import * as oclif from '@oclif/core'

import { FlagChar } from './char.js'

export default oclif.Flags.string({
  char: FlagChar.Output,
  helpValue: 'PATH',
  summary:
    'Destination for the CSV file. Specify folder path for auto-generated filename or file path for direct use.',
  default: '.',
})
