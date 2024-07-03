import csv from 'csvtojson'
import fs from 'fs/promises'
import fsExtra from 'fs-extra'
import { json2csv } from 'json-2-csv'
import path, { extname } from 'path'
import { Service } from 'typedi'

import { CsvStreamWriter } from './csv-stream-writer.js'

@Service()
export class IoService {
  async writeFile(filePath: string, content: string | Buffer): Promise<void> {
    const dir = path.dirname(filePath)
    await fsExtra.ensureDir(dir)

    await fs.writeFile(filePath, content)
  }

  async writeJsonFile(filePath: string, content: Record<string, any>): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(content, null, 2))
  }

  async writeCsv(filePath: string, data: Record<string, any>[]): Promise<void> {
    const csvContent = await json2csv(data)
    await fs.writeFile(filePath, csvContent)
  }

  async readFile(filePath: string): Promise<string> {
    return fs.readFile(filePath, 'utf-8')
  }

  async readCsv<T>(filePath: string): Promise<T[]> {
    const jsonArray = await csv().fromFile(filePath)
    return jsonArray
  }

  async doesFileExist(filePath: string): Promise<boolean> {
    return await fsExtra.pathExists(filePath)
  }

  async getDirectorySize(dirPath: string): Promise<number> {
    const statsArray = await fsExtra.readdir(dirPath).then(files =>
      Promise.all(
        files.map(async file => {
          const filePath = path.join(dirPath, file)
          const stat = await fsExtra.stat(filePath)
          if (stat.isFile()) {
            return stat.size
          } else if (stat.isDirectory()) {
            return this.getDirectorySize(filePath)
          }
          return 0
        }),
      ),
    )

    const sizeInBytes = statsArray.reduce((total, size) => total + size, 0)

    return sizeInBytes
  }

  async getCsvStreamWriter(filePath: string): Promise<CsvStreamWriter> {
    return new CsvStreamWriter(filePath)
  }

  isFilePath(path: string): boolean {
    return extname(path) !== ''
  }

  isDirectory(path: string): boolean {
    // Quick hack. TODO: Improve this
    return !this.isFilePath(path)
  }
}
