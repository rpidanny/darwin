import { DynamicStructuredTool } from '@langchain/core/tools'
import moment from 'moment'
import { z } from 'zod'

import { PaperSearchService } from '../../services/search/paper-search.service'

export class PapersSearchTool extends DynamicStructuredTool {
  constructor(private readonly searchService: PaperSearchService) {
    super({
      name: 'research-papers-search',
      description: 'Search research papers given a list of keywords.',
      schema: z.object({
        keywords: z
          .string()
          .describe('The keywords to search for. Separate multiple keywords with spaces.'),
        count: z
          .number()
          .describe('The minimum number of papers to search for. Default is 5.')
          .default(5),
      }),
      func: async ({ keywords, count }): Promise<string> => {
        const cwd = process.cwd()

        const fileName = `papers-${keywords.replace(/ /g, '-')}-${moment().format('YYYY-MM-DD-HH-mm-ss')}.csv`
        const filePath = `${cwd}/${fileName}`

        const outputFile = await this.searchService.exportPapersToCSV(keywords, filePath, count)
        return `Papers has been exported to ${outputFile}. Return the local file path to the user as plain text without markdown. DON'T USE MARKDOWN.`
      },
    })
  }
}
