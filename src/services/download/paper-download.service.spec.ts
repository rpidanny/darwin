import { jest } from '@jest/globals'
import { GoogleScholar } from '@rpidanny/google-scholar/dist'
import { mock } from 'jest-mock-extended'
import nock from 'nock'

import { getMockPageContent } from '../../../test/fixtures/google-scholar'
import { PaperService } from '../paper/paper.service'
import { PaperDownloadService } from './paper-download.service'

describe('PaperDownloadService', () => {
  const paperService = mock<PaperService>()
  const googleScholar = mock<GoogleScholar>()
  let service: PaperDownloadService

  const page = getMockPageContent()

  beforeEach(() => {
    paperService.download.mockImplementation()
    googleScholar.iteratePapers.mockImplementation(async (_options, onPaper) => {
      for (const paper of page.papers) {
        if (!(await onPaper(paper))) return
      }
    })

    service = new PaperDownloadService(googleScholar, paperService)

    nock.disableNetConnect()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('download', () => {
    it('should download papers', async () => {
      await expect(service.downloadPapers('CRISPR', 10, '/output')).resolves.toEqual('/output')

      expect(paperService.download).toHaveBeenCalledTimes(3)
      expect(paperService.download).toHaveBeenNthCalledWith(1, page.papers[0], '/output')
      expect(paperService.download).toHaveBeenNthCalledWith(2, page.papers[1], '/output')
      expect(paperService.download).toHaveBeenNthCalledWith(3, page.papers[2], '/output')
    })

    it('should stop downloading papers when count is reached', async () => {
      await expect(service.downloadPapers('CRISPR', 1, '/output')).resolves.toEqual('/output')

      expect(paperService.download).toHaveBeenCalledTimes(1)
      expect(paperService.download).toHaveBeenCalledWith(page.papers[0], '/output')
    })
  })
})
