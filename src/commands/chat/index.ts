import * as oclif from '@oclif/core'
import { Odysseus } from '@rpidanny/odysseus/dist/odysseus.js'
import { Container } from 'typedi'

import { BaseCommand } from '../../base.command.js'
import { LLMProvider } from '../../config/schema.js'
import { initChatContainer } from '../../containers/chat.container.js'
import { ChatService } from '../../services/chat/chat.service.js'

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

    const {
      concurrency,
      'llm-provider': llmProvider,
      'skip-captcha': skipCaptcha,
      'legacy-processing': legacyProcessing,
    } = this.flags

    initChatContainer(
      {
        concurrency,
        llmProvider,
        skipCaptcha,
        legacyProcessing,
      },
      this.localConfig,
      this.logger,
    )

    this.odysseus = Container.get(Odysseus)
    await this.odysseus.init()

    this.service = Container.get(ChatService)
  }

  protected async finally(error: Error | undefined): Promise<void> {
    await super.finally(error)
    await this.odysseus.close()
  }

  public async run(): Promise<void> {
    await this.service.run()
  }
}
