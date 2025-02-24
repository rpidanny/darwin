import fs from 'fs-extra'
import path from 'path'

import { BaseCommand } from '../../base.command.js'
import { CONFIG_FILE_NAME } from '../../config/constants.js'
import { ConfigSchema, TConfig } from '../../config/schema.js'
import uiInput from '../../utils/ui/input.js'

export default class SetConfig extends BaseCommand<typeof SetConfig> {
  static description = 'Set config'

  static examples = ['<%= config.bin %> <%= command.id %>']

  static flags = {}

  static args = {}

  public async run(): Promise<void> {
    const configFilePath = path.join(this.config.configDir, CONFIG_FILE_NAME)

    const existingConfig = await this.getExistingConfig(configFilePath)

    const openai = await uiInput.promptOpenAIConfig(existingConfig?.openai)
    const ollama = await uiInput.promptOllamaConfig(existingConfig?.ollama)

    const config: TConfig = {
      openai,
      ollama,
    }

    await this.saveConfig(configFilePath, config)
  }

  async getExistingConfig(configFilePath: string): Promise<TConfig | null> {
    try {
      const config = await fs.readJSON(configFilePath)
      return ConfigSchema.parse(config)
    } catch (err) {
      return null
    }
  }

  async saveConfig(configFilePath: string, config: TConfig): Promise<void> {
    await fs.ensureFile(configFilePath)
    await fs.writeFile(configFilePath, JSON.stringify(config, null, 2))
  }
}
