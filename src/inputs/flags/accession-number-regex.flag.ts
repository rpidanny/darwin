import * as oclif from '@oclif/core'

import { AccessionPattern } from '../../services/search/constants.js'
import { FlagChar } from './char.js'

export default oclif.Flags.string({
  char: FlagChar.AccessionNumberRegex,
  helpValue: 'REGEX',
  summary: 'Regex to match accession numbers. Defaults to matching BioProject accession numbers.',
  default: AccessionPattern.BioProject,
})
