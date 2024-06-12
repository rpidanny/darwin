import { DynamicStructuredTool } from '@langchain/core/tools'

import { RandomNumberGeneratorTool } from './random-number-generator'

describe('RandomNumberGeneratorTool', () => {
  it('should create a new instance of DynamicStructuredTool', () => {
    const tool = new RandomNumberGeneratorTool()
    expect(tool).toBeInstanceOf(DynamicStructuredTool)
  })

  it('should call searchService.exportPapersToCSV', async () => {
    const tool = new RandomNumberGeneratorTool()
    const low = 1
    const high = 10

    const resp = await tool.func({ low, high })

    const number = parseFloat(resp)

    expect(number).toBeGreaterThanOrEqual(low)
    expect(number).toBeLessThanOrEqual(high)
  })
})
