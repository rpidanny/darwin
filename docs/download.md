`darwin download`
=================

Download papers, datasets, or other content.

* [`darwin download papers KEYWORDS`](#darwin-download-papers-keywords)

## `darwin download papers KEYWORDS`

Download PDF papers based on specified keywords.

```
USAGE
  $ darwin download papers KEYWORDS -o <value> [-l TRACE|DEBUG|INFO|WARN|ERROR|FATAL] [-c NUMBER] [-h]

ARGUMENTS
  KEYWORDS  The keywords to search for. (Example: "crispr cas9")

FLAGS
  -c, --count=NUMBER    [default: 10] Minimum number of papers to search for. Actual number may be slightly higher with
                        concurrency.
  -h, --headless        Run the browser in headless mode (no UI).
  -o, --output=<value>  (required) The path to save the downloaded papers.

GLOBAL FLAGS
  -l, --log-level=TRACE|DEBUG|INFO|WARN|ERROR|FATAL  [default: INFO] Specify logging level.

EXAMPLES
  $ darwin download papers --help

  $ darwin download papers "crispr cas9" --output papers/ --count 100 --log-level debug
```

_See code: [src/commands/download/papers.ts](https://github.com/rpidanny/darwin/blob/v1.35.0/src/commands/download/papers.ts)_
