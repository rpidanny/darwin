import * as oclif from '@oclif/core'
import { GoogleScholar } from '@rpidanny/google-scholar'
import { Odysseus } from '@rpidanny/odysseus/dist/odysseus.js'

import { BaseCommand } from '../../base.command.js'
import { DownloadService } from '../../services/download/download.service.js'
import { PaperDownloadService } from '../../services/download/paper-download.service.js'
import { IoService } from '../../services/io/io.service.js'
import { PaperService } from '../../services/paper/paper.service.js'
import { PdfService } from '../../services/pdf/pdf.service.js'
import { getInitPageContent } from '../../utils/ui/odysseus.js'

export default class DownloadPapers extends BaseCommand<typeof DownloadPapers> {
  private service!: PaperDownloadService
  private odysseus!: Odysseus

  static summary = 'Download PDF papers based on specified keywords.'

  static examples = [
    '<%= config.bin %> <%= command.id %> --help',
    '<%= config.bin %> <%= command.id %> "crispr cas9" -o papers/ -c 100 --log-level debug',
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
    output: oclif.Flags.string({
      char: 'o',
      summary: 'The path to save the downloaded papers.',
      required: true,
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

    const { headless } = this.flags

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
        skipCaptcha: true,
        processPdf: false,
      },
      this.odysseus,
      pdfService,
      downloadService,
      this.logger,
    )

    this.service = new PaperDownloadService(scholar, paperService, this.logger)
  }

  protected async finally(error: Error | undefined): Promise<void> {
    await super.finally(error)
    await this.odysseus?.close()
  }

  public async run(): Promise<string> {
    const { count, output } = this.flags
    const { keywords } = this.args

    this.logger.info(`Downloading papers related to: ${keywords}`)

    const outputFile = await this.service.downloadPapers(keywords, count, output)

    this.logger.info(`Papers downloaded to ${outputFile}`)
    return `Papers downloaded to ${outputFile}`
  }
}
