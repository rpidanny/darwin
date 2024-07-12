`darwin search`
===============

Search for papers, accession numbers, or other content.

* [`darwin search accession KEYWORDS`](#darwin-search-accession-keywords)
* [`darwin search papers KEYWORDS`](#darwin-search-papers-keywords)

## `darwin search accession KEYWORDS`

Search and export papers containing accession numbers to a CSV file.

```
USAGE
  $ darwin search accession KEYWORDS [-l TRACE|DEBUG|INFO|WARN|ERROR|FATAL] [-c NUMBER] [-p NUMBER] [-o PATH] [-a
    REGEX] [-s] [--legacy] [-h] [-S] [--summary-method refine|map_reduce] [--llm openai|ollama] [-q STRING] [--year-low
    YEAR] [--year-high YEAR]

ARGUMENTS
  KEYWORDS  The keywords to search for. (Example: "crispr cas9")

FLAGS
  -S, --summary                           Include summaries in the output CSV (requires LLM, sets concurrency to 1)
  -a, --accession-number-regex=REGEX      [default: PRJNA\d+] Regex to match accession numbers. Defaults to matching
                                          BioProject accession numbers.
  -c, --count=NUMBER                      [default: 10] Minimum number of papers to search for. Actual number may be
                                          slightly higher with concurrency.
  -h, --headless                          Run the browser in headless mode (no UI).
  -o, --output=PATH                       [default: .] Destination for the CSV file. Specify folder path for
                                          auto-generated filename or file path for direct use.
  -p, --concurrency=NUMBER                [default: 10] The number papers to process in parallel.
  -q, --question=STRING                   The question to ask the language model about the text content. (requires LLM,
                                          sets concurrency to 1)
  -s, --skip-captcha                      Skip captcha on paper URLs. Note: Google Scholar captcha still needs to be
                                          solved.
      --legacy                            Enable legacy processing which extracts text only from the main URL. The new
                                          method attempts to extract text from the source URLs (pdf or html) and falls
                                          back to the main URL.
      --llm=openai|ollama                 [default: ollama] The LLM provider to use for generating summaries.
      --summary-method=refine|map_reduce  [default: map_reduce] Selects the method used to generate summaries.
      --year-high=YEAR                    Highest year to include in the search.
      --year-low=YEAR                     Lowest year to include in the search.

GLOBAL FLAGS
  -l, --log-level=TRACE|DEBUG|INFO|WARN|ERROR|FATAL  [default: INFO] Specify logging level.

EXAMPLES
  $ darwin search accession --help

  $ darwin search accession "mocrobiome, nRNA" --output ./ --count 10 --log-level DEBUG

FLAG DESCRIPTIONS
  -S, --summary  Include summaries in the output CSV (requires LLM, sets concurrency to 1)

    Summaries are generated using LLM. Ensure LLMs are configured by running `darwin config set`.

  -q, --question=STRING

    The question to ask the language model about the text content. (requires LLM, sets concurrency to 1)

    Questions are answered using LLM. Ensure LLMs are configured by running `darwin config set`.

  --summary-method=refine|map_reduce  Selects the method used to generate summaries.

    Refer to the FAQ for details on each method.
```

_See code: [src/commands/search/accession.ts](https://github.com/rpidanny/darwin/blob/v1.35.0/src/commands/search/accession.ts)_

## `darwin search papers KEYWORDS`

Searches and exports research papers based on keywords to a CSV file.

```
USAGE
  $ darwin search papers KEYWORDS [-l TRACE|DEBUG|INFO|WARN|ERROR|FATAL] [-c NUMBER] [-p NUMBER] [-o PATH] [-f
    REGEX] [-s] [--legacy] [-h] [-S] [--summary-method refine|map_reduce] [--llm openai|ollama] [-q STRING] [--year-low
    YEAR] [--year-high YEAR]

ARGUMENTS
  KEYWORDS  The keywords to search for. (Example: "crispr cas9")

FLAGS
  -S, --summary                           Include summaries in the output CSV (requires LLM, sets concurrency to 1)
  -c, --count=NUMBER                      [default: 10] Minimum number of papers to search for. Actual number may be
                                          slightly higher with concurrency.
  -f, --filter=REGEX                      Case-insensitive regex to filter papers by content. (Example:
                                          "Colidextribacter|Caproiciproducens")
  -h, --headless                          Run the browser in headless mode (no UI).
  -o, --output=PATH                       [default: .] Destination for the CSV file. Specify folder path for
                                          auto-generated filename or file path for direct use.
  -p, --concurrency=NUMBER                [default: 10] The number papers to process in parallel.
  -q, --question=STRING                   The question to ask the language model about the text content. (requires LLM,
                                          sets concurrency to 1)
  -s, --skip-captcha                      Skip captcha on paper URLs. Note: Google Scholar captcha still needs to be
                                          solved.
      --legacy                            Enable legacy processing which extracts text only from the main URL. The new
                                          method attempts to extract text from the source URLs (pdf or html) and falls
                                          back to the main URL.
      --llm=openai|ollama                 [default: ollama] The LLM provider to use for generating summaries.
      --summary-method=refine|map_reduce  [default: map_reduce] Selects the method used to generate summaries.
      --year-high=YEAR                    Highest year to include in the search.
      --year-low=YEAR                     Lowest year to include in the search.

GLOBAL FLAGS
  -l, --log-level=TRACE|DEBUG|INFO|WARN|ERROR|FATAL  [default: INFO] Specify logging level.

EXAMPLES
  $ darwin search papers --help

  $ darwin search papers "crispr cas9" --output crispr_cas9.csv --count 20

  $ darwin search papers "crispr cas9" --output crispr_cas9.csv --filter "tcell" --log-level DEBUG

FLAG DESCRIPTIONS
  -S, --summary  Include summaries in the output CSV (requires LLM, sets concurrency to 1)

    Summaries are generated using LLM. Ensure LLMs are configured by running `darwin config set`.

  -q, --question=STRING

    The question to ask the language model about the text content. (requires LLM, sets concurrency to 1)

    Questions are answered using LLM. Ensure LLMs are configured by running `darwin config set`.

  --summary-method=refine|map_reduce  Selects the method used to generate summaries.

    Refer to the FAQ for details on each method.
```

_See code: [src/commands/search/papers.ts](https://github.com/rpidanny/darwin/blob/v1.35.0/src/commands/search/papers.ts)_
