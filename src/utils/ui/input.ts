import chalk from 'chalk'
import inquirer from 'inquirer'

import { LLMType, TConfig } from '../../config/schema.js'

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

async function promptSummarizationConfig(
  defaultConfig?: TConfig['summarization'],
): Promise<TConfig['summarization']> {
  const llmType = {
    type: 'list',
    name: 'llmType',
    message: `Select the LLM Type:`,
    choices: Object.values(LLMType),
    default: defaultConfig?.llmType,
  }

  const model = {
    type: 'input',
    name: 'model',
    message: `Enter the model to use:`,
    default: defaultConfig?.model,
  }

  const endpoint = {
    type: 'input',
    name: 'endpoint',
    message: `Enter the endpoint:`,
    default: defaultConfig?.endpoint,
  }

  console.log(chalk.gray(`Please enter the Summarization Configurations:`))

  return await inquirer.prompt([llmType, model, endpoint])
}

export default {
  promptOpenAIConfig,
  promptSummarizationConfig,
}
