import * as oclif from '@oclif/core'

import { FlagChar } from './char.js'

export default oclif.Flags.boolean({
  char: FlagChar.IncludeSummary,
  summary: 'Include summaries in the output CSV (requires LLM, sets concurrency to 1)',
  description:
    'Summaries are generated using LLM. Ensure LLMs are configured by running `darwin config set`.',
  default: false,
})
