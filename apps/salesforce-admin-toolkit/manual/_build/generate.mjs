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

const CSS = `
:root{color-scheme:light;--bg:#f5f7f4;--ink:#172027;--muted:#5b6770;--panel:#fff;--line:#d6ded8;--green:#1f6b54;--green-soft:#e7f4ed;--rust:#a24d32;--blue:#235f82;font-family:Inter,"Hiragino Sans","Hiragino Kaku Gothic ProN","Yu Gothic",Meiryo,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}
*{box-sizing:border-box;}
body{margin:0;background:var(--bg);color:var(--ink);line-height:1.7;}
a{color:var(--blue);font-weight:800;text-decoration:none;}
a:hover{text-decoration:underline;}
.shell{width:min(1040px,calc(100% - 40px));margin:0 auto;padding:26px 0 64px;}
.nav{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:40px;}
.nav-links{display:flex;align-items:center;gap:16px;}
.brand{display:inline-flex;align-items:center;gap:10px;color:var(--ink);font-weight:900;}
.brand-mark{display:grid;width:36px;height:36px;place-items:center;border:1px solid var(--line);border-radius:8px;background:var(--panel);color:var(--rust);}
.lang-toggle{display:inline-flex;align-items:center;gap:6px;padding:6px 11px;border:1px solid var(--line);border-radius:999px;background:var(--panel);color:var(--ink);font-weight:800;font-size:13px;}
.lang-toggle:hover{text-decoration:none;border-color:var(--blue);color:var(--blue);}
.lang-toggle svg{width:16px;height:16px;flex:none;}
h1,h2,h3,p{margin-top:0;}
h1{margin-bottom:14px;font-size:clamp(32px,5.6vw,52px);line-height:1.1;}
h2{margin-bottom:12px;font-size:26px;line-height:1.18;}
h3{margin:18px 0 8px;font-size:19px;line-height:1.3;}
.lead{margin-bottom:10px;color:#3a464f;font-size:18px;}
.release-pill{display:inline-flex;margin-bottom:14px;padding:5px 10px;border-radius:999px;background:var(--green-soft);color:var(--green);font-size:13px;font-weight:900;}
.content{display:grid;gap:18px;}
section{padding:24px;border:1px solid var(--line);border-radius:8px;background:var(--panel);box-shadow:0 12px 26px rgba(23,32,39,.07);}
.toc ol{columns:2;column-gap:32px;margin:0;padding-left:22px;}
.toc li{break-inside:avoid;}
figure{margin:16px 0 0;}
figure img{display:block;width:100%;height:auto;border:1px solid var(--line);border-radius:8px;box-shadow:0 10px 22px rgba(23,32,39,.09);}
figure.narrow img{width:min(430px,100%);margin:0 auto;}
figcaption{margin-top:8px;color:var(--muted);font-size:14px;font-weight:700;text-align:center;}
ul,ol{margin-bottom:0;padding-left:22px;}
li+li{margin-top:8px;}
code{padding:2px 6px;border-radius:5px;background:#edf3ef;font-family:"SFMono-Regular",Consolas,"Liberation Mono",monospace;}
.notice{color:var(--muted);font-weight:700;}
@media(max-width:700px){.shell{width:min(100% - 28px,1040px);padding-top:18px;}.nav{flex-direction:column;align-items:flex-start;}.toc ol{columns:1;}}
`;

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

  const moreHtml = `      <section aria-labelledby="more-title">\n        <h2 id="more-title">${t("More", "関連リンク")}</h2>\n        <ul>\n          <li><a href="${otherHref}" hreflang="${otherLangCode}">${t("日本語版のマニュアル", "English version of this manual")}</a></li>\n          <li><a href="${overviewHref}">${t("DinaLab Admin Toolkit overview", "DinaLab Admin Toolkit の概要")}</a></li>\n          <li><a href="${privacyHref}">${t("Privacy Policy", "プライバシーポリシー")}</a></li>\n          <li><a href="${STORE_URL}" target="_blank" rel="noopener">${t("Chrome Web Store listing", "Chrome ウェブストアの掲載ページ")}</a></li>\n        </ul>\n      </section>`;

  const total = Object.keys(SCENES).filter((slug) => fs.existsSync(path.join(imgDirAbs, `${slug}.png`))).length;

  return `<!doctype html>
<html lang="${isEN ? "en" : "ja"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${t("User Manual", "ユーザーマニュアル")} | DinaLab Admin Toolkit</title>
  <meta name="description" content="${t("Step-by-step user manual for DinaLab Admin Toolkit with screenshots.", "DinaLab Admin Toolkit のスクリーンショット付きユーザーマニュアル。")}">
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <style>${CSS}</style>
  <script>
    (function () {
      try { ${redirectScript} } catch (error) {}
    })();
  </script>
</head>
<body>
  <main class="shell">
    <nav class="nav" aria-label="${t("Page navigation", "ページナビゲーション")}">
      <a class="brand" href="${homeHref}">
        <span class="brand-mark">D</span>
        <span>DinaLab</span>
      </a>
      <span class="nav-links">
        <a class="lang-toggle" href="${otherHref}" hreflang="${otherLangCode}" lang="${otherLangCode}" aria-label="${otherLangAria}" title="${otherLangAria}">${GLOBE}<span>${otherLangLabel}</span></a>
        <a href="${overviewHref}">${t("Back to DinaLab Admin Toolkit", "DinaLab Admin Toolkit に戻る")}</a>
      </span>
    </nav>

    <header>
      <span class="release-pill">${t("Manual for release 0.6.2", "リリース 0.6.2 対応マニュアル")}</span>
      <h1>${t("DinaLab Admin Toolkit — User Manual", "DinaLab Admin Toolkit ユーザーマニュアル")}</h1>
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
