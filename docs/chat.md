`darwin chat`
=============

Chat with Darwin using natural language.

* [`darwin chat`](#darwin-chat)

## `darwin chat`

Chat with Darwin using natural language.

```
USAGE
  $ darwin chat [-l TRACE|DEBUG|INFO|WARN|ERROR|FATAL] [-p NUMBER] [-s] [--legacy] [--llm openai|ollama]

FLAGS
  -p, --concurrency=NUMBER  [default: 10] The number papers to process in parallel.
  -s, --skip-captcha        Skip captcha on paper URLs. Note: Google Scholar captcha still needs to be solved.
      --legacy              Enable legacy processing which extracts text only from the main URL. The new method attempts
                            to extract text from the source URLs (pdf or html) and falls back to the main URL.
      --llm=openai|ollama   [default: ollama] The LLM provider to use for generating summaries.

GLOBAL FLAGS
  -l, --log-level=TRACE|DEBUG|INFO|WARN|ERROR|FATAL  [default: INFO] Specify logging level.

EXAMPLES
  $ darwin chat
```

_See code: [src/commands/chat/index.ts](https://github.com/rpidanny/darwin/blob/v1.31.0/src/commands/chat/index.ts)_
