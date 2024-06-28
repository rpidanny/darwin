import { GoogleScholar } from '@rpidanny/google-scholar/dist/google-scholar.js'
import { Quill } from '@rpidanny/quill'

import { PaperService } from '../paper/paper.service.js'

export class PaperDownloadService {
  constructor(
    private readonly googleScholar: GoogleScholar,
    private readonly paperService: PaperService,
    private readonly logger?: Quill,
  ) {}

  public async downloadPapers(keywords: string, count: number, outputDir: string): Promise<string> {
    let paperCount = 0
    await this.googleScholar.iteratePapers(
      { keywords },
      async paper => {
        try {
          await this.paperService.download(paper, outputDir)
          paperCount++
          if (paperCount >= count) return false
        } catch (error) {
          this.logger?.warn(`Failed to download paper: ${paper.title}: ${(error as Error).message}`)
        }
        return true
      },
      1,
    )

    return outputDir
  }
}
