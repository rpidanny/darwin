import * as oclif from '@oclif/core'
import { GoogleScholar } from '@rpidanny/google-scholar'
import { Odysseus } from '@rpidanny/odysseus/dist/odysseus.js'

import { BaseCommand } from '../../base.command.js'
import { IoService } from '../../services/io/io.js'
import { SearchService } from '../../services/search/search.service.js'
import { getInitPageContent } from '../../utils/ui/odysseus.js'

export default class SearchAccession extends BaseCommand<typeof SearchAccession> {
  private odysseus!: Odysseus
  private scholar!: GoogleScholar
  private searchService!: SearchService
  private ioService!: IoService

  static summary = 'Search for papers that contain accession numbers.'

  static examples = [
    '<%= config.bin %> <%= command.id %> --help',
    '<%= config.bin %> <%= command.id %> "mocrobiome, nRNA" -o output.csv  --log-level debug',
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
      summary: 'Regex to match accession numbers',
      required: false,
      default: 'PRJNA\\d+',
    }),
    'skip-captcha': oclif.Flags.boolean({
      char: 's',
      summary: 'Weather to skip captcha or wait for the user to solve the captcha',
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
    this.scholar = new GoogleScholar(this.odysseus, this.logger)
    this.ioService = new IoService()

    this.searchService = new SearchService(this.scholar, this.odysseus, this.ioService, this.logger)
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
      !this.flags['skip-captcha'],
    )

    this.logger.info(`Papers exported to to ${outputPath}`)
    return `Papers exported to to ${outputPath}`
  }
}
