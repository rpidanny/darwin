# darwin

A cli tool to download gene sequence datasets

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/darwin.svg)](https://npmjs.org/package/darwin)
[![Downloads/week](https://img.shields.io/npm/dw/darwin.svg)](https://npmjs.org/package/darwin)

<!-- toc -->
* [darwin](#darwin)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->
```sh-session
$ npm install -g @rpidanny/darwin
$ darwin COMMAND
running command...
$ darwin (--version)
@rpidanny/darwin/0.0.0 darwin-arm64 node-v18.18.2
$ darwin --help [COMMAND]
USAGE
  $ darwin COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`darwin help [COMMAND]`](#darwin-help-command)
* [`darwin search accession KEYWORDS`](#darwin-search-accession-keywords)

## `darwin help [COMMAND]`

Display help for darwin.

```
USAGE
  $ darwin help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for darwin.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.1.0/src/commands/help.ts)_

## `darwin search accession KEYWORDS`

Get the accession number of a research paper that matches the keywords provided.

```
USAGE
  $ darwin search accession KEYWORDS -o <value> [--log-level TRACE|DEBUG|INFO|WARN|ERROR|FATAL] [-m <value>] [-h]

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
  $ darwin search accession --help

  $ darwin search accession "mocrobiome, nRNA" -o output.csv  --log-level debug
```

_See code: [src/commands/search/accession.ts](https://github.com/rpidanny/darwin/blob/v0.0.0/src/commands/search/accession.ts)_
<!-- commandsstop -->
