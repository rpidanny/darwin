import { jest } from '@jest/globals'
import { Hook } from '@oclif/core'

import { getMockConfig } from './config'

export function getMockHooksContext(overrides?: Partial<Hook.Context>): Hook.Context {
  return {
    debug: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    exit: jest.fn(),
    config: getMockConfig(),
    ...overrides,
  }
}
