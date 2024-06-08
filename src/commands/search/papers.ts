import * as oclif from '@oclif/core'
import { GoogleScholar } from '@rpidanny/google-scholar'
import { Odysseus } from '@rpidanny/odysseus/dist/odysseus.js'

import { BaseCommand } from '../../base.command.js'
import { IoService } from '../../services/io/io.js'
import { PaperEntity } from '../../services/papers/interfaces.js'
import { PapersService } from '../../services/papers/papers.js'

export default class SearchPapers extends BaseCommand<typeof SearchPapers> {
  private webClient!: Odysseus
  private scholar!: GoogleScholar
  private service!: PapersService
  private ioService!: IoService

  static summary = 'Search research papers that matches the keywords provided.'

  static examples = [
    '<%= config.bin %> <%= command.id %> --help',
    '<%= config.bin %> <%= command.id %> "crispr cas9" -o crispr_cas9.csv  --log-level debug',
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
      summary: 'Maximum number of results to return',
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
  }

  async init(): Promise<void> {
    await super.init()

    const { headless } = this.flags

    this.webClient = new Odysseus({ headless, waitOnCaptcha: true }, this.logger)
    this.scholar = new GoogleScholar(this.webClient, this.logger)
    this.ioService = new IoService()

    this.service = new PapersService(this.scholar, this.webClient, this.logger)
  }

  public async run(): Promise<PaperEntity[]> {
    const { maxResults, output } = this.flags
    const { keywords } = this.args

    this.logger.info(`Searching papers related to: ${keywords}`)
    const result = await this.service.search(keywords, maxResults)

    this.logger.info(`Writing to ${output}`)
    await this.ioService.writeCsv(output, result)
    return result
  }
}
