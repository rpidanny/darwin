import { IPaperMetadata } from '@rpidanny/google-scholar'
import { Odysseus } from '@rpidanny/odysseus'
import { Quill } from '@rpidanny/quill'

import { DownloadService } from '../download/download.service'
import { PdfService } from '../pdf/pdf.service'
import { ITextMatch } from './interfaces'
import { IPaperServiceConfig } from './paper.service.config'

export class PaperService {
  constructor(
    private readonly config: IPaperServiceConfig,
    private readonly odysseus: Odysseus,
    private readonly pdfService: PdfService,
    private readonly downloadService: DownloadService,
    private readonly logger?: Quill,
  ) {}

  private async getWebContent(url: string): Promise<string> {
    return this.odysseus.getTextContent(url, undefined, !this.config.skipCaptcha)
  }

  private async getPdfContent(url: string): Promise<string> {
    return this.pdfService.getTextContent(url)
  }

  // TODO: limit length of sentence
  private getSentence(text: string, index: number): string {
    const start = text.lastIndexOf('.', index) + 1
    const end = text.indexOf('.', index) + 1
    return text.slice(start, end).trim()
  }

  /*
   * Returns the text content of a paper.
   * If processPdf is disabled, the text content is extracted from the main URL.
   * If processPdf is enabled:
   * - If the paper is a PDF, the text content is extracted from the PDF URL.
   * - If the paper is not a PDF, the text content is extracted from the paper URL.
   * If either extraction fails, the text content is extracted from the main URL.
   * If the main URL is empty, an empty string is returned.
   * */
  public async getTextContent({ url, paper }: IPaperMetadata): Promise<string> {
    if (!this.config.processPdf) {
      return url !== '' ? this.getWebContent(url) : ''
    }

    try {
      if (paper.type === 'pdf') return await this.getPdfContent(paper.url)
      if (paper.url !== '') return await this.getWebContent(paper.url)
    } catch (error) {
      this.logger?.debug(
        `Error extracting text from ${paper.type} ${paper.url}: ${(error as Error).message}`,
      )
    }

    if (url === '') return ''
    this.logger?.debug(`Falling back to main url ${url}`)
    return this.getWebContent(url)
  }

  /*
   * Finds occurrences of a regex pattern in the paper content.
   * Returns an array of found items, each containing the matched text and associated sentences.
   * */
  public async findInPaper(paper: IPaperMetadata, findRegex: string): Promise<ITextMatch[]> {
    try {
      const paperContent = await this.getTextContent(paper)
      const matches = paperContent.matchAll(new RegExp(findRegex, 'gi'))
      const foundItems = new Map<string, string[]>()

      for (const match of matches) {
        const sentence = this.getSentence(paperContent, match.index)
        const currentSentences = foundItems.get(match[0]) || []
        currentSentences.push(sentence)
        foundItems.set(match[0], currentSentences)
      }

      return Array.from(foundItems).map(([content, sentences]) => ({ content, sentences }))
    } catch (error) {
      this.logger?.warn(`Error extracting regex in paper: ${(error as Error).message}`)
      return []
    }
  }

  /*
   * Downloads the paper if it is a PDF.
   * */
  public async download({ title, paper }: IPaperMetadata, outputDir: string): Promise<void> {
    if (paper.type !== 'pdf') {
      this.logger?.debug(`Skipping download for non-PDF paper: ${title}`)
      return
    }

    const filePath = `${outputDir}/${title.replace(/[\s/]/g, '_')}.${paper.type}`
    await this.downloadService.download(paper.url, filePath)
  }
}
