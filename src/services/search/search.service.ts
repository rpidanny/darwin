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

  public async searchPapers(keywords: string, minItemCount: number = 20): Promise<PaperEntity[]> {
    return this.fetchPapers<PaperEntity>(keywords, minItemCount, async result => ({
      title: result.title,
      authors: result.authors.map(author => author.name),
      url: result.url,
      paperType: result.paper.type,
      paperUrl: result.paper.url,
      citationUrl: result.citation.url ?? '',
      citationCount: result.citation.count,
      description: result.description,
    }))
  }

  public async searchPapersWithAccessionNumbers(
    keywords: string,
    regex: RegExp,
    minItemCount: number = 20,
  ): Promise<PaperWithAccessionEntity[]> {
    return this.fetchPapers<PaperWithAccessionEntity>(keywords, minItemCount, async result => {
      if (!result || result.url == null) return null

      const accessionNumbers = await this.extractAccessionNumbers(result, regex)
      if (!accessionNumbers.length) return null

      this.logger?.info(`Found accession numbers: ${accessionNumbers}`)

      return {
        title: result.title,
        accessionNumbers,
        authors: result.authors.map(author => author.name),
        url: result.url,
        paperUrl: result.paper.url,
        paperType: result.paper.type,
        citationUrl: result.citation.url ?? '',
        citationCount: result.citation.count,
        description: result.description,
      }
    })
  }

  public async searchPapersWithBioProjectAccessionNumbers(
    keywords: string,
    minItemCount = 10,
  ): Promise<PaperWithAccessionEntity[]> {
    return this.searchPapersWithAccessionNumbers(
      keywords,
      this.bioProjectAccessionRegex,
      minItemCount,
    )
  }

  public async exportPapersToCSV(
    keywords: string,
    filePath: string,
    minItemCount: number = 20,
  ): Promise<string> {
    const papers = await this.searchPapers(keywords, minItemCount)
    this.ioService.writeCsv(filePath, papers)
    return filePath
  }

  public async exportPapersWithAccessionNumbersToCSV(
    keywords: string,
    regex: RegExp,
    filePath: string,
    minItemCount: number = 20,
  ): Promise<string> {
    const papers = await this.searchPapersWithAccessionNumbers(keywords, regex, minItemCount)
    this.ioService.writeCsv(filePath, papers)
    return filePath
  }

  public async exportPapersWithBioProjectAccessionNumbersToCSV(
    keywords: string,
    filePath: string,
    minItemCount: number = 20,
  ): Promise<string> {
    return this.exportPapersWithAccessionNumbersToCSV(
      keywords,
      this.bioProjectAccessionRegex,
      filePath,
      minItemCount,
    )
  }

  private async fetchPapers<T>(
    keywords: string,
    minItemCount: number,
    mapResult: (result: IGoogleScholarResult) => Promise<T | null>,
  ): Promise<T[]> {
    this.logger?.info(`Searching papers for: ${keywords}. Max items: ${minItemCount}`)

    const entities: T[] = []
    let response = await this.googleScholar.search(keywords)

    while (response && (!minItemCount || entities.length < minItemCount)) {
      await Promise.all(
        response.results.map(async (result): Promise<void> => {
          const entity = await mapResult(result)
          if (entity) entities.push(entity)
        }),
      )
      if (!response.next) break
      response = await response.next()
    }

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
