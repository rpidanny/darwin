`darwin chat`
=============

Chat with Darwin. Can be used to instruct Darwin to do things in natural language.

* [`darwin chat`](#darwin-chat)

## `darwin chat`

Chat with Darwin. Can be used to instruct Darwin to do things in natural language.

```
USAGE
  $ darwin chat [--log-level TRACE|DEBUG|INFO|WARN|ERROR|FATAL] [-p <value>] [-l] [-s]
    [--legacy-processing]

FLAGS
  -l, --logs                 Include application logs along with the chat conversations.
  -p, --concurrency=<value>  [default: 10] The number papers to process in parallel.
  -s, --skip-captcha         Skip captcha on paper URLs. Note: Google Scholar captcha still needs to be solved.
      --legacy-processing    Enable legacy processing of papers that only extracts text from the main URL. The new
                             method attempts to extract text from the source URLs (pdf or html) and falls back to the
                             main URL.

GLOBAL FLAGS
  --log-level=<option>  [default: INFO] Specify level for logging.
                        <options: TRACE|DEBUG|INFO|WARN|ERROR|FATAL>

EXAMPLES
  $ darwin chat
```

_See code: [src/commands/chat/index.ts](https://github.com/rpidanny/darwin/blob/v1.24.1/src/commands/chat/index.ts)_
