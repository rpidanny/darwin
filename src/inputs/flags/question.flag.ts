import * as oclif from '@oclif/core'

import { FlagChar } from './char.js'

export default oclif.Flags.string({
  char: FlagChar.Question,
  helpValue: 'STRING',
  summary:
    'The question to ask the language model about the text content. (requires LLM, sets concurrency to 1)',
  description:
    'Questions are answered using LLM. Ensure LLMs are configured by running `darwin config set`.',
})
