import * as oclif from '@oclif/core'

import { FlagChar } from './char.js'

export default oclif.Flags.string({
  char: FlagChar.Filter,
  helpValue: 'REGEX',
  summary:
    'Case-insensitive regex to filter papers by content. (Example: "Colidextribacter|Caproiciproducens")',
})
