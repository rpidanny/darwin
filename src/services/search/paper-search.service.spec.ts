import { jest } from '@jest/globals'
import { GoogleScholar, ISearchResponse, PaperUrlType } from '@rpidanny/google-scholar'
import { Odysseus } from '@rpidanny/odysseus/dist'
import { Quill } from '@rpidanny/quill'
import { mock } from 'jest-mock-extended'

import { getSearchResponse } from '../../../test/fixtures/google-scholar'
import { getExamplePaperHtmlContent } from '../../../test/fixtures/search.service'
import { CsvStreamWriter } from '../io/csv-stream-writer'
import { IoService } from '../io/io'
import { PdfService } from '../pdf/pdf.service'
import { IPaperSearchConfig } from './paper-search.config'
import { PaperSearchService } from './paper-search.service'

describe('PaperSearchService', () => {
  const googleScholarMock = mock<GoogleScholar>()
  const odysseusMock = mock<Odysseus>()
  const pdfServiceMock = mock<PdfService>()
  const logger = mock<Quill>()
  const mockConfig: IPaperSearchConfig = {
    skipCaptcha: true,
    processPdf: true,
  }

  let mockCsvWriter: CsvStreamWriter
  let ioService: IoService
  let service: PaperSearchService

  const mainResp = getSearchResponse()
  const pdfPaperResult = {
    ...mainResp.results[0],
    paper: { type: PaperUrlType.PDF, url: 'http://example.com' },
  }

  beforeEach(() => {
    mockCsvWriter = mock<CsvStreamWriter>()
    ioService = mock<IoService>({
      getCsvStreamWriter: import.meta.jest.fn().mockResolvedValue(mockCsvWriter),
    })

    service = new PaperSearchService(
      mockConfig,
      googleScholarMock,
      odysseusMock,
      pdfServiceMock,
      ioService,
      logger,
    )
  })

  afterEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  describe('searchPapers', () => {
    it('should search for papers', async () => {
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
      const results = [...mainResp.results, ...mainResp.results, ...mainResp.results]

      const resp: ISearchResponse = {
        ...mainResp,
        results,
      }

      googleScholarMock.search.mockResolvedValue({
        ...resp,
        next: import.meta.jest.fn().mockResolvedValue(resp),
      })

      const entities = await service.searchPapers('some keywords', 10)

      expect(entities).toHaveLength(6)
    })

    it('should filter papers based on the findRegex', async () => {
      const resp: ISearchResponse = {
        ...mainResp,
        results: [pdfPaperResult, pdfPaperResult],
        next: null,
      }

      googleScholarMock.search.mockResolvedValue(resp)
      pdfServiceMock.getTextContent.mockResolvedValueOnce(getExamplePaperHtmlContent())
      pdfServiceMock.getTextContent.mockResolvedValue(
        getExamplePaperHtmlContent('test', 'some-content'),
      )

      const entities = await service.searchPapers('some keywords', 10, undefined, 'cas9')

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

    it('should call odysseus and pdfService for html and pdf papers', async () => {
      const resp: ISearchResponse = {
        ...mainResp,
        results: [...mainResp.results, pdfPaperResult],
        next: null,
      }

      googleScholarMock.search.mockResolvedValue(resp)
      pdfServiceMock.getTextContent.mockResolvedValueOnce(getExamplePaperHtmlContent())
      odysseusMock.getTextContent.mockResolvedValueOnce(getExamplePaperHtmlContent())

      const entities = await service.searchPapers('some keywords', 10, undefined, 'cas9')

      expect(entities).toHaveLength(2)
      expect(odysseusMock.getTextContent).toHaveBeenCalledTimes(1)
      expect(pdfServiceMock.getTextContent).toHaveBeenCalledTimes(1)
    })

    describe('getPaperContent Fallback', () => {
      it('should fallback to web content when pdf processing fails', async () => {
        const resp: ISearchResponse = {
          ...mainResp,
          results: [pdfPaperResult],
          next: null,
        }

        googleScholarMock.search.mockResolvedValue(resp)
        pdfServiceMock.getTextContent.mockRejectedValueOnce(new Error('Failed to process PDF'))
        odysseusMock.getTextContent.mockResolvedValueOnce(getExamplePaperHtmlContent())

        const entities = await service.searchPapers('some keywords', 10, undefined, 'cas9')

        expect(entities).toHaveLength(1)
        expect(pdfServiceMock.getTextContent).toHaveBeenCalledTimes(1)
        expect(odysseusMock.getTextContent).toHaveBeenCalledTimes(1)
        expect(odysseusMock.getTextContent).toHaveBeenCalledWith(
          pdfPaperResult.url,
          undefined,
          false,
        )
      })

      it('should fallback to main web url when pdf processing is disabled', async () => {
        const service = new PaperSearchService(
          { ...mockConfig, processPdf: false },
          googleScholarMock,
          odysseusMock,
          pdfServiceMock,
          ioService,
          logger,
        )

        const resp: ISearchResponse = {
          ...mainResp,
          results: [pdfPaperResult],
          next: null,
        }

        googleScholarMock.search.mockResolvedValue(resp)
        pdfServiceMock.getTextContent.mockResolvedValueOnce(getExamplePaperHtmlContent())
        odysseusMock.getTextContent.mockResolvedValueOnce(getExamplePaperHtmlContent())

        const entities = await service.searchPapers('some keywords', 10, undefined, 'cas9')

        expect(entities).toHaveLength(1)
        expect(pdfServiceMock.getTextContent).not.toHaveBeenCalled()
        expect(odysseusMock.getTextContent).toHaveBeenCalledTimes(1)
        expect(odysseusMock.getTextContent).toHaveBeenCalledWith(
          pdfPaperResult.url,
          undefined,
          false,
        )
      })

      it('should fallback to web content when pdf processing is enabled and pdf is not available', async () => {
        const resp: ISearchResponse = {
          ...mainResp,
          results: [mainResp.results[0]],
          next: null,
        }

        googleScholarMock.search.mockResolvedValue(resp)
        odysseusMock.getTextContent.mockResolvedValueOnce(getExamplePaperHtmlContent())

        const entities = await service.searchPapers('some keywords', 10, undefined, 'cas9')

        expect(entities).toHaveLength(1)
        expect(pdfServiceMock.getTextContent).not.toHaveBeenCalled()
        expect(odysseusMock.getTextContent).toHaveBeenCalledTimes(1)
        expect(odysseusMock.getTextContent).toHaveBeenCalledWith(
          mainResp.results[0].paper.url,
          undefined,
          false,
        )
      })

      it('should fallback to main url when fetching paper url fails', async () => {
        const resp: ISearchResponse = {
          ...mainResp,
          next: null,
        }

        googleScholarMock.search.mockResolvedValue(resp)
        odysseusMock.getTextContent.mockRejectedValueOnce(new Error('Failed to fetch paper url'))
        odysseusMock.getTextContent.mockResolvedValueOnce(getExamplePaperHtmlContent())

        const entities = await service.searchPapers('some keywords', 10, undefined, 'cas9')

        expect(entities).toHaveLength(1)
        expect(pdfServiceMock.getTextContent).not.toHaveBeenCalled()
        expect(odysseusMock.getTextContent).toHaveBeenCalledTimes(2)
        expect(odysseusMock.getTextContent).toHaveBeenCalledWith(
          mainResp.results[0].paper.url,
          undefined,
          false,
        )
        expect(odysseusMock.getTextContent).toHaveBeenCalledWith(
          mainResp.results[0].url,
          undefined,
          false,
        )
      })
    })
  })

  describe('exportPapersToCSV', () => {
    it('should export papers to CSV', async () => {
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
        results: [pdfPaperResult, pdfPaperResult, pdfPaperResult],
      }

      googleScholarMock.search.mockResolvedValue(resp)
      pdfServiceMock.getTextContent.mockResolvedValueOnce(getExamplePaperHtmlContent())
      pdfServiceMock.getTextContent.mockResolvedValue(
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
