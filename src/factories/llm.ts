import { Ollama } from '@langchain/community/llms/ollama'
import { ChatOpenAI } from '@langchain/openai'
import { Quill } from '@rpidanny/quill'

import { LLMProvider, TConfig } from '../config/schema.js'

export class LLMFactory {
  private logger: Quill

  constructor(logger: Quill) {
    this.logger = logger
  }

  public getLLM(llmProvider: LLMProvider.OpenAI, config: TConfig): ChatOpenAI
  public getLLM(llmProvider: LLMProvider.Ollama, config: TConfig): Ollama
  public getLLM(llmProvider: LLMProvider, config: TConfig): Ollama | ChatOpenAI

  public getLLM(llmProvider: LLMProvider, config: TConfig): Ollama | ChatOpenAI {
    switch (llmProvider) {
      case LLMProvider.OpenAI:
        return this.createOpenAIInstance(config.openai)
      case LLMProvider.Ollama:
        return this.createOllamaInstance(config.ollama)
      default:
        this.logger.error(`Unsupported LLM provider: ${llmProvider}`)
        throw new Error(`Unsupported LLM provider: ${llmProvider}`)
    }
  }

  private createOpenAIInstance(openaiConfig: TConfig['openai']): ChatOpenAI {
    if (!openaiConfig?.apiKey || !openaiConfig?.model) {
      this.logger.error(
        'OpenAI API key and/or model are not set. Please run `darwin config set` to set them up.',
      )
      throw new Error('OpenAI API key and/or model are not set.')
    }
    return new ChatOpenAI({
      model: openaiConfig.model,
      apiKey: openaiConfig.apiKey,
    })
  }

  private createOllamaInstance(ollamaConfig: TConfig['ollama']): Ollama {
    if (!ollamaConfig?.model || !ollamaConfig?.baseUrl) {
      this.logger.error(
        'Ollama model and/or endpoint are not set. Please run `darwin config set` to set them up.',
      )
      throw new Error('Ollama model and/or endpoint are not set.')
    }
    return new Ollama({
      model: ollamaConfig.model,
      baseUrl: ollamaConfig.baseUrl,
    })
  }
}
