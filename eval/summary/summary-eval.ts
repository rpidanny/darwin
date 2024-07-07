import { Runnable } from '@langchain/core/runnables'
import { Quill } from '@rpidanny/quill'

import { LLMProvider, TConfig } from '../../src/config/schema'
import { LLMFactory } from '../../src/factories/llm'
import { LLMService, SummaryMethod } from '../../src/services/llm/llm.service'
import { IDataset } from './dataset'
import { EVAL_PROMPT_TEMPLATE } from './prompt'

export interface SummaryEvalOptions {
  models: string[]
  datasets: IDataset[]
  methods: SummaryMethod[]
}

export interface EvaluationScore {
  [key: string]: number
}

export class SummaryEvaluator {
  private coreModelName = 'gemma2:9b-instruct-q4_0'
  private datasetMap: Map<string, IDataset>
  private evaluationChain: Runnable

  constructor(
    private readonly options: SummaryEvalOptions,
    private readonly llmFactory: LLMFactory,
    private readonly logger: Quill,
  ) {
    this.datasetMap = new Map(options.datasets.map(dataset => [dataset.name, dataset]))
    const coreLlm = this.llmFactory.getLLM(LLMProvider.Ollama, this.getConfig(this.coreModelName))
    this.evaluationChain = EVAL_PROMPT_TEMPLATE.pipe(coreLlm)
  }

  private getConfig(modelName: string): TConfig {
    return { ollama: { model: modelName, baseUrl: 'http://localhost:11434' } }
  }

  private async generateSummaries(): Promise<Map<string, string[]>> {
    this.logger.info('Generating summaries...')
    const summaryMap = new Map<string, string[]>()
    const { models, datasets, methods } = this.options

    for (const model of models) {
      this.logger.debug(`Model: ${model}`)
      const llmService = new LLMService(
        this.llmFactory.getLLM(LLMProvider.Ollama, this.getConfig(model)),
      )

      for (const dataset of datasets) {
        this.logger.debug(`Dataset: ${dataset.name}`)

        for (const method of methods) {
          this.logger.debug(`Method: ${method}`)
          const summary = await llmService.summarize(dataset.paper, method)
          const key = dataset.name
          const previousSummaries = summaryMap.get(key) || []
          previousSummaries.push(`ID: ${model}-${method}\nSummary: ${summary}`)
          summaryMap.set(key, previousSummaries)
          this.logger.info(`Summary: ${summary}`)
        }
      }
    }
    return summaryMap
  }

  private async evaluateSummaries(summaryMap: Map<string, string[]>): Promise<EvaluationScore[]> {
    this.logger.info('Evaluating summaries...')
    const evaluations: EvaluationScore[] = []
    for (const [datasetName, summaries] of summaryMap.entries()) {
      let response = await this.evaluationChain.invoke({
        summaries: summaries.join('\n\n'),
        abstract: this.datasetMap.get(datasetName)?.abstract,
      })
      response = response.replace(/```json/g, '').replace(/```/g, '')
      this.logger.info(`Dataset: ${datasetName}`)
      console.log(response)
      evaluations.push(JSON.parse(response))
    }

    return evaluations
  }

  private async aggregateScores(scores: EvaluationScore[]): Promise<EvaluationScore> {
    return scores.reduce((accumulatedScores, score) => {
      for (const [model, value] of Object.entries(score)) {
        accumulatedScores[model] = accumulatedScores[model]
          ? (accumulatedScores[model] + value) / 2
          : value
      }
      return accumulatedScores
    }, {} as EvaluationScore)
  }

  public async run(iterations = 1): Promise<EvaluationScore> {
    const allScores: EvaluationScore[] = []

    for (let i = 0; i < iterations; i++) {
      this.logger.info(`Iteration ${i + 1}`)
      const summaryMap = await this.generateSummaries()
      const scores = await this.evaluateSummaries(summaryMap)

      const aggregatedScores = await this.aggregateScores(scores)

      this.logger.debug(`Iteration ${i + 1}`)
      this.logger.info(JSON.stringify(aggregatedScores, null, 2))
      allScores.push(aggregatedScores)
    }

    return allScores.reduce((accumulatedScores, score) => {
      for (const [model, value] of Object.entries(score)) {
        accumulatedScores[model] = accumulatedScores[model]
          ? (accumulatedScores[model] + value) / 2
          : value
      }
      return accumulatedScores
    }, {} as EvaluationScore)
  }
}
