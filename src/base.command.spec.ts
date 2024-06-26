import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { jest } from '@jest/globals'
import { runCommand } from '@oclif/test'

import mockConfig from '../test/fixtures/app/config/test/config.json'

// TODO: fix esm import
/*
      Stderr: (node:27103) ExperimentalWarning: VM Modules is an experimental feature and might change at any time
      (Use `node --trace-warnings ...` to show where the warning was created)
      (node:27103) [ERR_REQUIRE_ESM] Warning: Error
      module: @oclif/core@3.27.0
      task: findCommand (test)
      plugin: test
      root: /Users/abhishek.maharjan/workspace/rpidanny/darwin/test/fixtures/app
      code: ERR_REQUIRE_ESM
      message: Must use import to load ES Module: /Users/abhishek.maharjan/workspace/rpidanny/darwin/test/fixtures/app/src/commands/test.ts
      See more details with DEBUG=*
*/
describe.skip('Command - Base', () => {
  const __dirname = dirname(fileURLToPath(import.meta.url))
  const root = join(__dirname, '../test/fixtures/app')

  beforeEach(() => {
    // jest.spyOn(process.stderr, 'write').mockImplementation(() => true)
    // jest.spyOn(process.stdout, 'write').mockImplementation(() => true)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('arguments', () => {
    it.only('should parse args correctly', async () => {
      const { result, stderr } = await runCommand(['test', 'some-argument'], { root })

      console.log('Stderr:', stderr)

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
