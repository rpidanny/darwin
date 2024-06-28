import { ChatOpenAI } from '@langchain/openai'
import * as oclif from '@oclif/core'
import { GoogleScholar } from '@rpidanny/google-scholar'
import { Odysseus } from '@rpidanny/odysseus/dist/odysseus.js'

import { BaseCommand } from '../../base.command.js'
import { AutonomousAgent } from '../../services/chat/autonomous-agent.js'
import { ChatService } from '../../services/chat/chat.service.js'
import { DownloadService } from '../../services/download/download.service.js'
import { IoService } from '../../services/io/io.js'
import { PaperService } from '../../services/paper/paper.service.js'
import { PdfService } from '../../services/pdf/pdf.service.js'
import { PaperSearchService } from '../../services/search/paper-search.service.js'
import { getInitPageContent } from '../../utils/ui/odysseus.js'

export default class Chat extends BaseCommand<typeof Chat> {
  service!: ChatService
  odysseus!: Odysseus

  static summary =
    'Chat with Darwin. Can be used to instruct Darwin to do things in natural language.'

  static examples = ['<%= config.bin %> <%= command.id %>']

  static flags = {
    concurrency: oclif.Flags.integer({
      char: 'c',
      summary: 'The number of concurrent papers to process at a time',
      required: false,
      default: 10,
    }),
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
    pdf: oclif.Flags.boolean({
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

    const { includeAppLogs, pdf, concurrency } = this.flags

    const logger = includeAppLogs ? this.logger : undefined

    this.odysseus = new Odysseus(
      { headless: false, waitOnCaptcha: true, initHtml: getInitPageContent() },
      logger,
    )
    await this.odysseus.init()
    const scholar = new GoogleScholar(this.odysseus, logger)
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

    const searchService = new PaperSearchService(
      {
        concurrency,
      },
      scholar,
      paperService,
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
