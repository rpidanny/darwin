import { mock } from 'jest-mock-extended'
import nock from 'nock'

import { getExamplePaperEntity } from '../../../test/fixtures/search.service'
import { IoService } from '../io/io'
import { PaperSearchService } from '../search/paper-search.service'
import { PaperDownloadService } from './paper-download.service'

describe('PaperDownloadService', () => {
  const ioServiceMock = mock<IoService>()
  const paperSearchServiceMock = mock<PaperSearchService>()
  let paperDownloadService: PaperDownloadService

  const examplePaperEntity = getExamplePaperEntity()

  beforeEach(() => {
    ioServiceMock.writeFile.mockImplementation()
    paperSearchServiceMock.searchPapers.mockImplementation(async (_keywords, _count, onPaper) => {
      if (onPaper) await onPaper(examplePaperEntity)
      return [examplePaperEntity]
    })

    paperDownloadService = new PaperDownloadService(paperSearchServiceMock, ioServiceMock)

    nock.disableNetConnect()
  })

  afterEach(() => {
    if (nock.pendingMocks().length) {
      console.error('Pending mocks: %j', nock.pendingMocks())
      nock.abortPendingRequests()
      throw new Error('Unmatched pending mocks')
    }

    nock.cleanAll()
    nock.enableNetConnect()
    jest.clearAllMocks()
  })

  describe('download', () => {
    it('should download PDFs', async () => {
      const buffer = Buffer.from('PDF content')

      nock('http://example.com').get('/crispr.pdf').reply(200, buffer)

      await expect(paperDownloadService.download('CRISPR', 1, '/output')).resolves.toEqual(
        '/output',
      )

      expect(ioServiceMock.writeFile).toHaveBeenCalledWith(
        `/output/${examplePaperEntity.title}.pdf`,
        buffer,
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

      expect(ioServiceMock.writeFile).not.toHaveBeenCalled()
    })
  })
})
