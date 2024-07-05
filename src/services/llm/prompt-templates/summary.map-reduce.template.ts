import { PromptTemplate } from '@langchain/core/prompts'

export const MAP_TEMPLATE = `
You are an expert researcher skilled in summarizing research papers.
Your task is to summarize the following research paper text:

\`\`\`md
{text}
\`\`\`

If the text is not from a research paper, ignore it.

Provide a concise summary including the key ideas and findings as a paragraph.

[IMPORTANT] Only return the summary without saying anything else.

SUMMARY:`

export const REDUCE_TEMPLATE = `
You are an expert researcher skilled in summarizing research papers.
Your task is to consolidate the following summaries into a single, concise summary:

\`\`\`txt
{text}
\`\`\`

Provide a final summary of the main themes as a paragraph.

[IMPORTANT] Only return the summary without saying anything else.

CONCISE SUMMARY:`

export const MAP_PROMPT = PromptTemplate.fromTemplate(MAP_TEMPLATE)
export const REDUCE_PROMPT = PromptTemplate.fromTemplate(REDUCE_TEMPLATE)
