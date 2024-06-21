import { GoogleScholar, IGoogleScholarResult } from '@rpidanny/google-scholar/dist'
import { Odysseus } from '@rpidanny/odysseus'
import { Quill } from '@rpidanny/quill'

import { IoService } from '../io/io'
import { PaperEntity } from './interfaces'

export class PaperSearchService {
  constructor(
    protected readonly googleScholar: GoogleScholar,
    protected readonly odysseus: Odysseus,
    protected readonly ioService: IoService,
    protected readonly logger?: Quill,
  ) {}

  public async searchPapers(
    keywords: string,
    minItemCount: number = 20,
    findRegex?: string,
    waitOnCaptcha: boolean = true,
    onData?: (data: PaperEntity) => Promise<any>,
  ): Promise<PaperEntity[]> {
    return this.fetchPapers<PaperEntity>(keywords, minItemCount, async result => {
      let data

      if (findRegex) {
        const items = await this.findInPaper(result, findRegex, waitOnCaptcha)

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
    waitOnCaptcha: boolean = true,
  ): Promise<string> {
    const outputWriter = await this.ioService.getCsvStreamWriter(filePath)
    await this.searchPapers(
      keywords,
      minItemCount,
      findRegex,
      waitOnCaptcha,
      async data => await outputWriter.write(data),
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
    while (response && (!minItemCount || entities.length < minItemCount)) {
      await Promise.all(
        response.results.map(async (result): Promise<any> => {
          const entity = await mapResult(result)
          if (entity) entities.push(entity)
        }),
      )
      if (!response.next) break
      response = await response.next()
    }
    return entities
  }

  private async findInPaper(
    result: IGoogleScholarResult,
    findRegex: string,
    waitOnCaptcha: boolean,
  ): Promise<string[]> {
    if (!result.url) return []
    try {
      const textContent = await this.odysseus.getTextContent(result.url, undefined, waitOnCaptcha)
      const regex = new RegExp(findRegex, 'gi')
      const matches = textContent.match(regex)
      return [...new Set(matches)]
    } catch (error) {
      this.logger?.error(`Error extracting regex in paper: ${(error as Error).message}`)
      return []
    }
  }

  private mapResultToPaperEntity(result: IGoogleScholarResult, foundItems?: string[]): PaperEntity {
    return {
      title: result.title,
      authors: result.authors.map(author => author.name),
      url: result.url,
      paperType: result.paper.type,
      paperUrl: result.paper.url,
      citationUrl: result.citation.url ?? '',
      citationCount: result.citation.count,
      description: result.description,
      foundItems,
    }
  }
}
