import { GoogleScholar, ISearchResponse } from '@rpidanny/google-scholar'
import { Odysseus } from '@rpidanny/odysseus/dist'
import { Quill } from '@rpidanny/quill'
import { mock } from 'jest-mock-extended'

import { getSearchResponse } from '../../../test/fixtures/google-scholar'
import { AccessionService } from './accession'

describe('AccessionService', () => {
  const googleScholarMock = mock<GoogleScholar>()
  const odysseusMock = mock<Odysseus>()
  const logger = mock<Quill>()

  let service: AccessionService

  beforeEach(() => {
    service = new AccessionService(googleScholarMock, odysseusMock, logger)
  })

  it('should search for accession numbers', async () => {
    const mainResp = getSearchResponse()

    const resp: ISearchResponse = {
      ...mainResp,
      results: [...mainResp.results, ...mainResp.results, ...mainResp.results],
    }

    const content = 'PRJNA000001 PRJNA000002 PRJNA000003'

    odysseusMock.getContent.mockResolvedValue(content)
    googleScholarMock.search.mockResolvedValue(resp)

    const entities = await service.search('some keywords')

    expect(entities).toHaveLength(3)
    expect(entities).toEqual(
      resp.results.map(result => ({
        title: result.title,
        authors: result.authors.map(author => author.name),
        url: result.url,
        accessionNumbers: ['PRJNA000001', 'PRJNA000002', 'PRJNA000003'],
      })),
    )
  })

  it('should not include results without accession numbers', async () => {
    const resp = getSearchResponse()

    odysseusMock.getContent.mockResolvedValue('')
    googleScholarMock.search.mockResolvedValue(resp)

    const entities = await service.search('some keywords')

    expect(entities).toEqual([])
  })

  it('should stop searching when maxItems is reached', async () => {
    const mainResp = getSearchResponse()

    const resp: ISearchResponse = {
      ...mainResp,
      results: [...mainResp.results, ...mainResp.results, ...mainResp.results],
    }

    odysseusMock.getContent.mockResolvedValue('PRJNA000001')
    googleScholarMock.search.mockResolvedValue(resp)

    const entities = await service.search('some keywords', 1)

    expect(entities).toHaveLength(1)
    expect(entities).toEqual(
      mainResp.results.map(result => ({
        title: result.title,
        authors: result.authors.map(author => author.name),
        url: result.url,
        accessionNumbers: ['PRJNA000001'],
      })),
    )
  })

  it('should continue search until no more results left', async () => {
    const mainResp = getSearchResponse()

    const resp: ISearchResponse = {
      ...mainResp,
      next: async () => mainResp,
    }

    odysseusMock.getContent.mockResolvedValue('PRJNA000001')
    googleScholarMock.search.mockResolvedValue(resp)

    const entities = await service.search('some keywords')

    expect(entities).toHaveLength(2)
    expect(entities).toEqual([
      {
        title: resp.results[0].title,
        authors: resp.results[0].authors.map(author => author.name),
        url: resp.results[0].url,
        accessionNumbers: ['PRJNA000001'],
      },
      {
        title: resp.results[0].title,
        authors: resp.results[0].authors.map(author => author.name),
        url: resp.results[0].url,
        accessionNumbers: ['PRJNA000001'],
      },
    ])
  })
})
