import { Document } from '@langchain/core/documents'
import { BaseLanguageModel } from '@langchain/core/language_models/base'
import { Quill } from '@rpidanny/quill'
import chalk from 'chalk'
import { Presets, SingleBar } from 'cli-progress'
import {
  loadSummarizationChain,
  MapReduceDocumentsChain,
  RefineDocumentsChain,
  StuffDocumentsChain,
} from 'langchain/chains'
import { TokenTextSplitter } from 'langchain/text_splitter'
import { Service } from 'typedi'

import { SUMMARY_PROMPT, SUMMARY_REFINE_PROMPT } from './prompt-templates/summary.template.js'

@Service()
export class LLMService {
  summarizeChain!: RefineDocumentsChain | MapReduceDocumentsChain | StuffDocumentsChain
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
  }

  public async summarize(inputText: string) {
    const bar = new SingleBar(
      {
        clearOnComplete: false,
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
      `Summarizing ${inputText.length} char (${docChunks.length} chunks) document...`,
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
}
