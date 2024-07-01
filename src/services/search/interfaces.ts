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
  summary?: string
}

export interface ISearchOptions {
  keywords: string
  minItemCount: number
  filterPattern?: string
  summarize?: boolean
  onData?: (data: IPaperEntity) => Promise<any>
}
