import { GoogleScholar, IGoogleScholarResult } from '@rpidanny/google-scholar/dist'
import { Odysseus } from '@rpidanny/odysseus'
import { Quill } from '@rpidanny/quill'

import { IoService } from '../io/io'
import { PdfService } from '../pdf/pdf.service'
import { FoundItem, PaperEntity } from './interfaces'
import { IPaperSearchConfig } from './paper-search.config'

export class PaperSearchService {
  constructor(
    protected readonly config: IPaperSearchConfig,
    protected readonly googleScholar: GoogleScholar,
    protected readonly odysseus: Odysseus,
    protected readonly pdfService: PdfService,
    protected readonly ioService: IoService,
    protected readonly logger?: Quill,
  ) {}

  public async searchPapers(
    keywords: string,
    minItemCount: number = 20,
    onData?: (data: PaperEntity) => Promise<any>,
    findRegex?: string,
  ): Promise<PaperEntity[]> {
    return this.fetchPapers<PaperEntity>(keywords, minItemCount, async result => {
      let data

      if (findRegex) {
        const items = await this.findInPaper(result, findRegex)

        if (!items.length) return null

        this.logger?.debug(`Found search keywords: ${items}`)
        data = this.mapResultToPaperEntity(result, items)
      } else {
        data = this.mapResultToPaperEntity(result)
      }

      if (onData) await onData(data)
      return data
    })
  }

  public async exportPapersToCSV(
    keywords: string,
    filePath: string,
    minItemCount: number = 20,
    findRegex?: string,
  ): Promise<string> {
    const outputWriter = await this.ioService.getCsvStreamWriter(filePath)
    await this.searchPapers(
      keywords,
      minItemCount,
      async data => await outputWriter.write(data),
      findRegex,
    )
    await outputWriter.end()
    return filePath
  }

  protected async fetchPapers<T>(
    keywords: string,
    minItemCount: number,
    mapResult: (result: IGoogleScholarResult) => Promise<T | null>,
  ): Promise<T[]> {
    this.logger?.info(`Searching papers for: ${keywords}. Max items: ${minItemCount}`)
    const entities: T[] = []
    let response = await this.googleScholar.search(keywords)
    while (response) {
      await Promise.all(
        response.results.map(async (result): Promise<any> => {
          const entity = await mapResult(result)
          if (entity) entities.push(entity)
        }),
      )
      if (!response.next || entities.length >= minItemCount) break
      response = await response.next()
    }
    return entities
  }

  private getSentence(text: string, index: number): string {
    const start = text.lastIndexOf('.', index) + 1
    const end = text.indexOf('.', index) + 1
    return text.slice(start, end).trim()
  }

  private async getWebContent(url: string): Promise<string> {
    return this.odysseus.getTextContent(url, undefined, !this.config.skipCaptcha)
  }

  private async getPdfContent(url: string): Promise<string> {
    return this.pdfService.getTextContent(url)
  }

  protected async getPaperContent({ url, paper }: IGoogleScholarResult): Promise<string> {
    // if pdf processing is disabled, get text content from main url
    if (!this.config.processPdf) {
      return this.getWebContent(url)
    }

    // 1: first try to get text content from pdf
    if (paper.type === 'pdf') {
      try {
        return await this.getPdfContent(paper.url)
      } catch (error) {
        this.logger?.debug(
          `Error extracting text from pdf ${paper.url}: ${(error as Error).message}`,
        )
      }
    } else {
      // 2: if pdf content is not available, try to get text content from paper url
      if (paper.url !== '') {
        try {
          return await this.getWebContent(paper.url)
        } catch (error) {
          this.logger?.debug(
            `Error extracting text from paper ${paper.url}: ${(error as Error).message}`,
          )
        }
      }
    }

    this.logger?.debug('Falling back to main url content...')

    // 3: if paper url is not available, try to get text content from main url
    return this.getWebContent(url)
  }

  private async findInPaper(result: IGoogleScholarResult, findRegex: string): Promise<FoundItem[]> {
    if (!result.url) return []
    try {
      const paperContent = await this.getPaperContent(result)
      const regex = new RegExp(findRegex, 'gi')
      const matches = paperContent.matchAll(regex)

      const foundItems = new Map<string, string[]>()

      for (const match of matches) {
        const sentence = this.getSentence(paperContent, match.index)
        const currentSentences = foundItems.get(match[0]) || []
        currentSentences.push(sentence)
        foundItems.set(match[0], currentSentences)
      }

      return Array.from(foundItems).map(([text, sentences]) => ({ text, sentences }))
    } catch (error) {
      this.logger?.error(`Error extracting regex in paper: ${(error as Error).message}`)
      return []
    }
  }

  private mapResultToPaperEntity(
    result: IGoogleScholarResult,
    foundItems?: FoundItem[],
  ): PaperEntity {
    return {
      title: result.title,
      authors: result.authors.map(author => author.name),
      url: result.url,
      paperType: result.paper.type,
      paperUrl: result.paper.url,
      citationUrl: result.citation.url ?? '',
      citationCount: result.citation.count,
      description: result.description,
      foundItems: foundItems?.map(item => item.text) ?? undefined,
      sentencesOfInterest: foundItems?.map(item => item.sentences).flat() ?? undefined,
    }
  }
}
