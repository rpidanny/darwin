import { jest } from '@jest/globals'
import { mock } from 'jest-mock-extended'
import nock from 'nock'

import { IoService } from '../io/io.service'
import { DownloadService } from './download.service'

describe('DownloadService', () => {
  const ioServiceMock = mock<IoService>()
  let downloadService: DownloadService

  beforeEach(() => {
    downloadService = new DownloadService(ioServiceMock)

    nock.disableNetConnect()
  })

  afterEach(() => {
    if (nock.pendingMocks().length) {
      console.error('Pending mocks: %j', nock.pendingMocks())
      nock.abortPendingRequests()
      throw new Error('Unmatched pending mocks')
    }

    nock.cleanAll()
    nock.enableNetConnect()
    jest.clearAllMocks()
  })

  describe('download', () => {
    it('should download file', async () => {
      const buffer = Buffer.from('file content')

      nock('http://example.com').get('/test.pdf').reply(200, buffer)

      await downloadService.download('http://example.com/test.pdf', '/output/file')

      expect(ioServiceMock.writeFile).toHaveBeenCalledWith('/output/file', buffer)
    })

    it.each`
      statusCode
      ${403}
      ${404}
      ${500}
    `('should throw error when statusCode is $statusCode', async ({ statusCode }) => {
      nock('http://example.com').get('/test.pdf').reply(statusCode)

      await expect(
        downloadService.download('http://example.com/test.pdf', '/output/file'),
      ).rejects.toThrow()
    })
  })
})
