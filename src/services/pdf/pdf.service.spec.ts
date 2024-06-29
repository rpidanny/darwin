import { jest } from '@jest/globals'
import { readFile } from 'fs/promises'
import { mock } from 'jest-mock-extended'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

import { DownloadService } from '../download/download.service'
import { PdfService } from './pdf.service'

describe('PdfService', () => {
  const __dirname = dirname(fileURLToPath(import.meta.url))

  const mockDownloadService = mock<DownloadService>({
    getContent: () =>
      readFile(
        join(
          __dirname,
          '../../../test/data/papers/The-new-frontier-of-genome-engineering-with-CRISPR-Cas9.pdf',
        ),
      ),
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let pdfService: PdfService
  beforeEach(() => {
    pdfService = new PdfService(mockDownloadService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getTextContent', () => {
    it('should get text content from PDF', async () => {
      const content = await pdfService.getTextContent('https://example.com')
      expect(content).toContain('The new frontier of genome engineering with CRISPR-Cas9')
    })
  })
})
