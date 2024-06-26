import { jest } from '@jest/globals'
import { mock } from 'jest-mock-extended'

import { DownloadService } from '../download/download.service'
import { IPdfConfig } from './pdf.config'
import { PdfService } from './pdf.service'

describe('PdfService', () => {
  const mockDownloadService = mock<DownloadService>()
  const mockPdfConfig = mock<IPdfConfig>({
    tempPath: '/tmp',
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let pdfService: PdfService

  beforeEach(() => {
    pdfService = new PdfService(mockPdfConfig, mockDownloadService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getTextContent', () => {
    it('should get text content from PDF', async () => {
      // TODO: add test
    })
  })
})
