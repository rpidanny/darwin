import { Document } from '@langchain/core/documents'
import { ChatOpenAI } from '@langchain/openai'
import { Quill } from '@rpidanny/quill'
import {
  loadSummarizationChain,
  MapReduceDocumentsChain,
  RefineDocumentsChain,
  StuffDocumentsChain,
} from 'langchain/chains'
import { TokenTextSplitter } from 'langchain/text_splitter'

import { SUMMARY_PROMPT, SUMMARY_REFINE_PROMPT } from './prompt.templates.js'

export class SummaryService {
  summarizeChain!: RefineDocumentsChain | MapReduceDocumentsChain | StuffDocumentsChain
  textSplitter!: TokenTextSplitter

  constructor(
    readonly llm: ChatOpenAI,
    private readonly logger?: Quill,
  ) {
    this.textSplitter = new TokenTextSplitter({
      chunkSize: 10_000,
      chunkOverlap: 500,
    })

    this.summarizeChain = loadSummarizationChain(llm, {
      type: 'refine',
      verbose: false,
      questionPrompt: SUMMARY_PROMPT,
      refinePrompt: SUMMARY_REFINE_PROMPT,
    })
  }

  public async summarize(text: string) {
    this.logger?.debug(`Summarizing ${text.length} char long text...`)

    const document = new Document({
      pageContent: text,
    })

    const docChunks = await this.textSplitter.splitDocuments([document])
    const summary = await this.summarizeChain.run(docChunks)

    return summary
  }
}
