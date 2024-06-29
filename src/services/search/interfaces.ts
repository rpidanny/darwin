import { ICitation, IPaperSource } from '@rpidanny/google-scholar'

import { ITextMatch } from '../paper/interfaces'

export interface IPaperEntity {
  title: string
  description: string
  url: string
  source: IPaperSource
  citation: ICitation
  authors: string[]
  matches?: ITextMatch[]
}
