import { Odysseus } from '@rpidanny/odysseus'
import { Container } from 'typedi'

import { BaseCommand } from '../../base.command.js'
import { initSearchContainer } from '../../containers/search.container.js'
import keywordsArg from '../../inputs/args/keywords.arg.js'
import concurrencyFlag from '../../inputs/flags/concurrency.flag.js'
import countFlag from '../../inputs/flags/count.flag.js'
import filterFlag from '../../inputs/flags/filter.flag.js'
import headlessFlag from '../../inputs/flags/headless.flag.js'
import legacyFlag from '../../inputs/flags/legacy.flag.js'
import llmProviderFlag from '../../inputs/flags/llm-provider.flag.js'
import outputFlag from '../../inputs/flags/output.flag.js'
import questionFlag from '../../inputs/flags/question.flag.js'
import skipCaptchaFlag from '../../inputs/flags/skip-captcha.flag.js'
import summaryFlag from '../../inputs/flags/summary.flag.js'
import { PaperSearchService } from '../../services/search/paper-search.service.js'

export default class SearchPapers extends BaseCommand<typeof SearchPapers> {
  private odysseus!: Odysseus
  private searchService!: PaperSearchService

  static summary = 'Searches and exports research papers based on keywords to a CSV file.'

  static examples = [
    '<%= config.bin %> <%= command.id %> --help',
    '<%= config.bin %> <%= command.id %> "crispr cas9" --output crispr_cas9.csv --count 20',
    '<%= config.bin %> <%= command.id %> "crispr cas9" --output crispr_cas9.csv --filter "tcell" --log-level DEBUG',
  ]

  static args = {
    keywords: keywordsArg,
  }

  static flags = {
    count: countFlag,
    concurrency: concurrencyFlag,
    output: outputFlag,
    filter: filterFlag,
    'skip-captcha': skipCaptchaFlag,
    legacy: legacyFlag,
    headless: headlessFlag,
    summary: summaryFlag,
    llm: llmProviderFlag,
    question: questionFlag,
  }

  async init(): Promise<void> {
    await super.init()

    const {
      headless,
      concurrency,
      summary,
      question,
      llm: llmProvider,
      'skip-captcha': skipCaptcha,
      legacy,
    } = this.flags

    initSearchContainer(
      {
        headless,
        concurrency,
        summary,
        question,
        llmProvider,
        skipCaptcha,
        legacy,
      },
      this.localConfig,
      this.logger,
    )

    this.odysseus = Container.get(Odysseus)
    await this.odysseus.init()

    this.searchService = Container.get(PaperSearchService)
  }

  protected async finally(error: Error | undefined): Promise<void> {
    await super.finally(error)
    await this.odysseus?.close()
  }

  public async run(): Promise<void> {
    const { count, output, filter, summary, question } = this.flags
    const { keywords } = this.args

    this.logger.info(`Searching papers for: ${keywords}`)

    const outputFile = await this.searchService.exportToCSV(output, {
      keywords,
      minItemCount: count,
      filterPattern: filter,
      summarize: summary,
      question,
    })

    this.logger.info(`Exported papers list to: ${outputFile}`)
  }
}
