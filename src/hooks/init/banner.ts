import { Hook } from '@oclif/core'

import uiOutput from '../../utils/ui/output.js'

const hook: Hook<'init'> = async function (opts) {
  if (opts.id && ['autocomplete:script', 'readme'].includes(opts.id)) return

  uiOutput.printBanner(this.config.version, this.log)
}

export default hook
