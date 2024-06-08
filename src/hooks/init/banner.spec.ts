import { jest } from '@jest/globals'

import { getMockConfig } from '../../../test/fixtures/config.js'
import uiOutput from '../../utils/ui/output'
import bannerHook from './banner.js'

describe('Hooks - init:banner', () => {
  const mockConfig = getMockConfig()
  const context = {
    debug: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    exit: jest.fn(),
  }

  let oclifContext: any

  beforeEach(() => {
    oclifContext = {
      config: { version: '1.2.3' },
      ...context,
    }
    jest.spyOn(uiOutput, 'printBanner').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  it('should call uiOutput.printBanner', async () => {
    await bannerHook.call(oclifContext, {
      id: 'some-command',
      argv: [],
      config: mockConfig,
      context,
    })

    expect(uiOutput.printBanner).toHaveBeenCalledTimes(1)
    expect(uiOutput.printBanner).toHaveBeenCalledWith('1.2.3', context.log)
  })

  it.each`
    command
    ${'autocomplete:script'}
    ${'readme'}
  `('should not call uiOutput.printBanner if command is $command', async ({ command }) => {
    await bannerHook.call(oclifContext, {
      id: command,
      argv: [],
      config: mockConfig,
      context,
    })

    expect(uiOutput.printBanner).not.toHaveBeenCalled()
  })
})
