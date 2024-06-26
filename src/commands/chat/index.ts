import { ChatOpenAI } from '@langchain/openai'
import * as oclif from '@oclif/core'
import { GoogleScholar } from '@rpidanny/google-scholar'
import { Odysseus } from '@rpidanny/odysseus/dist/odysseus.js'

import { BaseCommand } from '../../base.command.js'
import { AutonomousAgent } from '../../services/chat/autonomous-agent.js'
import { ChatService } from '../../services/chat/chat.js'
import { DownloadService } from '../../services/download/download.service.js'
import { IoService } from '../../services/io/io.js'
import { PdfService } from '../../services/pdf/pdf.service.js'
import { AccessionSearchService } from '../../services/search/accession-search.service.js'
import { getInitPageContent } from '../../utils/ui/odysseus.js'

export default class Chat extends BaseCommand<typeof Chat> {
  service!: ChatService
  odysseus!: Odysseus

  static summary =
    'Chat with Darwin. Can be used to instruct Darwin to do things in natural language.'

  static examples = ['<%= config.bin %> <%= command.id %>']

  static flags = {
    includeAppLogs: oclif.Flags.boolean({
      char: 'l',
      name: 'include-app-logs',
      summary: 'Include application logs in the chat while performing actions',
      required: false,
      default: false,
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

  async init() {
    await super.init()

    if (!this.localConfig.openai?.apiKey || !this.localConfig.openai?.model) {
      this.logger.error(
        'OpenAI API key and/or model are not set. Please run `darwin config set` to set them up.',
      )
      process.exit(1)
    }

    const { includeAppLogs } = this.flags

    const logger = includeAppLogs ? this.logger : undefined

    this.odysseus = new Odysseus(
      { headless: false, waitOnCaptcha: true, initHtml: getInitPageContent() },
      logger,
    )
    await this.odysseus.init()
    const scholar = new GoogleScholar(this.odysseus, logger)
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

    const searchService = new AccessionSearchService(
      config,
      scholar,
      this.odysseus,
      pdfService,
      ioService,
      this.logger,
    )

    const llm = new ChatOpenAI({
      apiKey: this.localConfig.openai.apiKey,
      model: this.localConfig.openai.model,
    })

    const agent = new AutonomousAgent(llm, searchService)

    this.service = new ChatService(agent)
  }

  protected async finally(error: Error | undefined): Promise<void> {
    await super.finally(error)
    await this.odysseus.close()
  }

  public async run(): Promise<void> {
    await this.service.run()
  }
}
