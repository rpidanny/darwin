import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'

export class RandomNumberGeneratorTool extends DynamicStructuredTool {
  constructor() {
    super({
      name: 'random-number-generator',
      description: 'generates a random number between two input numbers',
      schema: z.object({
        low: z.number().describe('The lower bound of the generated number'),
        high: z.number().describe('The upper bound of the generated number'),
      }),
      func: async ({ low, high }) => (Math.random() * (high - low) + low).toString(), // Outputs still must be strings
    })
  }
}
