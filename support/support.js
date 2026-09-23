import { api, bi, lang, showError, watchSignIn } from "./support-common.js";

const el = id => document.getElementById(id);
const appSelect = el("app");
const log = el("log");
const message = el("message");
const chatError = el("chat-error");
let messages = [];
let sending = false;

// ?app=<slug> is how each product page and extension opens the chat on itself.
const requested = new URLSearchParams(location.search).get("app") || "";

async function loadApps() {
  const { apps } = await api("/apps");
  for (const entry of apps) appSelect.add(new Option(entry.name, entry.slug));
  if (apps.some(entry => entry.slug === requested)) appSelect.value = requested;
}

function add(role, content, extra = "") {
  const item = document.createElement("li");
  item.className = [role, extra].filter(Boolean).join(" ");
  item.textContent = content;
  log.append(item);
  log.scrollTop = log.scrollHeight;
  return item;
}

function reset() {
  messages = [];
  showError(chatError, "");
  const hello = bi(document.createElement("li"), "Hi! Ask me how an app works, or tell me about a bug or an idea and I will pass it to the team.",
    "こんにちは。アプリの使い方の質問や、不具合・アイデアのご報告をどうぞ。チームにお伝えします。");
  hello.className = "assistant";
  log.replaceChildren(hello);
}

el("composer").addEventListener("submit", async event => {
  event.preventDefault();
  const content = message.value.trim();
  if (!content || sending) return;
  sending = true;
  el("send").disabled = true;
  showError(chatError, "");
  add("user", content);
  message.value = "";
  const pending = bi(document.createElement("li"), "Thinking…", "考えています…");
  pending.className = "assistant pending";
  log.append(pending);
  const history = [...messages, { role: "user", content }];
  try {
    const result = await api("/chat", { method: "POST", body: { app: appSelect.value, lang: lang(), messages: history } });
    pending.remove();
    messages = [...history, { role: "assistant", content: result.reply }];
    add("assistant", result.reply);
    for (const item of result.feedback || []) {
      log.append(bi(Object.assign(document.createElement("li"), { className: "sent" }),
        `Sent to the team · reference ${item.id}`, `チームに送信しました · 参照番号 ${item.id}`));
    }
  } catch (error) {
    pending.remove();
    // The message was not answered, so it goes back in the box to send again.
    log.lastChild?.remove();
    message.value = content;
    showError(chatError, error.message);
  } finally {
    sending = false;
    el("send").disabled = false;
    message.focus();
  }
});

// Enter sends; Shift+Enter is a new line. Not while an IME is composing Japanese.
message.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    el("composer").requestSubmit();
  }
});
el("new-chat").addEventListener("click", reset);
// A different app is a different conversation: the answers so far were about the old one.
appSelect.addEventListener("change", reset);

watchSignIn(async user => {
  if (!user) return;
  reset();
  try {
    const me = await api("/me");
    el("admin-link").hidden = !me.admin;
  } catch (error) {
    showError(chatError, error.message);
  }
});
loadApps().catch(() => {});
