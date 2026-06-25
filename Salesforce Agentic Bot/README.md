# Salesforce Agentic Bot

Salesforce Agentic Bot is a draft Chrome extension for Salesforce admins and developers. It provides a Salesforce side-panel assistant that can use the active Salesforce org context and send chat requests through a Google Cloud Function backend.

This extension is not affiliated with, endorsed by, or sponsored by Salesforce.

## What You Can Do

- Open a right-side Chrome side panel on Salesforce pages.
- Detect the active Salesforce tab title and URL context.
- Read org and user summary information for the signed-in Salesforce org.
- Chat with a Google Cloud Function-backed assistant.
- Attach selected Salesforce context to chat requests.
- Keep the OpenAI API key hidden on the server-side Google Cloud Function.

## Architecture

Salesforce Agentic Bot separates the browser extension from the OpenAI transport.

Request path:

1. The extension reads the active Salesforce org session from the browser.
2. The side-panel ChatBot sends chat history, selected Salesforce context, current tab context, and the Salesforce session to the configured Google Cloud Function endpoint.
3. The Google Cloud Function calls OpenAI with the function-level `OPENAI_API_KEY`.
4. The Google Cloud Function returns the assistant response to the extension.

## Configuration

Set the Google Cloud Function URL in `Salesforce Agentic Bot/api.js`:

```js
export const GCF_ENDPOINT_URL = "https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/agenticBot";
```

Then load the extension locally:

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Choose Load unpacked.
4. Select the `Salesforce Agentic Bot` folder.
5. Open a Salesforce page and launch the extension.

## Google Cloud Function

Deploy the Cloud Function broker from:

```text
gcf/agentic-bot/index.js
```

Required environment variable:

- `OPENAI_API_KEY`

Optional runtime settings:

- `OPENAI_MODEL`, default `gpt-5-mini`
- `OPENAI_MAX_OUTPUT_TOKENS`, default `1600`

## Privacy

The extension stores UI settings, chat history, previous response IDs, and retrieved Salesforce metadata locally in the browser. It sends Salesforce session data, selected Salesforce context, current tab context, and chat messages only to the configured Google Cloud Function endpoint.

The extension does not store an OpenAI API key in the browser and does not call OpenAI directly from the extension.

Read the full policy: [Privacy Policy](../privacy-policy-salesforce-agentic-bot.html)

## Current Page

The current public app page is [salesforce-agentic-bot.md](../salesforce-agentic-bot.md).
