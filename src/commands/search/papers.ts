import { ChatOpenAI } from '@langchain/openai'
import * as oclif from '@oclif/core'
import { GoogleScholar } from '@rpidanny/google-scholar'
import { Odysseus } from '@rpidanny/odysseus/dist/odysseus.js'

import { BaseCommand } from '../../base.command.js'
import { ModelProvider } from '../../config/schema.js'
import { DownloadService } from '../../services/download/download.service.js'
import { IoService } from '../../services/io/io.service.js'
import { LLMService } from '../../services/llm/llm.service.js'
import { PaperService } from '../../services/paper/paper.service.js'
import { PdfService } from '../../services/pdf/pdf.service.js'
import { PaperSearchService } from '../../services/search/paper-search.service.js'
import { getInitPageContent } from '../../utils/ui/odysseus.js'

export default class SearchPapers extends BaseCommand<typeof SearchPapers> {
  private odysseus!: Odysseus
  private searchService!: PaperSearchService

  static summary = 'Searches and exports research papers based on keywords to a CSV file.'

  static examples = [
    '<%= config.bin %> <%= command.id %> --help',
    '<%= config.bin %> <%= command.id %> "crispr cas9" -o crispr_cas9.csv -c 20 --log-level DEBUG',
    '<%= config.bin %> <%= command.id %> "crispr cas9" -o crispr_cas9.csv -c 5 -p 1 -f "tcell" --log-level DEBUG',
  ]

  static args = {
    keywords: oclif.Args.string({
      name: 'keywords',
      required: true,
      description: 'The keywords to search for',
    }),
  }

  static flags = {
    count: oclif.Flags.integer({
      char: 'c',
      summary: 'The minimum number of papers to search for.',
      default: 10,
    }),
    concurrency: oclif.Flags.integer({
      char: 'p',
      summary: 'The number of papers to process in parallel.',
      default: 10,
    }),
    output: oclif.Flags.string({
      char: 'o',
      summary: 'Specify the output destination for the CSV file.',
      default: '.',
    }),
    filter: oclif.Flags.string({
      char: 'f',
      summary: 'Case-insensitive regex to filter papers by content.',
    }),
    'skip-captcha': oclif.Flags.boolean({
      char: 's',
      summary: 'Skip captcha on paper URLs.',
      default: false,
    }),
    'legacy-processing': oclif.Flags.boolean({
      summary: 'Enable legacy processing of papers.',
      default: false,
    }),
    headless: oclif.Flags.boolean({
      char: 'h',
      summary: 'Run the browser in headless mode.',
      default: false,
    }),
    'include-summary': oclif.Flags.boolean({
      char: 'S',
      summary: '[LLM Required] Include the paper summary in the output CSV file.',
      description: 'Summaries are generated using LLM (either OpenAI or Local).',
      default: false,
    }),
  }

  async init(): Promise<void> {
    await super.init()

    const { paperProcessor, openai } = this.localConfig
    const { model, modelProvider, endpoint } = paperProcessor

    const apiKey = modelProvider === ModelProvider.OpenAI ? openai?.apiKey : 'ollama'
    const baseURL = modelProvider === ModelProvider.Local ? endpoint : undefined

    if (modelProvider === ModelProvider.OpenAI && (!openai?.apiKey || !openai?.model)) {
      this.logger.error(
        'OpenAI API key and/or model are not set. Please run `darwin config set` to set them up.',
      )
      process.exit(1)
    }

    const { headless, concurrency, 'include-summary': summarize } = this.flags

    this.odysseus = new Odysseus(
      { headless, waitOnCaptcha: true, initHtml: getInitPageContent() },
      this.logger,
    )
    await this.odysseus.init()

    const scholar = new GoogleScholar(this.odysseus, this.logger)
    const ioService = new IoService()
    const downloadService = new DownloadService(ioService, this.logger)
    const pdfService = new PdfService(downloadService, this.logger)
    const llm = new ChatOpenAI({ model, apiKey, configuration: { baseURL } })
    const llmService = new LLMService(llm, this.logger)
    const paperService = new PaperService(
      {
        skipCaptcha: this.flags['skip-captcha'],
        legacyProcessing: this.flags['legacy-processing'],
      },
      this.odysseus,
      pdfService,
      downloadService,
      this.logger,
    )

    this.searchService = new PaperSearchService(
      { concurrency: summarize ? 1 : concurrency },
      scholar,
      paperService,
      ioService,
      llmService,
      this.logger,
    )
  }

  protected async finally(error: Error | undefined): Promise<void> {
    await super.finally(error)
    await this.odysseus?.close()
  }

  public async run(): Promise<void> {
    const { count, output, filter, 'include-summary': summarize } = this.flags
    const { keywords } = this.args

    this.logger.info(`Searching papers for: ${keywords}`)

    const outputFile = await this.searchService.exportToCSV(output, {
      keywords,
      minItemCount: count,
      filterPattern: filter,
      summarize,
    })

    this.logger.info(`Exported papers list to: ${outputFile}`)
  }
}
