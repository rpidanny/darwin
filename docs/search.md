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
    <value>] [-s] [-p]

ARGUMENTS
  KEYWORDS  The keywords to search for

FLAGS
  -a, --accession-number-regex=<value>  [default: PRJNA\d+] Regex to match accession numbers. Defaults to BioProject
                                        accession numbers.
  -c, --count=<value>                   [default: 10] The minimum number of papers with accession numbers to search for
  -h, --headless                        Run in headless mode
  -o, --output=<value>                  (required) Output CSV file name/path
  -p, --process-pdf                     [Experimental] Process the PDFs to extract text. This will take longer to export
                                        the papers.
  -s, --skip-captcha                    Weather to skip captcha on paper URLs or wait for the user to solve the captcha.
                                        Google Scholar captcha still needs to be solved.

GLOBAL FLAGS
  --log-level=<option>  [default: INFO] Specify level for logging.
                        <options: TRACE|DEBUG|INFO|WARN|ERROR|FATAL>

EXAMPLES
  $ darwin search accession --help

  $ darwin search accession "mocrobiome, nRNA" -o output.csv  --log-level DEBUG
```

_See code: [src/commands/search/accession.ts](https://github.com/rpidanny/darwin/blob/v1.18.0/src/commands/search/accession.ts)_

## `darwin search papers KEYWORDS`

Search research papers given a set of keywords. Exports the list of papers to a CSV file.

```
USAGE
  $ darwin search papers KEYWORDS -o <value> [--log-level TRACE|DEBUG|INFO|WARN|ERROR|FATAL] [-c <value>] [-h] [-f
    <value>] [-s] [-p]

ARGUMENTS
  KEYWORDS  The keywords to search for

FLAGS
  -c, --count=<value>       [default: 10] Minimum number of results to return
  -f, --find-regex=<value>  Regex to find in the paper content. If found, the paper will be included in the CSV file.
                            Its case-insensitive. Example: "Holdemania|Colidextribacter" will find papers that contain
                            either Holdemania or Colidextribacter.
  -h, --headless            Run in headless mode
  -o, --output=<value>      (required) Output CSV file name/path
  -p, --process-pdf         [Experimental] Process the PDFs to extract text. This will take longer to export the papers.
  -s, --skip-captcha        Weather to skip captcha on paper URLs or wait for the user to solve the captcha. Google
                            Scholar captcha still needs to be solved.

GLOBAL FLAGS
  --log-level=<option>  [default: INFO] Specify level for logging.
                        <options: TRACE|DEBUG|INFO|WARN|ERROR|FATAL>

EXAMPLES
  $ darwin search papers --help

  $ darwin search papers "crispr cas9" -o crispr_cas9.csv  --log-level DEBUG
```

_See code: [src/commands/search/papers.ts](https://github.com/rpidanny/darwin/blob/v1.18.0/src/commands/search/papers.ts)_
