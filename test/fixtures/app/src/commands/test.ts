import { Args, Flags } from '@oclif/core'

import { BaseCommand } from '../../../../../src/base.command.js'

export class TestCommand extends BaseCommand<typeof TestCommand> {
  static description = 'Get currently set configs'

  static examples = ['<%= config.bin %> <%= command.id %>']

  static flags = {
    verbose: Flags.boolean({
      char: 'v',
      description: 'enable verbose mode',
    }),
  }

  static args = {
    arg1: Args.string({
      description: 'some argument',
      required: true,
    }),
  }

  public async run(): Promise<Record<string, any>> {
    return {
      flags: this.flags,
      args: this.args,
    }
  }
}
