import { Quill } from '@rpidanny/quill'
import got from 'got'
import { CookieJar } from 'tough-cookie'

import { IoService } from '../io/io'

export class DownloadService {
  constructor(
    private readonly ioService: IoService,
    private readonly logger?: Quill,
  ) {}

  async getContent(url: string): Promise<Buffer> {
    // TODO: update user agent
    return await got
      .get(url, {
        timeout: 30_000,
        throwHttpErrors: true,
        cookieJar: new CookieJar(),
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
          Accept: '*/*',
          'Accept-Encoding': 'gzip, deflate, br',
          Connection: 'keep-alive',
        },
      })
      .buffer()
  }

  async download(url: string, filePath: string): Promise<void> {
    this.logger?.debug(`Downloading file ${url}`)
    const content = await this.getContent(url)
    await this.ioService.writeFile(filePath, content)
  }
}
