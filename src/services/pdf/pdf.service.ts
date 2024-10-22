import pdf2md from '@rpidanny/pdf2md'
import { Quill } from '@rpidanny/quill'
import { combinePagesIntoSingleString, parsePageItems } from 'pdf-text-reader'
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs'
import type { TextItem } from 'pdfjs-dist/types/src/display/api'
import { Service } from 'typedi'

import { DownloadService } from '../download/download.service.js'

pdfjs.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/legacy/build/pdf.worker.mjs'

@Service()
export class PdfService {
  constructor(
    private readonly downloadService: DownloadService,
    private readonly logger?: Quill,
  ) {}

  private async downloadPdf(url: string): Promise<Buffer> {
    this.logger?.debug(`Fetching PDF from ${url}`)

    try {
      return await this.downloadService.getContent(url)
    } catch (error) {
      this.logger?.debug(`Failed to get PDF from ${url} : ${(error as Error).message}`)
      throw error
    }
  }

  async getTextContent(url: string): Promise<string> {
    const fileContent = await this.downloadPdf(url)

    const doc = await pdfjs.getDocument({
      data: new Uint8Array(fileContent),
      useSystemFonts: true,
      verbosity: pdfjs.VerbosityLevel.ERRORS,
    }).promise
    const pages = await Promise.all(
      Array.from({ length: doc.numPages }, (_, i) => doc.getPage(i + 1)),
    )
    const content = await Promise.all(pages.map(page => page.getTextContent()))
    const items = content.flatMap(page =>
      page.items.filter((item): item is TextItem => 'str' in item),
    )
    const parsedPages = parsePageItems(items)
    return combinePagesIntoSingleString([parsedPages])
  }

  async getMarkdownContent(url: string): Promise<string> {
    const fileContent = await this.downloadPdf(url)
    return pdf2md(new Uint8Array(fileContent))
  }
}
