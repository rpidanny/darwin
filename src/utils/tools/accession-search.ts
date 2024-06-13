import { DynamicStructuredTool } from '@langchain/core/tools'
import moment from 'moment'
import { z } from 'zod'

import { SearchService } from '../../services/search/search.service'

export class PapersWithAccessionNumbersSearchTool extends DynamicStructuredTool {
  constructor(private readonly searchService: SearchService) {
    super({
      name: 'papers-with-accession-numbers-search',
      description:
        'Search for papers that contain BioProject accession numbers given a list of keywords.',
      schema: z.object({
        keywords: z
          .string()
          .describe('The keywords to search for. Separate multiple keywords with spaces.'),
        maxItems: z
          .number()
          .describe(
            'The maximum number of papers with accession numbers to search for. Default is 5.',
          )
          .default(5),
      }),
      func: async ({ keywords, maxItems }): Promise<string> => {
        const cwd = process.cwd()

        const fileName = `papers-${keywords.replace(/ /g, '-')}-${moment().format('YYYY-MM-DD-HH-mm-ss')}.csv`
        const filePath = `${cwd}/${fileName}`

        const outputFile = await this.searchService.exportPapersWithBioProjectAccessionNumbersToCSV(
          keywords,
          filePath,
          maxItems,
        )
        return `Papers has been exported to ${outputFile}. Return the local file path to the user as plain text. DON'T USE MARKDOWN.`
      },
    })
  }
}
