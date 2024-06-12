import { z } from 'zod'

const OpenAIConfigSchema = z.object({
  apiKey: z.string(),
  model: z.string(),
})

export const ConfigSchema = z.object({
  openai: OpenAIConfigSchema.optional(),
})

export type TConfig = z.infer<typeof ConfigSchema>
