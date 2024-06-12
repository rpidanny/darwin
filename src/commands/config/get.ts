import { BaseCommand } from '../../base.command.js'
import { TConfig } from '../../config/schema.js'

export default class GetConfig extends BaseCommand<typeof GetConfig> {
  static description = 'Get currently set config'

  static examples = ['<%= config.bin %> <%= command.id %>']

  static flags = {}

  static args = {}

  public async run(): Promise<TConfig> {
    this.logJson(this.localConfig)
    return this.localConfig
  }
}
