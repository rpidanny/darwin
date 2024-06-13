`darwin search`
===============

Search content (papers / accession numbers / etc)

* [`darwin search accession KEYWORDS`](#darwin-search-accession-keywords)
* [`darwin search papers KEYWORDS`](#darwin-search-papers-keywords)

## `darwin search accession KEYWORDS`

Search for papers that contain accession numbers.

```
USAGE
  $ darwin search accession KEYWORDS -o <value> [--log-level TRACE|DEBUG|INFO|WARN|ERROR|FATAL] [-m <value>] [-h] [-r
    <value>]

ARGUMENTS
  KEYWORDS  The keywords to search for

FLAGS
  -h, --headless                      Run in headless mode
  -m, --maxResults=<value>            [default: 10] The maximum number of papers with accession numbers to search for
  -o, --output=<value>                (required) Output CSV file name/path
  -r, --accessionNumberRegex=<value>  [default: PRJNA\d+] Regex to match accession numbers

GLOBAL FLAGS
  --log-level=<option>  [default: INFO] Specify level for logging.
                        <options: TRACE|DEBUG|INFO|WARN|ERROR|FATAL>

EXAMPLES
  $ darwin search accession --help

  $ darwin search accession "mocrobiome, nRNA" -o output.csv  --log-level debug
```

_See code: [src/commands/search/accession.ts](https://github.com/rpidanny/darwin/blob/v1.7.0/src/commands/search/accession.ts)_

## `darwin search papers KEYWORDS`

Search research papers given a list of keywords.

```
USAGE
  $ darwin search papers KEYWORDS -o <value> [--log-level TRACE|DEBUG|INFO|WARN|ERROR|FATAL] [-m <value>] [-h]

ARGUMENTS
  KEYWORDS  The keywords to search for

FLAGS
  -h, --headless            Run in headless mode
  -m, --maxResults=<value>  [default: 10] Maximum number of results to return
  -o, --output=<value>      (required) Output CSV file name/path

GLOBAL FLAGS
  --log-level=<option>  [default: INFO] Specify level for logging.
                        <options: TRACE|DEBUG|INFO|WARN|ERROR|FATAL>

EXAMPLES
  $ darwin search papers --help

  $ darwin search papers "crispr cas9" -o crispr_cas9.csv  --log-level debug
```

_See code: [src/commands/search/papers.ts](https://github.com/rpidanny/darwin/blob/v1.7.0/src/commands/search/papers.ts)_
