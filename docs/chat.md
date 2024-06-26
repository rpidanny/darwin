`darwin chat`
=============

Chat with Darwin. Can be used to instruct Darwin to do things in natural language.

* [`darwin chat`](#darwin-chat)

## `darwin chat`

Chat with Darwin. Can be used to instruct Darwin to do things in natural language.

```
USAGE
  $ darwin chat [--log-level TRACE|DEBUG|INFO|WARN|ERROR|FATAL] [-l] [-s] [-p]

FLAGS
  -l, --includeAppLogs  Include application logs in the chat while performing actions
  -p, --process-pdf     [Experimental] Process the PDFs to extract text. This will take longer to export the papers.
  -s, --skip-captcha    Weather to skip captcha on paper URLs or wait for the user to solve the captcha. Google Scholar
                        captcha still needs to be solved.

GLOBAL FLAGS
  --log-level=<option>  [default: INFO] Specify level for logging.
                        <options: TRACE|DEBUG|INFO|WARN|ERROR|FATAL>

EXAMPLES
  $ darwin chat
```

_See code: [src/commands/chat/index.ts](https://github.com/rpidanny/darwin/blob/v1.18.1/src/commands/chat/index.ts)_
