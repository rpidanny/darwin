`darwin download`
=================

Download pdf papers based on the given keywords.

* [`darwin download papers KEYWORDS`](#darwin-download-papers-keywords)

## `darwin download papers KEYWORDS`

Download pdf papers based on the given keywords.

```
USAGE
  $ darwin download papers KEYWORDS -o <value> [--log-level TRACE|DEBUG|INFO|WARN|ERROR|FATAL] [-c <value>] [-h]

ARGUMENTS
  KEYWORDS  The keywords to search for

FLAGS
  -c, --count=<value>   [default: 10] Minimum number of papers to download
  -h, --headless        Run in headless mode
  -o, --output=<value>  (required) Output path to store the downloaded papers

GLOBAL FLAGS
  --log-level=<option>  [default: INFO] Specify level for logging.
                        <options: TRACE|DEBUG|INFO|WARN|ERROR|FATAL>

EXAMPLES
  $ darwin download papers --help

  $ darwin download papers "crispr cas9" -o papers/ -c 100 --log-level debug
```

_See code: [src/commands/download/papers.ts](https://github.com/rpidanny/darwin/blob/v1.17.0/src/commands/download/papers.ts)_
