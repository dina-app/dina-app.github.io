// Generates the EN and JP manual pages from scenes.mjs + the captured images.
// A figure is emitted only when its screenshot file exists, so the pages always
// match what was actually captured. Run: node _build/generate.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SECTIONS, SCENES, RELEASE_NOTES } from "./scenes.mjs";

const dir = path.dirname(fileURLToPath(import.meta.url));
const manualRoot = path.resolve(dir, "..");
const STORE_URL = "https://chromewebstore.google.com/detail/admin-toolkit-for-salesfo/hcbaijonjdkbdhbaknaipikhobphjnjc";

const GLOBE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3.5 9h17M3.5 15h17"/><path d="M12 3c2.5 2.7 3.8 5.8 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.8-3.8-9S9.5 5.7 12 3z"/></svg>';

const MOON = '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5Z"/></svg>';
const SUN = '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';

function esc(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function figuresFor(sectionId, lang, imgDirAbs, imgPrefix) {
  return Object.entries(SCENES)
    .filter(([, s]) => s.section === sectionId)
    .filter(([slug]) => fs.existsSync(path.join(imgDirAbs, `${slug}.png`)))
    .map(([slug, s]) => {
      const narrow = sectionId === "getting-started" ? " class=\"narrow\"" : "";
      return `        <figure${narrow}>\n          <img src="${imgPrefix}${slug}.png" alt="${esc(s[lang].alt)}" loading="lazy">\n          <figcaption>${esc(s[lang].cap)}</figcaption>\n        </figure>`;
    })
    .join("\n");
}

function buildPage(lang) {
  const isEN = lang === "en";
  const imgDirAbs = path.join(manualRoot, "img", lang);
  const imgPrefix = isEN ? `img/${lang}/` : `../img/${lang}/`;
  const homeHref = isEN ? "../../../" : "../../../../";
  const assetHref = isEN ? "../../../assets/" : "../../../../assets/";
  const overviewHref = isEN ? "../" : "../../";
  const privacyHref = isEN ? "../PRIVACY_POLICY.html" : "../../PRIVACY_POLICY.html";
  const otherHref = isEN ? "jp/" : "../";
  const otherLangCode = isEN ? "ja" : "en";
  const otherLangLabel = isEN ? "日本語" : "EN";
  const otherLangAria = isEN ? "日本語で表示 / View this manual in Japanese" : "View this manual in English / 英語で表示";
  const canonicalUrl = isEN
    ? "https://dina.jp/apps/salesforce-admin-toolkit/manual/"
    : "https://dina.jp/apps/salesforce-admin-toolkit/manual/jp/";
  const t = (en, jp) => (isEN ? en : jp);
  const redirectScript = isEN
    ? 'if (localStorage.getItem("dinalab-lang") === "ja") { location.replace("jp/"); }'
    : 'if (localStorage.getItem("dinalab-lang") === "en") { location.replace("../"); }';

  const tocItems = [
    ...SECTIONS.map((s) => `          <li><a href="#${s.id}">${esc(s[lang].title)}</a></li>`),
    `          <li><a href="#release-notes">${esc(RELEASE_NOTES[lang].title)}</a></li>`
  ].join("\n");

  const sectionsHtml = SECTIONS.map((s) => {
    const figs = figuresFor(s.id, lang, imgDirAbs, imgPrefix);
    const steps = s.steps
      ? `\n        <ol>\n${s.steps[lang].map((step) => `          <li>${step}</li>`).join("\n")}\n        </ol>`
      : "";
    return `      <section id="${s.id}" aria-labelledby="${s.id}-title">\n        <h2 id="${s.id}-title">${esc(s[lang].title)}</h2>\n        <p>${s[lang].intro}</p>${steps}\n${figs}\n      </section>`;
  }).join("\n\n");

  const rn = RELEASE_NOTES[lang];
  const rnHtml = `      <section id="release-notes" aria-labelledby="release-notes-title">\n        <h2 id="release-notes-title">${esc(rn.title)}</h2>\n        <p>${rn.intro}</p>\n${rn.versions.map(([ver, items]) => `        <h3>${esc(ver)}</h3>\n        <ul>\n${items.map((i) => `          <li>${i}</li>`).join("\n")}\n        </ul>`).join("\n")}\n      </section>`;

  const moreHtml = `      <section aria-labelledby="more-title">\n        <h2 id="more-title">${t("More", "関連リンク")}</h2>\n        <ul>\n          <li><a href="${otherHref}" hreflang="${otherLangCode}">${t("日本語版のマニュアル", "English version of this manual")}</a></li>\n          <li><a href="${overviewHref}">${t("Admin Toolkit for Salesforce overview", "Admin Toolkit for Salesforce の概要")}</a></li>\n          <li><a href="${privacyHref}">${t("Privacy Policy", "プライバシーポリシー")}</a></li>\n          <li><a href="${STORE_URL}" target="_blank" rel="noopener">${t("Chrome Web Store listing", "Chrome ウェブストアの掲載ページ")}</a></li>\n        </ul>\n      </section>`;

  const total = Object.keys(SCENES).filter((slug) => fs.existsSync(path.join(imgDirAbs, `${slug}.png`))).length;

  return `<!doctype html>
<html lang="${isEN ? "en" : "ja"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${t("User Manual", "ユーザーマニュアル")} | Admin Toolkit for Salesforce</title>
  <meta name="description" content="${t("Step-by-step user manual for Admin Toolkit for Salesforce with screenshots.", "Admin Toolkit for Salesforce のスクリーンショット付きユーザーマニュアル。")}">
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="${assetHref}dinalab.css">
  <script src="${assetHref}site-theme.js"></script>
  <script>
    (function () {
      try { ${redirectScript} } catch (error) {}
    })();
  </script>
</head>
<body class="doc-page manual-page">
  <main class="shell">
    <nav class="nav" aria-label="${t("Page navigation", "ページナビゲーション")}">
      <a class="brand" href="${homeHref}">
        <span class="brand-mark">D</span>
        <span>DinaLab</span>
      </a>
      <span class="nav-links">
        <a href="${overviewHref}">${t("Back to Admin Toolkit for Salesforce", "Admin Toolkit for Salesforce に戻る")}</a>
        <a class="lang-toggle" href="${otherHref}" hreflang="${otherLangCode}" lang="${otherLangCode}" aria-label="${otherLangAria}" title="${otherLangAria}">${GLOBE}<span>${otherLangLabel}</span></a>
        <button type="button" class="theme-toggle" data-theme-toggle aria-label="${t("Toggle dark theme", "ダークテーマを切り替え")}" aria-pressed="false">${MOON}${SUN}</button>
      </span>
    </nav>

    <header class="intro">
      <span class="release-pill">${t("Manual for release 0.8.0", "リリース 0.8.0 対応マニュアル")}</span>
      <h1>${t("Admin Toolkit for Salesforce — User Manual", "Admin Toolkit for Salesforce ユーザーマニュアル")}</h1>
      <p class="lead">${t("How to install the toolkit, launch its apps from the popup, and use each workspace and tool — with " + total + " screenshots.", "インストールから、ポップアップでのアプリ起動、各ワークスペース・ツールの使い方まで、" + total + " 枚のスクリーンショットで解説します。")}</p>
      <p class="notice">${t("Screenshots were taken against a Salesforce Developer Edition org; org-identifying values (host, org and user names, IDs, addresses) are replaced with sample values. Salesforce is a trademark of Salesforce, Inc. This extension is not affiliated with, endorsed by, or sponsored by Salesforce.", "スクリーンショットは Salesforce Developer Edition 組織で撮影し、組織を特定できる情報（ホスト名、組織名・ユーザー名、ID、アドレス）はサンプル値に置き換えています。Salesforce は Salesforce, Inc. の商標です。本拡張機能は Salesforce の提携・承認・後援を受けていません。")}</p>
    </header>

    <div class="content" style="margin-top:28px;">
      <section class="toc" aria-labelledby="toc-title">
        <h2 id="toc-title">${t("Contents", "目次")}</h2>
        <ol>
${tocItems}
        </ol>
      </section>

${sectionsHtml}

${rnHtml}

${moreHtml}
    </div>
  </main>
  <script>
    (function () {
      var link = document.querySelector(".lang-toggle");
      if (!link) return;
      link.addEventListener("click", function () {
        try { localStorage.setItem("dinalab-lang", "${isEN ? "ja" : "en"}"); } catch (error) {}
      });
    })();
  </script>
</body>
</html>
`;
}

fs.writeFileSync(path.join(manualRoot, "index.html"), buildPage("en"));
fs.mkdirSync(path.join(manualRoot, "jp"), { recursive: true });
fs.writeFileSync(path.join(manualRoot, "jp", "index.html"), buildPage("jp"));

const enCount = Object.keys(SCENES).filter((s) => fs.existsSync(path.join(manualRoot, "img/en", `${s}.png`))).length;
const jpCount = Object.keys(SCENES).filter((s) => fs.existsSync(path.join(manualRoot, "img/jp", `${s}.png`))).length;
console.log(`Generated EN (${enCount} figures) and JP (${jpCount} figures).`);
