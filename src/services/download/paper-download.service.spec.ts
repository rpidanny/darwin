import { jest } from '@jest/globals'
import { mock } from 'jest-mock-extended'
import nock from 'nock'

import { getExamplePaperEntity } from '../../../test/fixtures/search.service'
import { PaperSearchService } from '../search/paper-search.service'
import { DownloadService } from './download.service'
import { PaperDownloadService } from './paper-download.service'

describe('PaperDownloadService', () => {
  const downloadServiceMock = mock<DownloadService>()
  const paperSearchServiceMock = mock<PaperSearchService>()
  let paperDownloadService: PaperDownloadService

  const examplePaperEntity = getExamplePaperEntity()

  beforeEach(() => {
    downloadServiceMock.download.mockImplementation()
    paperSearchServiceMock.searchPapers.mockImplementation(async (_keywords, _count, onPaper) => {
      if (onPaper) await onPaper(examplePaperEntity)
      return [examplePaperEntity]
    })

    paperDownloadService = new PaperDownloadService(paperSearchServiceMock, downloadServiceMock)

    nock.disableNetConnect()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('download', () => {
    it('should download PDFs', async () => {
      await expect(paperDownloadService.download('CRISPR', 1, '/output')).resolves.toEqual(
        '/output',
      )

      expect(downloadServiceMock.download).toHaveBeenCalledWith(
        examplePaperEntity.paperUrl,
        `/output/${examplePaperEntity.title}.pdf`,
      )
    })

    it('should not download if not pfd', async () => {
      const paper = getExamplePaperEntity({ paperType: 'html' })

      paperSearchServiceMock.searchPapers.mockImplementationOnce(
        async (_keywords, _count, onPaper) => {
          if (onPaper) await onPaper(paper)
          return [paper]
        },
      )

      await expect(paperDownloadService.download('CRISPR', 1, '/output')).resolves.toEqual(
        '/output',
      )

      expect(downloadServiceMock.download).not.toHaveBeenCalled()
    })
  })
})
