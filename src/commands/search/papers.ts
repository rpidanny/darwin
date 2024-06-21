import * as oclif from '@oclif/core'
import { GoogleScholar } from '@rpidanny/google-scholar'
import { Odysseus } from '@rpidanny/odysseus/dist/odysseus.js'

import { BaseCommand } from '../../base.command.js'
import { IoService } from '../../services/io/io.js'
import { SearchService } from '../../services/search/search.service.js'
import { getInitPageContent } from '../../utils/ui/odysseus.js'

export default class SearchPapers extends BaseCommand<typeof SearchPapers> {
  private odysseus!: Odysseus
  private scholar!: GoogleScholar
  private searchService!: SearchService
  private ioService!: IoService

  static summary = 'Search research papers given a list of keywords.'

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
      helpValue: 'Holdemania|Colidextribacter',
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
    await this.odysseus.close()
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
