import { BaseLanguageModel } from '@langchain/core/language_models/base'
import { GoogleScholar } from '@rpidanny/google-scholar'
import { Odysseus } from '@rpidanny/odysseus'
import { Quill } from '@rpidanny/quill'
import { Container } from 'typedi'

import { LLMProvider, TConfig } from '../config/schema.js'
import { LLMFactory } from '../factories/llm.js'
import { PaperServiceConfig } from '../services/paper/paper.service.config.js'
import { PaperSearchConfig } from '../services/search/paper-search.config.js'
import { getInitPageContent } from '../utils/ui/odysseus.js'

export function initSearchContainer(
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
  const { headless, concurrency, summarize, llmProvider, skipCaptcha, legacyProcessing } = opts

  Container.set(
    Odysseus,
    new Odysseus({ headless, waitOnCaptcha: true, initHtml: getInitPageContent() }),
  )
  Container.set(Quill, logger)
  Container.set(PaperSearchConfig, { concurrency: summarize ? 1 : concurrency })
  Container.set(PaperServiceConfig, {
    skipCaptcha,
    legacyProcessing,
  })
  Container.set(BaseLanguageModel, Container.get(LLMFactory).getLLM(llmProvider, config))

  Container.set(GoogleScholar, new GoogleScholar(Container.get(Odysseus), logger))
}
