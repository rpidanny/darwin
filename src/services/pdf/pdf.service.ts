import { Quill } from '@rpidanny/quill'
import { combinePagesIntoSingleString, parsePageItems } from 'pdf-text-reader'
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs'
import type { TextItem } from 'pdfjs-dist/types/src/display/api'

import { DownloadService } from '../download/download.service'
import { IPdfConfig } from './pdf.config'

export class PdfService {
  constructor(
    private readonly config: IPdfConfig,
    private readonly downloadService: DownloadService,
    private readonly logger?: Quill,
  ) {}

  async getTextContent(url: string): Promise<string> {
    const path = `${this.config.tempPath}/${Date.now()}.pdf`

    try {
      await this.downloadService.download(url, path)
    } catch (error) {
      this.logger?.debug(`Failed to download PDF ${url} : ${(error as Error).message}`)
      throw error
    }

    const doc = await pdfjs.getDocument({ url: path, useSystemFonts: true }).promise
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
}