import { jest } from '@jest/globals'
import { Hook } from '@oclif/core'

import { getMockConfig } from '../../../test/fixtures/config.js'
import { getMockHooksContext } from '../../../test/fixtures/hooks.js'
import uiOutput from '../../utils/ui/output'
import bannerHook from './banner.js'

describe('Hooks - init:banner', () => {
  const mockConfig = getMockConfig()

  let hookContext: Hook.Context

  beforeEach(() => {
    hookContext = getMockHooksContext({ config: mockConfig })

    jest.spyOn(uiOutput, 'printBanner').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  it('should call uiOutput.printBanner', async () => {
    await bannerHook.call(hookContext, {
      id: 'some-command',
      argv: [],
      config: mockConfig,
      context: hookContext,
    })

    expect(uiOutput.printBanner).toHaveBeenCalledTimes(1)
    expect(uiOutput.printBanner).toHaveBeenCalledWith('1.2.3', hookContext.log)
  })

  it.each`
    command
    ${'autocomplete:script'}
    ${'readme'}
  `('should not call uiOutput.printBanner if command is $command', async ({ command }) => {
    await bannerHook.call(hookContext, {
      id: command,
      argv: [],
      config: mockConfig,
      context: hookContext,
    })

    expect(uiOutput.printBanner).not.toHaveBeenCalled()
  })
})
