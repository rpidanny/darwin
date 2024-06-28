import * as oclif from '@oclif/core'
import { GoogleScholar } from '@rpidanny/google-scholar'
import { Odysseus } from '@rpidanny/odysseus/dist/odysseus.js'

import { BaseCommand } from '../../base.command.js'
import { DownloadService } from '../../services/download/download.service.js'
import { IoService } from '../../services/io/io.service.js'
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
      summary:
        'The minimum number of papers to search for. (When running concurrently, the actual number of papers may be a bit higher)',
      required: false,
      default: 10,
    }),
    concurrency: oclif.Flags.integer({
      char: 'p',
      summary: 'The number papers to process in parallel.',
      required: false,
      default: 10,
    }),
    output: oclif.Flags.string({
      char: 'o',
      summary: 'The name or path of the output CSV file.',
      required: true,
    }),
    filter: oclif.Flags.string({
      char: 'f',
      summary:
        'Case-insensitive regex to filter papers by content. Example: "Holdemania|Colidextribacter" will only include papers containing either term.',
      required: false,
    }),
    'skip-captcha': oclif.Flags.boolean({
      char: 's',
      summary: 'Skip captcha on paper URLs. Note: Google Scholar captcha still needs to be solved.',
      required: false,
      default: false,
    }),
    'process-pdf': oclif.Flags.boolean({
      char: 'p',
      summary:
        '[Experimental] Attempt to process PDFs for keywords within papers. This feature is experimental and may be unreliable.',
      required: false,
      default: false,
    }),
    headless: oclif.Flags.boolean({
      char: 'h',
      summary: 'Run the browser in headless mode (no UI).',
      required: false,
      default: false,
    }),
  }

  async init(): Promise<void> {
    await super.init()

    const { headless, concurrency } = this.flags

    this.odysseus = new Odysseus(
      { headless, waitOnCaptcha: true, initHtml: getInitPageContent() },
      this.logger,
    )
    await this.odysseus.init()
    const scholar = new GoogleScholar(this.odysseus, this.logger)
    const ioService = new IoService()
    const downloadService = new DownloadService(ioService, this.logger)
    const pdfService = new PdfService(downloadService, this.logger)
    const paperService = new PaperService(
      {
        skipCaptcha: this.flags['skip-captcha'],
        processPdf: this.flags['process-pdf'],
      },
      this.odysseus,
      pdfService,
      downloadService,
      this.logger,
    )

    this.searchService = new PaperSearchService(
      {
        concurrency,
      },
      scholar,
      paperService,
      ioService,
      this.logger,
    )
  }

  protected async finally(error: Error | undefined): Promise<void> {
    await super.finally(error)
    await this.odysseus?.close()
  }

  public async run(): Promise<void> {
    const { count, output, filter } = this.flags
    const { keywords } = this.args

    this.logger.info(`Searching papers for: ${keywords}`)

    const outputFile = await this.searchService.exportToCSV(keywords, output, count, filter)

    this.logger.info(`Exported papers list to: ${outputFile}`)
  }
}
