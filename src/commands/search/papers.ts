import * as oclif from '@oclif/core'
import { GoogleScholar } from '@rpidanny/google-scholar'
import { Odysseus } from '@rpidanny/odysseus/dist/odysseus.js'

import { BaseCommand } from '../../base.command.js'
import { ModelProvider } from '../../config/schema.js'
import { LLMFactory } from '../../factories/llm.js'
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
    'llm-provider': oclif.Flags.custom<ModelProvider>({
      summary: 'The LLM provider to use for generating summaries.',
      options: Object.values(ModelProvider) as string[], // Convert to string[] for the options
      default: ModelProvider.Ollama,
      parse: async (input: string): Promise<ModelProvider> => {
        if (Object.values(ModelProvider).includes(input as ModelProvider)) {
          return input as ModelProvider
        } else {
          throw new Error(
            `Invalid LLM provider: ${input}. Must be one of ${Object.values(ModelProvider).join(', ')}`,
          )
        }
      },
    })(),
  }

  async init(): Promise<void> {
    await super.init()

    const {
      headless,
      concurrency,
      'include-summary': summarize,
      'llm-provider': llmProvider,
    } = this.flags

    this.odysseus = new Odysseus(
      { headless, waitOnCaptcha: true, initHtml: getInitPageContent() },
      this.logger,
    )
    await this.odysseus.init()

    const scholar = new GoogleScholar(this.odysseus, this.logger)
    const ioService = new IoService()
    const downloadService = new DownloadService(ioService, this.logger)
    const pdfService = new PdfService(downloadService, this.logger)
    const llmFactory = new LLMFactory(this.logger)
    const llm = llmFactory.getLLM(llmProvider, this.localConfig)
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
