`darwin chat`
=============

Chat with Darwin. Can be used to instruct Darwin to do things in natural language.

* [`darwin chat`](#darwin-chat)

## `darwin chat`

Chat with Darwin. Can be used to instruct Darwin to do things in natural language.

```
USAGE
  $ darwin chat [--log-level TRACE|DEBUG|INFO|WARN|ERROR|FATAL] [-l]

FLAGS
  -l, --includeAppLogs  Include application logs in the chat while performing actions

GLOBAL FLAGS
  --log-level=<option>  [default: INFO] Specify level for logging.
                        <options: TRACE|DEBUG|INFO|WARN|ERROR|FATAL>

EXAMPLES
  $ darwin chat
```

_See code: [src/commands/chat/index.ts](https://github.com/rpidanny/darwin/blob/v1.12.4/src/commands/chat/index.ts)_
