import chalk from 'chalk'
import inquirer from 'inquirer'
import { marked, MarkedExtension } from 'marked'
import { markedTerminal } from 'marked-terminal'
import ora from 'ora'

import { AutonomousAgent } from './autonomous-agent'

marked.use(markedTerminal() as MarkedExtension)

export class ChatService {
  constructor(private readonly agent: AutonomousAgent) {}

  public async run(): Promise<void> {
    this.darwin(`How can I help you today?`)

    while (true) {
      const message = await this.getUserInput()

      if (message === '/exit') {
        this.darwin('Goodbye!')
        break
      } else if (message === '/?') {
        this.printHelp()
        continue
      }

      const spinner = ora('Thinking...').start()
      const output = await this.agent.run(message)
      spinner.stop()

      this.darwin(output)
    }
  }

  private darwin(message: string): void {
    console.log(
      `${chalk.bold('🤖 Darwin')}: ${marked(message.replace(/```ts/g, '```js').replace(/```typescript/g, '```js'))}`,
    )
  }

  private async getUserInput(): Promise<string> {
    const { message } = await inquirer.prompt([
      {
        type: 'input',
        name: 'message',
        message: 'You:',
        default: `${chalk.gray('Send a message (/? for help)')}`,
        transformer: (input: string) => `${input}\n`,
        prefix: '😎',
      },
    ])

    return message
  }

  private printHelp(): void {
    console.log(`${chalk.bold('Commands:')}`)
    console.log(`   ${chalk.bold('/?')} - Show this help message`)
    console.log(`   ${chalk.bold('/exit')} - Exit the chat\n`)
  }
}
