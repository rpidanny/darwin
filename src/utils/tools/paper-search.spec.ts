import { DynamicStructuredTool } from '@langchain/core/tools'
import { mock } from 'jest-mock-extended'

import { PaperSearchService } from '../../services/search/paper-search.service'
import { PapersSearchTool } from './paper-search'

describe('PapersSearchTool', () => {
  const searchService = mock<PaperSearchService>()

  it('should create a new instance of DynamicStructuredTool', () => {
    const tool = new PapersSearchTool(searchService)
    expect(tool).toBeInstanceOf(DynamicStructuredTool)
  })

  it('should call searchService.exportPapersToCSV', async () => {
    const tool = new PapersSearchTool(searchService)
    const keywords = 'keywords'
    const count = 5

    searchService.exportToCSV.mockResolvedValue('outputFile.csv')

    const resp = await tool.func({ keywords, count })

    expect(resp).toContain(`Papers has been exported to outputFile.csv`)
    expect(searchService.exportToCSV).toHaveBeenCalledWith(
      expect.stringContaining('papers-keywords-'),
      {
        keywords,
        minItemCount: count,
      },
    )
  })
})
