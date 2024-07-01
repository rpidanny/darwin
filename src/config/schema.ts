import { z } from 'zod'

const OpenAIConfigSchema = z.object({
  apiKey: z.string(),
  model: z.string(),
})

export enum LLMType {
  OpenAI = 'OpenAI',
  Local = 'Local',
}

const SummarizationConfigSchema = z.object({
  llmType: z.nativeEnum(LLMType).default(LLMType.Local),
  model: z.string().default('llama3:instruct'),
  endpoint: z.string().default('http://localhost:11434/v1'),
})

export const ConfigSchema = z.object({
  openai: OpenAIConfigSchema.optional(),
  summarization: SummarizationConfigSchema.default({}),
})

export type TConfig = z.infer<typeof ConfigSchema>
