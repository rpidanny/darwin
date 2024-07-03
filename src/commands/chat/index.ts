import { ChatOpenAI } from '@langchain/openai'
import * as oclif from '@oclif/core'
import { GoogleScholar } from '@rpidanny/google-scholar'
import { Odysseus } from '@rpidanny/odysseus/dist/odysseus.js'

import { BaseCommand } from '../../base.command.js'
import { LLMProvider } from '../../config/schema.js'
import { LLMFactory } from '../../factories/llm.js'
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
    'llm-provider': oclif.Flags.custom<LLMProvider>({
      summary: 'The LLM provider to use for generating summaries.',
      options: Object.values(LLMProvider) as string[],
      default: LLMProvider.Ollama,
      parse: async (input: string): Promise<LLMProvider> => {
        if (Object.values(LLMProvider).includes(input as LLMProvider)) {
          return input as LLMProvider
        } else {
          throw new Error(
            `Invalid LLM provider: ${input}. Must be one of ${Object.values(LLMProvider).join(', ')}`,
          )
        }
      },
    })(),
  }

  async init() {
    await super.init()

    const { logs, concurrency, 'llm-provider': llmProvider } = this.flags

    const logger = logs ? this.logger : undefined

    this.odysseus = new Odysseus(
      { headless: false, waitOnCaptcha: true, initHtml: getInitPageContent() },
      logger,
    )
    await this.odysseus.init()
    const scholar = new GoogleScholar(this.odysseus, logger)
    const ioService = new IoService()
    const llmFactory = new LLMFactory(this.logger)
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
    const openai = llmFactory.getLLM(LLMProvider.OpenAI, this.localConfig)
    const secondaryLlm = llmFactory.getLLM(llmProvider, this.localConfig)

    const llmService = new LLMService(secondaryLlm, this.logger)

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

    const agent = new AutonomousAgent(openai as ChatOpenAI, searchService)

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
