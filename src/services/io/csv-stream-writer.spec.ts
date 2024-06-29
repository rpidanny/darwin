import { jest } from '@jest/globals'
import { readFile } from 'fs/promises'
import { ensureFile } from 'fs-extra'
import tmp from 'tmp'

import { CsvStreamWriter } from './csv-stream-writer.js'

tmp.setGracefulCleanup()

describe('CsvStreamWriter', () => {
  let tempDir: tmp.DirResult

  beforeAll(() => {
    tempDir = tmp.dirSync({ unsafeCleanup: true })
  })

  afterEach(async () => {
    jest.clearAllMocks()
  })

  it('should create a CsvStreamWriter instance', () => {
    const file = `${tempDir.name}/test.csv`
    const csvStreamWriter = new CsvStreamWriter(file)

    expect(csvStreamWriter).toBeInstanceOf(CsvStreamWriter)
  })

  it('should write data to the CSV file', async () => {
    const file = `${tempDir.name}/test2.csv`
    const csvStreamWriter = new CsvStreamWriter(file)

    const data = { name: 'John Doe', age: 30 }

    await csvStreamWriter.write(data)

    const fileContent = await readFile(file, 'utf-8')
    expect(fileContent).toBe('"name","age"\n"John Doe",30')
  })

  it('should write JSON containing array properly', async () => {
    const file = `${tempDir.name}/test3.csv`
    const csvStreamWriter = new CsvStreamWriter(file)

    const data = {
      name: 'John Doe',
      age: 30,
      children: ['Jane Doe', 'Alice Doe'],
    }

    await csvStreamWriter.write(data)

    const fileContent = await readFile(file, 'utf-8')
    expect(fileContent).toBe(
      '"name","age","children.0","children.1"\n"John Doe",30,"Jane Doe","Alice Doe"',
    )
  })

  it('should write nested JSON properly', async () => {
    const file = `${tempDir.name}/test4.csv`
    const csvStreamWriter = new CsvStreamWriter(file)

    const data = { id: '1', obj: { key: 'a' } }

    await csvStreamWriter.write(data)

    const fileContent = await readFile(file, 'utf-8')
    expect(fileContent).toBe('"id","obj.key"\n"1","a"')
  })

  it('should throw error when file already exists', async () => {
    const file = `${tempDir.name}/test5.csv`
    await ensureFile(file)

    expect(() => new CsvStreamWriter(file)).toThrow(`File already exists: ${file}`)
  })
})
