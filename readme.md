# DinaLab public site

This repository publishes [dina.jp](https://dina.jp/) through GitHub Pages.

Public product pages:

- [Admin Toolkit for Salesforce](apps/salesforce-admin-toolkit/index.html), an independent Chrome extension compatible with Salesforce.
- [DinaSheet for Salesforce](apps/dinasheet-for-salesforce/index.html), a spreadsheet workspace for Salesforce data currently prepared as a release candidate, with an [English](apps/dinasheet-for-salesforce/manual/index.html) and [Japanese](apps/dinasheet-for-salesforce/manual/jp/index.html) screenshot manual.
- [Dina Agent for Salesforce](apps/salesforce-agentic-bot/index.html), an independent assistant in development for Salesforce workflows.
- [Common Tools](tools/index.html), a browser-only developer and administrator workbench.

## Design system

Every page renders from one stylesheet, [`assets/dinalab.css`](assets/dinalab.css).
Pages pick a composition with a body class — `home` for the marketing bands,
`doc-page` for product and policy pages, and `doc-page manual-page` for the
manuals. [`assets/site-theme.js`](assets/site-theme.js) stamps
`data-theme="light|dark"` on `<html>` before first paint and is loaded
synchronously from `<head>` on every page, so there is no flash of the wrong
theme. [`demo.html`](demo.html) is an internal, `noindex` reference showing the
tokens, type scale, and components; it is not linked from the public site.

The Admin Toolkit manual is generated from
[`manual/_build/scenes.mjs`](apps/salesforce-admin-toolkit/manual/_build/scenes.mjs)
and [`manual/_build/generate.mjs`](apps/salesforce-admin-toolkit/manual/_build/generate.mjs).
Regenerate both languages with:

```sh
node apps/salesforce-admin-toolkit/manual/_build/generate.mjs
```

Before publishing, complete [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md).

Salesforce is a trademark of Salesforce, Inc. DinaLab products are independent
and are not affiliated with, endorsed by, or sponsored by Salesforce.
