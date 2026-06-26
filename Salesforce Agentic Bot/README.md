# Salesforce Agentic Bot

Salesforce Agentic Bot is an in-development Chrome extension for Salesforce admins and developers. It adds a Chrome side panel assistant that can use active Salesforce org context and route chat requests through a Google Cloud Function backend.

This extension is not affiliated with, endorsed by, or sponsored by Salesforce.

## What You Can Do

- Open a Chrome side panel on Salesforce pages.
- Detect the active Salesforce tab title and URL.
- Read org and user summary information from the signed-in Salesforce org.
- Chat with an assistant backed by a Google Cloud Function.
- Send selected Salesforce context with chat requests.
- Keep the OpenAI API key out of the browser by storing it in the Google Cloud Function environment.

## Architecture

Salesforce Agentic Bot separates the browser extension from the OpenAI transport layer.

Request path:

1. The extension reads the active Salesforce org session in the browser.
2. The side panel ChatBot sends chat history, selected Salesforce context, current tab context, and the Salesforce session to the configured Google Cloud Function endpoint.
3. The Google Cloud Function calls OpenAI with its function-level `OPENAI_API_KEY`.
4. The Google Cloud Function returns the assistant's response to the extension.

## Configuration

Set the Google Cloud Function URL in `Salesforce Agentic Bot/api.js`:

```js
export const GCF_ENDPOINT_URL = "https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/agenticBot";
```

Then load the extension locally:

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Choose `Load unpacked`.
4. Select the `Salesforce Agentic Bot` folder.
5. Open a Salesforce tab and launch the extension.

## Google Cloud Function

Deploy the Cloud Function broker from:

```text
gcf/agentic-bot/index.js
```

Required environment variable:

- `OPENAI_API_KEY`

Optional runtime settings:

- `OPENAI_MODEL`, defaults to `gpt-5-mini`
- `OPENAI_MAX_OUTPUT_TOKENS`, defaults to `1600`

## Privacy

The extension stores UI settings, chat history, previous response IDs, and retrieved Salesforce metadata locally in the browser. It sends Salesforce session data, selected Salesforce context, current tab context, and chat messages only to the configured Google Cloud Function endpoint.

The extension does not store an OpenAI API key in the browser and does not call OpenAI directly from the extension.

Read the full policy: [Privacy Policy](../salesforce-agentic-bot/PRIVACY_POLICY.html)

## Status

Salesforce Agentic Bot is currently a draft extension.
