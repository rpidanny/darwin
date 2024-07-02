# Frequently Asked Questions

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## How do I update Darwin?

Updating Darwin is straightforward. Execute the following command:

```bash
npm i -g @rpidanny/darwin@latest
```

This command will globally install the latest version of Darwin from the npm registry, ensuring you have the most up-to-date features and improvements available.

## How do I configure Darwin for paper summarization?

Darwin uses a large language model (LLM) to summarize papers. You have two options: using OpenAI's API or setting up a local LLM.

### Using OpenAI's API

To configure Darwin with OpenAI:

1. Run the command:

   ```bash
   darwin config set
   ```

2. Select `OpenAI` as the model provider.

Note: This method is the simplest but can be costly.

### Using a Local LLM

For a more economical approach, you can set up a local LLM like [Ollama](https://ollama.com/). Follow these steps:

1. Download and install [Ollama](https://ollama.com/).
2. Download a model you want to use.

   - For example, to use the model `llama3:instruct`, run:

     ```sh
     ollama pull llama3:instruct
     ```

     List of available models can be found [here](https://ollama.com/library).

3. Configure Darwin to use local LLM for paper processing:

   - Run the command:

     ```bash
     darwin config set
     ```

   - Choose `Local` as the model provider while configuring the paper processor.
   - Enter the model name _(the model from Step 2)_ and the Ollama server's endpoint URL (typically `http://localhost:11434/v1`).

This setup allows you to summarize papers using either OpenAI's cloud-based service or a local LLM, depending on your preference and budget.
