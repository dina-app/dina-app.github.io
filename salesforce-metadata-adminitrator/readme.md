---
title: Salesforce Metadata Adminitrator
description: Independent Chrome side-panel workspace for Salesforce metadata administration.
---

# Salesforce Metadata Adminitrator

Salesforce Metadata Adminitrator is an independent Chrome extension for Salesforce administrators and developers. It opens as a Chrome side panel and uses the Salesforce session you are already signed in with, so you can browse, search, inspect, edit, deploy, export, and monitor Salesforce metadata without sending your org data to an external service.

This extension is not affiliated with, endorsed by, or sponsored by Salesforce.

## What You Can Do

- Search Salesforce metadata by label, name, API name, object API, developer name, and matching snippets.
- Browse source-style metadata folders and files from a side-panel workspace.
- Edit local metadata files, track changed files, and build package.xml selections.
- Open supported metadata results directly in Salesforce Setup.
- Run Salesforce REST API requests with the active Salesforce session.
- Execute anonymous Apex and inspect debug output.
- Export data with SOQL, SOSL, GraphQL, and report results.
- Browse Salesforce document folders and files.
- View setup audit trail, org limits, login history, event log files, org summary, and user summary.
- Use the built-in manual for end-user guidance.

## Metadata Search

The popup search helps Salesforce admins and developers find metadata even when they do not remember the exact API name. It can search across labels, names, API names, developer names, object names, and code/content snippets where supported.

Results are grouped by metadata type and can include direct Salesforce Setup open links for supported types such as custom objects, custom fields, validation rules, web links, Apex classes, Apex triggers, Visualforce pages, Lightning bundles, reports, dashboards, permission sets, profiles, static resources, and other metadata records.

## Files Workspace

The Files workspace provides a source-style view of loaded Salesforce metadata. You can select folders, search the loaded tree, inspect file details, edit supported local metadata files, track pending changes, and manage package.xml selections before deployment.

Workspace data is saved locally in Chrome browser storage so the app stays responsive. Use Reload when you need to refresh the latest org data.

## Admin And Developer Tools

Salesforce Metadata Adminitrator includes focused tools for daily Salesforce admin and developer work:

- REST API explorer for user-initiated Salesforce REST calls.
- Run Apex tool for anonymous Apex execution.
- Data export tool for SOQL, SOSL, GraphQL, and report output.
- Document folders browser.
- Monitoring views for setup audit trail, limits, login history, event logs, org summary, and user summary.

## Privacy

The extension uses Salesforce session cookies only to connect to the Salesforce org where the user is already signed in.

Salesforce metadata, org data, and user-entered requests are sent only to the selected Salesforce org through the active Salesforce session. The extension does not transfer Salesforce data to developer-operated servers or third-party services.

The extension does not sell user data, does not use data for advertising, does not include analytics or telemetry, and does not load remotely hosted code.

Workspace preferences, search data, selected folders, UI settings, and pending local edits may be stored locally in Chrome browser storage on the user's device.

Read the full policy: [Privacy Policy](PRIVACY_POLICY.md)

## Permissions

Salesforce Metadata Adminitrator requests only the permissions needed for its Salesforce workspace features:

- `cookies`: reads Salesforce session cookies for Salesforce domains so the extension can use the active Salesforce session.
- `sidePanel`: opens the extension as a Chrome side panel.
- `storage`: saves local workspace preferences, search data, UI settings, and pending edits.
- Salesforce host permissions: allow requests to Salesforce org, Salesforce Setup, Experience Cloud, Visualforce, and Salesforce Sites domains used by the active org.

## Install

Install from the Chrome Web Store when the listing is available.

For local development:

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Choose Load unpacked.
4. Select the `Salesforce Metadata Adminitrator` folder.
5. Open a Salesforce tab and launch the extension.

## Current Release

Version `0.4.2` keeps Files find scoped to the loaded workspace tree, expands popup metadata search with grouped results and Show more paging, and fixes CustomField open links to use Salesforce field IDs for Object Manager detail pages.

## Support

For support, use the support contact on the Chrome Web Store listing or open an issue in the project repository.
