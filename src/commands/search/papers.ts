import * as oclif from '@oclif/core'
import { GoogleScholar } from '@rpidanny/google-scholar'
import { Odysseus } from '@rpidanny/odysseus/dist/odysseus.js'

import { BaseCommand } from '../../base.command.js'
import { DownloadService } from '../../services/download/download.service.js'
import { IoService } from '../../services/io/io.js'
import { PdfService } from '../../services/pdf/pdf.service.js'
import { PaperSearchService } from '../../services/search/paper-search.service.js'
import { getInitPageContent } from '../../utils/ui/odysseus.js'

export default class SearchPapers extends BaseCommand<typeof SearchPapers> {
  private odysseus!: Odysseus
  private searchService!: PaperSearchService

  static summary =
    'Search research papers given a set of keywords. Exports the list of papers to a CSV file.'

  static examples = [
    '<%= config.bin %> <%= command.id %> --help',
    '<%= config.bin %> <%= command.id %> "crispr cas9" -o crispr_cas9.csv  --log-level DEBUG',
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
      summary: 'Minimum number of results to return',
      required: false,
      default: 10,
    }),
    output: oclif.Flags.string({
      char: 'o',
      summary: 'Output CSV file name/path',
      required: true,
    }),
    headless: oclif.Flags.boolean({
      char: 'h',
      summary: 'Run in headless mode',
      required: false,
      default: false,
    }),
    'find-regex': oclif.Flags.string({
      char: 'f',
      summary:
        'Regex to find in the paper content. If found, the paper will be included in the CSV file. Its case-insensitive. Example: "Holdemania|Colidextribacter" will find papers that contain either Holdemania or Colidextribacter.',
      required: false,
      // helpValue: 'Holdemania|Colidextribacter',
    }),
    'skip-captcha': oclif.Flags.boolean({
      char: 's',
      summary:
        'Weather to skip captcha on paper URLs or wait for the user to solve the captcha. Google Scholar captcha still needs to be solved.',
      required: false,
      default: false,
    }),
    'process-pdf': oclif.Flags.boolean({
      char: 'p',
      summary:
        '[Experimental] Process the PDFs to extract text. This will take longer to export the papers.',
      required: false,
      default: false,
    }),
  }

  async init(): Promise<void> {
    await super.init()

    const { headless } = this.flags

    this.odysseus = new Odysseus(
      { headless, waitOnCaptcha: true, initHtml: getInitPageContent() },
      this.logger,
    )
    await this.odysseus.init()
    const scholar = new GoogleScholar(this.odysseus, this.logger)
    const ioService = new IoService()
    const downloadService = new DownloadService(ioService, this.logger)
    const pdfService = new PdfService(
      {
        tempPath: `${this.config.dataDir}/downloads/pdf`,
      },
      downloadService,
      this.logger,
    )

    const config = {
      skipCaptcha: this.flags['skip-captcha'],
      processPdf: this.flags['process-pdf'],
    }

    this.searchService = new PaperSearchService(
      config,
      scholar,
      this.odysseus,
      pdfService,
      ioService,
      this.logger,
    )
  }

  protected async finally(error: Error | undefined): Promise<void> {
    await super.finally(error)
    await this.odysseus?.close()
  }

  public async run(): Promise<string> {
    const { count, output } = this.flags
    const { keywords } = this.args

    this.logger.info(`Searching papers related to: ${keywords}`)
    const outputFile = await this.searchService.exportPapersToCSV(
      keywords,
      output,
      count,
      this.flags['find-regex'],
    )

    this.logger.info(`Papers exported to to ${outputFile}`)
    return `Papers exported to to ${outputFile}`
  }
}
