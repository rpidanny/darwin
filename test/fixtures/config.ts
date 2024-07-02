import { Config } from '@oclif/core'
import path from 'path'

import { ModelProvider, TConfig } from '../../src/config/schema.js'

export function getMockConfig(): Config {
  const mockConfig = new Config({
    root: process.cwd(),
    ignoreManifest: true,
    version: '1.2.3',
    channel: 'stable',
  })

  mockConfig.configDir = path.join(process.cwd(), './test/data/configs')
  mockConfig.dataDir = path.join(process.cwd(), './test/data')
  mockConfig.version = '1.2.3'

  return mockConfig
}

export function getMockLocalConfig(overrides?: Partial<TConfig>): TConfig {
  return {
    openai: {
      apiKey: 'mock-api-key',
      model: 'gpt-4-turbo',
    },
    paperProcessor: {
      modelProvider: ModelProvider.Local,
      model: 'llama3:instruct',
      endpoint: 'http://localhost:11434/v1',
    },
    ...overrides,
  }
}
