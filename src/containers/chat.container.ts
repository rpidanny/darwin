import { ChatOpenAI } from '@langchain/openai'
import { Quill } from '@rpidanny/quill'
import { Container } from 'typedi'

import { LLMProvider, TConfig } from '../config/schema.js'
import { LLMFactory } from '../factories/llm.js'
import { initSearchContainer } from './search.container.js'

export function initChatContainer(
  opts: {
    headless: boolean
    concurrency: number
    summarize: boolean
    llmProvider: LLMProvider
    skipCaptcha: boolean
    legacyProcessing: boolean
  },
  config: TConfig,
  logger: Quill,
) {
  initSearchContainer(opts, config, logger)

  Container.set(ChatOpenAI, Container.get(LLMFactory).getLLM(LLMProvider.OpenAI, config))
}
