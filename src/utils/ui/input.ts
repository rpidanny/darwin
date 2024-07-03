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

async function promptOllamaConfig(defaultConfig?: TConfig['ollama']): Promise<TConfig['ollama']> {
  const model = {
    type: 'input',
    name: 'model',
    message: `Enter the model to use (ref: https://ollama.com/library): Example: llama3:instruct, gemma2:9b, etc.`,
    default: defaultConfig?.model,
  }

  const baseUrl = {
    type: 'input',
    name: 'baseUrl',
    message: `Enter the Ollama Server baseUrl:`,
    default: defaultConfig?.baseUrl,
  }

  console.log(chalk.gray(`Please enter the Ollama configurations:`))

  return await inquirer.prompt([model, baseUrl])
}

export default {
  promptOpenAIConfig,
  promptOllamaConfig,
}
