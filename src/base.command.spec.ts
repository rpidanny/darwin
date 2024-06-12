import { join } from 'node:path'

import { runCommand } from '@oclif/test'

import mockConfig from '../test/fixtures/app/config/test/config.json'

describe('Command - Base', () => {
  const root = join(__dirname, '../test/fixtures/app')

  beforeEach(() => {
    jest.spyOn(process.stderr, 'write').mockImplementation()
    jest.spyOn(process.stdout, 'write').mockImplementation()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('arguments', () => {
    it('should parse args correctly', async () => {
      const { result } = await runCommand(['test', 'some-argument'], { root })

      expect(result).toEqual({
        flags: expect.any(Object),
        args: {
          arg1: 'some-argument',
        },
        config: expect.any(Object),
      })
    })

    it.skip('should throw error when required argument is not provided', async () => {
      const { error } = await runCommand(['test'], { root })

      expect(error).toBeDefined()
      expect(error?.message).toContain('Missing 1 required arg:')
    })
  })

  describe('flags', () => {
    it('should parse flags correctly', async () => {
      const { result } = await runCommand(['test', 'some-argument', '-v'], {
        root,
      })

      expect(result).toEqual({
        flags: {
          'log-level': 'INFO',
          verbose: true,
        },
        args: expect.any(Object),
        config: expect.any(Object),
      })
    })

    it('should parse flags correctly when flag is not set', async () => {
      const { result } = await runCommand(['test', 'some-argument'], { root })

      expect(result).toEqual({
        flags: {
          'log-level': 'INFO',
        },
        args: expect.any(Object),
        config: expect.any(Object),
      })
    })

    it.skip('should throw error when flag is not recognized', async () => {
      const { error } = await runCommand(['test', 'some-argument', '-x'], {
        root,
      })

      expect(error).toBeDefined()
      expect(error?.message).toContain('Nonexistent flag: -x')
    })
  })

  describe('config', () => {
    beforeEach(() => {
      process.env.XDG_CONFIG_HOME = join(root, 'config')
    })

    afterEach(() => {
      delete process.env.XDG_CONFIG_HOME
    })

    it('should load local config', async () => {
      const { result } = await runCommand(['test', 'some-argument'], {
        root,
      })

      expect(result).toEqual({
        flags: expect.any(Object),
        args: expect.any(Object),
        config: mockConfig,
      })
    })

    it('should return empty object if config does not exist', async () => {
      delete process.env.XDG_CONFIG_HOME

      const { result } = await runCommand(['test', 'some-argument'], {
        root,
      })

      expect(result).toEqual({
        flags: expect.any(Object),
        args: expect.any(Object),
        config: {},
      })
    })
  })
})
