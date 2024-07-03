import * as oclif from '@oclif/core'

import { FlagChar } from './char.js'

export default oclif.Flags.integer({
  char: FlagChar.Concurrency,
  helpValue: 'NUMBER',
  summary: 'The number papers to process in parallel.',
  default: 10,
})
