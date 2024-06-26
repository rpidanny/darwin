import { Quill } from '@rpidanny/quill'

import { PaperSearchService } from '../search/paper-search.service.js'
import { DownloadService } from './download.service.js'

export class PaperDownloadService {
  constructor(
    private readonly paperSearchService: PaperSearchService,
    private readonly downloadService: DownloadService,
    private readonly logger?: Quill,
  ) {}

  public async download(keywords: string, count: number, outputDir: string): Promise<string> {
    await this.paperSearchService.fetchPapers<any>(keywords, count, async paper => {
      const filePath = `${outputDir}/${paper.title.replace(/[\s/]/g, '_')}.${paper.paper.type}`
      if (paper.paper.type === 'pdf') {
        try {
          await this.downloadService.download(paper.paper.url, filePath)
        } catch (err) {
          this.logger?.warn(`Failed to download paper: ${paper.title}: ${(err as Error).message}`)
          return null
        }
        return paper
      }
    })
    return outputDir
  }
}
