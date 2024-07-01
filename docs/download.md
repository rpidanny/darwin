`darwin download`
=================

Download papers, datasets, or other content.

* [`darwin download papers KEYWORDS`](#darwin-download-papers-keywords)

## `darwin download papers KEYWORDS`

Download PDF papers based on specified keywords.

```
USAGE
  $ darwin download papers KEYWORDS -o <value> [--log-level TRACE|DEBUG|INFO|WARN|ERROR|FATAL] [-c <value>] [-h]

ARGUMENTS
  KEYWORDS  The keywords to search for

FLAGS
  -c, --count=<value>   [default: 10] The minimum number of papers to search for. (When running concurrently, the actual
                        number of papers may be a bit higher)
  -h, --headless        Run the browser in headless mode (no UI).
  -o, --output=<value>  (required) The path to save the downloaded papers.

GLOBAL FLAGS
  --log-level=<option>  [default: INFO] Specify level for logging.
                        <options: TRACE|DEBUG|INFO|WARN|ERROR|FATAL>

EXAMPLES
  $ darwin download papers --help

  $ darwin download papers "crispr cas9" -o papers/ -c 100 --log-level debug
```

_See code: [src/commands/download/papers.ts](https://github.com/rpidanny/darwin/blob/v1.24.0/src/commands/download/papers.ts)_
