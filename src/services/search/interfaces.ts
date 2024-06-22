export interface PaperEntity {
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

export interface PaperWithAccessionEntity extends PaperEntity {
  accessionNumbers: string[]
}

export interface FoundItem {
  text: string
  sentences: string[]
}
