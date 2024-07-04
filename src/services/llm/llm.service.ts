import { Document } from '@langchain/core/documents'
import { BaseLanguageModel } from '@langchain/core/language_models/base'
import { Quill } from '@rpidanny/quill'
import chalk from 'chalk'
import { Presets, SingleBar } from 'cli-progress'
import {
  loadQAMapReduceChain,
  loadSummarizationChain,
  MapReduceDocumentsChain,
  RefineDocumentsChain,
  StuffDocumentsChain,
} from 'langchain/chains'
import { TokenTextSplitter } from 'langchain/text_splitter'
import { Service } from 'typedi'

import { MAP_PROMPT, REDUCE_PROMPT } from './prompt-templates/map-reduce.template.js'
import { SUMMARY_PROMPT, SUMMARY_REFINE_PROMPT } from './prompt-templates/summary.template.js'

@Service()
export class LLMService {
  summarizeChain!: RefineDocumentsChain | MapReduceDocumentsChain | StuffDocumentsChain
  qaChain!: RefineDocumentsChain | MapReduceDocumentsChain | StuffDocumentsChain

  textSplitter!: TokenTextSplitter

  constructor(
    readonly llm: BaseLanguageModel,
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

    this.qaChain = loadQAMapReduceChain(llm, {
      verbose: false,
      combineMapPrompt: MAP_PROMPT,
      combinePrompt: REDUCE_PROMPT,
    })
  }

  public async summarize(inputText: string) {
    const bar = new SingleBar(
      {
        clearOnComplete: true,
        hideCursor: true,
        format: `${chalk.magenta('Summarizing')} [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}`,
      },
      Presets.shades_classic,
    )

    const document = new Document({
      pageContent: inputText,
    })
    const docChunks = await this.textSplitter.splitDocuments([document])

    this.logger?.info(
      `Summarizing document with ${inputText.length} chars (${docChunks.length} chunks)`,
    )

    bar.start(docChunks.length, 0)

    let docCount = 0

    const resp = await this.summarizeChain.invoke(
      {
        // eslint-disable-next-line camelcase
        input_documents: docChunks,
      },
      {
        callbacks: [
          {
            handleLLMEnd: async () => {
              bar.update(++docCount)
            },
          },
        ],
      },
    )

    bar.stop()

    return resp.output_text
  }

  public async ask(inputText: string, question: string): Promise<string> {
    const bar = new SingleBar(
      {
        clearOnComplete: true,
        hideCursor: true,
        format: `${chalk.magenta('Querying')} [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}`,
      },
      Presets.shades_classic,
    )

    const document = new Document({
      pageContent: inputText,
    })
    const docChunks = await this.textSplitter.splitDocuments([document])

    this.logger?.info(
      `Querying "${question}" on document with ${inputText.length} chars (${docChunks.length} chunks)`,
    )

    // n map + 1 reduce
    bar.start(docChunks.length + 1, 0)

    let docCount = 0

    const resp = await this.qaChain.invoke(
      {
        // eslint-disable-next-line camelcase
        input_documents: docChunks,
        question,
      },
      {
        callbacks: [
          {
            handleLLMEnd: async () => {
              bar.update(++docCount)
            },
          },
        ],
      },
    )

    bar.stop()

    return resp.text
  }
}
