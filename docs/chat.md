`darwin chat`
=============

Chat with Darwin. Can be used to instruct Darwin to do things in natural language.

* [`darwin chat`](#darwin-chat)

## `darwin chat`

Chat with Darwin. Can be used to instruct Darwin to do things in natural language.

```
USAGE
  $ darwin chat [--log-level TRACE|DEBUG|INFO|WARN|ERROR|FATAL] [-p <value>] [-l] [-s] [-P]

FLAGS
  -P, --process-pdf          [Experimental] Attempt to process PDFs for keywords within papers. This feature is
                             experimental and may be unreliable.
  -l, --logs                 Include application logs along with the chat conversations.
  -p, --concurrency=<value>  [default: 10] The number papers to process in parallel.
  -s, --skip-captcha         Skip captcha on paper URLs. Note: Google Scholar captcha still needs to be solved.

GLOBAL FLAGS
  --log-level=<option>  [default: INFO] Specify level for logging.
                        <options: TRACE|DEBUG|INFO|WARN|ERROR|FATAL>

EXAMPLES
  $ darwin chat
```

_See code: [src/commands/chat/index.ts](https://github.com/rpidanny/darwin/blob/v1.19.0/src/commands/chat/index.ts)_
