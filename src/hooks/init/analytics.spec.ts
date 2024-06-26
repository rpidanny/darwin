/* eslint-disable camelcase */
import { jest } from '@jest/globals'
import { Hook } from '@oclif/core'
import { mock } from 'jest-mock-extended'
import Mixpanel from 'mixpanel'
import os from 'os'

import { getMockConfig } from '../../../test/fixtures/config.js'
import { getMockHooksContext } from '../../../test/fixtures/hooks.js'
import hook, { Metric } from './analytics.js' // Update with the actual path to your hook file

describe('Hook Tests', () => {
  const ciFlag = process.env.CI
  const osVersion =
    'Darwin Kernel Version 23.0.0: Fri Sep 15 14:41:43 PDT 2023; root:xnu-10002.1.13~1/RELEASE_ARM64_T6000'
  const mockConfig = getMockConfig()
  const mockMixpanel: Mixpanel.Mixpanel = mock<Mixpanel.Mixpanel>()

  let hookContext: Hook.Context

  beforeEach(() => {
    // Clear mock function calls and reset state before each test
    jest.clearAllMocks()
    hookContext = getMockHooksContext({ config: mockConfig })

    // remove CI flag
    process.env.CI = undefined
  })

  afterEach(() => {
    // Restore the original implementation of Mixpanel.init() after each test
    jest.restoreAllMocks()
    process.env.CI = ciFlag
  })

  it('should initialize Mixpanel with the correct token', async () => {
    const initSpy = jest.spyOn(Mixpanel, 'init')

    initSpy.mockImplementation(() => mockMixpanel)

    jest.spyOn(os, 'platform').mockReturnValue('darwin' as NodeJS.Platform)
    jest.spyOn(os, 'type').mockReturnValue('Darwin')
    jest.spyOn(os, 'version').mockReturnValue(osVersion)
    jest.spyOn(os, 'hostname').mockReturnValue('mock-hostname')

    await hook.call(hookContext, {
      id: 'some_command',
      argv: ['arg1', '--flag1', 'value1'],
      config: mockConfig,
      context: hookContext,
    })

    expect(initSpy).toHaveBeenCalledTimes(1)
    expect(mockMixpanel.track).toHaveBeenCalledTimes(1)
    expect(mockMixpanel.track).toHaveBeenCalledWith(Metric.CommandRun, {
      command: 'some_command',
      $os: 'darwin',
      distinct_id: 'mock-hostname',
      appName: mockConfig.name,
      appVersion: mockConfig.version,
      appChannel: mockConfig.channel,
      osPlatform: 'darwin',
      osType: 'Darwin',
      osVersion: osVersion,
      hostArchitecture: mockConfig.arch,
      hostname: 'mock-hostname',
      args: ['arg1', '--flag1', 'value1'],
    })
  })

  it('should not call mixpanel when CI is enabled', async () => {
    const initSpy = jest.spyOn(Mixpanel, 'init')

    initSpy.mockImplementation(() => mockMixpanel)

    process.env.CI = 'true'

    await hook.call(hookContext, {
      id: 'some_command',
      argv: [],
      config: mockConfig,
      context: hookContext,
    })

    expect(initSpy).not.toHaveBeenCalledTimes(1)
    expect(mockMixpanel.track).not.toHaveBeenCalledTimes(1)
  })
})
