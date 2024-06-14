import csvWriter, { CsvWriteStream } from 'csv-write-stream'
import { createWriteStream, existsSync } from 'fs'
import { ensureFileSync } from 'fs-extra'

import { IStreamWriter } from './interfaces.js'

export class CsvStreamWriter implements IStreamWriter {
  private writer: CsvWriteStream
  constructor(readonly filePath: string) {
    this.writer = csvWriter({
      separator: ',',
      newline: '\n',
      headers: undefined,
      sendHeaders: true,
    })

    if (existsSync(filePath)) {
      throw new Error(`File already exists: ${filePath}`)
    }

    ensureFileSync(filePath)

    this.writer.pipe(createWriteStream(filePath))
  }

  async write(data: Record<string, any>): Promise<boolean> {
    return this.writer.write(data)
  }

  async end(): Promise<void> {
    this.writer.end()
  }
}
