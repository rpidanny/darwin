import { Config, Plugin } from '@oclif/core'
import path from 'path'

export function getMockConfig(): Config {
  const mockConfig = new Config({
    root: process.cwd(),
    ignoreManifest: true,
    version: '1.2.3',
    channel: 'stable',
    pjson: new Plugin({ root: process.cwd() }).pjson,
  })

  mockConfig.configDir = path.join(process.cwd(), './test/data/configs')
  mockConfig.dataDir = path.join(process.cwd(), './test/data')

  return mockConfig
}
