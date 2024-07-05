import * as oclif from '@oclif/core'

import { SummaryMethod } from '../../services/llm/llm.service.js'

export default oclif.Flags.custom<SummaryMethod>({
  summary: 'Selects the method used to generate summaries.',
  description: 'Refer to the FAQ for details on each method.',
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
