import { jest } from '@jest/globals'
import { BaseLanguageModel } from '@langchain/core/language_models/base'
import { mock } from 'jest-mock-extended'

import { LLMService } from './llm.service'

describe('LLMService', () => {
  const mockBaseLanguageModel = mock<BaseLanguageModel>()

  let llmService: LLMService

  beforeEach(() => {
    llmService = new LLMService(
      mock<BaseLanguageModel>({
        pipe: () => mockBaseLanguageModel,
      }),
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  describe('summarize', () => {
    it('should call llm once for short text', async () => {
      const inputText = 'input text'
      mockBaseLanguageModel.invoke.mockResolvedValue('summary')

      await expect(llmService.summarize(inputText)).resolves.toEqual('summary')

      expect(mockBaseLanguageModel.invoke).toHaveBeenCalledTimes(1)
    })

    it('should call llm n times for longer text', async () => {
      const inputText = 'input text'.repeat(10_000)
      mockBaseLanguageModel.invoke.mockResolvedValue('summary')

      await expect(llmService.summarize(inputText)).resolves.toEqual('summary')

      // 2 calls for each chunk and 1 call for final summary
      expect(mockBaseLanguageModel.invoke).toHaveBeenCalledTimes(3)
    })
  })

  describe('ask', () => {
    it('should call llm once', async () => {
      const inputText = 'input text'
      const question = 'question'

      mockBaseLanguageModel.invoke.mockResolvedValue('answer')
      mockBaseLanguageModel.getNumTokens.mockResolvedValue(3)

      await expect(llmService.ask(inputText, question)).resolves.toEqual('answer')

      expect(mockBaseLanguageModel.invoke).toHaveBeenCalledTimes(11)
    })

    it('should call llm n times for longer text', async () => {
      const inputText = 'input text'.repeat(10_000)
      const question = 'question'

      mockBaseLanguageModel.invoke.mockResolvedValue('answer')
      mockBaseLanguageModel.getNumTokens.mockResolvedValue(3)

      await expect(llmService.ask(inputText, question)).resolves.toEqual('answer')

      expect(mockBaseLanguageModel.invoke).toHaveBeenCalledTimes(31)
    })
  })
})
