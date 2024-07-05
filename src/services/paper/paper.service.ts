import { IPaperMetadata } from '@rpidanny/google-scholar'
import { Odysseus } from '@rpidanny/odysseus'
import { Quill } from '@rpidanny/quill'
import { Service } from 'typedi'

import { ITextMatch } from '../../utils/text/interfaces.js'
import { findInText } from '../../utils/text/text-search.js'
import { DownloadService } from '../download/download.service.js'
import { PdfService } from '../pdf/pdf.service.js'
import { PaperServiceConfig } from './paper.service.config.js'

@Service()
export class PaperService {
  constructor(
    private readonly config: PaperServiceConfig,
    private readonly odysseus: Odysseus,
    private readonly pdfService: PdfService,
    private readonly downloadService: DownloadService,
    private readonly logger?: Quill,
  ) {}

  private async getWebContent(url: string): Promise<string> {
    return this.odysseus.getMarkdownContent(url, {
      waitOnCaptcha: !this.config.skipCaptcha,
      throwOnCaptcha: true,
    })
  }

  private async getPdfContent(url: string): Promise<string> {
    return this.pdfService.getTextContent(url)
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
  public async getTextContent({
    url,
    source,
  }: Pick<IPaperMetadata, 'url' | 'source'>): Promise<string> {
    if (this.config.legacyProcessing) {
      return url !== '' ? this.getWebContent(url) : ''
    }

    try {
      if (source.type === 'pdf') return await this.getPdfContent(source.url)
      if (source.url !== '') return await this.getWebContent(source.url)
    } catch (error) {
      this.logger?.debug(
        `Error extracting text from ${source.type} ${source.url}: ${(error as Error).message}`,
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
  public async findInPaper(paperContent: string, findRegex: string): Promise<ITextMatch[]> {
    try {
      return findInText(paperContent, new RegExp(findRegex, 'gi'))
    } catch (error) {
      this.logger?.debug(`Failed finding ${findRegex} in paper: ${(error as Error).message}`)
      return []
    }
  }

  /*
   * Downloads the paper if it is a PDF.
   * */
  public async download({ title, source }: IPaperMetadata, outputDir: string): Promise<void> {
    if (source.type !== 'pdf') {
      this.logger?.debug(`Skipping download for non-PDF paper: ${title}`)
      return
    }

    const filePath = `${outputDir}/${title.replace(/[\s/]/g, '_')}.${source.type}`
    await this.downloadService.download(source.url, filePath)
  }
}
