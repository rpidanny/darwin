import * as oclif from '@oclif/core'

import { SummaryMethod } from '../../services/llm/llm.service'

export default oclif.Flags.custom<SummaryMethod>({
  summary: 'The method to use for generating summaries.',
  description: 'See FAQ for differences between methods.',
  options: Object.values(SummaryMethod) as string[],
  helpValue: Object.values(SummaryMethod).join('|'),
  default: SummaryMethod.MapReduce,
  parse: async (input: string): Promise<SummaryMethod> => {
    if (Object.values(SummaryMethod).includes(input as SummaryMethod)) {
      return input as SummaryMethod
    } else {
      throw new Error(
        `Invalid Summary Method : ${input}. Must be one of ${Object.values(SummaryMethod).join(', ')}`,
      )
    }
  },
})()
