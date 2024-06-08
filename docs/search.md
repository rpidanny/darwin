`darwin search`
===============

Get the accession number of a research paper that matches the keywords provided.

* [`darwin search accession KEYWORDS`](#darwin-search-accession-keywords)
* [`darwin search papers [FILE]`](#darwin-search-papers-file)

## `darwin search accession KEYWORDS`

Get the accession number of a research paper that matches the keywords provided.

```
USAGE
  $ darwin search accession KEYWORDS -o <value> [--log-level TRACE|DEBUG|INFO|WARN|ERROR|FATAL] [-m <value>]

ARGUMENTS
  KEYWORDS  The keywords to search for

FLAGS
  -m, --maxResults=<value>  [default: 10] Maximum number of results to return
  -o, --output=<value>      (required) Output CSV file name/path

GLOBAL FLAGS
  --log-level=<option>  [default: INFO] Specify level for logging.
                        <options: TRACE|DEBUG|INFO|WARN|ERROR|FATAL>

EXAMPLES
  $ darwin search accession --help

  $ darwin search accession "mocrobiome, nRNA" -o output.csv  --log-level debug
```

_See code: [src/commands/search/accession.ts](https://github.com/rpidanny/darwin/blob/v0.0.0/src/commands/search/accession.ts)_

## `darwin search papers [FILE]`

describe the command here

```
USAGE
  $ darwin search papers [FILE] [-f] [-n <value>]

ARGUMENTS
  FILE  file to read

FLAGS
  -f, --force
  -n, --name=<value>  name to print

DESCRIPTION
  describe the command here

EXAMPLES
  $ darwin search papers
```

_See code: [src/commands/search/papers.ts](https://github.com/rpidanny/darwin/blob/v0.0.0/src/commands/search/papers.ts)_
