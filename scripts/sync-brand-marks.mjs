#!/usr/bin/env node
// Copies the approved product marks from the sibling `dina-app` repository.
//
// `Dina Brand PM/logo-final/` is the master: the three-tone fan set generated
// from `manifest.json`. Each mark there is a self-contained rounded tile — a
// three-tone fan behind a white solid D and the product's glyph — so unlike the
// neon-D marks from `scripts/build-logos.mjs` it needs no light/dark pair and
// works on either background.
//
// The two are not interchangeable. A product listed here is served by this
// script and MUST NOT also appear in `build-logos.mjs`, or whichever ran last
// would win. Products with no master entry stay on the generated neon D.
//
//   node scripts/sync-brand-marks.mjs            # copy, report what changed
//   node scripts/sync-brand-marks.mjs --check    # verify only, non-zero on drift
//
// Re-run after `dina-app` regenerates the brand set, then commit the result.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// Worktrees can point at the product checkout with DINA_APP_ROOT.
const sourceRoot = process.env.DINA_APP_ROOT
  ? resolve(process.env.DINA_APP_ROOT)
  : resolve(root, '../dina-app');
const master = join(sourceRoot, 'Dina Brand PM/logo-final/colour/svg');
const houseMaster = join(sourceRoot, 'Dina Brand PM/logo-master/svg');

// The house mark. `logo-master/manifest.json` records eight rounds of decisions
// and names the winner in its `resolved` block: `dina-master`, "Solar" — the same
// squircle and three-band fan as a product mark, in a bright gold no product uses,
// with no glyph. Its own reasoning: brightness is the one axis the eight products
// leave free, so a light tile is what marks the parent.
//
// The white D on that gold sits at 1.59 contrast, below the family's 3.99 floor.
// The manifest calls that deliberate and names the cost — "the D goes soft at
// 16px, still legible" — and supplies `dina-master-ink` for exactly the case where
// 16px crispness matters more than matching the eight. A favicon is that case, so
// the tab icon uses the ink letterform and every other placement uses the white.
const HOUSE = { id: 'dina-master', file: 'assets/dinalab-mark.svg' };
const FAVICON = { id: 'dina-master-ink', file: 'favicon.svg' };

// `id` is the entry in the brand manifest; `dir` is this site's folder, which
// keeps its original slug even where the product has since been renamed.
const MARKS = [
  { id: 'admin-toolkit', dir: 'apps/salesforce-admin-toolkit', title: 'Admin Toolkit for Salesforce', hue: 'indigo', glyph: 'a hexagon' },
  { id: 'google-sheet', dir: 'apps/sheetconnect-for-salesforce', title: 'SheetConnect for Salesforce', hue: 'emerald', glyph: 'a spreadsheet grid' },
  { id: 'dina-agent', dir: 'apps/salesforce-agentic-bot', title: 'Agent for Salesforce', hue: 'violet', glyph: 'a linked node cluster' },
  { id: 'dina-dock', dir: 'apps/dina-dock-for-salesforce', title: 'Dock for Salesforce', hue: 'sky blue', glyph: 'a dock of three lights' },
  { id: 'dinadevops', dir: 'apps/dinadevops-for-salesforce', title: 'DevOps for Salesforce', hue: 'slate teal', glyph: 'two linked rings' },
  { id: 'force-voice', dir: 'apps/force-connect-voice', title: 'Voice for Salesforce', hue: 'coral', glyph: 'a voice waveform' },
  { id: 'prompter', dir: 'apps/salesforce-prompter', title: 'Prompter for Salesforce', hue: 'magenta', glyph: 'a prompt chevron and caret' },
];

// Sheet for Salesforce has its own canonical dimensional mark in Store Assets.
// It is distinct from SheetConnect's emerald fan; copy the transparent PNG intact.
const SHEET = {
  source: 'DinaSheet for Salesforce Store Assets/brand-mark-master.png',
  file: 'apps/dinasheet-for-salesforce/logo.png',
};

const check = process.argv.includes('--check');
const drift = [];

function wrap({ artwork, id, title, desc, source, clip }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" role="img" aria-labelledby="t d">
  <!-- Copied by scripts/sync-brand-marks.mjs from \`${source}\`
       in the sibling dina-app repository. Do not edit here, and do not add this
       mark back to scripts/build-logos.mjs. -->
  <title id="t">${title}</title>
  <desc id="d">${desc}</desc>
  <defs>
    <clipPath id="tile">${clip ?? '<rect x="4" y="4" width="120" height="120" rx="28"/>'}</clipPath>
  </defs>
  ${artwork}
</svg>
`;
}

function artworkOf(svg) {
  // Take the drawing verbatim; only the wrapper and the clip id are ours.
  return svg
    .replace(/^[\s\S]*?<\/defs>\s*/, '')
    .replace(/<\/svg>\s*$/, '')
    .replace(/url\(#[cm]\)/g, 'url(#tile)')
    .trim();
}

function emit(target, out) {
  const path = join(root, target);
  const current = existsSync(path) ? readFileSync(path) : null;
  const bytes = Buffer.isBuffer(out) ? out : Buffer.from(out);
  if (current?.equals(bytes)) return;
  drift.push(target);
  if (!check) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, out);
  }
}

const sheetSource = join(sourceRoot, SHEET.source);
if (!existsSync(sheetSource)) {
  console.error(`missing Sheet master mark: ${sheetSource}`);
  process.exitCode = 1;
} else {
  emit(SHEET.file, readFileSync(sheetSource));
}

for (const { id, dir, title, hue, glyph } of MARKS) {
  const source = join(master, `${id}.svg`);
  if (!existsSync(source)) {
    console.error(`missing master mark: ${source}`);
    process.exitCode = 1;
    continue;
  }
  emit(`${dir}/logo.svg`, wrap({
    artwork: artworkOf(readFileSync(source, 'utf8')),
    id,
    title,
    desc: `A rounded ${hue} tile with a three-tone fan, carrying a white D and ${glyph}.`,
    source: `Dina Brand PM/logo-final/colour/svg/${id}.svg`,
  }));
}

const houseVariants = [
  {
    ...HOUSE,
    title: 'DinaLab',
    desc: 'A rounded gold tile with a three-band fan, carrying a white D with an empty counter.',
    bleed: false,
  },
  {
    ...FAVICON,
    title: 'DinaLab',
    desc: 'A rounded gold tile with a three-band fan, carrying a dark D with an empty counter.',
    bleed: true,
  },
];

for (const { id, file, title, desc, bleed } of houseVariants) {
  const source = join(houseMaster, `${id}.svg`);
  if (!existsSync(source)) {
    console.error(`missing house mark: ${source}`);
    process.exitCode = 1;
    continue;
  }
  let artwork = artworkOf(readFileSync(source, 'utf8'));
  let clip = '<rect x="4" y="4" width="120" height="120" rx="28"/>';
  if (bleed) {
    // A favicon is already clipped to a tiny square, so the 4px margin the 128px
    // mark carries for card use only costs legibility. Push the tile and its clip
    // out to the full canvas; the fan paths and the D are untouched.
    artwork = artwork.replace('<rect x="4" y="4" width="120" height="120"', '<rect x="0" y="0" width="128" height="128"');
    clip = '<rect x="0" y="0" width="128" height="128" rx="28"/>';
  }
  emit(file, wrap({
    artwork,
    id,
    title,
    desc,
    clip,
    source: `Dina Brand PM/logo-master/svg/${id}.svg`,
  }));
}

if (check) {
  if (process.exitCode) {
    console.error('Brand mark check incomplete: one or more masters are missing.');
  } else if (drift.length) {
    console.error(`Brand marks are out of date:\n${drift.map((f) => `- ${f}`).join('\n')}`);
    console.error('Run: node scripts/sync-brand-marks.mjs');
    process.exitCode = 1;
  } else {
    console.log(`Brand marks match dina-app: ${MARKS.length + houseVariants.length + 1} checked.`);
  }
} else if (drift.length) {
  drift.forEach((f) => console.log(`wrote ${f}`));
} else {
  console.log(`Brand marks already match dina-app: ${MARKS.length + houseVariants.length + 1} checked.`);
}
