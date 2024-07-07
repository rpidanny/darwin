import { readdirSync, readFileSync } from 'fs'
import { basename, join } from 'path'

export interface IDataset {
  name: string
  paper: string
  abstract: string
}

export function listFiles(dir: string): string[] {
  return readdirSync(dir)
}

export function getDatasets(count?: number): IDataset[] {
  const paperDir = './eval/summary/data/papers'
  const abstractDir = './eval/summary/data/abstract'
  const papers = listFiles(paperDir)

  return papers.slice(0, count ?? papers.length).map(paper => ({
    name: basename(paper),
    paper: readFileSync(join(paperDir, paper), 'utf-8'),
    abstract: readFileSync(join(abstractDir, basename(paper)), 'utf-8'),
  }))
}
