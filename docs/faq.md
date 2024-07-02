# Frequently Asked Questions

## How to Update Darwin

Updating Darwin is straightforward. Just execute the following command:

```bash
npm i -g @rpidanny/darwin@latest
```

This command will globally install the latest version of Darwin from the npm registry, ensuring you have the most up-to-date features and improvements available.

## How to Configure Darwin for Paper Summarization

Darwin uses a large language model (LLM) to summarize papers. You have two options: using OpenAI's API or setting up a local LLM that works with OpenAI's API.

### Using OpenAI's API

The simplest way to start is through OpenAI, although it can be costly. To configure Darwin with OpenAI:

- Run `darwin config set` and select `OpenAI` as the model provider.

### Using a Local LLM

For a more economical approach, you can set up a local LLM like [Ollama](https://ollama.com/). Follow these steps:

- Visit [Ollama's website](https://ollama.com/) to download and install the software.
- Once installed, choose a model from their library.
- Configure Darwin with the local LLM:
  - Run `darwin config set` and choose `Local` as the model provider while configuring the paper processor.
  - Enter the model name (chosen from Ollama's library) and the server's endpoint URL (typically `http://localhost:11434/v1`).

This setup allows you to effectively summarize papers using Darwin with either OpenAI's cloud-based service or a local LLM, depending on your preference and budget.
