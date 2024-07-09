import { Flags } from '@oclif/core'

export default Flags.integer({
  helpValue: 'YEAR',
  summary: 'Highest year to include in the search.',
  required: false,
})
