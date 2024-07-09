import { ICitation, IPaperSource } from '@rpidanny/google-scholar'

import { ITextMatch } from '../../utils/text/interfaces.js'
import { SummaryMethod } from '../llm/llm.service.js'

export interface IPaperEntity {
  title: string
  description: string
  url: string
  source: IPaperSource
  citation: ICitation
  authors: string[]
  matches?: ITextMatch[]
  summary?: string
  answer?: string
}

export interface ISearchOptions {
  keywords: string
  minItemCount: number
  filterPattern?: string
  summarize?: boolean
  summaryMethod?: SummaryMethod
  question?: string
  onData?: (data: IPaperEntity) => Promise<any>
  yearLow?: number
  yearHigh?: number
}
