import { ChatOpenAI } from '@langchain/openai'
import * as oclif from '@oclif/core'
import { GoogleScholar } from '@rpidanny/google-scholar'
import { Odysseus } from '@rpidanny/odysseus/dist/odysseus.js'

import { BaseCommand } from '../../base.command.js'
import { AutonomousAgent } from '../../services/chat/autonomous-agent.js'
import { ChatService } from '../../services/chat/chat.service.js'
import { DownloadService } from '../../services/download/download.service.js'
import { IoService } from '../../services/io/io.service.js'
import { LLMService } from '../../services/llm/llm.service.js'
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
      char: 'p',
      summary: 'The number papers to process in parallel.',
      required: false,
      default: 10,
    }),
    logs: oclif.Flags.boolean({
      char: 'l',
      summary: 'Include application logs along with the chat conversations.',
      required: false,
      default: false,
    }),
    'skip-captcha': oclif.Flags.boolean({
      char: 's',
      summary: 'Skip captcha on paper URLs. Note: Google Scholar captcha still needs to be solved.',
      required: false,
      default: false,
    }),
    'legacy-processing': oclif.Flags.boolean({
      summary:
        'Enable legacy processing of papers that only extracts text from the main URL. The new method attempts to extract text from the source URLs (pdf or html) and falls back to the main URL.',
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

    const { logs, concurrency } = this.flags

    const logger = logs ? this.logger : undefined

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
        legacyProcessing: this.flags['legacy-processing'],
      },
      this.odysseus,
      pdfService,
      downloadService,
      this.logger,
    )
    const localLlm = new ChatOpenAI({
      model: 'llama3:instruct',
      apiKey: 'ollama',
      configuration: {
        baseURL: 'http://localhost:11434/v1',
      },
    })
    const llmService = new LLMService(localLlm, this.logger)

    const searchService = new PaperSearchService(
      {
        concurrency,
      },
      scholar,
      paperService,
      ioService,
      llmService,
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
