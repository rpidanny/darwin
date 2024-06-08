import { GoogleScholar, IGoogleScholarResult } from '@rpidanny/google-scholar'
import { Odysseus } from '@rpidanny/odysseus'
import { Quill } from '@rpidanny/quill'

import { AccessionEntity } from './interfaces.js'

export class AccessionService {
  constructor(
    private readonly googleScholar: GoogleScholar,
    private readonly odysseys: Odysseus,
    private readonly logger: Quill,
  ) {}

  public async search(keywords: string, maxItems?: number): Promise<AccessionEntity[]> {
    const entities: AccessionEntity[] = []

    let response = await this.googleScholar.search(keywords)

    while (response && (!maxItems || entities.length < maxItems)) {
      for (const result of response.results) {
        if (!result || result.url == null) continue

        const accessionNumbers = await this.getAccessionNumbers(result)

        if (!accessionNumbers) continue

        this.logger.info(`Found accession numbers: ${accessionNumbers}`)

        entities.push({
          title: result.title,
          accessionNumbers,
          authors: result.authors.map(author => author.name),
          url: result.url,
        })

        if (maxItems && entities.length >= maxItems) break
      }

      if (response.next == undefined) break
      response = await response.next()
    }

    await this.odysseys.close()

    return entities
  }

  private async getAccessionNumbers(result: IGoogleScholarResult): Promise<string[] | null> {
    const content = await this.odysseys.getContent(result.url)
    const match = content.match(/PRJ[A-Z]{2}[0-9]{6}/g)

    return match ?? null
  }
}
