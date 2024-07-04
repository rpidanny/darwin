![alt text](darwin.png 'Darwin')

# Darwin

`Darwin` is an elegant and powerful command-line interface (CLI) utility designed to streamline your research efforts. While it shines brightest in the field of [biotechnology](https://en.wikipedia.org/wiki/Biotechnology), its versatile tools can support research across various domains, albeit with some limitations.

[![Version](https://img.shields.io/npm/v/@rpidanny/darwin.svg)](https://npmjs.org/package/@rpidanny/darwin)
[![Downloads/week](https://img.shields.io/npm/dw/@rpidanny/darwin.svg)](https://npmjs.org/package/@rpidanny/darwin)

<!-- toc -->
* [Darwin](#darwin)
* [Usage](#usage)
* [Command Topics](#command-topics)
* [FAQ](#faq)
* [Issues and Feature Requests](#issues-and-feature-requests)
* [Contribution](#contribution)
* [License](#license)
<!-- tocstop -->

# Usage

## Prerequisites

- [Node.js v20+](https://nodejs.org/en/download/prebuilt-installer)
- [Ollama](https://ollama.com/) _(optional for paper summarization)_
- [OpenAI API Keys](https://platform.openai.com/settings/profile?tab=api-keys) _(optional for chat interface)_

<!-- usage -->
```sh-session
$ npm install -g @rpidanny/darwin
$ darwin COMMAND
running command...
$ darwin (--version)
@rpidanny/darwin/1.31.1 linux-x64 node-v20.15.0
$ darwin --help [COMMAND]
USAGE
  $ darwin COMMAND
...
```
<!-- usagestop -->

> After installing, configure Darwin with `darwin config set`.

<!-- commands -->
# Command Topics

* [`darwin chat`](docs/chat.md) - Chat with Darwin using natural language.
* [`darwin config`](docs/config.md) - Manage application configurations.
* [`darwin download`](docs/download.md) - Download papers, datasets, or other content.
* [`darwin search`](docs/search.md) - Search for papers, accession numbers, or other content.
* [`darwin update`](docs/update.md) - Update Darwin to the latest version.

<!-- commandsstop -->

# FAQ

[Frequently Asked Questions](docs/faq.md)

# Issues and Feature Requests

If you encounter any issues or have a feature request, please [open an issue](https://github.com/rpidanny/darwin/issues) in the repository. We'd love to hear from you and improve Darwin together!

# Contribution

We welcome contributions to `Darwin`! To contribute, fork the repository, create a new branch for your feature, make your changes, and submit a pull request. For more details, see our [CONTRIBUTING](CONTRIBUTING.md) guidelines.

# License

`Darwin` is released under the MIT License. See the [LICENSE](LICENSE) file for more details.
