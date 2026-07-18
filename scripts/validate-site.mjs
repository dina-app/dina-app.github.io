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
  "apps/salesforce-agentic-bot/index.html",
  "apps/salesforce-agentic-bot/PRIVACY_POLICY.html",
];

for (const relative of primaryPages) {
  const html = fs.readFileSync(path.join(root, relative), "utf8");
  if (!/<title>[^<]+<\/title>/.test(html)) errors.push(`${relative}: missing title`);
  if (!/<meta name="description" content="[^"]+">/.test(html)) errors.push(`${relative}: missing meta description`);
  if (!/<link rel="canonical" href="https:\/\/dina\.jp\//.test(html)) errors.push(`${relative}: missing dina.jp canonical URL`);
}

for (const relative of [
  "apps/salesforce-admin-toolkit/PRIVACY_POLICY.html",
  "apps/salesforce-agentic-bot/PRIVACY_POLICY.html",
]) {
  const html = fs.readFileSync(path.join(root, relative), "utf8");
  if (!html.includes("Chrome Web Store User Data Policy, including the Limited Use requirements")) {
    errors.push(`${relative}: missing Limited Use disclosure`);
  }
}

const staleNameFiles = allFiles.filter((file) => /\.(?:html|md|js|mjs)$/.test(file));
for (const file of staleNameFiles) {
  if (path.basename(file) === "404.html") continue;
  if (file === import.meta.filename) continue;
  const text = fs.readFileSync(file, "utf8");
  if (/DinaLab Admin Toolkit|Salesforce Agentic Bot|Salesforce Metadata Adminitrator/.test(text)) {
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
