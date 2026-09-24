// The support button and chat panel, on every page.
//
// The panel docks to the right edge like a browser extension's side panel: the
// page narrows to make room instead of sliding under it, and the left edge can
// be dragged to resize. On a phone it covers the screen instead.
//
// The button is drawn at once; the sign-in code (Firebase, ~150 KB, and Google's
// own button script) is only fetched when someone opens the panel, so a page
// view that never asks for help costs one small script.
//
// Opening it:
//   - the floating button,
//   - any element with data-support-open (the nav's Support links),
//   - ?support=open in the URL (what /support/ and old links redirect to).
// On a product page it starts on that app; ?app=<slug> overrides.

const STATE_KEY = "dinalab-support";
const WIDTH_KEY = "dinalab-support-width";
const MIN_WIDTH = 320;
const DEFAULT_WIDTH = 400;
// Below this the page has no room to share, so the panel covers it instead.
const DOCK_BREAKPOINT = 720;

const ICON = {
  chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.2 3.6c-.5.4-1.3.1-1.3-.6V16A2.5 2.5 0 0 1 4 13.5z" fill="currentColor"/><path d="M8 8.5h8M8 11.5h5" stroke="var(--on-primary)" stroke-width="1.6" stroke-linecap="round" fill="none"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>',
  send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12 20 4l-4 16-4.5-6.5z" fill="currentColor"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5z" fill="currentColor"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
  compose: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" fill="none"/><path d="M13.5 6.5l4 4" stroke="currentColor" stroke-width="1.8" fill="none"/></svg>'
};

// Each app's own mark, shown with its name at the top of the panel. The panel's
// colours follow the same app (assets/dinalab.css, generated from these marks).
const LOGOS = {
  "general": "/assets/dinalab-mark.svg",
  "sheetconnect-for-salesforce": "/apps/sheetconnect-for-salesforce/logo.svg",
  "dinasheet-for-salesforce": "/apps/dinasheet-for-salesforce/logo.png",
  "salesforce-admin-toolkit": "/apps/salesforce-admin-toolkit/logo.svg",
  "salesforce-agentic-bot": "/apps/salesforce-agentic-bot/logo.svg",
  "dina-dock-for-salesforce": "/apps/dina-dock-for-salesforce/logo.svg",
  "dinadevops-for-salesforce": "/apps/dinadevops-for-salesforce/logo.svg"
};
const logoFor = slug => LOGOS[slug] || LOGOS.general;

const lang = () => (document.documentElement.lang === "ja" ? "ja" : "en");
const say = (en, ja) => (lang() === "ja" ? ja : en);
// Text the language toggle can switch later: page-language.js swaps every
// element carrying both attributes when it is pressed.
const both = (en, ja) => `data-en="${en}" data-ja="${ja}"`;
const label = (en, ja) => `data-aria-en="${en}" data-aria-ja="${ja}" aria-label="${say(en, ja)}"`;

function readState() {
  try { return JSON.parse(sessionStorage.getItem(STATE_KEY) || "{}") || {}; } catch (_error) { return {}; }
}
function writeState(state) {
  try { sessionStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch (_error) { /* a conversation that cannot be kept still works on this page */ }
}
function readWidth() {
  try { return Number(localStorage.getItem(WIDTH_KEY)) || DEFAULT_WIDTH; } catch (_error) { return DEFAULT_WIDTH; }
}
function saveWidth(width) {
  try { localStorage.setItem(WIDTH_KEY, String(width)); } catch (_error) { /* the width resets next visit */ }
}
// Never more than 60% of the window, so the page beside it stays readable.
const maxWidth = () => Math.max(MIN_WIDTH, Math.min(720, Math.round(window.innerWidth * 0.6)));
const clampWidth = width => Math.round(Math.min(maxWidth(), Math.max(MIN_WIDTH, width)));

// The width as set, not as measured: the sheet animates its width, and reading
// it back mid-animation saved whatever it had reached so far.
let currentWidth = DEFAULT_WIDTH;

function setWidth(width) {
  const value = clampWidth(width);
  currentWidth = value;
  document.documentElement.style.setProperty("--support-width", `${value}px`);
  const handle = panel?.querySelector("[data-support-resize]");
  if (handle) {
    handle.setAttribute("aria-valuenow", String(value));
    handle.setAttribute("aria-valuemax", String(maxWidth()));
  }
  return value;
}

// The product a page is about, from its path: /apps/<slug>/...
function pageApp() {
  const params = new URLSearchParams(location.search);
  return params.get("app") || (location.pathname.match(/^\/apps\/([a-z0-9-]+)\//) || [])[1] || "";
}

const fab = document.createElement("button");
fab.type = "button";
fab.className = "circle extra support-fab";
fab.setAttribute("aria-haspopup", "dialog");
fab.setAttribute("aria-expanded", "false");
fab.setAttribute("aria-controls", "support-panel");
fab.setAttribute("data-aria-en", "Questions and feedback");
fab.setAttribute("data-aria-ja", "質問とフィードバック");
fab.setAttribute("aria-label", say("Questions and feedback", "質問とフィードバック"));
fab.innerHTML = ICON.chat;
document.body.append(fab);

let panel = null;
let ready = null;

function buildPanel() {
  panel = document.createElement("dialog");
  panel.id = "support-panel";
  panel.className = "right support-panel";
  panel.dataset.app = "general";
  panel.setAttribute("aria-labelledby", "support-app-name support-panel-title");
  panel.innerHTML = `
    <header class="support-head">
      <div class="support-app-picker">
        <button type="button" class="support-app-button" data-support-app-button aria-haspopup="listbox" aria-expanded="false"
          aria-controls="support-app-list" disabled>
          <img class="support-app-logo" data-support-app-logo src="${LOGOS.general}" alt="" width="32" height="32">
          <span class="support-app-text">
            <strong id="support-app-name" data-support-app-name>DinaLab</strong>
            <span id="support-panel-title" ${both("Questions and feedback", "質問とフィードバック")}>${say("Questions and feedback", "質問とフィードバック")}</span>
          </span>
          ${ICON.arrow}
        </button>
        <ul id="support-app-list" class="support-app-list" role="listbox" tabindex="-1" data-support-app-list hidden
          ${label("Choose an app", "アプリを選択")}></ul>
      </div>
      <div class="support-head-actions">
        <button type="button" class="circle transparent small" data-support-new data-signed-in-only hidden
          title="${say("New conversation", "新しい会話")}" ${label("New conversation", "新しい会話")}>${ICON.compose}</button>
        <div class="support-account" data-signed-in-only hidden>
          <button type="button" class="circle transparent small support-avatar" data-support-account aria-haspopup="menu" aria-expanded="false"
            ${label("Google account", "Google アカウント")}>
            <img alt="" referrerpolicy="no-referrer" data-user-photo hidden>
            <span data-user-initial></span>
          </button>
          <div class="support-account-menu" data-support-menu role="menu" hidden>
            <strong data-user-name></strong>
            <span class="support-account-email" data-user-email></span>
            <a href="/support/admin.html" role="menuitem" data-support-admin hidden ${both("Feedback inbox", "フィードバック一覧")}>${say("Feedback inbox", "フィードバック一覧")}</a>
            <button type="button" class="border small" role="menuitem" data-sign-out ${both("Sign out", "サインアウト")}>${say("Sign out", "サインアウト")}</button>
          </div>
        </div>
        <button type="button" class="circle transparent small" data-support-close ${label("Close", "閉じる")}>${ICON.close}</button>
      </div>
    </header>

    <section class="support-gate" data-signed-out hidden>
      <p class="support-intro" ${both("Ask how a DinaLab app works, report a bug, or suggest a feature. The assistant answers from the published product pages and passes anything it cannot answer to the team.", "DinaLab アプリの使い方の質問、不具合の報告、機能の提案ができます。アシスタントは公開中の製品ページをもとに回答し、答えられない内容はチームに引き継ぎます。")}>${say("Ask how a DinaLab app works, report a bug, or suggest a feature. The assistant answers from the published product pages and passes anything it cannot answer to the team.", "DinaLab アプリの使い方の質問、不具合の報告、機能の提案ができます。アシスタントは公開中の製品ページをもとに回答し、答えられない内容はチームに引き継ぎます。")}</p>
      <p ${both("DinaLab uses only Google accounts, a sign-in provider you can trust. Please sign in with the account you use every day: it makes it easy for us to support you.", "DinaLab は信頼できるサインイン方法として Google アカウントのみを使用しています。普段お使いのアカウントでサインインしていただくと、サポートがスムーズになります。")}>${say("DinaLab uses only Google accounts, a sign-in provider you can trust. Please sign in with the account you use every day: it makes it easy for us to support you.", "DinaLab は信頼できるサインイン方法として Google アカウントのみを使用しています。普段お使いのアカウントでサインインしていただくと、サポートがスムーズになります。")}</p>
      <div class="support-google-slot pending" data-google-button></div>
      <button type="button" class="support-google" data-sign-in>
        <svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
        <span ${both("Sign in with Google", "Google でサインイン")}>${say("Sign in with Google", "Google でサインイン")}</span>
      </button>
      <p class="support-notice" ${both("Messages are sent to OpenAI to write the answer and are not kept there. Feedback you send is kept with your name and email so we can reply.", "メッセージは回答作成のため OpenAI に送信されますが、保存はされません。送信したフィードバックは、返信のためにお名前とメールアドレスとともに保管します。")}>${say("Messages are sent to OpenAI to write the answer and are not kept there. Feedback you send is kept with your name and email so we can reply.", "メッセージは回答作成のため OpenAI に送信されますが、保存はされません。送信したフィードバックは、返信のためにお名前とメールアドレスとともに保管します。")}</p>
      <p class="support-error" role="alert" data-sign-in-error hidden></p>
    </section>

    <section class="support-chat" data-signed-in hidden>
      <ol class="support-log" aria-live="polite" data-support-log></ol>
      <form class="support-composer" data-support-form>
        <div class="field textarea border">
          <textarea rows="3" maxlength="4000" required data-support-message ${label("Your message", "メッセージ")}></textarea>
        </div>
        <button type="submit" class="circle support-send" data-support-send ${label("Send", "送信")}>${ICON.send}</button>
      </form>
      <p class="support-error" role="alert" data-support-error hidden></p>
    </section>
    <div class="support-resize" data-support-resize role="separator" aria-orientation="vertical" tabindex="0"
      aria-valuemin="${MIN_WIDTH}" ${label("Resize the panel", "パネルの幅を変更")}></div>`;
  document.body.append(panel);
  panel.querySelector("[data-support-close]").addEventListener("click", close);
  panel.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    if (!menu().hidden) toggleMenu(false);
    else close();
  });
  wireAccountMenu();
  wireResize();
}

const menu = () => panel.querySelector("[data-support-menu]");
function toggleMenu(show) {
  const button = panel.querySelector("[data-support-account]");
  menu().hidden = !show;
  button.setAttribute("aria-expanded", String(show));
  if (show) menu().querySelector("[data-sign-out]").focus();
}
function wireAccountMenu() {
  panel.querySelector("[data-support-account]").addEventListener("click", () => toggleMenu(menu().hidden));
  document.addEventListener("click", event => {
    if (panel && !menu().hidden && !event.target.closest?.(".support-account")) toggleMenu(false);
  });
}

// Drag the left edge, or focus it and use the arrow keys.
function wireResize() {
  const handle = panel.querySelector("[data-support-resize]");
  let dragging = false;
  handle.addEventListener("pointerdown", event => {
    dragging = true;
    handle.setPointerCapture(event.pointerId);
    document.documentElement.classList.add("support-resizing");
  });
  handle.addEventListener("pointermove", event => {
    if (dragging) setWidth(window.innerWidth - event.clientX);
  });
  const stop = () => {
    if (!dragging) return;
    dragging = false;
    document.documentElement.classList.remove("support-resizing");
    saveWidth(currentWidth);
  };
  handle.addEventListener("pointerup", stop);
  handle.addEventListener("pointercancel", stop);
  handle.addEventListener("keydown", event => {
    const step = { ArrowLeft: 16, ArrowRight: -16 }[event.key];
    if (!step) return;
    event.preventDefault();
    saveWidth(setWidth(currentWidth + step));
  });
  window.addEventListener("resize", () => setWidth(readWidth()));
}

// Everything that needs the network: sign-in, the app list, the conversation.
async function start() {
  const { api, bi, showError, watchSignIn, renderGoogleButton } = await import("/support/support-common.js");
  const part = name => panel.querySelector(`[data-${name}]`);
  const appButton = part("support-app-button");
  const appList = part("support-app-list");
  let apps = [{ slug: "general", name: say("DinaLab in general", "DinaLab 全般") }];
  let currentApp = "general";
  const log = part("support-log");
  const message = part("support-message");
  const chatError = part("support-error");
  const state = readState();
  let messages = Array.isArray(state.messages) ? state.messages : [];
  let sending = false;
  let googleButton = null;

  const save = () => writeState({ ...readState(), app: currentApp, messages });

  // The app shown at the top: its mark, its name, and the panel's colours.
  function showApp(slug) {
    const entry = apps.find(item => item.slug === slug) || apps[0];
    currentApp = entry.slug;
    panel.dataset.app = entry.slug;
    part("support-app-logo").src = logoFor(entry.slug);
    part("support-app-name").textContent = entry.slug === "general" ? "DinaLab" : entry.name;
    for (const option of appList.children) option.setAttribute("aria-selected", String(option.dataset.slug === entry.slug));
  }

  function toggleApps(show) {
    appList.hidden = !show;
    appButton.setAttribute("aria-expanded", String(show));
    if (!show) return;
    const selected = appList.querySelector('[aria-selected="true"]') || appList.firstElementChild;
    activate(selected);
    appList.focus();
  }
  function activate(option) {
    for (const item of appList.children) item.classList.toggle("active", item === option);
    appList.setAttribute("aria-activedescendant", option.id);
    option.scrollIntoView({ block: "nearest" });
  }
  function choose(slug) {
    toggleApps(false);
    appButton.focus();
    if (slug === currentApp) return;
    showApp(slug);
    // A different app is a different conversation: the answers so far were about the old one.
    reset();
  }

  function bubble(role, text) {
    const item = document.createElement("li");
    item.className = role;
    item.textContent = text;
    log.append(item);
    log.scrollTop = log.scrollHeight;
    return item;
  }

  function greet() {
    const hello = bi(document.createElement("li"), "Hi! Ask me how an app works, or tell me about a bug or an idea and I will pass it to the team.",
      "こんにちは。アプリの使い方の質問や、不具合・アイデアのご報告をどうぞ。チームにお伝えします。");
    hello.className = "assistant";
    log.replaceChildren(hello);
  }

  function reset() {
    messages = [];
    showError(chatError, "");
    greet();
    save();
    message.focus();
  }

  apps = [apps[0], ...(await api("/apps")).apps];
  appList.replaceChildren(...apps.map(entry => {
    const option = document.createElement("li");
    option.id = `support-app-${entry.slug}`;
    option.dataset.slug = entry.slug;
    option.setAttribute("role", "option");
    const logo = Object.assign(document.createElement("img"), { src: logoFor(entry.slug), alt: "", width: 28, height: 28 });
    const name = document.createElement("span");
    if (entry.slug === "general") bi(name, "DinaLab in general", "DinaLab 全般"); else name.textContent = entry.name;
    const tick = document.createElement("span");
    tick.className = "support-app-check";
    tick.innerHTML = ICON.check;
    option.append(logo, name, tick);
    option.addEventListener("click", () => choose(entry.slug));
    return option;
  }));
  appButton.disabled = false;
  appButton.addEventListener("click", () => toggleApps(appList.hidden));
  appButton.addEventListener("keydown", event => {
    if (["ArrowDown", "ArrowUp"].includes(event.key)) { event.preventDefault(); toggleApps(true); }
  });
  appList.addEventListener("keydown", event => {
    const options = [...appList.children];
    const at = options.findIndex(option => option.classList.contains("active"));
    const move = { ArrowDown: 1, ArrowUp: -1 }[event.key];
    if (move) { event.preventDefault(); activate(options[(at + move + options.length) % options.length]); }
    else if (event.key === "Home" || event.key === "End") { event.preventDefault(); activate(options[event.key === "Home" ? 0 : options.length - 1]); }
    else if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(options[at].dataset.slug); }
    else if (event.key === "Escape" || event.key === "Tab") { event.stopPropagation(); if (event.key === "Escape") event.preventDefault(); toggleApps(false); appButton.focus(); }
  });
  document.addEventListener("click", event => {
    if (!appList.hidden && !event.target.closest?.(".support-app-picker")) toggleApps(false);
  });
  const wanted = pageApp() || state.app || "";
  showApp(apps.some(entry => entry.slug === wanted) ? wanted : "general");
  // A conversation carried over from another page is shown as it was left.
  greet();
  for (const turn of messages) bubble(turn.role, turn.content);

  part("support-form").addEventListener("submit", async event => {
    event.preventDefault();
    const content = message.value.trim();
    if (!content || sending) return;
    sending = true;
    part("support-send").disabled = true;
    showError(chatError, "");
    bubble("user", content);
    message.value = "";
    const pending = bi(document.createElement("li"), "Thinking…", "考えています…");
    pending.className = "assistant pending";
    log.append(pending);
    log.scrollTop = log.scrollHeight;
    const history = [...messages, { role: "user", content }];
    try {
      const result = await api("/chat", { method: "POST", body: { app: currentApp, lang: lang(), messages: history } });
      pending.remove();
      messages = [...history, { role: "assistant", content: result.reply }];
      bubble("assistant", result.reply);
      for (const item of result.feedback || []) {
        const sent = bi(document.createElement("li"), `Sent to the team · reference ${item.id}`, `チームに送信しました · 参照番号 ${item.id}`);
        sent.className = "sent";
        log.append(sent);
      }
      save();
    } catch (error) {
      pending.remove();
      // Not answered, so it goes back in the box to send again.
      log.lastChild?.remove();
      message.value = content;
      showError(chatError, error.message);
    } finally {
      sending = false;
      part("support-send").disabled = false;
      message.focus();
    }
  });

  // Enter sends; Shift+Enter is a new line. Not while an IME is composing Japanese.
  message.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      part("support-form").requestSubmit();
    }
  });
  part("support-new").addEventListener("click", reset);

  watchSignIn(panel, async user => {
    for (const node of panel.querySelectorAll("[data-signed-in-only]")) node.hidden = !user;
    if (!user) {
      toggleMenu(false);
      // Google's "Continue as <name>" button, drawn once; the popup button is the
      // fallback where Google refuses the site as an origin.
      // The popup button shows at once; Google's replaces it only once it has
      // actually drawn, so nobody waits on a button that is not coming.
      googleButton ||= renderGoogleButton(part("google-button"), { onError: text => showError(part("sign-in-error"), text) })
        .then(shown => {
          part("google-button").classList.remove("pending");
          part("sign-in").hidden = shown;
          return shown;
        });
      return;
    }
    message.focus();
    try {
      const me = await api("/me");
      part("support-admin").hidden = !me.admin;
    } catch (error) {
      showError(chatError, error.message);
    }
  });
}

function docked() {
  return window.innerWidth > DOCK_BREAKPOINT;
}

function open() {
  if (!panel) buildPanel();
  setWidth(readWidth());
  if (!panel.open) panel.show();
  document.documentElement.classList.add("support-open");
  fab.setAttribute("aria-expanded", "true");
  fab.hidden = true;
  writeState({ ...readState(), open: true });
  if (!ready) {
    ready = start().catch(error => {
      ready = null;
      const box = panel.querySelector("[data-sign-in-error]");
      panel.querySelector("[data-signed-out]").hidden = false;
      box.hidden = false;
      box.textContent = say("The assistant could not load. Check your connection and try again.", "アシスタントを読み込めませんでした。接続を確認して、もう一度お試しください。");
      console.error(error);
    });
  }
  if (!docked()) panel.querySelector("[data-support-close]").focus();
}

function close() {
  panel?.close();
  document.documentElement.classList.remove("support-open");
  fab.hidden = false;
  fab.setAttribute("aria-expanded", "false");
  writeState({ ...readState(), open: false });
  fab.focus();
}

fab.addEventListener("click", open);
document.addEventListener("click", event => {
  const trigger = event.target.closest?.("[data-support-open]");
  if (!trigger) return;
  event.preventDefault();
  open();
});

// Opened by a link (?support=open), or still open from the page before this one.
const params = new URLSearchParams(location.search);
if (params.get("support") === "open" || readState().open) open();
