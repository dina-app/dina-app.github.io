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

The DinaLab house mark is [`assets/dinalab-mark.svg`](assets/dinalab-mark.svg):
**Solar**, the `resolved` entry in `Dina Brand PM/logo-master/manifest.json` in
`dina-app`, picked there over eight recorded rounds. It is the same squircle and
three-band fan as a product mark, in a bright gold no product uses, and it carries
no glyph — the empty counter is the parent signal. The reasoning is in the
manifest: brightness is the one axis the eight products leave free, so the only
light tile in the row is what reads as their parent.

Its white D sits at 1.59 contrast on that gold, below the family's own 3.99 floor.
The manifest calls that deliberate and names the cost — the D goes soft at 16px —
and ships `dina-master-ink`, a dark-D variant, for where 16px crispness matters
more than matching the eight. `favicon.svg` is that case, so the tab icon uses the
ink letterform, drawn full-bleed, and every other placement uses the white one.
`scripts/sync-brand-marks.mjs` writes both, so edit neither by hand.

Product marks come from two places, and a product belongs to exactly one of them.

Most of them are the approved **three-tone fan** set, copied from
`Dina Brand PM/logo-final/` in `dina-app` by
[`scripts/sync-brand-marks.mjs`](scripts/sync-brand-marks.mjs). Each is a
self-contained rounded tile that works on either background, so it has no
light/dark pair and the markup points a single `<img>` at it. The same artwork
renders each product's packaged extension icon and its Chrome Web Store icon, so
site, extension and listing match. Re-run after `dina-app` regenerates the set:

```sh
node scripts/sync-brand-marks.mjs          # copy
node scripts/sync-brand-marks.mjs --check  # verify only, fails on drift
```

The rest are the older **neon D** marks, drawn from the frame and D geometry in
`assets/dinalab-logo.svg` by [`scripts/build-logos.mjs`](scripts/build-logos.mjs),
which varies only the neon hue and the glyph in the frame gap. These do carry a
`logo-light.svg` / `logo-dark.svg` pair. Change one by editing that script's
`MARKS` list and rerunning it, not by editing the SVGs:

```sh
node scripts/build-logos.mjs
```

The two never overlap: a product in `sync-brand-marks.mjs` must not also appear
in `build-logos.mjs`, or whichever ran last would win. Sheet for Salesforce is
the notable neon-D holdout — the brand manifest has no entry for it, because its
emerald grid slot was reassigned to SheetConnect when that product was named.

The iOS marks are separate again: they come from each project's
`Assets.xcassets/AppIcon.appiconset`, downscaled to 128px and corner-rounded by
`scripts/build-ios-app-marks.py` because the store icons ship as hard squares.

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
