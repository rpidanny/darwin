import * as oclif from '@oclif/core'

import { FlagChar } from './char.js'

export default oclif.Flags.integer({
  char: FlagChar.Count,
  helpValue: 'NUMBER',
  summary:
    'Minimum number of papers to search for. Actual number may be slightly higher with concurrency.',
  default: 10,
})
