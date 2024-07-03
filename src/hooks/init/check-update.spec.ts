import { jest } from '@jest/globals'
import { Hook } from '@oclif/core'
import nock from 'nock'

import { getMockConfig } from '../../../test/fixtures/config.js'
import { getMockHooksContext } from '../../../test/fixtures/hooks.js'
import uiOutput from '../../utils/ui/output'
import checkUpdateHook from './check-update.js'

describe('Hooks - init:check-update', () => {
  const latest = '2.1.0'
  const current = '1.27.1'
  const mockConfig = getMockConfig({ version: current })

  let hookContext: Hook.Context

  beforeEach(() => {
    nock('https://registry.npmjs.org')
      .get('/@rpidanny/darwin/latest')
      .reply(200, { version: latest })

    hookContext = getMockHooksContext({ config: mockConfig })

    jest.spyOn(uiOutput, 'printUpdateBanner').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  it('should call uiOutput.printUpdateBanner when current version is lower than latest version', async () => {
    await checkUpdateHook.call(hookContext, {
      id: 'some-command',
      argv: [],
      config: mockConfig,
      context: hookContext,
    })

    expect(uiOutput.printUpdateBanner).toHaveBeenCalledTimes(1)
    expect(uiOutput.printUpdateBanner).toHaveBeenCalledWith(latest, hookContext.log)
  })

  it('should not call uiOutput.printUpdateBanner when current version is the latest version', async () => {
    const config = getMockConfig({ version: latest })
    const context = getMockHooksContext({ config })

    await checkUpdateHook.call(context, {
      id: 'some-command',
      argv: [],
      config,
      context,
    })

    expect(uiOutput.printUpdateBanner).not.toHaveBeenCalled()
  })

  it.each`
    command
    ${'autocomplete:script'}
    ${'readme'}
  `('should not call uiOutput.printUpdateBanner if command is $command', async ({ command }) => {
    await checkUpdateHook.call(hookContext, {
      id: command,
      argv: [],
      config: mockConfig,
      context: hookContext,
    })

    expect(uiOutput.printUpdateBanner).not.toHaveBeenCalled()
  })

  it('should not throw an error if the request fails', async () => {
    nock.cleanAll()
    nock('https://registry.npmjs.org').get('/@rpidanny/darwin/latest').reply(500)

    await expect(
      checkUpdateHook.call(hookContext, {
        id: 'some-command',
        argv: [],
        config: mockConfig,
        context: hookContext,
      }),
    ).resolves.not.toThrow()
  })
})
