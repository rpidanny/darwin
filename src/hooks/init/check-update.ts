import { Hook } from '@oclif/core'
import got from 'got'
import semver from 'semver'

import ui from '../../utils/ui/output.js'

const hook: Hook<'init'> = async function (opts) {
  if (opts.id && ['autocomplete:script', 'readme', 'update'].includes(opts.id)) return

  try {
    const { version: latestVersion } = await got(
      'https://registry.npmjs.org/@rpidanny/darwin/latest',
      {
        responseType: 'json',
        timeout: 1_000,
      },
    ).json<{ version: string }>()

    if (semver.gt(latestVersion, this.config.version)) {
      ui.printUpdateBanner(latestVersion, this.log)
    }
  } catch (error) {
    // Silence errors
    return
  }
}

export default hook
