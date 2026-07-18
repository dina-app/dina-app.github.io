# DinaLab public site

This repository publishes [dina.jp](https://dina.jp/) through GitHub Pages.

Public product pages:

- [DinaLab Admin Toolkit](apps/salesforce-admin-toolkit/index.html), an independent Chrome extension compatible with Salesforce.
- [DinaLab Agent Assistant](apps/salesforce-agentic-bot/index.html), an independent assistant in development for Salesforce workflows.
- [Common Tools](tools/index.html), a browser-only developer and administrator workbench.

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
