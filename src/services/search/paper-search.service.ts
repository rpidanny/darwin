import { GoogleScholar, IPaperMetadata } from '@rpidanny/google-scholar/dist'
import { Quill } from '@rpidanny/quill'
import { join } from 'path'

import { ITextMatch } from '../../utils/text/interfaces'
import { IoService } from '../io/io.service'
import { PaperService } from '../paper/paper.service'
import { IPaperEntity } from './interfaces'
import { IPaperSearchConfig } from './paper-search.config'

export class PaperSearchService {
  constructor(
    protected readonly config: IPaperSearchConfig,
    protected readonly googleScholar: GoogleScholar,
    protected readonly paperService: PaperService,
    protected readonly ioService: IoService,
    protected readonly logger?: Quill,
  ) {}

  public async search(
    keywords: string,
    minItemCount: number = 20,
    onData?: (data: IPaperEntity) => Promise<any>,
    filterPattern?: string,
  ): Promise<IPaperEntity[]> {
    const papers: IPaperEntity[] = []

    await this.googleScholar.iteratePapers(
      { keywords },
      async paper => {
        const entity = await this.processPaper(paper, filterPattern)
        if (!entity) return true

        papers.push(entity)
        if (onData) await onData(entity)

        return papers.length < minItemCount
      },
      this.config.concurrency,
    )

    return papers
  }

  public getFilePath(path: string, keywords: string, filterPattern?: string): string {
    if (!this.ioService.isDirectory(path)) {
      return path
    }

    const sanitizedFilter = filterPattern?.replace(/[^\w-]/g, '-')
    const sanitizedKeywords = keywords.replace(/[^\w-]/g, '-')
    const fileName = `${sanitizedKeywords}${sanitizedFilter ? `_${sanitizedFilter}` : ''}_${Date.now()}.csv`

    return join(path, fileName)
  }

  public async exportToCSV(
    keywords: string,
    filePath: string,
    minItemCount: number = 20,
    filterPattern?: string,
  ): Promise<string> {
    const fullPath = this.getFilePath(filePath, keywords, filterPattern)
    const outputWriter = await this.ioService.getCsvStreamWriter(fullPath)
    await this.search(keywords, minItemCount, page => outputWriter.write(page), filterPattern)
    await outputWriter.end()
    return fullPath
  }

  private async processPaper(
    paper: IPaperMetadata,
    filterPattern?: string,
  ): Promise<IPaperEntity | undefined> {
    if (!filterPattern) return this.toEntity(paper)

    const matches = await this.paperService.findInPaper(paper, filterPattern)
    if (matches.length === 0) return undefined

    this.logMatches(matches)
    return this.toEntity(paper, matches)
  }

  private logMatches(foundItems: ITextMatch[]): void {
    const foundTexts = foundItems.map(item => item.content).join(', ')
    this.logger?.info(`Found matches: ${foundTexts}`)
  }

  private toEntity(result: IPaperMetadata, foundItems?: ITextMatch[]): IPaperEntity {
    return {
      title: result.title,
      description: result.description,
      authors: result.authors.map(author => author.name),
      url: result.url,
      citation: result.citation,
      source: result.source,
      matches: foundItems,
    }
  }
}
