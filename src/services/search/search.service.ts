import { GoogleScholar, IGoogleScholarResult } from '@rpidanny/google-scholar/dist'
import { Odysseus } from '@rpidanny/odysseus'
import { Quill } from '@rpidanny/quill'

import { IoService } from '../io/io'
import { PaperEntity, PaperWithAccessionEntity } from './interfaces'

export class SearchService {
  private bioProjectAccessionRegex = /PRJNA\d+/g

  constructor(
    private readonly googleScholar: GoogleScholar,
    private readonly odysseus: Odysseus,
    private readonly ioService: IoService,
    private readonly logger?: Quill,
  ) {}

  public async searchPapers(keywords: string, maxItems: number = 20): Promise<PaperEntity[]> {
    return this.fetchPapers<PaperEntity>(keywords, maxItems, async result => ({
      title: result.title,
      authors: result.authors.map(author => author.name),
      url: result.url,
      paperUrl: result.paperUrl,
      citationUrl: result.citation.url ?? '',
      citationCount: result.citation.count,
      description: result.description,
    }))
  }

  public async searchPapersWithAccessionNumbers(
    keywords: string,
    regex: RegExp,
    maxItems: number = 20,
  ): Promise<PaperWithAccessionEntity[]> {
    return this.fetchPapers<PaperWithAccessionEntity>(keywords, maxItems, async result => {
      if (!result || result.url == null) return null

      const accessionNumbers = await this.extractAccessionNumbers(result, regex)
      if (!accessionNumbers.length) return null

      this.logger?.info(`Found accession numbers: ${accessionNumbers}`)

      return {
        title: result.title,
        accessionNumbers,
        authors: result.authors.map(author => author.name),
        url: result.url,
        paperUrl: result.paperUrl,
        citationUrl: result.citation.url ?? '',
        citationCount: result.citation.count,
        description: result.description,
      }
    })
  }

  public async searchPapersWithBioProjectAccessionNumbers(
    keywords: string,
    maxItems = 10,
  ): Promise<PaperWithAccessionEntity[]> {
    return this.searchPapersWithAccessionNumbers(keywords, this.bioProjectAccessionRegex, maxItems)
  }

  public async exportPapersToCSV(
    keywords: string,
    filePath: string,
    maxItems: number = 20,
  ): Promise<string> {
    const papers = await this.searchPapers(keywords, maxItems)
    this.ioService.writeCsv(filePath, papers)
    return filePath
  }

  public async exportPapersWithAccessionNumbersToCSV(
    keywords: string,
    regex: RegExp,
    filePath: string,
    maxItems: number = 20,
  ): Promise<string> {
    const papers = await this.searchPapersWithAccessionNumbers(keywords, regex, maxItems)
    this.ioService.writeCsv(filePath, papers)
    return filePath
  }

  public async exportPapersWithBioProjectAccessionNumbersToCSV(
    keywords: string,
    filePath: string,
    maxItems: number = 20,
  ): Promise<string> {
    return this.exportPapersWithAccessionNumbersToCSV(
      keywords,
      this.bioProjectAccessionRegex,
      filePath,
      maxItems,
    )
  }

  private async fetchPapers<T>(
    keywords: string,
    maxItems: number,
    mapResult: (result: IGoogleScholarResult) => Promise<T | null>,
  ): Promise<T[]> {
    this.logger?.info(`Searching papers for: ${keywords}. Max items: ${maxItems}`)

    const entities: T[] = []
    let response = await this.googleScholar.search(keywords)

    while (response && (!maxItems || entities.length < maxItems)) {
      for (const result of response.results) {
        const entity = await mapResult(result)
        if (entity) entities.push(entity)
        if (maxItems && entities.length >= maxItems) break
      }
      if (!response.next) break
      response = await response.next()
    }

    await this.odysseus.close()
    return entities
  }

  private async extractAccessionNumbers(
    result: IGoogleScholarResult,
    regex: RegExp,
  ): Promise<string[]> {
    const content = await this.odysseus.getContent(result.url)
    const matches = content.match(regex)
    return [...new Set(matches)]
  }
}
