#!/usr/bin/env node
// Draws every app mark from one master: the DinaLab neon D.
//
// The master is vector geometry: an open bracket frame with a gap at the top
// right and an outlined D. The brand mark is transparent; app marks reuse the
// same skeleton on a dark tile and vary exactly two things: the neon hue, and
// the glyph that sits in the frame's gap. Products in the same family share a
// hue.
//
// Regenerate every mark with:  node scripts/build-logos.mjs
//
// Edit this file rather than the SVGs — the SVGs are output.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// ---------------------------------------------------------------------------
// Master geometry.
// ---------------------------------------------------------------------------

// The homepage SVG is the source of truth. App marks reuse its exact frame and
// bowl paths at 4x scale, so changing the master shape updates every product
// without manually copying path data into this generator.
const masterFile = join(root, 'assets/dinalab-logo.svg');
const masterSource = await readFile(masterFile, 'utf8');

function masterPath(id) {
  const match = masterSource.match(new RegExp('<path\\s+id="' + id + '"\\s+d="([^"]+)"'));
  if (!match) throw new Error('Missing #' + id + ' path in assets/dinalab-logo.svg');
  return match[1];
}

const FRAME = masterPath('frame');
const LETTER = masterPath('bowl');

// Four-point star with the control points collapsed onto the centre, which is
// what gives the concave waist.
const star = (cx, cy, r) =>
  `M${cx} ${cy - r}Q${cx} ${cy} ${cx + r} ${cy}Q${cx} ${cy} ${cx} ${cy + r}` +
  `Q${cx} ${cy} ${cx - r} ${cy}Q${cx} ${cy} ${cx} ${cy - r}Z`;

// Neon is three passes over the same path: a blurred copy for the bloom, the
// gradient body, and a near-white core that keeps the shape readable at 36px.
const PASSES = [
  { width: 12, stroke: 'url(#neon)', opacity: '.55', filter: ' filter="url(#bloom)"' },
  { width: 7, stroke: 'url(#neon)', opacity: '1', filter: '' },
  { width: 2.4, stroke: 'var(--core)', opacity: '.95', filter: '' },
];

// Without a dark tile, a broad bloom makes the frame and D merge. The brand
// keeps a restrained edge glow so its negative space stays open at 36px.
const TRANSPARENT_PASSES = [
  { width: 11, stroke: 'url(#neon)', opacity: '.28', filter: ' filter="url(#markBloom)"' },
  { width: 8.5, stroke: 'url(#neon)', opacity: '1', filter: '' },
  { width: 2, stroke: 'var(--core)', opacity: '.88', filter: '' },
];

// ---------------------------------------------------------------------------
// Palettes. `neon` is the gradient (light → saturated → light), `core` the hot
// centre line. Shared hue means shared product family.
// ---------------------------------------------------------------------------

const PALETTES = {
  brand: { neon: ['#7fdcff', '#0a63ff', '#5ec8ff'], core: '#eaf7ff' },
  gold: { neon: ['#ffe9a8', '#f5a524', '#ffd166'], core: '#fff6e0' },
  emerald: { neon: ['#a8ffd8', '#12c974', '#5ef2a4'], core: '#e6fff4' },
  violet: { neon: ['#d8c7ff', '#7c3aed', '#a78bfa'], core: '#f3ecff' },
  teal: { neon: ['#a5fff0', '#0ea5c4', '#5eead4'], core: '#e6fffb' },
  sky: { neon: ['#bfe9ff', '#0a84e0', '#7dd3fc'], core: '#eaf7ff' },
  magenta: { neon: ['#ffc9f5', '#c026d3', '#f0abfc'], core: '#fdeaff' },
  coral: { neon: ['#ffd2c2', '#f43f5e', '#fb9c8a'], core: '#ffece6' },
};

// ---------------------------------------------------------------------------
// Glyphs. Each one lives in the frame's gap, centred near (190, 64). `scale`
// thins or thickens a stroke relative to the frame; `dot` paths are drawn as
// round caps, so they bloom like a lit point.
// ---------------------------------------------------------------------------

const dot = (x, y) => `M${x - 0.5} ${y}h1`;

const GLYPHS = {
  // The large spark bridges the frame gap while the smaller spark continues
  // its diagonal without making the mark feel right-heavy.
  sparkles: { fills: [star(184, 58, 20), star(209, 85, 9)] },

  hex: { strokes: [{ d: 'M190 38l22 13v26l-22 13-22-13V51Z', scale: 0.85 }] },

  grid: {
    strokes: [
      { d: 'M174 40h32a8 8 0 0 1 8 8v32a8 8 0 0 1-8 8h-32a8 8 0 0 1-8-8V48a8 8 0 0 1 8-8Z', scale: 0.85 },
      { d: 'M190 40v48M166 64h48', scale: 0.7 },
    ],
  },

  doc: {
    strokes: [
      { d: 'M172 38h22l16 16v28a8 8 0 0 1-8 8h-30a8 8 0 0 1-8-8V46a8 8 0 0 1 8-8Z', scale: 0.85 },
      { d: 'M176 66h26M176 78h18', scale: 0.7 },
    ],
  },

  node: {
    strokes: [
      { d: 'M170 52h40M170 52l20 32M210 52l-20 32', scale: 0.7 },
      { d: `${dot(170, 52)}${dot(210, 52)}${dot(190, 84)}`, scale: 1.5 },
    ],
  },

  loop: {
    strokes: [
      { d: 'M165 64a13 13 0 1 0 26 0 13 13 0 1 0-26 0Z', scale: 0.8 },
      { d: 'M189 64a13 13 0 1 0 26 0 13 13 0 1 0-26 0Z', scale: 0.8 },
    ],
  },

  dock: {
    strokes: [
      { d: 'M168 78h44', scale: 1 },
      { d: `${dot(174, 56)}${dot(190, 56)}${dot(206, 56)}`, scale: 1.5 },
    ],
  },

  prompt: {
    strokes: [
      { d: 'm174 50 14 14-14 14', scale: 0.85 },
      { d: 'M196 78h16', scale: 0.85 },
    ],
  },

  wave: { strokes: [{ d: 'M170 57v14M180 51v26M190 46v36M200 51v26M210 57v14', scale: 0.8 }] },

  bot: {
    strokes: [
      { d: 'M180 48h20a10 10 0 0 1 10 10v16a10 10 0 0 1-10 10h-20a10 10 0 0 1-10-10V58a10 10 0 0 1 10-10Z', scale: 0.85 },
      { d: 'M190 48v-9', scale: 0.7 },
      { d: `${dot(190, 36)}${dot(181, 66)}${dot(199, 66)}`, scale: 1.4 },
    ],
  },

  phone: {
    strokes: [
      { d: 'M174 36h32a8 8 0 0 1 8 8v42a8 8 0 0 1-8 8h-32a8 8 0 0 1-8-8V44a8 8 0 0 1 8-8Z', scale: 0.85 },
      { d: 'M180 46h20M184 82h12', scale: 0.7 },
    ],
  },
};

// ---------------------------------------------------------------------------
// The marks. Order matches the homepage: product cards, then business roadmap.
// ---------------------------------------------------------------------------

const MARKS = [
  {
    file: 'apps/salesforce-admin-toolkit/logo.svg',
    title: 'Admin Toolkit for Salesforce',
    desc: 'The DinaLab neon D in gold, with a hexagon in the frame gap.',
    palette: 'gold',
    glyph: 'hex',
  },
  {
    file: 'apps/dinasheet-for-salesforce/logo.svg',
    title: 'DinaSheet for Salesforce',
    desc: 'The DinaLab neon D in emerald, with a spreadsheet grid in the frame gap.',
    palette: 'emerald',
    glyph: 'grid',
  },
  {
    file: 'apps/salesforce-agentic-bot/logo.svg',
    title: 'Dina Agent for Salesforce',
    desc: 'The DinaLab neon D in violet, with a linked node cluster in the frame gap.',
    palette: 'violet',
    glyph: 'node',
  },
  {
    file: 'apps/dinadevops-for-salesforce/logo.svg',
    title: 'DinaDevOps for Salesforce',
    desc: 'The DinaLab neon D in teal, with two linked rings in the frame gap.',
    palette: 'teal',
    glyph: 'loop',
  },
  {
    file: 'apps/dina-dock-for-salesforce/logo.svg',
    title: 'Dina Dock for Salesforce',
    desc: 'The DinaLab neon D in sky blue, with a dock of three lights in the frame gap.',
    palette: 'sky',
    glyph: 'dock',
  },
  {
    file: 'apps/salesforce-prompter/logo.svg',
    title: 'Salesforce Prompter',
    desc: 'The DinaLab neon D in magenta, with a prompt chevron and caret in the frame gap.',
    palette: 'magenta',
    glyph: 'prompt',
  },
  {
    file: 'apps/force-connect-voice/logo.svg',
    title: 'Force Connect Voice',
    desc: 'The DinaLab neon D in coral, with a voice waveform in the frame gap.',
    palette: 'coral',
    glyph: 'wave',
  },
  // Shares Dina Agent's violet: it is the same assistant on iOS.
  {
    file: 'apps/dina-bot-for-salesforce/logo.svg',
    title: 'Dina Bot for Salesforce',
    desc: 'The DinaLab neon D in violet, with a bot head in the frame gap.',
    palette: 'violet',
    glyph: 'bot',
  },
  // Shares Dina Agent's violet: it is the same assistant on iOS.
  {
    file: 'apps/dina-agent-ios/logo.svg',
    title: 'Dina Agent for iOS',
    desc: 'The DinaLab neon D in violet, with a phone in the frame gap.',
    palette: 'violet',
    glyph: 'phone',
  },
  // Shares DinaSheet's emerald: same product, different host.
  {
    file: 'apps/dinasheet-for-google-sheets/logo.svg',
    title: 'DinaSheet for Google Sheets',
    desc: 'The DinaLab neon D in emerald, with a sheet document in the frame gap.',
    palette: 'emerald',
    glyph: 'doc',
  },
];

// ---------------------------------------------------------------------------

const round = (n) => Number(n.toFixed(2));

function render({ title, desc, palette, glyph, transparent = false }) {
  const { neon, core } = PALETTES[palette];
  const { strokes = [], fills = [] } = GLYPHS[glyph];
  const shapes = [
    { d: FRAME, scale: 1, master: true },
    { d: LETTER, scale: 1, master: true },
    ...strokes,
  ];
  const passes = transparent ? TRANSPARENT_PASSES : PASSES;
  const sparkleBloom = transparent ? 'url(#markBloom)' : 'url(#bloom)';
  const viewBox = transparent ? '18 18 220 220' : '0 0 256 256';

  const layers = passes.map(({ width, stroke, opacity, filter }) => {
    const paths = shapes
      .map(({ d, scale, master }) => {
        const masterAttrs = master ? ' transform="scale(4)" vector-effect="non-scaling-stroke"' : '';
        return `      <path d="${d}" stroke-width="${round(width * scale)}"${masterAttrs}/>`;
      })
      .join('\n');
    return (
      `    <g stroke="${stroke.replace('var(--core)', core)}" opacity="${opacity}"${filter}>\n` +
      `${paths}\n` +
      `    </g>`
    );
  }).join('\n');

  const sparks = fills.length
    ? '\n' +
      `  <g fill="${neon[2]}">\n` +
      fills.map((d) => `    <path d="${d}" fill="${neon[1]}" opacity=".45" filter="${sparkleBloom}"/>`).join('\n') +
      '\n' +
      fills.map((d) => `    <path d="${d}" fill="${core}"/>`).join('\n') +
      '\n  </g>'
    : '';

  const tile = transparent
    ? ''
    : `
  <rect width="256" height="256" rx="56" fill="#02040f"/>
  <rect width="256" height="256" rx="56" fill="url(#glow)"/>
`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="${viewBox}" role="img" aria-labelledby="t d">
  <!-- Generated from assets/dinalab-logo.svg by scripts/build-logos.mjs. -->
  <title id="t">${title}</title>
  <desc id="d">${desc}</desc>
  <defs>
    <linearGradient id="neon" x1="40" y1="216" x2="216" y2="40" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${neon[0]}"/>
      <stop offset="0.5" stop-color="${neon[1]}"/>
      <stop offset="1" stop-color="${neon[2]}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.46" cy="0.44" r="0.62">
      <stop offset="0" stop-color="${neon[1]}" stop-opacity="0.34"/>
      <stop offset="1" stop-color="${neon[1]}" stop-opacity="0"/>
    </radialGradient>
    <filter id="bloom" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="7"/>
    </filter>
    <filter id="markBloom" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2.5"/>
    </filter>
  </defs>

${tile}

  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
${layers}
  </g>${sparks}
</svg>
`;
}

for (const mark of MARKS) {
  const out = join(root, mark.file);
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, render(mark));
  console.log(`wrote ${mark.file}`);
}
