import { GoogleScholar, IGoogleScholarResult } from '@rpidanny/google-scholar/dist'
import { Odysseus } from '@rpidanny/odysseus'
import { Quill } from '@rpidanny/quill'

import { IoService } from '../io/io.js'
import { PaperWithAccessionEntity } from './interfaces.js'
import { PaperSearchService } from './paper-search.service.js'

export class AccessionSearchService extends PaperSearchService {
  private bioProjectAccessionRegex = /PRJNA\d+/g

  constructor(
    readonly googleScholar: GoogleScholar,
    readonly odysseus: Odysseus,
    readonly ioService: IoService,
    readonly logger?: Quill,
  ) {
    super(googleScholar, odysseus, ioService, logger)
  }

  public async searchPapersWithAccessionNumbers(
    keywords: string,
    regex: RegExp,
    minItemCount: number = 20,
    waitOnCaptcha: boolean = true,
    onData?: (data: PaperWithAccessionEntity) => Promise<any>,
  ): Promise<PaperWithAccessionEntity[]> {
    return this.fetchPapers<PaperWithAccessionEntity>(keywords, minItemCount, async result => {
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

  private async extractAccessionNumbers(
    result: IGoogleScholarResult,
    regex: RegExp,
    waitOnCaptcha: boolean,
  ): Promise<string[]> {
    if (!result.url) return []
    try {
      const textContent = await this.odysseus.getTextContent(result.url, undefined, waitOnCaptcha)
      const matches = textContent.match(regex)
      return [...new Set(matches)]
    } catch (error) {
      this.logger?.error(`Error extracting accession numbers: ${(error as Error).message}`)
      return []
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
