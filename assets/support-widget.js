// The support button and chat panel, on every page.
//
// The button is drawn at once; the panel's sign-in code (Firebase, ~150 KB) is
// only fetched when someone opens it, so a page view that never asks for help
// costs one small script. The panel is BeerCSS's right-side sheet, opened
// non-modally so the page stays readable beside the conversation.
//
// Opening it:
//   - the floating button,
//   - any element with data-support-open (the nav's Support links),
//   - ?support=open in the URL (what /support/ and old links redirect to).
// On a product page it starts on that app; ?app=<slug> overrides.

const STATE_KEY = "dinalab-support";
const ICON = {
  chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.2 3.6c-.5.4-1.3.1-1.3-.6V16A2.5 2.5 0 0 1 4 13.5z" fill="currentColor"/><path d="M8 8.5h8M8 11.5h5" stroke="var(--on-primary)" stroke-width="1.6" stroke-linecap="round" fill="none"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>',
  send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12 20 4l-4 16-4.5-6.5z" fill="currentColor"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5z" fill="currentColor"/></svg>'
};

const lang = () => (document.documentElement.lang === "ja" ? "ja" : "en");
const say = (en, ja) => (lang() === "ja" ? ja : en);
// Text the language toggle can switch later: page-language.js swaps every
// element carrying both attributes when it is pressed.
const both = (en, ja) => `data-en="${en}" data-ja="${ja}"`;

function readState() {
  try { return JSON.parse(sessionStorage.getItem(STATE_KEY) || "{}") || {}; } catch (_error) { return {}; }
}
function writeState(state) {
  try { sessionStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch (_error) { /* a conversation that cannot be kept still works on this page */ }
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
  panel.setAttribute("aria-labelledby", "support-panel-title");
  panel.innerHTML = `
    <header class="support-head">
      <h2 id="support-panel-title" ${both("Questions and feedback", "質問とフィードバック")}>${say("Questions and feedback", "質問とフィードバック")}</h2>
      <button type="button" class="circle transparent support-close" data-support-close
        data-aria-en="Close" data-aria-ja="閉じる" aria-label="${say("Close", "閉じる")}">${ICON.close}</button>
    </header>
    <p class="support-intro" ${both("Ask how a DinaLab app works, report a bug, or suggest a feature. The assistant answers from the published product pages and passes anything it cannot answer to the team.", "DinaLab アプリの使い方の質問、不具合の報告、機能の提案ができます。アシスタントは公開中の製品ページをもとに回答し、答えられない内容はチームに引き継ぎます。")}>${say("Ask how a DinaLab app works, report a bug, or suggest a feature. The assistant answers from the published product pages and passes anything it cannot answer to the team.", "DinaLab アプリの使い方の質問、不具合の報告、機能の提案ができます。アシスタントは公開中の製品ページをもとに回答し、答えられない内容はチームに引き継ぎます。")}</p>

    <section class="support-gate" data-signed-out hidden>
      <p ${both("Sign in with Google to start, so the team can reply to your report and the assistant is not open to automated abuse.", "開始するには Google でサインインしてください。チームがご報告に返信できるよう、また自動化された悪用を防ぐためです。")}>${say("Sign in with Google to start, so the team can reply to your report and the assistant is not open to automated abuse.", "開始するには Google でサインインしてください。チームがご報告に返信できるよう、また自動化された悪用を防ぐためです。")}</p>
      <button type="button" class="support-google" data-sign-in>
        <svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
        <span ${both("Sign in with Google", "Google でサインイン")}>${say("Sign in with Google", "Google でサインイン")}</span>
      </button>
      <p class="support-error" role="alert" data-sign-in-error hidden></p>
    </section>

    <section class="support-chat" data-signed-in hidden>
      <div class="field label suffix border small">
        <select data-support-app>
          <option value="general" ${both("DinaLab in general", "DinaLab 全般")}>${say("DinaLab in general", "DinaLab 全般")}</option>
        </select>
        <label ${both("App", "アプリ")}>${say("App", "アプリ")}</label>
        <i>${ICON.arrow}</i>
      </div>
      <p class="support-user">
        <span data-user-email></span>
        <a href="/support/admin.html" data-support-admin hidden ${both("Feedback inbox", "フィードバック一覧")}>${say("Feedback inbox", "フィードバック一覧")}</a>
        <button type="button" class="support-link" data-support-new ${both("New conversation", "新しい会話")}>${say("New conversation", "新しい会話")}</button>
        <button type="button" class="support-link" data-sign-out ${both("Sign out", "サインアウト")}>${say("Sign out", "サインアウト")}</button>
      </p>
      <ol class="support-log" aria-live="polite" data-support-log></ol>
      <form class="support-composer" data-support-form>
        <div class="field textarea border">
          <textarea rows="3" maxlength="4000" required data-support-message
            data-aria-en="Your message" data-aria-ja="メッセージ" aria-label="${say("Your message", "メッセージ")}"></textarea>
        </div>
        <button type="submit" class="circle support-send" data-support-send
          data-aria-en="Send" data-aria-ja="送信" aria-label="${say("Send", "送信")}">${ICON.send}</button>
      </form>
      <p class="support-error" role="alert" data-support-error hidden></p>
    </section>

    <details class="support-privacy">
      <summary ${both("What happens to what you write", "入力内容の扱い")}>${say("What happens to what you write", "入力内容の扱い")}</summary>
      <p ${both("Your messages are sent to OpenAI to write the answer and are not stored there. Feedback you confirm is kept by DinaLab with your name, Google email address and that conversation, so the team can follow up. The chat takes text only. Do not paste passwords, session IDs or customer data. To have your feedback deleted, ask in the chat.", "メッセージは回答作成のため OpenAI に送信されますが、OpenAI 側には保存されません。確認のうえ送信したフィードバックは、チームが対応できるよう、お名前・Google のメールアドレス・その会話とともに DinaLab が保管します。チャットはテキストのみ対応です。パスワード、セッション ID、顧客データは貼り付けないでください。フィードバックの削除をご希望の場合は、チャットでお知らせください。")}>${say("Your messages are sent to OpenAI to write the answer and are not stored there. Feedback you confirm is kept by DinaLab with your name, Google email address and that conversation, so the team can follow up. The chat takes text only. Do not paste passwords, session IDs or customer data. To have your feedback deleted, ask in the chat.", "メッセージは回答作成のため OpenAI に送信されますが、OpenAI 側には保存されません。確認のうえ送信したフィードバックは、チームが対応できるよう、お名前・Google のメールアドレス・その会話とともに DinaLab が保管します。チャットはテキストのみ対応です。パスワード、セッション ID、顧客データは貼り付けないでください。フィードバックの削除をご希望の場合は、チャットでお知らせください。")}</p>
    </details>`;
  document.body.append(panel);
  panel.querySelector("[data-support-close]").addEventListener("click", close);
  panel.addEventListener("keydown", event => { if (event.key === "Escape") { event.preventDefault(); close(); } });
}

// Everything that needs the network: sign-in, the app list, the conversation.
async function start() {
  const { api, bi, showError, watchSignIn } = await import("/support/support-common.js");
  const part = name => panel.querySelector(`[data-${name}]`);
  const appSelect = part("support-app");
  const log = part("support-log");
  const message = part("support-message");
  const chatError = part("support-error");
  const state = readState();
  let messages = Array.isArray(state.messages) ? state.messages : [];
  let sending = false;

  const save = () => writeState({ ...readState(), app: appSelect.value, messages });

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
  }

  const { apps } = await api("/apps");
  for (const entry of apps) appSelect.add(new Option(entry.name, entry.slug));
  const wanted = pageApp() || state.app || "";
  if ([...appSelect.options].some(option => option.value === wanted)) appSelect.value = wanted;
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
      const result = await api("/chat", { method: "POST", body: { app: appSelect.value, lang: lang(), messages: history } });
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
  // A different app is a different conversation: the answers so far were about the old one.
  appSelect.addEventListener("change", reset);

  watchSignIn(panel, async user => {
    if (!user) return;
    message.focus();
    try {
      const me = await api("/me");
      part("support-admin").hidden = !me.admin;
    } catch (error) {
      showError(chatError, error.message);
    }
  });
}

function open() {
  if (!panel) buildPanel();
  if (!panel.open) panel.show();
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
  panel.querySelector("[data-support-message]:not([hidden])")?.focus?.();
}

function close() {
  panel?.close();
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
