import * as oclif from '@oclif/core'
import { GoogleScholar } from '@rpidanny/google-scholar'
import { Odysseus } from '@rpidanny/odysseus/dist/odysseus.js'

import { BaseCommand } from '../../base.command.js'
import { DownloadService } from '../../services/download/download.service.js'
import { IoService } from '../../services/io/io.js'
import { PdfService } from '../../services/pdf/pdf.service.js'
import { AccessionSearchService } from '../../services/search/accession-search.service.js'
import { getInitPageContent } from '../../utils/ui/odysseus.js'

export default class SearchAccession extends BaseCommand<typeof SearchAccession> {
  private odysseus!: Odysseus
  private searchService!: AccessionSearchService

  static summary = 'Search for papers that contain accession numbers.'

  static deprecationOptions?: oclif.Interfaces.Deprecation = {
    message: 'Use `darwin search papers` command with  `--find-regex="PRJNA\\d+"` instead.',
    version: '1.13.0',
    to: 'search papers',
  }

  static examples = [
    '<%= config.bin %> <%= command.id %> --help',
    '<%= config.bin %> <%= command.id %> "mocrobiome, nRNA" -o output.csv  --log-level DEBUG',
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
      summary: 'The minimum number of papers with accession numbers to search for',
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
      default: 'PRJNA\\d+',
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

    const { headless, pdf } = this.flags

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
      processPdf: pdf,
    }

    this.searchService = new AccessionSearchService(
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

    this.logger.info(`Searching accession numbers for: ${keywords}`)

    const outputPath = await this.searchService.exportPapersWithAccessionNumbersToCSV(
      keywords,
      new RegExp(this.flags['accession-number-regex'], 'g'),
      output,
      count,
    )

    this.logger.info(`Papers list exported to ${outputPath}`)
    return `Papers list exported to ${outputPath}`
  }
}
