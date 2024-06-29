`darwin search`
===============

Search for papers, accession numbers, or other content.

* [`darwin search accession KEYWORDS`](#darwin-search-accession-keywords)
* [`darwin search papers KEYWORDS`](#darwin-search-papers-keywords)

## `darwin search accession KEYWORDS`

Search and export papers containing accession numbers to a CSV file.

```
USAGE
  $ darwin search accession KEYWORDS [--log-level TRACE|DEBUG|INFO|WARN|ERROR|FATAL] [-c <value>] [-p <value>] [-o
    <value>] [-a <value>] [-s] [-P] [-h]

ARGUMENTS
  KEYWORDS  The keywords to search for

FLAGS
  -P, --process-pdf                     [Experimental] Attempt to process PDFs for keywords within papers. This feature
                                        is experimental and may be unreliable.
  -a, --accession-number-regex=<value>  [default: PRJNA\d+] Regex to match accession numbers. Defaults to matching
                                        BioProject accession numbers.
  -c, --count=<value>                   [default: 10] The minimum number of papers to search for. (When running
                                        concurrently, the actual number of papers may be a bit higher)
  -h, --headless                        Run the browser in headless mode (no UI).
  -o, --output=<value>                  [default: .] Specify the output destination for the CSV file. If a folder path
                                        is given, the filename is auto-generated; if a file path is given, it is used
                                        directly.
  -p, --concurrency=<value>             [default: 10] The number papers to process in parallel.
  -s, --skip-captcha                    Skip captcha on paper URLs. Note: Google Scholar captcha still needs to be
                                        solved.

GLOBAL FLAGS
  --log-level=<option>  [default: INFO] Specify level for logging.
                        <options: TRACE|DEBUG|INFO|WARN|ERROR|FATAL>

EXAMPLES
  $ darwin search accession --help

  $ darwin search accession "mocrobiome, nRNA" -o output.csv  -n 5 -c 1 --log-level DEBUG
```

_See code: [src/commands/search/accession.ts](https://github.com/rpidanny/darwin/blob/v1.20.2/src/commands/search/accession.ts)_

## `darwin search papers KEYWORDS`

Searches and exports research papers based on keywords to a CSV file.

```
USAGE
  $ darwin search papers KEYWORDS [--log-level TRACE|DEBUG|INFO|WARN|ERROR|FATAL] [-c <value>] [-p <value>] [-o
    <value>] [-f <value>] [-s] [-P] [-h]

ARGUMENTS
  KEYWORDS  The keywords to search for

FLAGS
  -P, --process-pdf          [Experimental] Attempt to process PDFs for keywords within papers. This feature is
                             experimental and may be unreliable.
  -c, --count=<value>        [default: 10] The minimum number of papers to search for. (When running concurrently, the
                             actual number of papers may be a bit higher)
  -f, --filter=<value>       Case-insensitive regex to filter papers by content. Example: "Holdemania|Colidextribacter"
                             will only include papers containing either term.
  -h, --headless             Run the browser in headless mode (no UI).
  -o, --output=<value>       [default: .] Specify the output destination for the CSV file. If a folder path is given,
                             the filename is auto-generated; if a file path is given, it is used directly.
  -p, --concurrency=<value>  [default: 10] The number papers to process in parallel.
  -s, --skip-captcha         Skip captcha on paper URLs. Note: Google Scholar captcha still needs to be solved.

GLOBAL FLAGS
  --log-level=<option>  [default: INFO] Specify level for logging.
                        <options: TRACE|DEBUG|INFO|WARN|ERROR|FATAL>

EXAMPLES
  $ darwin search papers --help

  $ darwin search papers "crispr cas9" -o crispr_cas9.csv -c 20 --log-level DEBUG

  $ darwin search papers "crispr cas9" -o crispr_cas9.csv -c 5 -p 1 -f "tcell" --log-level DEBUG
```

_See code: [src/commands/search/papers.ts](https://github.com/rpidanny/darwin/blob/v1.20.2/src/commands/search/papers.ts)_
