import { Ollama } from '@langchain/community/llms/ollama'
import { ChatOpenAI } from '@langchain/openai'
import { Quill } from '@rpidanny/quill'

import { ModelProvider, TConfig } from '../config/schema.js'

export class LLMFactory {
  private logger: Quill

  constructor(logger: Quill) {
    this.logger = logger
  }

  public getLLM(llmProvider: ModelProvider.OpenAI, config: TConfig): ChatOpenAI
  public getLLM(llmProvider: ModelProvider.Ollama, config: TConfig): Ollama
  public getLLM(llmProvider: ModelProvider, config: TConfig): Ollama | ChatOpenAI {
    switch (llmProvider) {
      case ModelProvider.OpenAI:
        return this.createOpenAIInstance(config.openai)
      case ModelProvider.Ollama:
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
      process.exit(1)
    }
    return new ChatOpenAI({
      model: openaiConfig.model,
      apiKey: openaiConfig.apiKey,
    })
  }

  private createOllamaInstance(ollamaConfig: TConfig['ollama']): Ollama {
    if (!ollamaConfig?.model || !ollamaConfig?.endpoint) {
      this.logger.error(
        'Ollama model and/or endpoint are not set. Please run `darwin config set` to set them up.',
      )
      process.exit(1)
    }
    console.log(
      `Creating Ollama instance with model: ${ollamaConfig.model} and endpoint: ${ollamaConfig.endpoint}`,
    )
    return new Ollama({
      model: ollamaConfig.model,
      baseUrl: ollamaConfig.endpoint,
    })
  }
}
