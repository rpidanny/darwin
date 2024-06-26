import { PaperSearchService } from '../search/paper-search.service.js'
import { DownloadService } from './download.service.js'

export class PaperDownloadService {
  constructor(
    private readonly paperSearchService: PaperSearchService,
    private readonly downloadService: DownloadService,
  ) {}

  public async download(keywords: string, count: number, outputDir: string): Promise<string> {
    await this.paperSearchService.searchPapers(keywords, count, async paper => {
      const filePath = `${outputDir}/${paper.title.replace(/[\s/]/g, '_')}.${paper.paperType}`
      if (paper.paperType === 'pdf') {
        await this.downloadService.download(paper.paperUrl, filePath)
      }
    })
    return outputDir
  }
}
