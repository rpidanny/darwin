import { GoogleScholar, IGoogleScholarResult } from '@rpidanny/google-scholar/dist'
import { Odysseus } from '@rpidanny/odysseus'
import { Quill } from '@rpidanny/quill'

import { IoService } from '../io/io.js'
import { PdfService } from '../pdf/pdf.service.js'
import { IAccessionSearchConfig } from './accession-search.config.js'
import { PaperWithAccessionEntity } from './interfaces.js'
import { PaperSearchService } from './paper-search.service.js'

export class AccessionSearchService extends PaperSearchService {
  private bioProjectAccessionRegex = /PRJNA\d+/g

  constructor(
    protected readonly config: IAccessionSearchConfig,
    readonly googleScholar: GoogleScholar,
    readonly odysseus: Odysseus,
    readonly pdfService: PdfService,
    readonly ioService: IoService,
    readonly logger?: Quill,
  ) {
    super(config, googleScholar, odysseus, pdfService, ioService, logger)
  }

  public async searchPapersWithAccessionNumbers(
    keywords: string,
    regex: RegExp,
    minItemCount: number = 20,
    onData?: (data: PaperWithAccessionEntity) => Promise<any>,
  ): Promise<PaperWithAccessionEntity[]> {
    return this.fetchPapers<PaperWithAccessionEntity>(keywords, minItemCount, async result => {
      const accessionNumbers = await this.extractAccessionNumbers(result, regex)
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
    onData?: (data: PaperWithAccessionEntity) => Promise<any>,
  ): Promise<PaperWithAccessionEntity[]> {
    return this.searchPapersWithAccessionNumbers(
      keywords,
      this.bioProjectAccessionRegex,
      minItemCount,
      onData,
    )
  }

  public async exportPapersWithAccessionNumbersToCSV(
    keywords: string,
    regex: RegExp,
    filePath: string,
    minItemCount: number = 20,
  ): Promise<string> {
    const outputWriter = await this.ioService.getCsvStreamWriter(filePath)
    await this.searchPapersWithAccessionNumbers(
      keywords,
      regex,
      minItemCount,
      async data => await outputWriter.write(data),
    )
    await outputWriter.end()
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

  private async extractAccessionNumbers(
    result: IGoogleScholarResult,
    regex: RegExp,
  ): Promise<string[]> {
    if (!result.url) return []
    try {
      const textContent = await this.getPaperContent(result)
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
