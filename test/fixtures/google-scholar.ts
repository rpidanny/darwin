import { ISearchResponse, PaperUrlType } from '@rpidanny/google-scholar'

export function getSearchResponse(overrides?: Partial<ISearchResponse>): ISearchResponse {
  return {
    results: [
      {
        title: 'CRISPR–Cas9 structures and mechanisms',
        url: 'https://www.annualreviews.org/doi/abs/10.1146/annurev-biophys-062215-010822',
        description:
          '… and Cas9 orthologs have contributed greatly to our understanding of CRISPR–Cas9 mechanisms. In this review, we briefly explain the biology underlying CRISPR–Cas9 technology …',
        paper: {
          type: PaperUrlType.HTML,
          url: 'https://www.annualreviews.org/doi/pdf/10.1146/annurev-biophys-062215-010822',
        },
        authors: [
          {
            name: 'F Jiang',
            url: 'https://scholar.google.com/citations?user=gt-dzeEAAAAJ&hl=en&oi=sra',
          },
          {
            name: 'JA Doudna',
            url: 'https://scholar.google.com/citations?user=YO5XSXwAAAAJ&hl=en&oi=sra',
          },
        ],
        citation: {
          count: 2_020,
          url: 'https://scholar.google.com/scholar?cites=2456688039791281496&as_sdt=2005&sciodt=0,5&hl=en',
        },
        relatedArticlesUrl:
          'https://scholar.google.com/scholar?q=related:WMW1j8HoFyIJ:scholar.google.com/&scioq=crispr+cas9&hl=en&as_sdt=0,5',
      },
    ],
    count: 594_000,
    nextUrl: 'https://scholar.google.com/scholar?start=10&q=crispr+cas9&hl=en&as_sdt=0,5',
    prevUrl: null,
    next: null,
    previous: null,
    ...overrides,
  }
}
