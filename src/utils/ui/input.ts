import chalk from 'chalk'
import inquirer from 'inquirer'

import { TConfig } from '../../config/schema.js'

async function promptOpenAIConfig(defaultConfig?: TConfig['openai']): Promise<TConfig['openai']> {
  const apiKey = {
    type: 'input',
    name: 'apiKey',
    message: `Enter OpenAI API Key:`,
    default: defaultConfig?.apiKey,
  }

  const model = {
    type: 'input',
    name: 'model',
    message: `Enter the OpenAI model to use:`,
    default: defaultConfig?.model,
  }

  console.log(chalk.gray(`Please enter the OpenAI Configurations:`))

  return await inquirer.prompt([apiKey, model])
}

export default {
  promptOpenAIConfig,
}
