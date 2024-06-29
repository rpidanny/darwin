import { ITextMatch } from './interfaces'

function getStartIndex(text: string, index: number): number {
  const dot = text.lastIndexOf('.', index)
  const nl = text.lastIndexOf('\n', index)
  return Math.max(dot, nl) + 1
}

function getEndIndex(text: string, index: number): number {
  const dot = text.indexOf('.', index)
  const nl = text.indexOf('\n', index)
  return Math.min(dot === -1 ? Infinity : dot, nl === -1 ? Infinity : nl) + 1
}

export function getSentence(text: string, index: number): string {
  const start = getStartIndex(text, index)
  const end = getEndIndex(text, index)

  return text.slice(start, end).trim()
}

export function findInText(text: string, regex: RegExp): ITextMatch[] {
  const matches = text.matchAll(regex)
  const foundItems = new Map<string, string[]>()

  for (const match of matches) {
    const sentence = getSentence(text, match.index)
    const currentSentences = foundItems.get(match[0]) || []
    currentSentences.push(sentence)
    foundItems.set(match[0], currentSentences)
  }

  return Array.from(foundItems).map(([content, sentences]) => ({ content, sentences }))
}
