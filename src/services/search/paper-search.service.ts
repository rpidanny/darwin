import { GoogleScholar, IPaperMetadata } from '@rpidanny/google-scholar'
import { Quill } from '@rpidanny/quill'
import { join } from 'path'
import { Service } from 'typedi'

import { ITextMatch } from '../../utils/text/interfaces.js'
import { IoService } from '../io/io.service.js'
import { LLMService } from '../llm/llm.service.js'
import { PaperService } from '../paper/paper.service.js'
import { IPaperEntity, ISearchOptions } from './interfaces.js'
import { PaperSearchConfig } from './paper-search.config.js'

@Service()
export class PaperSearchService {
  constructor(
    private readonly config: PaperSearchConfig,
    private readonly googleScholar: GoogleScholar,
    private readonly paperService: PaperService,
    private readonly ioService: IoService,
    private readonly llmService: LLMService,
    private readonly logger?: Quill,
  ) {}

  public async search({
    keywords,
    minItemCount,
    filterPattern,
    summarize,
    onData,
  }: ISearchOptions): Promise<IPaperEntity[]> {
    const papers: IPaperEntity[] = []

    await this.googleScholar.iteratePapers(
      { keywords },
      async paper => {
        const entity = await this.processPaper(paper, filterPattern, summarize)
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
    const fileName =
      `${sanitizedKeywords}${sanitizedFilter ? `_${sanitizedFilter}` : ''}_${Date.now()}.csv`.replace(
        /-+/g,
        '-',
      )

    return join(path, fileName)
  }

  public async exportToCSV(filePath: string, opts: ISearchOptions): Promise<string> {
    const fullPath = this.getFilePath(filePath, opts.keywords, opts.filterPattern)
    const outputWriter = await this.ioService.getCsvStreamWriter(fullPath)
    await this.search({
      ...opts,
      onData: async data => {
        await outputWriter.write(data)
      },
    })
    await outputWriter.end()
    return fullPath
  }

  private async processPaper(
    paper: IPaperMetadata,
    filterPattern?: string,
    summarize?: boolean,
  ): Promise<IPaperEntity | undefined> {
    const entity = this.toEntity(paper)

    if (!filterPattern && !summarize) return entity

    try {
      const textContent = await this.paperService.getTextContent(paper)

      if (filterPattern) {
        const matches = await this.paperService.findInPaper(textContent, filterPattern)
        if (matches.length === 0) return undefined
        this.logMatches(matches)
        entity.matches = matches
      }

      if (summarize) {
        const summary = await this.llmService.summarize(textContent)
        entity.summary = summary
      }

      return entity
    } catch (error) {
      this.logger?.debug(`Failed processing paper ${paper.url}: ${(error as Error).message}`)
    }
  }

  private logMatches(foundItems: ITextMatch[]): void {
    const foundTexts = foundItems.map(item => item.content).join(', ')
    this.logger?.info(`Found matches: ${foundTexts}`)
  }

  private toEntity(result: IPaperMetadata): IPaperEntity {
    return {
      title: result.title,
      description: result.description,
      authors: result.authors.map(author => author.name),
      url: result.url,
      citation: result.citation,
      source: result.source,
    }
  }
}
