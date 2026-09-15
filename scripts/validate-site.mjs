import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const errors = [];
const warnings = [];

function filesUnder(dir, result = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", ".firebase", ".firebase-public"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) filesUnder(full, result);
    else result.push(full);
  }
  return result;
}

function resolveLocalReference(file, reference) {
  const clean = reference.split("#")[0].split("?")[0];
  if (!clean || /^(?:[a-z]+:|#|mailto:|tel:|data:)/i.test(reference)) return null;
  const decoded = decodeURIComponent(clean);
  const candidate = decoded.startsWith("/")
    ? path.join(root, decoded.slice(1))
    : path.resolve(path.dirname(file), decoded);
  if (decoded.endsWith("/")) return path.join(candidate, "index.html");
  if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) return path.join(candidate, "index.html");
  return candidate;
}

const allFiles = filesUnder(root);
const htmlFiles = allFiles.filter((file) => file.endsWith(".html"));

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const relative = path.relative(root, file);
  for (const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)) {
    const target = resolveLocalReference(file, match[1]);
    if (target && !fs.existsSync(target)) errors.push(`${relative}: missing ${match[1]}`);
  }
}

const primaryPages = [
  "index.html",
  "apps/salesforce-admin-toolkit/index.html",
  "apps/salesforce-admin-toolkit/PRIVACY_POLICY.html",
  "apps/salesforce-admin-toolkit/manual/index.html",
  "apps/salesforce-admin-toolkit/manual/jp/index.html",
  "apps/dinasheet-for-salesforce/index.html",
  "apps/dinasheet-for-salesforce/jp/index.html",
  "apps/dinasheet-for-salesforce/PRIVACY_POLICY.html",
  "apps/dinasheet-for-salesforce/manual/index.html",
  "apps/dinasheet-for-salesforce/manual/jp/index.html",
  "apps/sheetconnect-for-salesforce/index.html",
  "apps/sheetconnect-for-salesforce/PRIVACY_POLICY.html",
  "apps/salesforce-agentic-bot/index.html",
  "apps/salesforce-agentic-bot/PRIVACY_POLICY.html",
  "apps/salesforce-agentic-bot/TOKUSHOHO.html",
  "blog/index.html",
  "blog/salesforce-org-review-before-release/index.html",
  "blog/safer-salesforce-bulk-data-updates/index.html",
  "blog/ai-salesforce-without-sharing-credentials/index.html",
];

for (const relative of primaryPages) {
  const html = fs.readFileSync(path.join(root, relative), "utf8");
  if (!/<title>[^<]+<\/title>/.test(html)) errors.push(`${relative}: missing title`);
  if (!/<meta\s+[^>]*name=["']description["'][^>]*content=["'][^"']+["'][^>]*>/i.test(html)) errors.push(`${relative}: missing meta description`);
  if (!/<link rel="canonical" href="https:\/\/dina\.jp\//.test(html)) errors.push(`${relative}: missing dina.jp canonical URL`);
}

// SheetConnect also touches Google user data, so its disclosure names the Google
// API Services policy between the Chrome Web Store one and the Limited Use
// clause. Its wording is the source of record in `dina-app` and must not drift.
for (const [relative, disclosure] of [
  ["apps/salesforce-admin-toolkit/PRIVACY_POLICY.html", "Chrome Web Store User Data Policy, including the Limited Use requirements"],
  ["apps/dinasheet-for-salesforce/PRIVACY_POLICY.html", "Chrome Web Store User Data Policy, including the Limited Use requirements"],
  ["apps/salesforce-agentic-bot/PRIVACY_POLICY.html", "Chrome Web Store User Data Policy, including the Limited Use requirements"],
  ["apps/sheetconnect-for-salesforce/PRIVACY_POLICY.html", "Google API Services User Data Policy</a>, including the Limited Use requirements"],
]) {
  const html = fs.readFileSync(path.join(root, relative), "utf8");
  if (!html.includes(disclosure)) {
    errors.push(`${relative}: missing Limited Use disclosure`);
  }
}

const agentProductPath = "apps/salesforce-agentic-bot/index.html";
const agentProduct = fs.readFileSync(path.join(root, agentProductPath), "utf8");
for (const [label, fragment] of [
  ["independent Chrome side-panel product description", "independent Chrome side-panel assistant"],
  ["administrator audience", "Salesforce administrators"],
  ["developer audience", "developers"],
  ["consultant audience", "consultants"],
  ["free-to-use statement", "free to use"],
  ["no-paid-plans disclosure", "no paid plans"],
  ["no-payment-details disclosure", "No payment details are collected"],
  ["open-source intent stated as a direction", "not a commitment"],
  ["privacy policy link", "href=\"PRIVACY_POLICY.html\""],
  ["commercial disclosure link", "href=\"TOKUSHOHO.html\""],
  ["Salesforce certification disclaimer", "certified by Salesforce"],
]) {
  if (!agentProduct.includes(fragment)) errors.push(`${agentProductPath}: missing ${label}`);
}

for (const section of ["overview", "features", "free", "support", "legal"]) {
  if (!agentProduct.includes(`href=\"#${section}\"`)) errors.push(`${agentProductPath}: missing ${section} navigation link`);
  if (!agentProduct.includes(`id=\"${section}\"`)) errors.push(`${agentProductPath}: missing ${section} section`);
}

// Nothing on this site is sold. These guard the claim rather than the old paid
// model: a price, a plan, a checkout or a leftover owner placeholder appearing
// again means a page and reality have diverged.
const agentLegalPath = "apps/salesforce-agentic-bot/TOKUSHOHO.html";
const commercialFree = [agentProductPath, agentLegalPath, "index.html"];
for (const relative of commercialFree) {
  const text = fs.readFileSync(path.join(root, relative), "utf8");
  if (/\$\s?\d+(?:\.\d+)?\s*(?:USD|\/\s*month|／月)/i.test(text)) {
    errors.push(`${relative}: contains a price while nothing is sold`);
  }
  if (/checkout\.stripe\.com|buy\.stripe\.com|Stripe Checkout|Stripe Customer Portal/i.test(text)) {
    errors.push(`${relative}: contains a checkout or billing flow while nothing is sold`);
  }
  if (/\[OWNER (?:INPUT|DECISION) REQUIRED/.test(text)) {
    errors.push(`${relative}: contains an unresolved owner placeholder`);
  }
}

const agentLegal = fs.readFileSync(path.join(root, agentLegalPath), "utf8");
for (const [label, fragment] of [
  ["no-sales statement", "販売を行っていません"],
  ["free-of-charge statement", "無料で提供"],
  ["no applicable disclosure items", "該当するものはありません"],
  ["commitment to disclose before any future sale", "記載のないまま販売を行うことはありません"],
  ["English summary", "DinaLab does not sell any of the products"],
]) {
  if (!agentLegal.includes(fragment)) errors.push(`${agentLegalPath}: missing ${label}`);
}

for (const relative of [agentProductPath, "apps/salesforce-agentic-bot/PRIVACY_POLICY.html", agentLegalPath]) {
  const text = fs.readFileSync(path.join(root, relative), "utf8");
  if (/(?:sk|rk)_(?:live|test)_[A-Za-z0-9]+|whsec_[A-Za-z0-9]+|STRIPE_SECRET_KEY|OPENAI_API_KEY/i.test(text)) {
    errors.push(`${relative}: contains a secret or secret-key identifier`);
  }
}

const staleNameFiles = allFiles.filter((file) => /\.(?:html|md|js|mjs)$/.test(file));
for (const file of staleNameFiles) {
  if (path.basename(file) === "404.html") continue;
  if (file === import.meta.filename) continue;
  const text = fs.readFileSync(file, "utf8");
  // Retired full product names. Matching the full name rather than the bare word
  // leaves room for the pages that legitimately explain a rename, and leaves the
  // lowercase URL slug `dinasheet-for-salesforce` (the live Store item and this
  // site's own paths) and `DinaSheet for Google Sheets` (never renamed) alone.
  // Canonical asset directory keeps its compatibility name after the rename.
  const displayText = text.replaceAll("DinaSheet for Salesforce Store Assets/", "");
  if (/DinaLab Admin Toolkit|DinaLab Agent Assistant|Salesforce Agentic Bot|Salesforce Metadata Adminitrator|DinaSheet for Salesforce|DinaConnect for Salesforce/.test(displayText)) {
    errors.push(`${path.relative(root, file)}: stale product name`);
  }
}

const imageNames = (lang) => new Set(
  fs.readdirSync(path.join(root, "apps/salesforce-admin-toolkit/manual/img", lang))
    .filter((name) => name.endsWith(".png"))
);
const enImages = imageNames("en");
const jpImages = imageNames("jp");
const missingJp = [...enImages].filter((name) => !jpImages.has(name)).sort();
if (missingJp.length) warnings.push(`JP manual has ${missingJp.length} fewer screenshots: ${missingJp.join(", ")}`);

if (warnings.length) {
  console.warn("Warnings:");
  warnings.forEach((warning) => console.warn(`- ${warning}`));
}

if (errors.length) {
  console.error("Validation failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Site validation passed: ${htmlFiles.length} HTML files checked.`);
}
