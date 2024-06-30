import { jest } from '@jest/globals'
import { PaperSourceType } from '@rpidanny/google-scholar'
import { Odysseus } from '@rpidanny/odysseus'
import { mock } from 'jest-mock-extended'

import { getMockPaperMetadata } from '../../../test/fixtures/google-scholar'
import { DownloadService } from '../download/download.service'
import { PdfService } from '../pdf/pdf.service'
import { PaperService } from './paper.service'
import { IPaperServiceConfig } from './paper.service.config'

describe('PaperService', () => {
  const htmlPaperMetadata = getMockPaperMetadata()
  const pdfPaperMetadata = getMockPaperMetadata({
    source: {
      ...htmlPaperMetadata.source,
      type: PaperSourceType.PDF,
    },
  })

  const pdfServiceMock = mock<PdfService>()
  const odysseusMock = mock<Odysseus>()
  const downloadService = mock<DownloadService>()
  const config: IPaperServiceConfig = {
    processPdf: true,
    skipCaptcha: true,
  }

  let service: PaperService

  beforeEach(() => {
    service = new PaperService(config, odysseusMock, pdfServiceMock, downloadService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getTextContent', () => {
    it('should get text content from main url when pdf processing is disabled', async () => {
      const service = new PaperService(
        { ...config, processPdf: false },
        odysseusMock,
        pdfServiceMock,
        downloadService,
      )

      odysseusMock.getTextContent.mockResolvedValueOnce('some-text')

      const content = await service.getTextContent(htmlPaperMetadata)

      expect(content).toBe('some-text')
      expect(odysseusMock.getTextContent).toHaveBeenCalledTimes(1)
      expect(odysseusMock.getTextContent).toHaveBeenCalledWith(htmlPaperMetadata.url, {
        waitOnCaptcha: !config.skipCaptcha,
        throwOnCaptcha: true,
      })
      expect(pdfServiceMock.getTextContent).not.toHaveBeenCalled()
    })

    it('should get text content from pdf url when paper is a pdf', async () => {
      pdfServiceMock.getTextContent.mockResolvedValueOnce('some-text')

      const content = await service.getTextContent(pdfPaperMetadata)

      expect(content).toBe('some-text')
      expect(pdfServiceMock.getTextContent).toHaveBeenCalledTimes(1)
      expect(pdfServiceMock.getTextContent).toHaveBeenCalledWith(pdfPaperMetadata.source.url)
      expect(odysseusMock.getTextContent).not.toHaveBeenCalled()
    })

    it('should get text content from paper url when paper is not a pdf', async () => {
      odysseusMock.getTextContent.mockResolvedValueOnce('some-text')

      const content = await service.getTextContent(htmlPaperMetadata)

      expect(content).toBe('some-text')
      expect(odysseusMock.getTextContent).toHaveBeenCalledTimes(1)
      expect(odysseusMock.getTextContent).toHaveBeenCalledWith(htmlPaperMetadata.source.url, {
        waitOnCaptcha: !config.skipCaptcha,
        throwOnCaptcha: true,
      })
      expect(pdfServiceMock.getTextContent).not.toHaveBeenCalled()
    })

    it('should fallback to main url when pdf processing fails', async () => {
      pdfServiceMock.getTextContent.mockRejectedValueOnce(new Error('Failed to process PDF'))
      odysseusMock.getTextContent.mockResolvedValueOnce('some-text')

      const content = await service.getTextContent(pdfPaperMetadata)

      expect(content).toBe('some-text')
      expect(pdfServiceMock.getTextContent).toHaveBeenCalledTimes(1)
      expect(odysseusMock.getTextContent).toHaveBeenCalledTimes(1)
      expect(odysseusMock.getTextContent).toHaveBeenCalledWith(pdfPaperMetadata.url, {
        waitOnCaptcha: !config.skipCaptcha,
        throwOnCaptcha: true,
      })
    })

    it('should fallback to main url when paper url is empty', async () => {
      const metadata = getMockPaperMetadata({ source: { ...htmlPaperMetadata.source, url: '' } })
      odysseusMock.getTextContent.mockResolvedValueOnce('some-text')

      const content = await service.getTextContent(metadata)

      expect(content).toBe('some-text')
      expect(odysseusMock.getTextContent).toHaveBeenCalledTimes(1)
      expect(odysseusMock.getTextContent).toHaveBeenCalledWith(metadata.url, {
        waitOnCaptcha: !config.skipCaptcha,
        throwOnCaptcha: true,
      })
    })

    it('should return empty string when url is empty when processPdf is false', async () => {
      const service = new PaperService(
        { ...config, processPdf: false },
        odysseusMock,
        pdfServiceMock,
        downloadService,
      )

      const metadata = getMockPaperMetadata({ url: '' })

      const content = await service.getTextContent(metadata)

      expect(content).toBe('')
      expect(odysseusMock.getTextContent).not.toHaveBeenCalled()
      expect(pdfServiceMock.getTextContent).not.toHaveBeenCalled()
    })

    it('should return empty string when falling back to main url and url is empty', async () => {
      const metadata = getMockPaperMetadata({ url: '' })
      odysseusMock.getTextContent.mockRejectedValueOnce(new Error('Failed to process PDF'))

      const content = await service.getTextContent(metadata)

      expect(content).toBe('')
      expect(odysseusMock.getTextContent).toHaveBeenCalledTimes(1)
      expect(pdfServiceMock.getTextContent).not.toHaveBeenCalled()
    })
  })

  describe('findInPaper', () => {
    it('should find regex in paper content', async () => {
      jest
        .spyOn(service, 'getTextContent')
        .mockResolvedValueOnce(
          'CRISPR–Cas9 structures and mechanisms. In this review, we briefly explain the biology underlying CRISPR–Cas9 technology.',
        )

      const foundItems = await service.findInPaper(htmlPaperMetadata, 'CRISPR–Cas9')

      expect(foundItems).toHaveLength(1)
      expect(foundItems[0].content).toBe('CRISPR–Cas9')
      expect(foundItems[0].sentences).toEqual([
        'CRISPR–Cas9 structures and mechanisms.',
        'In this review, we briefly explain the biology underlying CRISPR–Cas9 technology.',
      ])
    })

    it('should find multiple items in paper content', async () => {
      jest
        .spyOn(service, 'getTextContent')
        .mockResolvedValueOnce(
          'CRISPR–Cas9 structures and mechanisms. In this review, we briefly explain the biology underlying CRISPR–Cas9 technology.',
        )

      const foundItems = await service.findInPaper(htmlPaperMetadata, 'CRISPR|Cas9')

      expect(foundItems).toHaveLength(2)
      expect(foundItems[0].content).toBe('CRISPR')
      expect(foundItems[0].sentences).toEqual([
        'CRISPR–Cas9 structures and mechanisms.',
        'In this review, we briefly explain the biology underlying CRISPR–Cas9 technology.',
      ])
      expect(foundItems[1].content).toBe('Cas9')
      expect(foundItems[1].sentences).toEqual([
        'CRISPR–Cas9 structures and mechanisms.',
        'In this review, we briefly explain the biology underlying CRISPR–Cas9 technology.',
      ])
    })

    it('should return empty array if regex is not found in paper content', async () => {
      jest.spyOn(service, 'getTextContent').mockResolvedValueOnce('some-text')

      const foundItems = await service.findInPaper(htmlPaperMetadata, 'CRISPR–Cas9')

      expect(foundItems).toHaveLength(0)
    })

    it('should return empty string when getTextContent fails', async () => {
      jest.spyOn(service, 'getTextContent').mockRejectedValueOnce(new Error('Failed to get text'))

      const foundItems = await service.findInPaper(htmlPaperMetadata, 'CRISPR–Cas9')

      expect(foundItems).toHaveLength(0)
    })
  })

  describe('download', () => {
    const outputDir = 'output-dir'

    it('should download paper if paper is a pdf', async () => {
      const expectedFilePath = `${outputDir}/${pdfPaperMetadata.title.replace(/[\s/]/g, '_')}.pdf`

      await service.download(pdfPaperMetadata, outputDir)

      expect(downloadService.download).toHaveBeenCalledTimes(1)
      expect(downloadService.download).toHaveBeenCalledWith(
        pdfPaperMetadata.source.url,
        expectedFilePath,
      )
    })

    it('should skip download if paper is not a pdf', async () => {
      await service.download(htmlPaperMetadata, outputDir)

      expect(downloadService.download).not.toHaveBeenCalled()
    })
  })
})
