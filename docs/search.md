`darwin search`
===============

Search content (papers / accession numbers / etc)

* [`darwin search accession KEYWORDS`](#darwin-search-accession-keywords)
* [`darwin search papers KEYWORDS`](#darwin-search-papers-keywords)

## `darwin search accession KEYWORDS`

Search for papers that contain accession numbers.

```
USAGE
  $ darwin search accession KEYWORDS -o <value> [--log-level TRACE|DEBUG|INFO|WARN|ERROR|FATAL] [-c <value>] [-h] [-a
    <value>] [-s]

ARGUMENTS
  KEYWORDS  The keywords to search for

FLAGS
  -a, --accession-number-regex=<value>  [default: PRJNA\d+] Regex to match accession numbers. Defaults to BioProject
                                        accession numbers.
  -c, --count=<value>                   [default: 10] The minimum number of papers with accession numbers to search for
  -h, --headless                        Run in headless mode
  -o, --output=<value>                  (required) Output CSV file name/path
  -s, --skip-captcha                    Weather to skip captcha or wait for the user to solve the captcha

GLOBAL FLAGS
  --log-level=<option>  [default: INFO] Specify level for logging.
                        <options: TRACE|DEBUG|INFO|WARN|ERROR|FATAL>

EXAMPLES
  $ darwin search accession --help

  $ darwin search accession "mocrobiome, nRNA" -o output.csv  --log-level debug
```

_See code: [src/commands/search/accession.ts](https://github.com/rpidanny/darwin/blob/v1.12.4/src/commands/search/accession.ts)_

## `darwin search papers KEYWORDS`

Search research papers given a list of keywords.

```
USAGE
  $ darwin search papers KEYWORDS -o <value> [--log-level TRACE|DEBUG|INFO|WARN|ERROR|FATAL] [-c <value>] [-h]

ARGUMENTS
  KEYWORDS  The keywords to search for

FLAGS
  -c, --count=<value>   [default: 10] Minimum number of results to return
  -h, --headless        Run in headless mode
  -o, --output=<value>  (required) Output CSV file name/path

GLOBAL FLAGS
  --log-level=<option>  [default: INFO] Specify level for logging.
                        <options: TRACE|DEBUG|INFO|WARN|ERROR|FATAL>

EXAMPLES
  $ darwin search papers --help

  $ darwin search papers "crispr cas9" -o crispr_cas9.csv  --log-level debug
```

_See code: [src/commands/search/papers.ts](https://github.com/rpidanny/darwin/blob/v1.12.4/src/commands/search/papers.ts)_
