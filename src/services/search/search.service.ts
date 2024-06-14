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

  public async searchPapers(
    keywords: string,
    minItemCount: number = 20,
    onData?: (data: PaperEntity) => Promise<any>,
  ): Promise<PaperEntity[]> {
    return this.fetchPapers<PaperEntity>(keywords, minItemCount, async result => {
      const data = this.mapResultToPaperEntity(result)
      if (onData) await onData(data)
      return data
    })
  }

  public async searchPapersWithAccessionNumbers(
    keywords: string,
    regex: RegExp,
    minItemCount: number = 20,
    waitOnCaptcha: boolean = true,
    onData?: (data: PaperWithAccessionEntity) => Promise<any>,
  ): Promise<PaperWithAccessionEntity[]> {
    return this.fetchPapers<PaperWithAccessionEntity>(keywords, minItemCount, async result => {
      if (!result || !result.url) return null
      const accessionNumbers = await this.extractAccessionNumbers(result, regex, waitOnCaptcha)
      if (!accessionNumbers.length) return null
      this.logger?.info(`Found accession numbers: ${accessionNumbers}`)
      const data = this.mapResultToPaperWithAccessionEntity(result, accessionNumbers)
      if (onData) await onData(data)
      return data
    })
  }

  public async searchPapersWithBioProjectAccessionNumbers(
    keywords: string,
    minItemCount = 10,
    waitOnCaptcha: boolean = true,
    onData?: (data: PaperWithAccessionEntity) => Promise<any>,
  ): Promise<PaperWithAccessionEntity[]> {
    return this.searchPapersWithAccessionNumbers(
      keywords,
      this.bioProjectAccessionRegex,
      minItemCount,
      waitOnCaptcha,
      onData,
    )
  }

  public async exportPapersToCSV(
    keywords: string,
    filePath: string,
    minItemCount: number = 20,
  ): Promise<string> {
    const outputWriter = await this.ioService.getCsvStreamWriter(filePath)
    await this.searchPapers(keywords, minItemCount, async data => await outputWriter.write(data))
    await outputWriter.end()
    return filePath
  }

  public async exportPapersWithAccessionNumbersToCSV(
    keywords: string,
    regex: RegExp,
    filePath: string,
    minItemCount: number = 20,
    waitOnCaptcha: boolean = true,
  ): Promise<string> {
    const outputWriter = await this.ioService.getCsvStreamWriter(filePath)
    await this.searchPapersWithAccessionNumbers(
      keywords,
      regex,
      minItemCount,
      waitOnCaptcha,
      async data => await outputWriter.write(data),
    )
    await outputWriter.end()
    return filePath
  }

  public async exportPapersWithBioProjectAccessionNumbersToCSV(
    keywords: string,
    filePath: string,
    minItemCount: number = 20,
    waitOnCaptcha: boolean = true,
  ): Promise<string> {
    return this.exportPapersWithAccessionNumbersToCSV(
      keywords,
      this.bioProjectAccessionRegex,
      filePath,
      minItemCount,
      waitOnCaptcha,
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

  private async extractAccessionNumbers(
    result: IGoogleScholarResult,
    regex: RegExp,
    waitOnCaptcha: boolean,
  ): Promise<string[]> {
    try {
      const content = await this.odysseus.getContent(result.url, undefined, waitOnCaptcha)
      const matches = content.match(regex)
      return [...new Set(matches)]
    } catch (error) {
      this.logger?.error(`Error extracting accession numbers: ${(error as Error).message}`)
      return []
    }
  }

  private mapResultToPaperEntity(result: IGoogleScholarResult): PaperEntity {
    return {
      title: result.title,
      authors: result.authors.map(author => author.name),
      url: result.url,
      paperType: result.paper.type,
      paperUrl: result.paper.url,
      citationUrl: result.citation.url ?? '',
      citationCount: result.citation.count,
      description: result.description,
    }
  }

  private mapResultToPaperWithAccessionEntity(
    result: IGoogleScholarResult,
    accessionNumbers: string[],
  ): PaperWithAccessionEntity {
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
  }
}
