import chalk from 'chalk'
import inquirer from 'inquirer'

import { ModelProvider, TConfig } from '../../config/schema.js'

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

async function promptSummaryConfig(
  defaultConfig?: TConfig['summary'],
): Promise<TConfig['summary']> {
  const modelProvider = {
    type: 'list',
    name: 'modelProvider',
    message: `Select the model provider:`,
    choices: Object.values(ModelProvider),
    default: defaultConfig?.modelProvider,
  }

  const model = {
    type: 'input',
    name: 'model',
    message: `Enter the model to use: Example: llama3:instruct, gpt-4-turbo, etc.`,
    default: defaultConfig?.model,
  }

  const endpoint = {
    type: 'input',
    name: 'endpoint',
    message: `Enter the endpoint: (optional) Leave empty for OpenAI.`,
    default: defaultConfig?.endpoint,
  }

  console.log(chalk.gray(`Please enter the configuration used for summarization:`))

  return await inquirer.prompt([modelProvider, model, endpoint])
}

export default {
  promptOpenAIConfig,
  promptSummaryConfig,
}
