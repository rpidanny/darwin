import { GoogleScholar, IPaperMetadata } from '@rpidanny/google-scholar/dist'
import { Quill } from '@rpidanny/quill'

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

  public async exportToCSV(
    keywords: string,
    filePath: string,
    minItemCount: number = 20,
    filterPattern?: string,
  ): Promise<string> {
    const outputWriter = await this.ioService.getCsvStreamWriter(filePath)
    await this.search(keywords, minItemCount, page => outputWriter.write(page), filterPattern)
    await outputWriter.end()
    return filePath
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
