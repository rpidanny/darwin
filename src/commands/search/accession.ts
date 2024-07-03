import * as oclif from '@oclif/core'
import { Odysseus } from '@rpidanny/odysseus'
import { Container } from 'typedi'

import { BaseCommand } from '../../base.command.js'
import { LLMProvider } from '../../config/schema.js'
import { initSearchContainer } from '../../containers/search.container.js'
import { AccessionPattern } from '../../services/search/constants.js'
import { PaperSearchService } from '../../services/search/paper-search.service.js'

export default class SearchAccession extends BaseCommand<typeof SearchAccession> {
  private odysseus!: Odysseus
  private searchService!: PaperSearchService

  static summary = 'Search and export papers containing accession numbers to a CSV file.'

  static deprecationOptions: oclif.Interfaces.Deprecation = {
    message: 'Use `darwin search papers` command with  `--find="PRJNA\\d+"` instead.',
    version: '1.13.0',
    to: 'search papers',
  }

  static examples = [
    '<%= config.bin %> <%= command.id %> --help',
    '<%= config.bin %> <%= command.id %> "mocrobiome, nRNA" -o output.csv  -n 5 -c 1 --log-level DEBUG',
  ]

  static args = {
    keywords: oclif.Args.string({
      name: 'keywords',
      required: true,
      description: 'The keywords to search for',
    }),
  }

  static flags = {
    count: oclif.Flags.integer({
      char: 'c',
      summary:
        'The minimum number of papers to search for. (When running concurrently, the actual number of papers may be a bit higher)',
      default: 10,
    }),
    concurrency: oclif.Flags.integer({
      char: 'p',
      summary: 'The number papers to process in parallel.',
      default: 10,
    }),
    output: oclif.Flags.string({
      char: 'o',
      summary:
        'Specify the output destination for the CSV file. If a folder path is given, the filename is auto-generated; if a file path is given, it is used directly.',
      default: '.',
    }),
    'accession-number-regex': oclif.Flags.string({
      char: 'a',
      summary:
        'Regex to match accession numbers. Defaults to matching BioProject accession numbers.',
      default: AccessionPattern.BioProject,
    }),
    'skip-captcha': oclif.Flags.boolean({
      char: 's',
      summary: 'Skip captcha on paper URLs. Note: Google Scholar captcha still needs to be solved.',
      default: false,
    }),
    'legacy-processing': oclif.Flags.boolean({
      summary:
        'Enable legacy processing of papers that only extracts text from the main URL. The new method attempts to extract text from the source URLs (pdf or html) and falls back to the main URL.',
      default: false,
    }),
    headless: oclif.Flags.boolean({
      char: 'h',
      summary: 'Run the browser in headless mode (no UI).',
      default: false,
    }),
    'include-summary': oclif.Flags.boolean({
      char: 'S',
      summary:
        '[LLM Required] Include the paper summary in the output CSV file. When enabled, concurrency is set to 1.',
      description:
        'Summaries are generated using LLM so make sure LLMs are configured by running `darwin config set`',
      default: false,
    }),
    'llm-provider': oclif.Flags.custom<LLMProvider>({
      summary: 'The LLM provider to use for generating summaries.',
      options: Object.values(LLMProvider) as string[],
      default: LLMProvider.Ollama,
      parse: async (input: string): Promise<LLMProvider> => {
        if (Object.values(LLMProvider).includes(input as LLMProvider)) {
          return input as LLMProvider
        } else {
          throw new Error(
            `Invalid LLM provider: ${input}. Must be one of ${Object.values(LLMProvider).join(', ')}`,
          )
        }
      },
    })(),
  }

  async init(): Promise<void> {
    await super.init()

    const {
      headless,
      concurrency,
      'include-summary': summarize,
      'llm-provider': llmProvider,
      'skip-captcha': skipCaptcha,
      'legacy-processing': legacyProcessing,
    } = this.flags

    initSearchContainer(
      {
        headless,
        concurrency,
        summarize,
        llmProvider,
        skipCaptcha,
        legacyProcessing,
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
    const {
      count,
      output,
      'accession-number-regex': filterPattern,
      'include-summary': summarize,
    } = this.flags
    const { keywords } = this.args

    this.logger.info(`Searching papers with Accession Numbers (${filterPattern}) for: ${keywords}`)

    const outputPath = await this.searchService.exportToCSV(output, {
      keywords,
      minItemCount: count,
      filterPattern,
      summarize,
    })

    this.logger.info(`Exported papers list to: ${outputPath}`)
  }
}
