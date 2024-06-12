import { DynamicStructuredTool } from '@langchain/core/tools'
import { mock } from 'jest-mock-extended'

import { SearchService } from '../../services/search/search.service'
import { PapersWithAccessionNumbersSearchTool } from './accession-search'

describe('PapersWithAccessionNumbersSearchTool', () => {
  const searchService = mock<SearchService>()

  it('should create a new instance of DynamicStructuredTool', () => {
    const tool = new PapersWithAccessionNumbersSearchTool(searchService)
    expect(tool).toBeInstanceOf(DynamicStructuredTool)
  })

  it('should call searchService.exportPapersWithAccessionNumbersToCSV', async () => {
    const tool = new PapersWithAccessionNumbersSearchTool(searchService)
    const keywords = 'keywords'
    const maxItems = 5

    searchService.exportPapersWithAccessionNumbersToCSV.mockResolvedValue('outputFile.csv')

    const resp = await tool.func({ keywords, maxItems })

    expect(resp).toContain(`Papers has been exported to outputFile.csv`)
    expect(searchService.exportPapersWithAccessionNumbersToCSV).toHaveBeenCalledWith(
      keywords,
      expect.stringContaining('papers-keywords-'),
      maxItems,
    )
  })
})
