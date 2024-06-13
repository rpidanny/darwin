import * as oclif from '@oclif/core'
import { GoogleScholar } from '@rpidanny/google-scholar'
import { Odysseus } from '@rpidanny/odysseus/dist/odysseus.js'

import { BaseCommand } from '../../base.command.js'
import { IoService } from '../../services/io/io.js'
import { SearchService } from '../../services/search/search.service.js'

export default class SearchAccession extends BaseCommand<typeof SearchAccession> {
  private webClient!: Odysseus
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
    maxResults: oclif.Flags.integer({
      char: 'm',
      name: 'max-results',
      summary: 'The maximum number of papers with accession numbers to search for',
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
    accessionNumberRegex: oclif.Flags.string({
      char: 'r',
      name: 'accession-number-regex',
      summary: 'Regex to match accession numbers',
      required: false,
      default: 'PRJNA\\d+',
    }),
  }

  async init(): Promise<void> {
    await super.init()

    const { headless } = this.flags

    this.webClient = new Odysseus({ headless, waitOnCaptcha: true }, this.logger)
    this.scholar = new GoogleScholar(this.webClient, this.logger)
    this.ioService = new IoService()

    this.searchService = new SearchService(
      this.scholar,
      this.webClient,
      this.ioService,
      this.logger,
    )
  }

  public async run(): Promise<string> {
    const { maxResults, output, accessionNumberRegex } = this.flags
    const { keywords } = this.args

    this.logger.info(`Searching accession numbers for: ${keywords}`)
    const outputPath = await this.searchService.exportPapersWithAccessionNumbersToCSV(
      keywords,
      new RegExp(accessionNumberRegex, 'g'),
      output,
      maxResults,
    )

    this.logger.info(`Papers exported to to ${outputPath}`)
    return `Papers exported to to ${outputPath}`
  }
}
