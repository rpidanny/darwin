import { GoogleScholar, ISearchResponse } from '@rpidanny/google-scholar'
import { Odysseus } from '@rpidanny/odysseus/dist'
import { Quill } from '@rpidanny/quill'
import { mock } from 'jest-mock-extended'

import { getSearchResponse } from '../../../test/fixtures/google-scholar'
import { IoService } from '../io/io'
import { SearchService } from './search.service'

describe('SearchService', () => {
  const googleScholarMock = mock<GoogleScholar>()
  const odysseusMock = mock<Odysseus>()
  const logger = mock<Quill>()
  const ioService = mock<IoService>()

  let service: SearchService

  beforeEach(() => {
    service = new SearchService(googleScholarMock, odysseusMock, ioService, logger)
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
          paperUrl: result.paperUrl,
        })),
      )
    })

    it('should stop searching when maxItems is reached', async () => {
      const mainResp = getSearchResponse()

      const resp: ISearchResponse = {
        ...mainResp,
        results: [...mainResp.results, ...mainResp.results, ...mainResp.results],
      }

      odysseusMock.getContent.mockResolvedValue('')
      googleScholarMock.search.mockResolvedValue(resp)

      const entities = await service.searchPapers('some keywords', 1)

      expect(entities).toHaveLength(1)
    })

    it('should continue searching when maxItems is not reached', async () => {
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

      const entities = await service.searchPapers('some keywords', 5)

      expect(entities).toHaveLength(5)
    })
  })

  describe('searchPapersWithAccessionNumbers', () => {
    it('should search for papers with accession numbers', async () => {
      const mainResp = getSearchResponse()

      const resp: ISearchResponse = {
        ...mainResp,
        results: [...mainResp.results, ...mainResp.results, ...mainResp.results],
      }

      const content = 'PRJNA000001 PRJNA000002 PRJNA000003'

      odysseusMock.getContent.mockResolvedValue(content)
      googleScholarMock.search.mockResolvedValue(resp)

      const entities = await service.searchPapersWithAccessionNumbers('some keywords')

      expect(entities).toHaveLength(3)
      expect(entities).toEqual(
        resp.results.map(result => ({
          title: result.title,
          authors: result.authors.map(author => author.name),
          url: result.url,
          accessionNumbers: ['PRJNA000001', 'PRJNA000002', 'PRJNA000003'],
          citationCount: result.citation.count,
          citationUrl: result.citation.url ?? '',
          description: result.description,
          paperUrl: result.paperUrl,
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
      ioService.writeCsv.mockResolvedValue()

      const filePath = await service.exportPapersToCSV('some keywords', 'file.csv')

      expect(filePath).toBe('file.csv')
      expect(ioService.writeCsv).toHaveBeenCalledWith(
        'file.csv',
        resp.results.map(result => ({
          title: result.title,
          authors: result.authors.map(author => author.name),
          description: result.description,
          url: result.url,
          citationCount: result.citation.count,
          citationUrl: result.citation.url ?? '',
          paperUrl: result.paperUrl,
        })),
      )
    })
  })

  describe('exportPapersWithAccessionNumbersToCSV', () => {
    it('should export papers with accession numbers to CSV', async () => {
      const mainResp = getSearchResponse()

      const resp: ISearchResponse = {
        ...mainResp,
        results: [...mainResp.results, ...mainResp.results, ...mainResp.results],
      }

      googleScholarMock.search.mockResolvedValue(resp)
      ioService.writeCsv.mockResolvedValue()

      const filePath = await service.exportPapersWithAccessionNumbersToCSV(
        'some keywords',
        'file.csv',
      )

      expect(filePath).toBe('file.csv')
      expect(ioService.writeCsv).toHaveBeenCalledWith(
        'file.csv',
        resp.results.map(result => ({
          title: result.title,
          authors: result.authors.map(author => author.name),
          url: result.url,
          accessionNumbers: ['PRJNA000001', 'PRJNA000002', 'PRJNA000003'],
          citationCount: result.citation.count,
          citationUrl: result.citation.url ?? '',
          description: result.description,
          paperUrl: result.paperUrl,
        })),
      )
    })
  })
})
