import { Transform } from '@json2csv/node'
import { flatten } from '@json2csv/transforms'
import { createWriteStream, existsSync } from 'fs'
import { ensureFileSync } from 'fs-extra'
import stream from 'stream'

import { IStreamWriter } from './interfaces.js'

export class CsvStreamWriter implements IStreamWriter {
  private writer: stream.Transform

  constructor(readonly filePath: string) {
    if (existsSync(filePath)) {
      throw new Error(`File already exists: ${filePath}`)
    }

    ensureFileSync(filePath)

    this.writer = new Transform(
      {
        transforms: [
          flatten({
            objects: true,
            arrays: true,
          }),
        ],
      },
      {},
      { objectMode: true },
    )

    this.writer.pipe(createWriteStream(filePath))
  }

  async write(data: Record<string, any>): Promise<boolean> {
    return this.writer.write(data)
  }

  async end(): Promise<void> {
    this.writer.end()
  }
}
