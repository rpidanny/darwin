export interface IPaperEntity {
  title: string
  description: string
  url: string
  sourceType: string
  sourceUrl: string
  citationCount: number
  citationUrl: string
  authors: string[]
  matchedTexts?: string[]
  relevantSentences?: string[]
}
