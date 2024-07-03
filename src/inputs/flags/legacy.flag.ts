import * as oclif from '@oclif/core'

export default oclif.Flags.boolean({
  summary:
    'Enable legacy processing which extracts text only from the main URL. The new method attempts to extract text from the source URLs (pdf or html) and falls back to the main URL.',
  default: false,
})
