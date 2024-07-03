import * as oclif from '@oclif/core'
import { Odysseus } from '@rpidanny/odysseus/dist/odysseus.js'
import { Container } from 'typedi'

import { BaseCommand } from '../../base.command.js'
import { initDownloadContainer } from '../../containers/download.container.js'
import keywordsArg from '../../inputs/args/keywords.arg.js'
import { FlagChar } from '../../inputs/flags/char.js'
import countFlag from '../../inputs/flags/count.flag.js'
import headlessFlag from '../../inputs/flags/headless.flag.js'
import { PaperDownloadService } from '../../services/download/paper-download.service.js'

export default class DownloadPapers extends BaseCommand<typeof DownloadPapers> {
  private service!: PaperDownloadService
  private odysseus!: Odysseus

  static summary = 'Download PDF papers based on specified keywords.'

  static examples = [
    '<%= config.bin %> <%= command.id %> --help',
    '<%= config.bin %> <%= command.id %> "crispr cas9" --output papers/ --count 100 --log-level debug',
  ]

  static args = {
    keywords: keywordsArg,
  }

  static flags = {
    count: countFlag,
    output: oclif.Flags.string({
      char: FlagChar.Output,
      summary: 'The path to save the downloaded papers.',
      required: true,
    }),
    headless: headlessFlag,
  }

  async init(): Promise<void> {
    await super.init()

    const { headless } = this.flags

    initDownloadContainer({ headless }, this.logger)

    this.odysseus = Container.get(Odysseus)
    await this.odysseus.init()

    this.service = Container.get(PaperDownloadService)
  }

  protected async finally(error: Error | undefined): Promise<void> {
    await super.finally(error)
    await this.odysseus?.close()
  }

  public async run(): Promise<void> {
    const { count, output } = this.flags
    const { keywords } = this.args

    this.logger.info(`Downloading papers for: ${keywords}`)

    const outputFile = await this.service.downloadPapers(keywords, count, output)

    this.logger.info(`Papers downloaded to: ${outputFile}`)
  }
}
