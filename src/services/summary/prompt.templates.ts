import { PromptTemplate } from '@langchain/core/prompts'

export const SUMMARY_TEMPLATE = `
You are an expert researcher who is very good as summarizing research papers.
Your goal is to create a summary of a research paper.
Below you find the text content of the paper:
--------
{text}
--------

Total output will be a summary of the paper and key points of the paper.
Only return the summary and key points without saying anything else.

SUMMARY:

KEY POINTS:
`

export const SUMMARY_REFINE_TEMPLATE = `
You are an expert researcher who is very good as summarizing research papers.
Your goal is to create a summary of a research paper.

We have provided an existing summary up to a certain point:
--------
{existing_answer}
--------

Below you find the text content of the paper:
--------
{text}
--------

Given the new context, refine the summary to be more accurate and informative.
If the context isn't useful, return the original summary.
Total output will be a summary of the paper and key points of the paper.
Only return the summary and key points without saying anything else.

SUMMARY:

KEY POINTS:
`

export const SUMMARY_PROMPT = PromptTemplate.fromTemplate(SUMMARY_TEMPLATE)
export const SUMMARY_REFINE_PROMPT = PromptTemplate.fromTemplate(SUMMARY_REFINE_TEMPLATE)
