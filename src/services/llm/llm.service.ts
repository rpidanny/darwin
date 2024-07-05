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

import * as qaTemplate from './prompt-templates/question-answer.template.js'
import * as summaryMapReduceTemplate from './prompt-templates/summary.map-reduce.template.js'
import * as summaryRefineTemplate from './prompt-templates/summary.refine.template.js'

export enum SummaryMethod {
  Refine = 'refine',
  MapReduce = 'map_reduce',
}

type TChain = RefineDocumentsChain | MapReduceDocumentsChain | StuffDocumentsChain

@Service()
export class LLMService {
  private summarizationChains: { [key in SummaryMethod]: TChain }
  private qaChain: TChain
  private textSplitter: TokenTextSplitter

  constructor(
    readonly llm: BaseLanguageModel,
    private readonly logger?: Quill,
  ) {
    this.textSplitter = new TokenTextSplitter({ chunkSize: 10_000, chunkOverlap: 500 })

    this.summarizationChains = {
      [SummaryMethod.Refine]: loadSummarizationChain(llm, {
        type: 'refine',
        verbose: false,
        questionPrompt: summaryRefineTemplate.SUMMARY_PROMPT,
        refinePrompt: summaryRefineTemplate.SUMMARY_REFINE_PROMPT,
      }),
      [SummaryMethod.MapReduce]: loadSummarizationChain(llm, {
        type: 'map_reduce',
        verbose: false,
        combineMapPrompt: summaryMapReduceTemplate.MAP_PROMPT,
        combinePrompt: summaryMapReduceTemplate.REDUCE_PROMPT,
      }),
    }

    this.qaChain = loadQAMapReduceChain(llm, {
      verbose: false,
      combineMapPrompt: qaTemplate.MAP_PROMPT,
      combinePrompt: qaTemplate.REDUCE_PROMPT,
    })
  }

  private createProgressBar(task: string, total: number): SingleBar {
    const bar = new SingleBar(
      {
        clearOnComplete: true,
        hideCursor: true,
        format: `${chalk.magenta(task)} [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}`,
      },
      Presets.shades_classic,
    )

    bar.start(total, 0)

    return bar
  }

  private async getDocumentChunks(inputText: string): Promise<Document[]> {
    const document = new Document({ pageContent: inputText })
    return this.textSplitter.splitDocuments([document])
  }

  private async processChunks(
    chain: TChain,
    docChunks: Document[],
    callbacks: any[],
    question?: string,
  ): Promise<any> {
    let docCount = 0
    return chain.invoke(
      // eslint-disable-next-line camelcase
      { input_documents: docChunks, question },
      {
        callbacks: callbacks.map(callback => ({
          handleLLMEnd: async res => {
            callback(++docCount)
            if (process.env.DARWIN_GOD_MODE) {
              this.logger?.debug(
                `LLM Response: ${res.generations.map(g => g.map(t => t.text).join('\n')).join(',')}`,
              )
            }
          },
        })),
      },
    )
  }

  public async summarize(
    inputText: string,
    method: SummaryMethod = SummaryMethod.MapReduce,
  ): Promise<string> {
    const docChunks = await this.getDocumentChunks(inputText)
    const totalSteps = docChunks.length + (method === SummaryMethod.MapReduce ? 1 : 0)

    this.logger?.info(
      `Summarizing document with ${inputText.length} chars (${docChunks.length} chunks)`,
    )
    const bar = this.createProgressBar('Summarizing', totalSteps)

    const resp = await this.processChunks(this.summarizationChains[method], docChunks, [
      bar.update.bind(bar),
    ])

    bar.stop()
    return method === SummaryMethod.MapReduce ? resp.text : resp.output_text
  }

  public async ask(inputText: string, question: string): Promise<string> {
    const docChunks = await this.getDocumentChunks(inputText)

    const totalSteps = docChunks.length + 1

    this.logger?.info(
      `Querying "${question}" on document with ${inputText.length} chars (${docChunks.length} chunks)`,
    )
    const bar = this.createProgressBar('Querying', totalSteps)

    const resp = await this.processChunks(this.qaChain, docChunks, [bar.update.bind(bar)], question)

    bar.stop()
    return resp.text
  }
}
