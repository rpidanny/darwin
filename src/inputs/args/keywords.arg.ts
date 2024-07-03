import * as oclif from '@oclif/core'

export default oclif.Args.string({
  name: 'keywords',
  required: true,
  description: 'The keywords to search for. (Example: "crispr cas9")',
})
