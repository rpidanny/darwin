import { Quill } from '@rpidanny/quill'
import got from 'got'

import { IoService } from '../io/io.js'
import { PaperSearchService } from '../search/paper-search.service.js'

export class PaperDownloadService {
  constructor(
    private readonly paperSearchService: PaperSearchService,
    private readonly ioService: IoService,
    private readonly logger?: Quill,
  ) {}

  public async download(keywords: string, count: number, outputDir: string): Promise<string> {
    await this.paperSearchService.searchPapers(keywords, count, async paper => {
      const filePath = `${outputDir}/${paper.title.replace(/ /g, '_')}.${paper.paperType}`
      if (paper.paperType === 'pdf') {
        await this.downloadPdf(paper.paperUrl, filePath)
      }
    })
    return outputDir
  }

  private async downloadPdf(url: string, filePath: string): Promise<void> {
    this.logger?.debug(`Downloading PDF: ${filePath}`)

    const content = await got
      .get(url, {
        timeout: 30_000,
        throwHttpErrors: true,
      })
      .buffer()
    await this.ioService.writeFile(filePath, content)
  }
}
