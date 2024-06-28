import * as oclif from '@oclif/core'
import { GoogleScholar } from '@rpidanny/google-scholar'
import { Odysseus } from '@rpidanny/odysseus/dist/odysseus.js'

import { BaseCommand } from '../../base.command.js'
import { DownloadService } from '../../services/download/download.service.js'
import { IoService } from '../../services/io/io.js'
import { PaperService } from '../../services/paper/paper.service.js'
import { PdfService } from '../../services/pdf/pdf.service.js'
import { AccessionPattern } from '../../services/search/constants.js'
import { PaperSearchService } from '../../services/search/paper-search.service.js'
import { getInitPageContent } from '../../utils/ui/odysseus.js'

export default class SearchAccession extends BaseCommand<typeof SearchAccession> {
  private odysseus!: Odysseus
  private searchService!: PaperSearchService

  static summary = 'Search for papers that contain accession numbers.'

  static deprecationOptions?: oclif.Interfaces.Deprecation = {
    message: 'Use `darwin search papers` command with  `--find="PRJNA\\d+"` instead.',
    version: '1.13.0',
    to: 'search papers',
  }

  static examples = [
    '<%= config.bin %> <%= command.id %> --help',
    '<%= config.bin %> <%= command.id %> "mocrobiome, nRNA" -o output.csv  -n 5 -c 1 --log-level DEBUG',
  ]

  static args = {
    keywords: oclif.Args.string({
      name: 'keywords',
      required: true,
      description: 'The keywords to search for',
    }),
  }

  static flags = {
    nums: oclif.Flags.integer({
      char: 'n',
      summary: 'The minimum number of papers with accession numbers to search for',
      required: false,
      default: 10,
    }),
    concurrency: oclif.Flags.integer({
      char: 'c',
      summary: 'The number of concurrent papers to process at a time',
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
    'accession-number-regex': oclif.Flags.string({
      char: 'a',
      summary: 'Regex to match accession numbers. Defaults to BioProject accession numbers.',
      required: false,
      default: AccessionPattern.BioProject,
    }),
    'skip-captcha': oclif.Flags.boolean({
      char: 's',
      summary:
        'Weather to skip captcha on paper URLs or wait for the user to solve the captcha. Google Scholar captcha still needs to be solved.',
      required: false,
      default: false,
    }),
    pdf: oclif.Flags.boolean({
      char: 'p',
      summary:
        '[Experimental] Whether to try to process the PDFs if it exists while searching for keywords inside papers. This is experimental and may not work well.',
      required: false,
      default: false,
    }),
  }

  async init(): Promise<void> {
    await super.init()

    const { headless, pdf, concurrency } = this.flags

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
        processPdf: pdf,
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

  public async run(): Promise<string> {
    const { nums, output } = this.flags
    const { keywords } = this.args

    this.logger.info(`Searching accession numbers for: ${keywords}`)

    const outputPath = await this.searchService.exportToCSV(
      keywords,
      output,
      nums,
      this.flags['accession-number-regex'],
    )

    this.logger.info(`Papers list exported to ${outputPath}`)
    return `Papers list exported to ${outputPath}`
  }
}
