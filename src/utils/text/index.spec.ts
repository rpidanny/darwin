import { findInText, getSentence } from './index'

describe('getSentence', () => {
  it('should return the sentence containing the given index', () => {
    const text = 'This is a sentence. This is another sentence. And this is the last sentence.'
    const index = 10
    const sentence = getSentence(text, index)
    expect(sentence).toBe('This is a sentence.')
  })

  it('should return an empty string if the index is out of range', () => {
    const text = 'This is a sentence.'
    const index = 100
    const sentence = getSentence(text, index)
    expect(sentence).toBe('')
  })
})

describe('findInText', () => {
  it('should find all matches of the given regex in the text', () => {
    const text = 'This is a sentence. This is another sentence. And this is the last sentence.'
    const regex = /sentence/gi
    const matches = findInText(text, regex)
    expect(matches).toHaveLength(1)
    expect(matches[0].content).toBe('sentence')
    expect(matches[0].sentences).toEqual([
      'This is a sentence.',
      'This is another sentence.',
      'And this is the last sentence.',
    ])
  })

  it('should return an empty array if no matches are found', () => {
    const text = 'This is a sentence.'
    const regex = /word/g
    const matches = findInText(text, regex)
    expect(matches).toHaveLength(0)
  })

  it('should return sentence until new line if the sentence starts with a new line', () => {
    const text = `Article Open access 15 March 2021


DATA AVAILABILITY

All the raw sequences were submitted to NCBI GenBank sequence reads archives (SRA) with the Bioproject SRA accession number: PRJNA860706.`

    const regex = /PRJNA\d+/gi
    const matches = findInText(text, regex)
    expect(matches).toHaveLength(1)
    expect(matches[0].content).toBe('PRJNA860706')
    expect(matches[0].sentences).toEqual([
      'All the raw sequences were submitted to NCBI GenBank sequence reads archives (SRA) with the Bioproject SRA accession number: PRJNA860706.',
    ])
  })

  it('should return sentence until new line if the sentence ends with a new line', () => {
    const text = `All the raw sequences were submitted to NCBI GenBank sequence reads archives (SRA) with the Bioproject SRA accession number: PRJNA860706

Article Open access 15 March 2021
`

    const regex = /PRJNA\d+/gi
    const matches = findInText(text, regex)
    expect(matches).toHaveLength(1)
    expect(matches[0].content).toBe('PRJNA860706')
    expect(matches[0].sentences).toEqual([
      'All the raw sequences were submitted to NCBI GenBank sequence reads archives (SRA) with the Bioproject SRA accession number: PRJNA860706',
    ])
  })
})
