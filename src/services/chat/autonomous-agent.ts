import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from '@langchain/core/prompts'
import { StructuredToolInterface } from '@langchain/core/tools'
import { ChatOpenAI } from '@langchain/openai'
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents'

import { PapersWithAccessionNumbersSearchTool } from '../../utils/tools/accession-search.js'
import { PapersSearchTool } from '../../utils/tools/paper-search.js'
import { SearchService } from '../search/search.service.js'

export class AutonomousAgent {
  private agent!: AgentExecutor

  constructor(
    private llm: ChatOpenAI,
    private readonly searchService: SearchService,
  ) {}

  async init(verbose = false) {
    const tools = this.getTools()
    const prompt = this.getPrompt()

    this.agent = new AgentExecutor({
      agent: await createOpenAIFunctionsAgent({
        llm: this.llm,
        tools,
        prompt,
      }),
      tools,
      verbose,
    })
  }

  async run(message: string): Promise<string> {
    if (!this.agent) {
      await this.init()
    }

    const { output } = await this.agent.invoke({ input: message })
    return output
  }

  /*
   * The agent can use these tools to perform actions that require more than just text generation.
   */
  private getTools(): StructuredToolInterface[] {
    return [
      new PapersSearchTool(this.searchService),
      new PapersWithAccessionNumbersSearchTool(this.searchService),
    ]
  }

  /*
   * The agent uses this prompt to structure the conversation.
   */
  private getPrompt(): ChatPromptTemplate {
    return ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate('You are a helpful assistant named Darwin.'),
      new MessagesPlaceholder({
        variableName: 'chat_history',
        optional: true,
      }),
      HumanMessagePromptTemplate.fromTemplate('{input}'),
      new MessagesPlaceholder({
        variableName: 'agent_scratchpad',
        optional: false,
      }),
    ])
  }
}
