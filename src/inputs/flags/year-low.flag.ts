import { Flags } from '@oclif/core'

export default Flags.integer({
  helpValue: 'YEAR',
  summary: 'Lowest year to include in the search.',
  required: false,
})
