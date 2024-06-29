import { Transform } from '@json2csv/node'
import { flatten } from '@json2csv/transforms'
import { createWriteStream, existsSync, WriteStream } from 'fs'
import { ensureFileSync } from 'fs-extra'
import { Readable } from 'stream'

import { IStreamWriter } from './interfaces.js'

class ReadableStream extends Readable {
  constructor() {
    super()
  }
  _read() {}
}

export class CsvStreamWriter implements IStreamWriter {
  private reader: Readable
  private writer: WriteStream

  constructor(readonly filePath: string) {
    if (existsSync(filePath)) {
      throw new Error(`File already exists: ${filePath}`)
    }

    this.reader = new ReadableStream()
    this.writer = createWriteStream(filePath)

    ensureFileSync(filePath)

    this.reader
      .pipe(
        new Transform({
          transforms: [
            flatten({
              objects: true,
              arrays: true,
            }),
          ],
        }),
      )
      .pipe(this.writer)
  }

  async write(data: Record<string, any>): Promise<boolean> {
    return this.reader.push(JSON.stringify(data))
  }

  async end(): Promise<void> {
    this.writer.close()
  }
}
