import { PaperEntity } from '../../src/services/search/interfaces'

export function getExamplePaperHtmlContent(title?: string, body?: string): string {
  return `<html><title>${title ?? 'CRISPR'}</title><body>${body ?? 'CRISPR, short for Clustered Regularly Interspaced Short Palindromic Repeats, is a revolutionary gene-editing technology that allows for precise modifications to DNA. It is derived from a natural defense mechanism found in bacteria, where it serves to recognize and cut viral DNA. The key proteins involved in CRISPR are Cas (CRISPR-associated) proteins, with Cas9 being the most well-known. Cas9 acts like molecular scissors, guided by RNA sequences to specific locations on the DNA strand where it makes precise cuts. This system can be used to add, remove, or alter genetic material at targeted sites, making it a powerful tool for research, medicine, and biotechnology.'}</body></html>`
}

export function getExamplePaperEntity(overrides?: Partial<PaperEntity>): PaperEntity {
  return {
    title: 'CRISPR',
    description:
      'CRISPR, short for Clustered Regularly Interspaced Short Palindromic Repeats, is a revolutionary gene-editing technology that allows for precise modifications to DNA. It is derived from a natural defense mechanism found in bacteria, where it serves to recognize and cut viral DNA. The key proteins involved in CRISPR are Cas (CRISPR-associated) proteins, with Cas9 being the most well-known. Cas9 acts like molecular scissors, guided by RNA sequences to specific locations on the DNA strand where it makes precise cuts. This system can be used to add, remove, or alter genetic material at targeted sites, making it a powerful tool for research, medicine, and biotechnology.',
    url: 'http://example.com',
    paperType: 'pdf',
    paperUrl: 'http://example.com/crispr.pdf',
    citationCount: 100,
    citationUrl: 'http://example.com/citations',
    authors: ['Alice', 'Bob', 'Charlie'],
    foundItems: ['CRISPR', 'Cas9'],
    sentencesOfInterest: [
      'CRISPR is a revolutionary gene-editing technology',
      'Cas9 acts like molecular scissors',
    ],
    ...overrides,
  }
}
