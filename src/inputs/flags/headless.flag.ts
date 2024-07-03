import * as oclif from '@oclif/core'

import { FlagChar } from './char.js'

export default oclif.Flags.boolean({
  char: FlagChar.Headless,
  summary: 'Run the browser in headless mode (no UI).',
  default: false,
})
