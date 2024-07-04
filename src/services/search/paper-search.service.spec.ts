import { jest } from '@jest/globals'
import { GoogleScholar } from '@rpidanny/google-scholar'
import { CaptchaError } from '@rpidanny/odysseus/dist/index.js'
import { Quill } from '@rpidanny/quill'
import { mock } from 'jest-mock-extended'

import { getMockPageContent } from '../../../test/fixtures/google-scholar'
import { CsvStreamWriter } from '../io/csv-stream-writer'
import { IoService } from '../io/io.service'
import { LLMService } from '../llm/llm.service.js'
import { PaperService } from '../paper/paper.service'
import { AccessionPattern } from './constants.js'
import { PaperSearchConfig } from './paper-search.config'
import { PaperSearchService } from './paper-search.service'

describe('PaperSearchService', () => {
  const page = getMockPageContent()

  const googleScholarMock = mock<GoogleScholar>()
  const paperService = mock<PaperService>()
  const logger = mock<Quill>()
  const llmService = mock<LLMService>()

  const mockConfig: PaperSearchConfig = {
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

    service = new PaperSearchService(
      mockConfig,
      googleScholarMock,
      paperService,
      ioService,
      llmService,
      logger,
    )
  })

  afterEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(1_719_677_868_856)
  })
  afterAll(() => {
    jest.useRealTimers()
  })

  describe('search', () => {
    it('should search for papers', async () => {
      const entities = await service.search({ keywords: 'some keywords', minItemCount: 10 })

      expect(entities).toHaveLength(3)
      expect(entities).toEqual(
        page.papers.map(result => ({
          title: result.title,
          authors: result.authors.map(author => author.name),
          description: result.description,
          url: result.url,
          citation: result.citation,
          source: result.source,
        })),
      )
    })

    it('should stop searching when minItemCount is reached', async () => {
      const entities = await service.search({ keywords: 'some keywords', minItemCount: 1 })

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

      const entities = await service.search({
        keywords: 'some keywords',
        minItemCount: 10,
        filterPattern: 'cas9',
      })

      expect(entities).toHaveLength(1)
      expect(entities).toEqual(
        [page.papers[0]].map(result => ({
          title: result.title,
          authors: result.authors.map(author => author.name),
          description: result.description,
          url: result.url,
          citation: result.citation,
          source: result.source,
          matches: [
            {
              content: 'Cas9',
              sentences: [
                'The key proteins involved in CRISPR are Cas (CRISPR-associated) proteins, with Cas9 being the most well-known.',
                'Cas9 acts like molecular scissors, guided by RNA sequences to specific locations on the DNA strand where it makes precise cuts.',
              ],
            },
          ],
        })),
      )
    })

    it('should skip paper when CaptchaError is thrown', async () => {
      paperService.getTextContent.mockRejectedValue(new CaptchaError())

      const entities = await service.search({
        keywords: 'some keywords',
        minItemCount: 10,
        filterPattern: 'cas9',
      })

      expect(entities).toHaveLength(0)
    })

    it('should summarize papers if summarize is true', async () => {
      llmService.summarize.mockResolvedValue('This is a summary.')

      const entities = await service.search({
        keywords: 'some keywords',
        minItemCount: 10,
        summarize: true,
      })

      expect(entities).toHaveLength(3)
      expect(entities).toEqual(
        page.papers.map(result => ({
          title: result.title,
          authors: result.authors.map(author => author.name),
          description: result.description,
          url: result.url,
          citation: result.citation,
          source: result.source,
          summary: 'This is a summary.',
        })),
      )
    })

    it('should ask question and store answer if question is provided', async () => {
      const answer = 'transformer is better than RNN, duhhhh'
      llmService.ask.mockResolvedValue(answer)

      const entities = await service.search({
        keywords: 'some keywords',
        minItemCount: 10,
        question: 'Is it better than RNN?',
      })

      expect(entities).toHaveLength(3)
      expect(entities).toEqual(
        page.papers.map(result => ({
          title: result.title,
          authors: result.authors.map(author => author.name),
          description: result.description,
          url: result.url,
          citation: result.citation,
          source: result.source,
          answer,
        })),
      )
    })
  })

  describe('exportToCSV', () => {
    it('should export papers to CSV', async () => {
      const filePath = await service.exportToCSV('file.csv', {
        keywords: 'some keywords',
        minItemCount: 10,
      })

      expect(filePath).toBe('file.csv')
      expect(ioService.getCsvStreamWriter).toHaveBeenCalledWith('file.csv')
      page.papers.forEach((result, idx) => {
        expect(mockCsvWriter.write).toHaveBeenNthCalledWith(idx + 1, {
          title: result.title,
          authors: result.authors.map(author => author.name),
          url: result.url,
          description: result.description,
          citation: result.citation,
          source: result.source,
        })
      })
      expect(mockCsvWriter.end).toHaveBeenCalled()
    })

    it('should export papers to CSV with autogenerated filename when path is a directory', async () => {
      jest.spyOn(ioService, 'isDirectory').mockReturnValue(true)
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

      const expectedPath = `data/exports/some-keywords_PRJNA-d-_1719677868856.csv`
      const filePath = await service.exportToCSV('data/exports/', {
        keywords: 'some keywords',
        minItemCount: 10,
        filterPattern: AccessionPattern.BioProject,
      })

      expect(filePath).toBe(expectedPath)
      expect(ioService.getCsvStreamWriter).toHaveBeenCalledWith(expectedPath)
      expect(mockCsvWriter.write).toHaveBeenCalledTimes(1)
      expect(mockCsvWriter.write).toHaveBeenNthCalledWith(1, {
        title: page.papers[0].title,
        authors: page.papers[0].authors.map(author => author.name),
        url: page.papers[0].url,
        description: page.papers[0].description,
        citation: page.papers[0].citation,
        source: page.papers[0].source,
        matches: [
          {
            content: 'Cas9',
            sentences: [
              'The key proteins involved in CRISPR are Cas (CRISPR-associated) proteins, with Cas9 being the most well-known.',
              'Cas9 acts like molecular scissors, guided by RNA sequences to specific locations on the DNA strand where it makes precise cuts.',
            ],
          },
        ],
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

      const filePath = await service.exportToCSV('file.csv', {
        keywords: 'some keywords',
        minItemCount: 10,
        filterPattern: 'cas9',
      })

      expect(filePath).toBe('file.csv')
      expect(ioService.getCsvStreamWriter).toHaveBeenCalledWith('file.csv')
      expect(mockCsvWriter.write).toHaveBeenCalledTimes(1)
      expect(mockCsvWriter.write).toHaveBeenNthCalledWith(1, {
        title: page.papers[0].title,
        authors: page.papers[0].authors.map(author => author.name),
        url: page.papers[0].url,
        description: page.papers[0].description,
        citation: page.papers[0].citation,
        source: page.papers[0].source,
        matches: [
          {
            content: 'Cas9',
            sentences: [
              'The key proteins involved in CRISPR are Cas (CRISPR-associated) proteins, with Cas9 being the most well-known.',
              'Cas9 acts like molecular scissors, guided by RNA sequences to specific locations on the DNA strand where it makes precise cuts.',
            ],
          },
        ],
      })
      expect(mockCsvWriter.end).toHaveBeenCalled()
    })
  })

  describe('getFilePath', () => {
    it('should return the given path if it is not a directory', () => {
      const path = service.getFilePath('file.csv', { keywords: 'some keywords' })

      expect(path).toBe('file.csv')
    })

    it('should return a generated path if the given path is a directory', () => {
      jest.spyOn(ioService, 'isDirectory').mockReturnValue(true)

      const path = service.getFilePath('data/exports/', { keywords: 'some keywords' })

      expect(path).toBe('data/exports/some-keywords_1719677868856.csv')
    })

    it('should return a generated path with filter pattern if the given path is a directory and filterPattern is provided', () => {
      jest.spyOn(ioService, 'isDirectory').mockReturnValue(true)

      const path = service.getFilePath('data/exports/', {
        keywords: 'some keywords',
        filterPattern: 'cas9',
      })

      expect(path).toBe('data/exports/some-keywords_cas9_1719677868856.csv')
    })

    it('should return a generated path with question if the given path is a directory and question is provided', () => {
      jest.spyOn(ioService, 'isDirectory').mockReturnValue(true)

      const path = service.getFilePath('data/exports/', {
        keywords: 'some keywords',
        question: 'Is it better than RNN?',
      })

      expect(path).toBe('data/exports/some-keywords_Is-it-better-than-RNN-_1719677868856.csv')
    })
  })
})
