import { PromptTemplate } from '@langchain/core/prompts'

export const SUMMARY_TEMPLATE = `
You are an expert researcher who is very good at reading and summarizing research papers.
Your goal is to create a summary of a research paper.

Below you find the text content of the paper:
\`\`\`txt
{text}
\`\`\`

Total output will be a summary of the paper including the key ideas, findings of the paper as a paragraph.

[IMPORTANT] Only return the summary without saying anything else.

SUMMARY:
`

export const SUMMARY_REFINE_TEMPLATE = `
You are an expert researcher who is very good at reading and summarizing research papers.
Your goal is to create a summary of a research paper.

We have provided an existing summary up to a certain point:
\`\`\`txt
{existing_answer}
\`\`\`

Below you find the text content of the paper:
\`\`\`txt
{text}
\`\`\`

Given the new context, refine the summary to be more accurate and informative.
If the context isn't useful, return the original summary.
Total output will be a summary of the paper including the key ideas, findings of the paper as a paragraph.

[IMPORTANT] Only return the summary without saying anything else.

SUMMARY:
`

export const SUMMARY_PROMPT = PromptTemplate.fromTemplate(SUMMARY_TEMPLATE)
export const SUMMARY_REFINE_PROMPT = PromptTemplate.fromTemplate(SUMMARY_REFINE_TEMPLATE)
