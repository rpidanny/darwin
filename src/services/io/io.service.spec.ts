import { jest } from '@jest/globals'
import fs from 'fs/promises'
import path from 'path'
import tmp from 'tmp'

import { CsvStreamWriter } from './csv-stream-writer.js'
import { IoService } from './io.service.js'

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

  describe('writeCsv', () => {
    it('should write a CSV file with headers', async () => {
      const filePath = `${tempDir.name}/test.csv`
      const data = [
        { id: '1', name: 'Abhishek' },
        { id: '2', name: 'Maharjan' },
      ]

      await ioService.writeCsv(filePath, data)

      const fileContent = await fs.readFile(filePath, 'utf-8')
      expect(fileContent).toBe('id,name\n1,Abhishek\n2,Maharjan')
    })

    it('should write JSON containing array properly', async () => {
      const filePath = `${tempDir.name}/test.csv`
      const data = [
        { id: '1', arr: ['a', 'b'] },
        { id: '2', arr: ['c', 'd'] },
      ]

      await ioService.writeCsv(filePath, data)

      const fileContent = await fs.readFile(filePath, 'utf-8')
      expect(fileContent).toBe('id,arr\n1,"[""a"",""b""]"\n2,"[""c"",""d""]"')
    })

    it('should write nested JSON properly', async () => {
      const filePath = `${tempDir.name}/test.csv`
      const data = [
        { id: '1', obj: { key: 'a' } },
        { id: '2', obj: { key: 'b' } },
      ]

      await ioService.writeCsv(filePath, data)

      const fileContent = await fs.readFile(filePath, 'utf-8')
      expect(fileContent).toBe('id,obj.key\n1,a\n2,b')
    })
  })

  describe('isFilePath', () => {
    it.each`
      path                                        | isFile
      ${'file.csv'}                               | ${true}
      ${'/home/user/documents/report.pdf'}        | ${true}
      ${'C:\\Users\\User\\Documents\\report.pdf'} | ${true}
      ${'/usr/local/bin'}                         | ${false}
      ${'D:\\Photos\\Vacation'}                   | ${false}
      ${'./'}                                     | ${false}
      ${'.\\'}                                    | ${false}
    `('should return $isFile for path $path', ({ path, isFile }) => {
      expect(ioService.isFilePath(path)).toBe(isFile)
    })
  })

  describe('isDirectory', () => {
    it.each`
      path                                        | isDir
      ${'/home/user/documents/report.pdf'}        | ${false}
      ${'C:\\Users\\User\\Documents\\report.pdf'} | ${false}
      ${'/usr/local/bin'}                         | ${true}
      ${'D:\\Photos\\Vacation'}                   | ${true}
      ${'data/exports/'}                          | ${true}
      ${'./'}                                     | ${true}
      ${'.\\'}                                    | ${true}
    `('should return $isDir for path $path', ({ path, isDir }) => {
      expect(ioService.isDirectory(path)).toBe(isDir)
    })
  })
})
