import { jest } from '@jest/globals'
import { GoogleScholar } from '@rpidanny/google-scholar'
import { Quill } from '@rpidanny/quill'
import { mock } from 'jest-mock-extended'

import { getMockPageContent } from '../../../test/fixtures/google-scholar'
import { CsvStreamWriter } from '../io/csv-stream-writer'
import { IoService } from '../io/io.service'
import { PaperService } from '../paper/paper.service'
import { IPaperSearchConfig } from './paper-search.config'
import { PaperSearchService } from './paper-search.service'

describe('PaperSearchService', () => {
  const page = getMockPageContent()

  const googleScholarMock = mock<GoogleScholar>()
  const paperService = mock<PaperService>()
  const logger = mock<Quill>()
  const mockConfig: IPaperSearchConfig = {
    concurrency: 1,
  }

  let mockCsvWriter: CsvStreamWriter
  let ioService: IoService
  let service: PaperSearchService

  beforeEach(() => {
    mockCsvWriter = mock<CsvStreamWriter>()
    ioService = mock<IoService>({
      getCsvStreamWriter: import.meta.jest.fn().mockResolvedValue(mockCsvWriter),
    })

    googleScholarMock.iteratePapers.mockImplementation(async (_, onData) => {
      for (const paper of page.papers) {
        await onData(paper)
      }
    })

    service = new PaperSearchService(mockConfig, googleScholarMock, paperService, ioService, logger)
  })

  afterEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  describe('search', () => {
    it('should search for papers', async () => {
      const entities = await service.search('some keywords')

      expect(entities).toHaveLength(3)
      expect(entities).toEqual(
        page.papers.map(result => ({
          title: result.title,
          authors: result.authors.map(author => author.name),
          description: result.description,
          url: result.url,
          citationCount: result.citation.count,
          citationUrl: result.citation.url ?? '',
          sourceUrl: result.source.url,
          sourceType: result.source.type,
        })),
      )
    })

    it('should stop searching when minItemCount is reached', async () => {
      const entities = await service.search('some keywords', 1)

      expect(entities.length).toBeGreaterThan(1)
    })

    it('should filter papers if paperIncludes is provided', async () => {
      paperService.findInPaper.mockResolvedValueOnce([
        {
          content: 'Cas9',
          sentences: [
            'The key proteins involved in CRISPR are Cas (CRISPR-associated) proteins, with Cas9 being the most well-known.',
            'Cas9 acts like molecular scissors, guided by RNA sequences to specific locations on the DNA strand where it makes precise cuts.',
          ],
        },
      ])
      paperService.findInPaper.mockResolvedValue([])

      const entities = await service.search('some keywords', 10, undefined, 'cas9')

      expect(entities).toHaveLength(1)
      expect(entities).toEqual(
        [page.papers[0]].map(result => ({
          title: result.title,
          authors: result.authors.map(author => author.name),
          description: result.description,
          url: result.url,
          citationCount: result.citation.count,
          citationUrl: result.citation.url ?? '',
          sourceUrl: result.source.url,
          sourceType: result.source.type,
          matchedTexts: ['Cas9'],
          relevantSentences: [
            'The key proteins involved in CRISPR are Cas (CRISPR-associated) proteins, with Cas9 being the most well-known.',
            'Cas9 acts like molecular scissors, guided by RNA sequences to specific locations on the DNA strand where it makes precise cuts.',
          ],
        })),
      )
    })
  })

  describe('exportToCSV', () => {
    it('should export papers to CSV', async () => {
      const filePath = await service.exportToCSV('some keywords', 'file.csv')

      expect(filePath).toBe('file.csv')
      expect(ioService.getCsvStreamWriter).toHaveBeenCalledWith('file.csv')
      page.papers.forEach((result, idx) => {
        expect(mockCsvWriter.write).toHaveBeenNthCalledWith(idx + 1, {
          title: result.title,
          authors: result.authors.map(author => author.name),
          url: result.url,
          citationCount: result.citation.count,
          citationUrl: result.citation.url ?? '',
          description: result.description,
          sourceUrl: result.source.url,
          sourceType: result.source.type,
        })
      })
      expect(mockCsvWriter.end).toHaveBeenCalled()
    })

    it('should export papers to CSV while filtering papers when paperIncludes is provided', async () => {
      paperService.findInPaper.mockResolvedValueOnce([
        {
          content: 'Cas9',
          sentences: [
            'The key proteins involved in CRISPR are Cas (CRISPR-associated) proteins, with Cas9 being the most well-known.',
            'Cas9 acts like molecular scissors, guided by RNA sequences to specific locations on the DNA strand where it makes precise cuts.',
          ],
        },
      ])
      paperService.findInPaper.mockResolvedValue([])

      const filePath = await service.exportToCSV('some keywords', 'file.csv', 10, 'cas9')

      expect(filePath).toBe('file.csv')
      expect(ioService.getCsvStreamWriter).toHaveBeenCalledWith('file.csv')
      expect(mockCsvWriter.write).toHaveBeenCalledTimes(1)
      expect(mockCsvWriter.write).toHaveBeenNthCalledWith(1, {
        title: page.papers[0].title,
        authors: page.papers[0].authors.map(author => author.name),
        url: page.papers[0].url,
        citationCount: page.papers[0].citation.count,
        citationUrl: page.papers[0].citation.url ?? '',
        description: page.papers[0].description,
        sourceUrl: page.papers[0].source.url,
        sourceType: page.papers[0].source.type,
        matchedTexts: ['Cas9'],
        relevantSentences: [
          'The key proteins involved in CRISPR are Cas (CRISPR-associated) proteins, with Cas9 being the most well-known.',
          'Cas9 acts like molecular scissors, guided by RNA sequences to specific locations on the DNA strand where it makes precise cuts.',
        ],
      })
      expect(mockCsvWriter.end).toHaveBeenCalled()
    })
  })
})
