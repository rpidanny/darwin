import { GoogleScholar } from '@rpidanny/google-scholar/dist'
import { Odysseus } from '@rpidanny/odysseus'
import { Quill } from '@rpidanny/quill'

import { PaperEntity } from './interfaces'

export class PapersService {
  constructor(
    private readonly googleScholar: GoogleScholar,
    private readonly odysseys: Odysseus,
    private readonly logger: Quill,
  ) {}

  public async search(keywords: string, maxItems?: number): Promise<PaperEntity[]> {
    const entities: PaperEntity[] = []

    let response = await this.googleScholar.search(keywords)

    while (response && (!maxItems || entities.length < maxItems)) {
      for (const result of response.results) {
        entities.push({
          title: result.title,
          authors: result.authors.map(author => author.name),
          url: result.url,
          paperUrl: result.url,
          citationUrl: result.citation.url ?? '',
          citationCount: result.citation.count,
          description: result.description,
        })

        if (maxItems && entities.length >= maxItems) break
      }

      if (response.next == undefined) break
      response = await response.next()
    }

    await this.odysseys.close()

    return entities
  }
}
