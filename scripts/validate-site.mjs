import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const errors = [];
const warnings = [];

function filesUnder(dir, result = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git") continue;
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

for (const relative of [
  "apps/salesforce-admin-toolkit/PRIVACY_POLICY.html",
  "apps/dinasheet-for-salesforce/PRIVACY_POLICY.html",
  "apps/salesforce-agentic-bot/PRIVACY_POLICY.html",
]) {
  const html = fs.readFileSync(path.join(root, relative), "utf8");
  if (!html.includes("Chrome Web Store User Data Policy, including the Limited Use requirements")) {
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
  ["Plus USD price", "$9"],
  ["Pro USD price", "$29"],
  ["monthly USD price unit", "USD / month"],
  ["no-overage disclosure", "No overage charges"],
  ["non-live billing disclosure", "Billing is not live"],
  ["Plus availability", "Coming soon"],
  ["Pro availability", "Closed pilot"],
  ["Max unavailable status", "Not for sale"],
  ["Stripe Checkout disclosure", "Stripe Checkout"],
  ["Stripe Customer Portal disclosure", "Stripe Customer Portal"],
  ["refund owner decision placeholder", "[OWNER DECISION REQUIRED]"],
  ["support email placeholder", "[OWNER INPUT REQUIRED: SUPPORT EMAIL]"],
  ["support phone placeholder", "[OWNER INPUT REQUIRED: SUPPORT PHONE]"],
  ["privacy policy link", "href=\"PRIVACY_POLICY.html\""],
  ["commercial disclosure link", "href=\"TOKUSHOHO.html\""],
  ["Salesforce certification disclaimer", "certified by Salesforce"],
]) {
  if (!agentProduct.includes(fragment)) errors.push(`${agentProductPath}: missing ${label}`);
}

for (const section of ["overview", "features", "pricing", "support", "legal"]) {
  if (!agentProduct.includes(`href=\"#${section}\"`)) errors.push(`${agentProductPath}: missing ${section} navigation link`);
  if (!agentProduct.includes(`id=\"${section}\"`)) errors.push(`${agentProductPath}: missing ${section} section`);
}

if (/checkout\.stripe\.com|buy\.stripe\.com/i.test(agentProduct)) {
  errors.push(`${agentProductPath}: contains an active Stripe checkout URL while billing is not live`);
}

const agentLegalPath = "apps/salesforce-agentic-bot/TOKUSHOHO.html";
const agentLegal = fs.readFileSync(path.join(root, agentLegalPath), "utf8");
for (const [label, fragment] of [
  ["seller field", "販売業者・法人名"],
  ["address field", "所在地"],
  ["phone field", "電話番号"],
  ["email field", "メールアドレス"],
  ["price field", "販売価格"],
  ["payment timing field", "支払時期"],
  ["service delivery field", "サービス提供時期"],
  ["cancellation field", "解約"],
  ["refund field", "返品・返金"],
  ["seller placeholder", "[OWNER INPUT REQUIRED: SELLER / LEGAL NAME]"],
  ["address placeholder", "[OWNER INPUT REQUIRED: BUSINESS ADDRESS]"],
  ["refund decision placeholder", "[OWNER DECISION REQUIRED]"],
  ["Plus USD price", "$9 USD"],
  ["Pro USD price", "$29 USD"],
  ["Max not sold disclosure", "Max：販売していません"],
  ["Stripe Checkout disclosure", "Stripe Checkout"],
  ["Stripe Customer Portal disclosure", "Stripe Customer Portal"],
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
  if (/DinaLab Admin Toolkit|DinaLab Agent Assistant|Salesforce Agentic Bot|Salesforce Metadata Adminitrator/.test(text)) {
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
