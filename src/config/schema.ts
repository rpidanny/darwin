import { z } from 'zod'

const OpenAIConfigSchema = z.object({
  apiKey: z.string(),
  model: z.string(),
})

export enum LLMProvider {
  OpenAI = 'openai',
  Ollama = 'ollama',
}

const ollamaConfigSchema = z.object({
  model: z.string().default('llama3:instruct'),
  baseUrl: z.string().optional().default('http://localhost:11434'),
})

export const ConfigSchema = z.object({
  openai: OpenAIConfigSchema.optional(),
  ollama: ollamaConfigSchema.default({}),
})

export type TConfig = z.infer<typeof ConfigSchema>
