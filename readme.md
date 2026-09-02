# DinaLab public site

This repository publishes [dina.jp](https://dina.jp/) through GitHub Pages.

Public product pages:

- [Admin Toolkit for Salesforce](apps/salesforce-admin-toolkit/index.html), an independent Chrome extension compatible with Salesforce.
- [DinaSheet for Salesforce](apps/dinasheet-for-salesforce/index.html), a spreadsheet workspace for Salesforce data currently prepared as a release candidate, with an [English](apps/dinasheet-for-salesforce/manual/index.html) and [Japanese](apps/dinasheet-for-salesforce/manual/jp/index.html) screenshot manual.
- [Agent for Salesforce](apps/salesforce-agentic-bot/index.html), an independent assistant in development for Salesforce workflows.
- [Common Tools](tools/index.html), a browser-only developer and administrator workbench.

Four earlier-stage apps are listed on the homepage under "In the workshop"
with a logo, one line, and an honest status: DevOps for Salesforce, Dina Dock
for Salesforce, Prompter for Salesforce, and Voice for Salesforce. They have
no product page yet, so their folders under `apps/` hold only logo assets.
Legacy asset folders for apps no longer listed on the homepage remain untouched.

Logos are copied from the app sources in the sibling `dina-app` repository —
`<App>/icon.svg` for the newer extensions, `<App>/logo.svg` for Admin Toolkit and
Dina Agent, and `DinaSheet for Salesforce Store Assets/brand-mark.svg` for
DinaSheet. The iOS marks come from each project's
`Assets.xcassets/AppIcon.appiconset`, downscaled to 128px and corner-rounded by
`scripts/build-ios-app-marks.py` because the store icons ship as hard squares.
Re-copy from there when a mark changes rather than editing in place.

## Design system

Every page renders from one stylesheet, [`assets/dinalab.css`](assets/dinalab.css).
Pages pick a composition with a body class — `home` for the marketing bands,
`doc-page` for product and policy pages, and `doc-page manual-page` for the
manuals. [`assets/site-theme.js`](assets/site-theme.js) stamps
`data-theme="light|dark"` on `<html>` before first paint and is loaded
synchronously from `<head>` on every page, so there is no flash of the wrong
theme.

The homepage composition — bands, the centred hero, the stat strip, the numbered
intent rows, and the guide, chip, rule, idea, and closing blocks — lives under
`.home` in the same stylesheet. There is no separate homepage CSS file and no
demo or style-guide page; `index.html` is the only place these classes are used,
so it doubles as the reference for them.

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
