import { jest } from '@jest/globals'
import { PaperUrlType } from '@rpidanny/google-scholar/dist'
import { mock } from 'jest-mock-extended'
import nock from 'nock'

import { getSearchResponse } from '../../../test/fixtures/google-scholar'
import { PaperSearchService } from '../search/paper-search.service'
import { DownloadService } from './download.service'
import { PaperDownloadService } from './paper-download.service'

describe('PaperDownloadService', () => {
  const downloadServiceMock = mock<DownloadService>()
  const paperSearchServiceMock = mock<PaperSearchService>()
  let paperDownloadService: PaperDownloadService

  const exampleScholarResponse = getSearchResponse()

  beforeEach(() => {
    downloadServiceMock.download.mockImplementation()
    paperSearchServiceMock.fetchPapers.mockImplementation(async (_keywords, _count, onPaper) => {
      if (onPaper) await onPaper(exampleScholarResponse.results[0])
      return []
    })

    paperDownloadService = new PaperDownloadService(paperSearchServiceMock, downloadServiceMock)

    nock.disableNetConnect()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('download', () => {
    it('should download PDFs', async () => {
      const paper = {
        ...exampleScholarResponse.results[0],
        paper: { type: PaperUrlType.PDF, url: 'http://example.com' },
      }

      paperSearchServiceMock.fetchPapers.mockImplementation(async (_keywords, _count, onPaper) => {
        if (onPaper) await onPaper(paper)
        return []
      })

      await expect(paperDownloadService.download('CRISPR', 1, '/output')).resolves.toEqual(
        '/output',
      )

      expect(downloadServiceMock.download).toHaveBeenCalledWith(
        paper.paper.url,
        `/output/${paper.title.replace(/[\s/]/g, '_')}.pdf`,
      )
    })

    it('should not download if not pfd', async () => {
      const paper = {
        ...exampleScholarResponse.results[0],
      }

      paperSearchServiceMock.fetchPapers.mockImplementation(async (_keywords, _count, onPaper) => {
        if (onPaper) await onPaper(paper)
        return []
      })

      await expect(paperDownloadService.download('CRISPR', 1, '/output')).resolves.toEqual(
        '/output',
      )

      expect(downloadServiceMock.download).not.toHaveBeenCalled()
    })
  })
})
