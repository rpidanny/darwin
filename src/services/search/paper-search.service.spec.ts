import { GoogleScholar, ISearchResponse } from '@rpidanny/google-scholar'
import { Odysseus } from '@rpidanny/odysseus/dist'
import { Quill } from '@rpidanny/quill'
import { mock } from 'jest-mock-extended'

import { getSearchResponse } from '../../../test/fixtures/google-scholar'
import { getExamplePaperHtmlContent } from '../../../test/fixtures/search.service'
import { CsvStreamWriter } from '../io/csv-stream-writer'
import { IoService } from '../io/io'
import { PaperSearchService } from './paper-search.service'

describe('PaperSearchService', () => {
  const googleScholarMock = mock<GoogleScholar>()
  const odysseusMock = mock<Odysseus>()
  const logger = mock<Quill>()
  const mockCsvWriter = mock<CsvStreamWriter>()
  const ioService = mock<IoService>({
    getCsvStreamWriter: jest.fn().mockResolvedValue(mockCsvWriter),
  })

  let service: PaperSearchService

  beforeEach(() => {
    service = new PaperSearchService(googleScholarMock, odysseusMock, ioService, logger)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('searchPapers', () => {
    it('should search for papers', async () => {
      const mainResp = getSearchResponse()

      const resp: ISearchResponse = {
        ...mainResp,
        results: [...mainResp.results, ...mainResp.results, ...mainResp.results],
        next: null,
      }

      googleScholarMock.search.mockResolvedValue(resp)

      const entities = await service.searchPapers('some keywords')

      expect(entities).toHaveLength(3)
      expect(entities).toEqual(
        resp.results.map(result => ({
          title: result.title,
          authors: result.authors.map(author => author.name),
          description: result.description,
          url: result.url,
          citationCount: result.citation.count,
          citationUrl: result.citation.url ?? '',
          paperUrl: result.paper.url,
          paperType: result.paper.type,
        })),
      )
    })

    it('should stop searching when minItemCount is reached', async () => {
      const mainResp = getSearchResponse()

      const resp: ISearchResponse = {
        ...mainResp,
        results: [...mainResp.results, ...mainResp.results, ...mainResp.results],
      }

      odysseusMock.getContent.mockResolvedValue('')
      googleScholarMock.search.mockResolvedValue(resp)

      const entities = await service.searchPapers('some keywords', 1)

      expect(entities.length).toBeGreaterThan(1)
    })

    it('should continue searching when minItemCount is not reached', async () => {
      const mainResp = getSearchResponse()
      const results = [...mainResp.results, ...mainResp.results, ...mainResp.results]

      const resp: ISearchResponse = {
        ...mainResp,
        results,
      }

      googleScholarMock.search.mockResolvedValue({
        ...resp,
        next: jest.fn().mockResolvedValue(resp),
      })

      const entities = await service.searchPapers('some keywords', 10)

      expect(entities).toHaveLength(6)
    })

    it('should filter papers based on the findRegex', async () => {
      const mainResp = getSearchResponse()

      const resp: ISearchResponse = {
        ...mainResp,
        results: [...mainResp.results, ...mainResp.results],
        next: null,
      }

      googleScholarMock.search.mockResolvedValue(resp)
      odysseusMock.getTextContent.mockResolvedValueOnce(getExamplePaperHtmlContent())
      odysseusMock.getTextContent.mockResolvedValue(
        getExamplePaperHtmlContent('test', 'some-content'),
      )

      const entities = await service.searchPapers('some keywords', 10, 'cas9')

      expect(entities).toHaveLength(1)
      expect(entities).toEqual(
        [resp.results[0]].map(result => ({
          title: result.title,
          authors: result.authors.map(author => author.name),
          description: result.description,
          url: result.url,
          citationCount: result.citation.count,
          citationUrl: result.citation.url ?? '',
          paperUrl: result.paper.url,
          paperType: result.paper.type,
          foundItems: ['Cas9'],
          sentencesOfInterest: [
            'The key proteins involved in CRISPR are Cas (CRISPR-associated) proteins, with Cas9 being the most well-known.',
            'Cas9 acts like molecular scissors, guided by RNA sequences to specific locations on the DNA strand where it makes precise cuts.',
          ],
        })),
      )
    })
  })

  describe('exportPapersToCSV', () => {
    it('should export papers to CSV', async () => {
      const mainResp = getSearchResponse()

      const resp: ISearchResponse = {
        ...mainResp,
        results: [...mainResp.results, ...mainResp.results, ...mainResp.results],
      }

      googleScholarMock.search.mockResolvedValue(resp)

      const filePath = await service.exportPapersToCSV('some keywords', 'file.csv')

      expect(filePath).toBe('file.csv')
      expect(ioService.getCsvStreamWriter).toHaveBeenCalledWith('file.csv')
      resp.results.forEach((result, idx) => {
        expect(mockCsvWriter.write).toHaveBeenNthCalledWith(idx + 1, {
          title: result.title,
          authors: result.authors.map(author => author.name),
          url: result.url,
          citationCount: result.citation.count,
          citationUrl: result.citation.url ?? '',
          description: result.description,
          paperUrl: result.paper.url,
          paperType: result.paper.type,
        })
      })
      expect(mockCsvWriter.end).toHaveBeenCalled()
    })

    it('should export papers to CSV while filtering papers when findRegex is provided', async () => {
      const mainResp = getSearchResponse()

      const resp: ISearchResponse = {
        ...mainResp,
        results: [...mainResp.results, ...mainResp.results, ...mainResp.results],
      }

      googleScholarMock.search.mockResolvedValue(resp)
      odysseusMock.getTextContent.mockResolvedValueOnce(getExamplePaperHtmlContent())
      odysseusMock.getTextContent.mockResolvedValue(
        getExamplePaperHtmlContent('test', 'some-content'),
      )

      const filePath = await service.exportPapersToCSV('some keywords', 'file.csv', 10, 'cas9')

      expect(filePath).toBe('file.csv')
      expect(ioService.getCsvStreamWriter).toHaveBeenCalledWith('file.csv')
      expect(mockCsvWriter.write).toHaveBeenCalledTimes(1)
      expect(mockCsvWriter.write).toHaveBeenNthCalledWith(1, {
        title: resp.results[0].title,
        authors: resp.results[0].authors.map(author => author.name),
        url: resp.results[0].url,
        citationCount: resp.results[0].citation.count,
        citationUrl: resp.results[0].citation.url ?? '',
        description: resp.results[0].description,
        paperUrl: resp.results[0].paper.url,
        paperType: resp.results[0].paper.type,
        foundItems: ['Cas9'],
        sentencesOfInterest: [
          'The key proteins involved in CRISPR are Cas (CRISPR-associated) proteins, with Cas9 being the most well-known.',
          'Cas9 acts like molecular scissors, guided by RNA sequences to specific locations on the DNA strand where it makes precise cuts.',
        ],
      })
      expect(mockCsvWriter.end).toHaveBeenCalled()
    })
  })
})
