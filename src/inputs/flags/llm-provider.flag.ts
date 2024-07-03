import * as oclif from '@oclif/core'

import { LLMProvider } from '../../config/schema.js'

export default oclif.Flags.custom<LLMProvider>({
  summary: 'The LLM provider to use for generating summaries.',
  options: Object.values(LLMProvider) as string[],
  helpValue: Object.values(LLMProvider).join('|'),
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
})()
