import { z } from 'zod'

const OpenAIConfigSchema = z.object({
  apiKey: z.string(),
  model: z.string(),
})

export enum ModelProvider {
  OpenAI = 'OpenAI',
  Local = 'Local',
}

const paperProcessorConfigSchema = z.object({
  modelProvider: z.nativeEnum(ModelProvider).default(ModelProvider.Local),
  model: z.string().default('llama3:instruct'),
  endpoint: z.string().optional().default('http://localhost:11434/v1'),
})

export const ConfigSchema = z.object({
  openai: OpenAIConfigSchema.optional(),
  paperProcessor: paperProcessorConfigSchema.default({}),
})

export type TConfig = z.infer<typeof ConfigSchema>
