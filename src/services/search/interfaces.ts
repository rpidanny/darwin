export interface IPaperEntity {
  title: string
  description: string
  url: string
  paperType: string
  paperUrl: string
  citationCount: number
  citationUrl: string
  authors: string[]
  foundItems?: string[]
  sentencesOfInterest?: string[]
}
