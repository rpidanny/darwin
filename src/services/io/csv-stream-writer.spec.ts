import { jest } from '@jest/globals'
import { readFile } from 'fs/promises'
import { ensureFile } from 'fs-extra'
import tmp from 'tmp'

import { sleep } from '../../../test/fixtures/sleep.js'
import { CsvStreamWriter } from './csv-stream-writer.js'

tmp.setGracefulCleanup()

describe('CsvStreamWriter', () => {
  let tempDir: tmp.DirResult

  const getFilePath = (): string => `${tempDir.name}/${Date.now()}-${Math.random() * 1_000}.csv`

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
    const file = getFilePath()
    const csvStreamWriter = new CsvStreamWriter(file)

    const data = { name: 'John Doe', age: 30 }

    await csvStreamWriter.write(data)

    const fileContent = await readFile(file, 'utf-8')
    expect(fileContent).toBe('"name","age"\n"John Doe",30')
  })

  it('should write multiple data to the CSV file correctly', async () => {
    const file = getFilePath()
    const csvStreamWriter = new CsvStreamWriter(file)

    const data1 = { name: 'John Doe', age: 30 }
    const data2 = { name: 'Taylor Swift', age: 25 }

    await csvStreamWriter.write(data1)
    await csvStreamWriter.write(data2)

    // Wait for the stream to finish writing
    await sleep(100)

    const fileContent = await readFile(file, 'utf-8')
    expect(fileContent).toBe('"name","age"\n"John Doe",30\n"Taylor Swift",25')
  })

  it('should write JSON containing array properly', async () => {
    const file = getFilePath()
    const csvStreamWriter = new CsvStreamWriter(file)

    const data = {
      name: 'John Doe',
      age: 30,
      children: ['Jane Doe', 'Alice Doe'],
    }

    await csvStreamWriter.write(data)

    // Wait for the stream to finish writing
    await sleep(100)
    const fileContent = await readFile(file, 'utf-8')
    expect(fileContent).toBe(
      '"name","age","children.0","children.1"\n"John Doe",30,"Jane Doe","Alice Doe"',
    )
  })

  it('should write nested JSON properly', async () => {
    const file = getFilePath()
    const csvStreamWriter = new CsvStreamWriter(file)

    const data = { id: '1', obj: { key: 'a' } }

    await csvStreamWriter.write(data)

    // Wait for the stream to finish writing
    await sleep(100)
    const fileContent = await readFile(file, 'utf-8')
    expect(fileContent).toBe('"id","obj.key"\n"1","a"')
  })

  it('should throw error when file already exists', async () => {
    const file = getFilePath()
    await ensureFile(file)

    expect(() => new CsvStreamWriter(file)).toThrow(`File already exists: ${file}`)
  })
})
