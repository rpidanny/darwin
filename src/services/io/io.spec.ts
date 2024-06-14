import fs from 'fs/promises'
import path from 'path'
import tmp from 'tmp'

import { CsvStreamWriter } from './csv-stream-writer.js'
import { IoService } from './io.js'

tmp.setGracefulCleanup()

describe('IoService', () => {
  let ioService: IoService
  let tempDir: tmp.DirResult

  beforeEach(() => {
    tempDir = tmp.dirSync({ unsafeCleanup: true })

    ioService = new IoService()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should write a file', async () => {
    const filePath = `${tempDir.name}/test.txt`
    const content = 'Hello, World!'

    await ioService.writeFile(filePath, content)

    await expect(fs.readFile(filePath, 'utf-8')).resolves.toBe(content)
  })

  it('should ensure directory exists when writing a file', async () => {
    const dirPath = `${tempDir.name}/new-directory`
    const filePath = `${dirPath}/test.txt`
    const content = 'Hello, World!'

    await ioService.writeFile(filePath, content)

    const fileContent = await fs.readFile(filePath, 'utf-8')
    expect(fileContent).toBe(content)

    // Check if the directory exists
    const dirExists = await fs.stat(dirPath).then(stats => stats.isDirectory())
    expect(dirExists).toBe(true)
  })

  it('should write a JSON file', async () => {
    const filePath = `${tempDir.name}/test.json`
    const content = { key: 'value' }

    await ioService.writeJsonFile(filePath, content)

    await expect(fs.readFile(filePath, 'utf-8')).resolves.toBe(JSON.stringify(content, null, 2))
  })

  it('should write a CSV file', async () => {
    const filePath = `${tempDir.name}/test.csv`
    const content = [
      { id: '1', name: 'Abhishek' },
      { id: '2', name: 'Maharjan' },
    ]

    await ioService.writeCsv(filePath, content)

    const fileContent = await fs.readFile(filePath, 'utf-8')
    expect(fileContent).toBe('id,name\n1,Abhishek\n2,Maharjan')
  })

  it('should read a file', async () => {
    const filePath = path.join(process.cwd(), './test/data/io/test.txt')
    const expectedContent = 'Hello, World!\n'

    const result = await ioService.readFile(filePath)

    expect(result).toEqual(expectedContent)
  })

  it('should read a CSV file', async () => {
    const filePath = path.join(process.cwd(), './test/data/io/test.csv')
    const expectedJsonData = [
      { id: '1', name: 'Abhishek' },
      { id: '2', name: 'Maharjan' },
    ]
    const result = await ioService.readCsv(filePath)

    expect(result).toEqual(expectedJsonData)
  })

  it('should read return the size of a directory', async () => {
    const dirPath = path.join(process.cwd(), './test/data/io')
    const expectedSize = 47

    const result = await ioService.getDirectorySize(dirPath)

    expect(result).toEqual(expectedSize)
  })

  it('should return true if a file exists', async () => {
    const filePath = path.join(process.cwd(), './test/data/io/test.txt')

    const result = await ioService.doesFileExist(filePath)

    expect(result).toBe(true)
  })

  it('should return false if a file doesnt exists', async () => {
    const filePath = path.join(process.cwd(), './test/data/io/somepath/test.txt')

    const result = await ioService.doesFileExist(filePath)

    expect(result).toBe(false)
  })

  it('should return a CsvStreamWriter instance with file initialized', async () => {
    const filePath = `${tempDir.name}/test.csv`

    expect.assertions(2)

    const result = await ioService.getCsvStreamWriter(filePath)

    expect(result).toBeInstanceOf(CsvStreamWriter)
    expect(result.filePath).toBe(filePath)
  })
})
