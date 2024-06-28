import { GoogleScholar, IPaperMetadata } from '@rpidanny/google-scholar/dist'
import { Quill } from '@rpidanny/quill'

import { IoService } from '../io/io'
import { IFoundItem } from '../paper/interfaces'
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
    paperIncludes?: string,
  ): Promise<IPaperEntity[]> {
    const papers: IPaperEntity[] = []

    await this.googleScholar.iteratePapers(
      { keywords },
      async paper => {
        const entity = await this.processPaper(paper, paperIncludes)
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
    paperIncludes?: string,
  ): Promise<string> {
    const outputWriter = await this.ioService.getCsvStreamWriter(filePath)
    await this.search(keywords, minItemCount, page => outputWriter.write(page), paperIncludes)
    await outputWriter.end()
    return filePath
  }

  private async processPaper(
    paper: IPaperMetadata,
    paperIncludes?: string,
  ): Promise<IPaperEntity | undefined> {
    if (!paperIncludes) return this.toEntity(paper)

    const foundItems = await this.paperService.findInPaper(paper, paperIncludes)
    if (foundItems.length === 0) return undefined

    this.logFoundItems(foundItems)
    return this.toEntity(paper, foundItems)
  }

  private logFoundItems(foundItems: IFoundItem[]): void {
    const foundTexts = foundItems.map(item => item.text).join(', ')
    this.logger?.debug(`Found search keywords: ${foundTexts}`)
  }

  private toEntity(result: IPaperMetadata, foundItems?: IFoundItem[]): IPaperEntity {
    return {
      title: result.title,
      authors: result.authors.map(author => author.name),
      url: result.url,
      paperType: result.paper.type,
      paperUrl: result.paper.url,
      citationUrl: result.citation.url ?? '',
      citationCount: result.citation.count,
      description: result.description,
      foundItems: foundItems?.map(item => item.text),
      sentencesOfInterest: foundItems?.flatMap(item => item.sentences),
    }
  }
}
