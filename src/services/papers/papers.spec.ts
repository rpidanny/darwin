import { GoogleScholar, ISearchResponse } from '@rpidanny/google-scholar'
import { Odysseus } from '@rpidanny/odysseus'
import { Quill } from '@rpidanny/quill'
import { mock } from 'jest-mock-extended'

import { getSearchResponse } from '../../../test/fixtures/google-scholar'
import { PapersService } from './papers'

describe('PapersService', () => {
  const googleScholarMock = mock<GoogleScholar>()
  const odysseusMock = mock<Odysseus>()
  const logger = mock<Quill>()

  let service: PapersService

  beforeEach(() => {
    service = new PapersService(googleScholarMock, odysseusMock, logger)
  })

  it('should search for papers', async () => {
    const mainResp = getSearchResponse()

    const resp: ISearchResponse = {
      ...mainResp,
      results: [...mainResp.results, ...mainResp.results, ...mainResp.results],
      next: null,
    }

    googleScholarMock.search.mockResolvedValue(resp)

    const entities = await service.search('some keywords')

    expect(entities).toHaveLength(3)
    expect(entities).toEqual(
      resp.results.map(result => ({
        title: result.title,
        authors: result.authors.map(author => author.name),
        description: result.description,
        url: result.url,
        paperUrl: result.url,
        citationCount: result.citation.count,
        citationUrl: result.citation.url ?? '',
      })),
    )
  })

  it('should stop searching when maxItems is reached', async () => {
    const mainResp = getSearchResponse()

    const resp: ISearchResponse = {
      ...mainResp,
      results: [...mainResp.results, ...mainResp.results, ...mainResp.results],
    }

    odysseusMock.getContent.mockResolvedValue('')
    googleScholarMock.search.mockResolvedValue(resp)

    const entities = await service.search('some keywords', 1)

    expect(entities).toHaveLength(1)
  })

  it('should continue searching when maxItems is not reached', async () => {
    const mainResp = getSearchResponse()
    const results = [...mainResp.results, ...mainResp.results, ...mainResp.results]

    const resp: ISearchResponse = {
      ...mainResp,
      results,
    }

    googleScholarMock.search.mockResolvedValue({
      ...resp,
      next: jest.fn().mockResolvedValue(resp),
    })

    const entities = await service.search('some keywords', 5)

    expect(entities).toHaveLength(5)
  })
})
