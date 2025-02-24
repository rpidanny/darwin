import { PromptTemplate } from '@langchain/core/prompts'

export const EVAL_SUMMARY_PROMPT = `
You are an expert researcher evaluating summaries of a research paper.

You will be provided with:
- The original abstract of the research paper.
- Summary generated by a language models.

Evaluate the summary on how well it captures the main points of the original abstract.

Provide a score between 1 and 10.

# Original Abstract
\`\`\`txt
{abstract}
\`\`\`

# Summary
\`\`\`txt
{summary}
\`\`\`

Return the score as a JSON object with key 'score' and the score as the value.

[IMPORTANT] Only return the JSON object containing the model score and nothing else.
`

export const EVAL_PROMPT_TEMPLATE = PromptTemplate.fromTemplate(EVAL_SUMMARY_PROMPT)
