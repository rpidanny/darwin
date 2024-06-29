import { ICitation, IPaperSource } from '@rpidanny/google-scholar'

import { ITextMatch } from '../../utils/text/interfaces'

export interface IPaperEntity {
  title: string
  description: string
  url: string
  source: IPaperSource
  citation: ICitation
  authors: string[]
  matches?: ITextMatch[]
}
