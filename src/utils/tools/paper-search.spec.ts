import { DynamicStructuredTool } from '@langchain/core/tools'
import { mock } from 'jest-mock-extended'

import { SearchService } from '../../services/search/search.service'
import { PapersSearchTool } from './paper-search'

describe('PapersSearchTool', () => {
  const searchService = mock<SearchService>()

  it('should create a new instance of DynamicStructuredTool', () => {
    const tool = new PapersSearchTool(searchService)
    expect(tool).toBeInstanceOf(DynamicStructuredTool)
  })

  it('should call searchService.exportPapersToCSV', async () => {
    const tool = new PapersSearchTool(searchService)
    const keywords = 'keywords'
    const maxItems = 5

    searchService.exportPapersToCSV.mockResolvedValue('outputFile.csv')

    const resp = await tool.func({ keywords, maxItems })

    expect(resp).toContain(`Papers has been exported to outputFile.csv`)
    expect(searchService.exportPapersToCSV).toHaveBeenCalledWith(
      keywords,
      expect.stringContaining('papers-keywords-'),
      maxItems,
    )
  })
})
