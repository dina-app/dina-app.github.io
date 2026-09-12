# DinaLab public site

This repository publishes [dina.jp](https://dina.jp/) through GitHub Pages.

Public product pages:

- [Admin Toolkit for Salesforce](apps/salesforce-admin-toolkit/index.html), an independent Chrome extension compatible with Salesforce.
- [Sheet for Salesforce](apps/dinasheet-for-salesforce/index.html), a spreadsheet workspace for
  Salesforce data currently prepared as a release candidate, with an
  [English](apps/dinasheet-for-salesforce/manual/index.html) and
  [Japanese](apps/dinasheet-for-salesforce/manual/jp/index.html) screenshot manual. It was called
  DinaSheet until 0.3.2; the folder paths and the Chrome Web Store URL keep the old slug, as they
  do in `dina-app`, so only the displayed name changed.
- [SheetConnect for Salesforce](apps/sheetconnect-for-salesforce/index.html), a Google Sheets side
  panel that imports Salesforce data into a worksheet and sends confirmed record changes back,
  with its [privacy policy](apps/sheetconnect-for-salesforce/PRIVACY_POLICY.html) published here
  because the Chrome Web Store listing needs that URL on a public host.
- [Agent for Salesforce](apps/salesforce-agentic-bot/index.html), an independent assistant in development for Salesforce workflows.
- [Common Tools](tools/index.html), a browser-only developer and administrator workbench.

Four earlier-stage apps are listed on the homepage under "In the workshop"
with a logo, one line, and an honest status: DevOps for Salesforce, Dock for
Salesforce, Prompter for Salesforce, and Voice for Salesforce. They have
no product page yet, so their folders under `apps/` hold only logo assets.
Legacy asset folders for apps no longer listed on the homepage remain untouched.

Most `apps/*/logo.svg` files, with their `logo-light.svg` / `logo-dark.svg`
pairs, are output from [`scripts/build-logos.mjs`](scripts/build-logos.mjs),
which draws each mark from the frame and D geometry in `assets/dinalab-logo.svg`
and varies only the neon hue and the glyph in the frame gap. Change one of those
by editing that script's `MARKS` list and rerunning it, not by editing the SVGs:

```sh
node scripts/build-logos.mjs
```

Two sets of marks are deliberately outside that generator, so rerunning it leaves
them alone:

- The products that have moved to the **three-tone fan** identity carry their
  shipping mark instead, copied from `dina-app`: Admin Toolkit from
  `Admin Toolkit for Salesforce/logo.svg`, SheetConnect from
  `SheetConnect for Salesforce Store Assets/source/brand-mark-master.svg`. The
  same artwork renders each one's packaged extension icon and Chrome Web Store
  icon, so the site, the extension and the listing match. Each is a
  self-contained tile that works on either background, so it has no light/dark
  pair and the homepage card points a single `<img>` at it. Re-copy from the
  master when it changes. The rest of the family still ships the neon D and is
  still generated, which is why the homepage currently shows both.
- The iOS marks come from each project's `Assets.xcassets/AppIcon.appiconset`,
  downscaled to 128px and corner-rounded by `scripts/build-ios-app-marks.py`
  because the store icons ship as hard squares.

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
