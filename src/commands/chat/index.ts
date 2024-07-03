import { Odysseus } from '@rpidanny/odysseus/dist/odysseus.js'
import { Container } from 'typedi'

import { BaseCommand } from '../../base.command.js'
import { initChatContainer } from '../../containers/chat.container.js'
import concurrencyFlag from '../../inputs/flags/concurrency.flag.js'
import legacyFlag from '../../inputs/flags/legacy.flag.js'
import llmProviderFlag from '../../inputs/flags/llm-provider.flag.js'
import skipCaptchaFlag from '../../inputs/flags/skip-captcha.flag.js'
import { ChatService } from '../../services/chat/chat.service.js'

export default class Chat extends BaseCommand<typeof Chat> {
  service!: ChatService
  odysseus!: Odysseus

  static summary = 'Chat with Darwin using natural language.'

  static examples = ['<%= config.bin %> <%= command.id %>']

  static flags = {
    concurrency: concurrencyFlag,
    'skip-captcha': skipCaptchaFlag,
    legacy: legacyFlag,
    llm: llmProviderFlag,
  }

  async init() {
    await super.init()

    const { concurrency, llm: llmProvider, 'skip-captcha': skipCaptcha, legacy } = this.flags

    initChatContainer(
      {
        concurrency,
        llmProvider,
        skipCaptcha,
        legacy,
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
