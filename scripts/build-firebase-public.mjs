import { cpSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = join(repositoryRoot, ".firebase-public");
const publishedEntries = [
  "index.html",
  "404.html",
  "favicon.svg",
  "robots.txt",
  "sitemap.xml",
  "privacy-policy-salesforce-agentic-bot.html",
  "assets",
  "apps",
  "blog",
  "tools",
];

rmSync(outputDirectory, { recursive: true, force: true });
mkdirSync(outputDirectory, { recursive: true });

for (const entry of publishedEntries) {
  cpSync(join(repositoryRoot, entry), join(outputDirectory, entry), {
    recursive: true,
  });
}

rmSync(
  join(outputDirectory, "apps/salesforce-admin-toolkit/manual/_build"),
  { recursive: true, force: true },
);

console.log(`Prepared Firebase Hosting files in ${outputDirectory}`);
