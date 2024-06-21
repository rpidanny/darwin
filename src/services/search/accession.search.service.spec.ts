import { GoogleScholar, ISearchResponse } from '@rpidanny/google-scholar'
import { Odysseus } from '@rpidanny/odysseus/dist'
import { Quill } from '@rpidanny/quill'
import { mock } from 'jest-mock-extended'

import { getSearchResponse } from '../../../test/fixtures/google-scholar'
import { CsvStreamWriter } from '../io/csv-stream-writer'
import { IoService } from '../io/io'
import { AccessionSearchService } from './accession.search.service'

describe('AccessionSearchService', () => {
  const googleScholarMock = mock<GoogleScholar>()
  const odysseusMock = mock<Odysseus>()
  const logger = mock<Quill>()
  const mockCsvWriter = mock<CsvStreamWriter>()
  const ioService = mock<IoService>({
    getCsvStreamWriter: jest.fn().mockResolvedValue(mockCsvWriter),
  })

  let service: AccessionSearchService

  beforeEach(() => {
    service = new AccessionSearchService(googleScholarMock, odysseusMock, ioService, logger)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('searchPapersWithAccessionNumbers', () => {
    const regex = new RegExp('PRJNA\\d+', 'g')

    it('should search for papers with accession numbers', async () => {
      const mainResp = getSearchResponse()

      const resp: ISearchResponse = {
        ...mainResp,
        results: [...mainResp.results, ...mainResp.results, ...mainResp.results],
      }

      const content = 'PRJNA000001 PRJNA000002 PRJNA000003'

      odysseusMock.getContent.mockResolvedValue(content)
      googleScholarMock.search.mockResolvedValue(resp)

      const entities = await service.searchPapersWithAccessionNumbers('some keywords', regex)

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
          paperUrl: result.paper.url,
          paperType: result.paper.type,
        })),
      )
    })

    it('should not throw error when failed to get accession number', async () => {
      const mainResp = getSearchResponse()

      const resp: ISearchResponse = {
        ...mainResp,
        results: [...mainResp.results, ...mainResp.results, ...mainResp.results],
      }

      odysseusMock.getContent.mockRejectedValue(new Error('Failed to get content'))
      googleScholarMock.search.mockResolvedValue(resp)

      await expect(
        service.searchPapersWithAccessionNumbers('some keywords', regex),
      ).resolves.toEqual([])
      expect(logger.error).toHaveBeenCalledWith(
        'Error extracting accession numbers: Failed to get content',
      )
    })
  })

  describe('searchPapersWithBioProjectAccessionNumbers', () => {
    it('should search for papers with accession numbers', async () => {
      const mainResp = getSearchResponse()

      const resp: ISearchResponse = {
        ...mainResp,
        results: [...mainResp.results, ...mainResp.results, ...mainResp.results],
      }

      const content = 'PRJNA000001 PRJNA000002 PRJNA000003'

      odysseusMock.getContent.mockResolvedValue(content)
      googleScholarMock.search.mockResolvedValue(resp)

      const entities = await service.searchPapersWithBioProjectAccessionNumbers('some keywords')

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
          paperUrl: result.paper.url,
          paperType: result.paper.type,
        })),
      )
    })
  })

  describe('exportPapersWithAccessionNumbersToCSV', () => {
    const regex = /PRJNA[0-9]{6}/g

    it('should export papers with accession numbers to CSV', async () => {
      const mainResp = getSearchResponse()

      const resp: ISearchResponse = {
        ...mainResp,
        results: [...mainResp.results, ...mainResp.results, ...mainResp.results],
      }

      const content = 'PRJNA000001 PRJNA000002 PRJNA000003'

      odysseusMock.getContent.mockResolvedValue(content)
      googleScholarMock.search.mockResolvedValue(resp)

      const filePath = await service.exportPapersWithAccessionNumbersToCSV(
        'some keywords',
        regex,
        'file.csv',
      )

      expect(filePath).toBe('file.csv')
      expect(ioService.getCsvStreamWriter).toHaveBeenCalledWith('file.csv')
      expect(mockCsvWriter.write).toHaveBeenCalledTimes(resp.results.length)
      resp.results.map((result, idx) => {
        expect(mockCsvWriter.write).toHaveBeenNthCalledWith(idx + 1, {
          title: result.title,
          authors: result.authors.map(author => author.name),
          url: result.url,
          accessionNumbers: ['PRJNA000001', 'PRJNA000002', 'PRJNA000003'],
          citationCount: result.citation.count,
          citationUrl: result.citation.url ?? '',
          description: result.description,
          paperUrl: result.paper.url,
          paperType: result.paper.type,
        })
      })
    })
  })

  describe('exportPapersWithBioProjectAccessionNumbersToCSV', () => {
    it('should export papers with accession numbers to CSV', async () => {
      const mainResp = getSearchResponse()

      const resp: ISearchResponse = {
        ...mainResp,
        results: [...mainResp.results, ...mainResp.results, ...mainResp.results],
      }

      const content = 'PRJNA000001 PRJNA000002 PRJNA000003'

      odysseusMock.getContent.mockResolvedValue(content)
      googleScholarMock.search.mockResolvedValue(resp)

      const filePath = await service.exportPapersWithBioProjectAccessionNumbersToCSV(
        'some keywords',
        'file.csv',
      )

      expect(filePath).toBe('file.csv')
      expect(ioService.getCsvStreamWriter).toHaveBeenCalledWith('file.csv')
      expect(mockCsvWriter.write).toHaveBeenCalledTimes(resp.results.length)
      resp.results.map((result, idx) => {
        expect(mockCsvWriter.write).toHaveBeenNthCalledWith(idx + 1, {
          title: result.title,
          authors: result.authors.map(author => author.name),
          url: result.url,
          accessionNumbers: ['PRJNA000001', 'PRJNA000002', 'PRJNA000003'],
          citationCount: result.citation.count,
          citationUrl: result.citation.url ?? '',
          description: result.description,
          paperUrl: result.paper.url,
          paperType: result.paper.type,
        })
      })
    })
  })
})
