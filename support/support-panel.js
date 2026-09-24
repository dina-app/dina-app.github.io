// Everything inside the support panel once it is open: the app switcher, the
// sign-in, and the four ways in. Loaded by assets/support-widget.js only when
// the panel opens, so a page view that never asks for help never fetches it.
//
//   How to use     topics from the app's JSON, answered straight from it: no AI
//   Report a bug   a form that goes to the inbox: no AI
//   Suggest a feature  the same
//   Ask anything   AI chat, which searches the same JSON (search_docs) and can
//                  open one of its screenshots beside the panel (show_image)
//
// Only the apps the server marks available get these; the others say so.
// The limits are the server's (GET /api/support/apps returns them); the page
// only shows them, and a request past one is refused there, not here.
import { api, bi, showError, watchSignIn, renderGoogleButton } from "./support-common.js";

const CHAT_KEY = "chat";

export async function mountPanel(ctx) {
  const { panel, part, readState, writeState, pageApp, lang, say, ICON, logoFor, toggleMenu } = ctx;
  const appButton = part("support-app-button");
  const appList = part("support-app-list");
  const view = part("support-view");
  const knowledgeCache = new Map();
  let apps = [{ slug: "general", name: "DinaLab" }];
  let limits = { messageChars: 600, turnsPerConversation: 10 };
  let currentApp = "general";
  // The user's two AI usage windows (5 hours, 1 week), as the server last said.
  let usage = null;
  let signedIn = false;
  let googleButton = null;

  // ---------------------------------------------------------------- helpers
  const el = (tag, props = {}, ...children) => {
    const node = Object.assign(document.createElement(tag), props);
    for (const child of children.flat()) if (child != null) node.append(child);
    return node;
  };
  const tr = (tag, en, ja, props = {}) => bi(el(tag, props), en, ja);
  const pick = value => (value && typeof value === "object" ? value[lang()] || value.en : value || "");
  // A string from the knowledge file, switchable by the page's language toggle.
  const kt = (tag, value, props = {}) => bi(el(tag, props), value?.en || "", value?.ja || value?.en || "");

  const chats = () => readState()[CHAT_KEY] || {};
  const chatFor = slug => chats()[slug] || { conversationId: "", transcript: [], turnsLeft: limits.turnsPerConversation };
  const saveChat = (slug, value) => writeState({ ...readState(), [CHAT_KEY]: { ...chats(), [slug]: value } });

  async function knowledgeFor(slug) {
    if (!knowledgeCache.has(slug)) {
      knowledgeCache.set(slug, fetch(`/support/knowledge/${slug}.json`).then(response => {
        if (!response.ok) throw new Error(`knowledge ${response.status}`);
        return response.json();
      }).catch(error => { knowledgeCache.delete(slug); throw error; }));
    }
    return knowledgeCache.get(slug);
  }
  const appName = () => (currentApp === "general" ? "DinaLab" : apps.find(entry => entry.slug === currentApp)?.name || "DinaLab");
  const available = () => apps.find(entry => entry.slug === currentApp)?.available === true;
  const percent = window => Math.min(100, Math.round((window.used / window.limit) * 100));
  const limitHit = () => usage?.find(window => window.used >= window.limit) || null;
  const resetTime = (window, locale) => new Date(window.resetsAt).toLocaleString(locale,
    window.name === "week" ? { weekday: "short", hour: "numeric", minute: "2-digit" } : { hour: "numeric", minute: "2-digit" });

  // --------------------------------------------------------- screenshot popup
  // A screenshot the assistant opened, over the page to the left of the panel
  // (over the panel itself on a phone). Esc, its close button, closing the
  // panel or switching app puts it away.
  let shot = null;
  function closeShot() {
    if (shot) shot.hidden = true;
  }
  function openShot(image) {
    if (!shot) {
      const close = el("button", { type: "button", className: "circle transparent small support-shot-close", innerHTML: ICON.close });
      close.setAttribute("aria-label", say("Close the screenshot", "スクリーンショットを閉じる"));
      close.addEventListener("click", closeShot);
      shot = el("figure", { className: "support-shot", hidden: true }, close,
        el("a", { target: "_blank", rel: "noopener" }, el("img", { decoding: "async" })), el("figcaption"));
      shot.setAttribute("role", "dialog");
      document.body.append(shot);
      // Captured before the panel's own Esc, which would close the whole panel.
      document.addEventListener("keydown", event => {
        if (event.key !== "Escape" || shot.hidden) return;
        event.preventDefault();
        event.stopPropagation();
        closeShot();
      }, true);
      panel.addEventListener("close", closeShot);
    }
    shot.setAttribute("aria-label", image.alt);
    shot.querySelector("a").href = image.src;
    Object.assign(shot.querySelector("img"), { src: image.src, alt: image.alt });
    shot.querySelector("figcaption").textContent = image.alt;
    shot.hidden = false;
  }

  function back(target = "home") {
    const button = tr("button", "‹ Back", "‹ 戻る", { type: "button", className: "support-back" });
    button.addEventListener("click", () => show(target));
    return button;
  }

  // A textarea or input with a live count against its limit.
  function limited(tag, { max, required = false, value = "", rows = 3, labelEn, labelJa, name }) {
    const id = `support-field-${name}`;
    const control = el(tag, { id, name, maxLength: max, required, value, ...(tag === "textarea" ? { rows } : { type: "text" }) });
    const count = el("span", { className: "support-count", textContent: `${value.length}/${max}` });
    control.addEventListener("input", () => { count.textContent = `${control.value.length}/${max}`; });
    const caption = tr("label", `${labelEn}${required ? " *" : ""}`, `${labelJa}${required ? " *" : ""}`, { htmlFor: id });
    return { control, row: el("div", { className: "support-field" }, el("div", { className: "support-field-head" }, caption, count), control) };
  }

  function browserName() {
    const brands = navigator.userAgentData?.brands?.filter(brand => !/not.?a.?brand|chromium/i.test(brand.brand)) || [];
    const platform = navigator.userAgentData?.platform || "";
    if (brands.length) return `${brands[0].brand} ${brands[0].version}${platform ? ` · ${platform}` : ""}`.slice(0, 120);
    const match = navigator.userAgent.match(/(Edg|Chrome|Firefox|Version)\/(\d+)/);
    return (match ? `${match[1] === "Version" ? "Safari" : match[1] === "Edg" ? "Edge" : match[1]} ${match[2]}` : navigator.userAgent).slice(0, 120);
  }

  async function sendFeedback(body, errorNode, button) {
    showError(errorNode, "");
    button.disabled = true;
    try {
      const { id } = await api("/feedback", { method: "POST", body: { app: currentApp, lang: lang(), ...body } });
      show("sent", { id });
    } catch (error) {
      showError(errorNode, error.message);
      button.disabled = false;
    }
  }

  // ------------------------------------------------------------------ views
  const VIEWS = {
    home() {
      const option = (target, icon, titleEn, titleJa, subEn, subJa) => {
        const button = el("button", { type: "button", className: "support-option" },
          el("span", { className: "support-option-icon", innerHTML: icon }),
          el("span", { className: "support-option-text" }, tr("strong", titleEn, titleJa), tr("span", subEn, subJa)));
        button.addEventListener("click", () => show(target));
        return button;
      };
      return [
        tr("p", `What do you need help with in ${appName()}?`, `${appName()} について、どのようなご用件ですか？`, { className: "support-hello" }),
        el("div", { className: "support-options" },
          option("topics", ICON.book, "How to use it", "使い方を見る", "Answers from the docs, instantly", "資料からすぐに回答"),
          option("bug", ICON.bug, "Report a bug", "不具合を報告", "Goes straight to the team", "チームに直接届きます"),
          option("idea", ICON.idea, "Suggest a feature", "機能を提案", "Tell us what would help", "欲しい機能を教えてください"),
          option("chat", ICON.chat, "Ask anything", "自由に質問",
            limitHit() ? `AI limit reached · resets ${resetTime(limitHit(), "en-US")}` : "AI answers from the docs",
            limitHit() ? `AI の上限に達しました · ${resetTime(limitHit(), "ja-JP")} にリセット` : "AI が資料から回答"))
      ];
    },

    async topics() {
      const data = await knowledgeFor(currentApp);
      const filter = el("input", { type: "search", className: "support-filter" });
      filter.setAttribute("aria-label", say("Filter topics", "トピックを絞り込む"));
      filter.placeholder = say("Filter topics", "トピックを絞り込む");
      const groups = el("div", { className: "support-topic-groups" });
      const draw = () => {
        const term = filter.value.trim().toLowerCase();
        const match = entry => !term || [entry.title.en, entry.title.ja, entry.answer.en, entry.answer.ja, ...(entry.keywords || [])].join(" ").toLowerCase().includes(term);
        groups.replaceChildren(...[["howto", "How to", "使い方"], ["faq", "Questions", "よくある質問"], ["privacy", "Data and privacy", "データとプライバシー"]].map(([type, en, ja]) => {
          const entries = data.entries.filter(entry => entry.type === type && match(entry));
          if (!entries.length) return null;
          return el("section", { className: "support-topic-group" }, tr("h4", en, ja),
            el("ul", {}, entries.map(entry => {
              const button = kt("button", entry.title, { type: "button", className: "support-topic" });
              button.addEventListener("click", () => show("answer", { entry }));
              return el("li", {}, button);
            })));
        }).filter(Boolean));
        if (!groups.children.length) groups.append(tr("p", "Nothing matches. Try Ask anything.", "該当するトピックがありません。「自由に質問」をお試しください。", { className: "support-empty" }));
      };
      filter.addEventListener("input", draw);
      draw();
      return [back(), tr("h3", `How to use ${data.name}`, `${data.name} の使い方`), filter, groups];
    },

    async answer({ entry }) {
      const data = await knowledgeFor(currentApp);
      const links = [["page", "Product page", "製品ページ"], ["manual", "User manual", "ユーザーマニュアル"], ["privacy", "Privacy policy", "プライバシーポリシー"], ["store", "Chrome Web Store", "Chrome ウェブストア"]]
        .filter(([key]) => data.links?.[key])
        .map(([key, en, ja]) => tr("a", en, ja, { href: data.links[key], target: key === "store" ? "_blank" : "_self", rel: "noopener" }));
      const ask = tr("button", "Ask AI about this", "AI に質問する", { type: "button", className: "button border small" });
      ask.addEventListener("click", () => show("chat", { draft: pick(entry.title) }));
      const report = tr("button", "Report a bug", "不具合を報告", { type: "button", className: "button border small" });
      report.addEventListener("click", () => show("bug"));
      return [back("topics"), kt("h3", entry.title), kt("p", entry.answer, { className: "support-answer" }),
        links.length ? el("p", { className: "support-links" }, links) : null,
        el("div", { className: "support-actions" }, ask, report)];
    },

    async bug() {
      const data = await knowledgeFor(currentApp).catch(() => ({ versions: [] }));
      const steps = limited("textarea", { name: "steps", max: 400, labelEn: "What did you do?", labelJa: "行った操作" });
      const expected = limited("textarea", { name: "expected", max: 400, rows: 2, labelEn: "What did you expect?", labelJa: "期待した結果" });
      const actual = limited("textarea", { name: "actual", max: 400, required: true, labelEn: "What happened?", labelJa: "実際に起きたこと" });
      const version = el("select", { id: "support-field-version" },
        (data.versions || []).map(value => el("option", { value, textContent: value })),
        tr("option", "Not sure", "わからない", { value: "" }));
      const browser = limited("input", { name: "browser", max: 120, value: browserName(), labelEn: "Browser", labelJa: "ブラウザー" });
      const error = el("p", { className: "support-error", hidden: true });
      error.setAttribute("role", "alert");
      const send = tr("button", "Send to the team", "チームに送信", { type: "submit" });
      const form = el("form", { className: "support-form" }, steps.row, expected.row, actual.row,
        el("div", { className: "support-field" }, tr("label", "Version", "バージョン", { htmlFor: "support-field-version" }), version),
        browser.row,
        tr("p", "Do not include passwords, session IDs or customer data.", "パスワード、セッション ID、顧客データは含めないでください。", { className: "support-note" }),
        send, error);
      form.addEventListener("submit", event => {
        event.preventDefault();
        sendFeedback({ kind: "bug", fields: { steps: steps.control.value, expected: expected.control.value, actual: actual.control.value,
          version: version.value, browser: browser.control.value } }, error, send);
      });
      return [back(), tr("h3", `Report a bug in ${appName()}`, `${appName()} の不具合を報告`), form];
    },

    idea() {
      const title = limited("input", { name: "title", max: 100, required: true, labelEn: "Your idea in a line", labelJa: "アイデアを一言で" });
      const details = limited("textarea", { name: "details", max: 400, rows: 5, labelEn: "Details", labelJa: "詳細" });
      const error = el("p", { className: "support-error", hidden: true });
      error.setAttribute("role", "alert");
      const send = tr("button", "Send to the team", "チームに送信", { type: "submit" });
      const form = el("form", { className: "support-form" }, title.row, details.row, send, error);
      form.addEventListener("submit", event => {
        event.preventDefault();
        sendFeedback({ kind: "idea", fields: { title: title.control.value, details: details.control.value } }, error, send);
      });
      return [back(), tr("h3", `Suggest a feature for ${appName()}`, `${appName()} の機能を提案`), form];
    },

    sent({ id }) {
      const home = tr("button", "Back to start", "最初に戻る", { type: "button", className: "button border small" });
      home.addEventListener("click", () => show("home"));
      return [el("div", { className: "support-sent" }, el("span", { className: "support-option-icon", innerHTML: ICON.check }),
        tr("h3", "Sent to the team", "チームに送信しました"),
        tr("p", `Reference: ${id}. We read every report.`, `参照番号: ${id}。すべて確認しています。`)), home];
    },

    unavailable() {
      const choices = apps.filter(entry => entry.available).map(entry => {
        const button = el("button", { type: "button", className: "support-option" },
          el("img", { className: "support-option-logo", src: logoFor(entry.slug), alt: "", width: 40, height: 40 }),
          el("span", { className: "support-option-text" }, el("strong", { textContent: entry.name })));
        button.addEventListener("click", () => { showApp(entry.slug); show("home"); });
        return button;
      });
      return [el("div", { className: "support-sent" },
        tr("h3", `Support for ${appName()} is not available yet`, `${appName()} のサポートはまだご利用いただけません`),
        tr("p", "For now, questions, bug reports and ideas are open for these apps:", "現在、質問・不具合の報告・機能の提案は次のアプリで受け付けています。")),
      el("div", { className: "support-options" }, choices)];
    },

    chat({ draft = "" } = {}) {
      const state = chatFor(currentApp);
      const log = el("ol", { className: "support-log" });
      log.setAttribute("aria-live", "polite");
      const meta = el("p", { className: "support-meta" });
      const usageBox = el("div", { className: "support-usage" });
      const error = el("p", { className: "support-error", hidden: true });
      error.setAttribute("role", "alert");
      const message = el("textarea", { rows: 3, maxLength: limits.messageChars, value: draft });
      message.setAttribute("aria-label", say("Your message", "メッセージ"));
      const count = el("span", { className: "support-count" });
      const sendButton = el("button", { type: "submit", className: "circle support-send", innerHTML: ICON.send });
      sendButton.setAttribute("aria-label", say("Send", "送信"));
      const composer = el("form", { className: "support-composer" },
        el("div", { className: "field textarea border" }, message), sendButton);
      const limitReached = el("div", { className: "support-limit", hidden: true });
      const toTeam = tr("button", "Send this question to the team", "この質問をチームに送る", { type: "button", className: "support-chip" });
      const toBug = tr("button", "Report a bug", "不具合を報告", { type: "button", className: "support-chip" });
      toBug.addEventListener("click", () => show("bug"));
      let sending = false;

      const bubble = (role, text, images = []) => {
        const item = el("li", { className: role }, text);
        if (images.length) {
          item.append(el("span", { className: "support-thumbs" }, images.map(image => {
            const button = el("button", { type: "button", className: "support-thumb", title: image.alt }, el("img", { src: image.src, alt: image.alt, loading: "lazy" }));
            button.addEventListener("click", () => openShot(image));
            return button;
          })));
        }
        log.append(item);
        log.scrollTop = log.scrollHeight;
        return item;
      };
      // One bar per window: how much is used, and when it starts over.
      const drawUsage = () => usageBox.replaceChildren(...(usage || []).map(window => {
        const used = percent(window);
        const [en, ja] = window.name === "session" ? ["5-hour limit", "5 時間の上限"] : ["Weekly limit", "週の上限"];
        const bar = el("span", { className: "support-usage-bar" }, el("span", { style: `inline-size: ${used}%` }));
        bar.setAttribute("role", "progressbar");
        bar.setAttribute("aria-label", say(en, ja));
        bar.setAttribute("aria-valuenow", String(used));
        return el("div", { className: `support-usage-row${used >= 100 ? " full" : ""}` }, tr("span", en, ja),
          tr("span", `${used}% used${window.resetsAt ? ` · resets ${resetTime(window, "en-US")}` : ""}`,
            `${used}% 使用${window.resetsAt ? ` · ${resetTime(window, "ja-JP")} にリセット` : ""}`), bar);
      }));
      const drawMeta = () => {
        const s = chatFor(currentApp);
        const turnsLeft = s.conversationId ? s.turnsLeft : limits.turnsPerConversation;
        bi(meta, `${turnsLeft}/${limits.turnsPerConversation} messages left in this conversation`, `この会話の残り ${turnsLeft}/${limits.turnsPerConversation} 件`);
        drawUsage();
        const full = Boolean(s.conversationId) && s.turnsLeft <= 0;
        const hit = limitHit();
        composer.hidden = full || Boolean(hit);
        count.hidden = composer.hidden;
        limitReached.hidden = !(full || hit);
        if (full || hit) {
          const again = tr("button", "Start a new conversation", "新しい会話を始める", { type: "button", className: "button border small" });
          again.addEventListener("click", () => { saveChat(currentApp, { conversationId: "", transcript: [], turnsLeft: limits.turnsPerConversation }); show("chat"); });
          limitReached.replaceChildren(
            hit ? tr("p", `You have used your ${hit.name === "session" ? "5-hour" : "weekly"} AI limit. It resets ${hit.name === "session" ? "at" : "on"} ${resetTime(hit, "en-US")}. How to use and the forms still work.`,
              `AI の${hit.name === "session" ? " 5 時間" : "週"}の上限に達しました。${resetTime(hit, "ja-JP")} にリセットされます。「使い方を見る」とフォームは引き続き使えます。`)
              : tr("p", `This conversation reached ${limits.turnsPerConversation} messages.`, `この会話は ${limits.turnsPerConversation} 件に達しました。`),
            ...(hit ? [] : [again]));
        }
        toTeam.hidden = !s.transcript.some(turn => turn.role === "user");
        count.textContent = `${message.value.length}/${limits.messageChars}`;
      };

      log.append(tr("li", `Ask me anything about ${appName()}. I answer from its documentation.`,
        `${appName()} について何でも質問してください。資料をもとに回答します。`, { className: "assistant" }));
      for (const turn of state.transcript) bubble(turn.role, turn.content, turn.images);

      message.addEventListener("input", () => { count.textContent = `${message.value.length}/${limits.messageChars}`; });
      // Enter sends; Shift+Enter is a new line. Not while an IME is composing Japanese.
      message.addEventListener("keydown", event => {
        if (event.key === "Enter" && !event.shiftKey && !event.isComposing) { event.preventDefault(); composer.requestSubmit(); }
      });
      composer.addEventListener("submit", async event => {
        event.preventDefault();
        const content = message.value.trim();
        if (!content || sending) return;
        sending = true;
        sendButton.disabled = true;
        showError(error, "");
        bubble("user", content);
        message.value = "";
        const pending = tr("li", "Looking it up…", "調べています…", { className: "assistant pending" });
        log.append(pending);
        log.scrollTop = log.scrollHeight;
        const before = chatFor(currentApp);
        try {
          const result = await api("/chat", { method: "POST", body: { app: currentApp, lang: lang(), message: content, conversationId: before.conversationId || undefined } });
          pending.remove();
          const images = result.images || [];
          bubble("assistant", result.reply, images);
          if (images.length) openShot(images[0]);
          usage = result.usage || usage;
          saveChat(currentApp, { conversationId: result.conversationId, turnsLeft: result.turnsLeft,
            transcript: [...before.transcript, { role: "user", content }, { role: "assistant", content: result.reply, ...(images.length ? { images } : {}) }] });
        } catch (failure) {
          pending.remove();
          // Not answered, so it goes back in the box to send again.
          log.lastChild?.remove();
          message.value = content;
          showError(error, failure.message);
          // A refusal may be a limit: fetch where the windows stand.
          usage = (await api("/me").catch(() => null))?.usage || usage;
        } finally {
          sending = false;
          sendButton.disabled = false;
          drawMeta();
          if (!composer.hidden) message.focus();
        }
      });
      toTeam.addEventListener("click", () => {
        const s = chatFor(currentApp);
        const question = [...s.transcript].reverse().find(turn => turn.role === "user")?.content || "";
        toTeam.disabled = true;
        sendFeedback({ kind: "question", fields: { question }, conversationId: s.conversationId }, error, toTeam);
      });
      drawMeta();
      queueMicrotask(() => message.focus());
      return [back(), meta, usageBox, log, composer, count, limitReached, el("div", { className: "support-chips" }, toTeam, toBug), error];
    }
  };

  let current = "home";
  async function show(name, args = {}) {
    if (!available()) name = "unavailable";
    current = name;
    writeState({ ...readState(), view: ["sent", "answer", "unavailable"].includes(name) ? "home" : name });
    view.dataset.view = name;
    try {
      const nodes = await VIEWS[name](args);
      if (current !== name) return;
      view.replaceChildren(...[nodes].flat().filter(Boolean));
      view.scrollTop = 0;
    } catch (error) {
      view.replaceChildren(back(), tr("p", "This could not load. Check your connection and try again.", "読み込めませんでした。接続を確認して、もう一度お試しください。", { className: "support-error" }));
      console.error(error);
    }
  }

  // ------------------------------------------------------------ app switcher
  function showApp(slug) {
    const entry = apps.find(item => item.slug === slug) || apps[0];
    closeShot();
    currentApp = entry.slug;
    panel.dataset.app = entry.slug;
    part("support-app-logo").src = logoFor(entry.slug);
    part("support-app-name").textContent = entry.name;
    for (const option of appList.children) option.setAttribute("aria-selected", String(option.dataset.slug === entry.slug));
    writeState({ ...readState(), app: entry.slug });
  }
  function toggleApps(open) {
    appList.hidden = !open;
    appButton.setAttribute("aria-expanded", String(open));
    if (!open) return;
    activate(appList.querySelector('[aria-selected="true"]') || appList.firstElementChild);
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
    if (signedIn) show("home");
  }

  const listing = await api("/apps");
  limits = { ...limits, ...listing.limits };
  apps = listing.apps;
  appList.replaceChildren(...apps.map(entry => {
    const option = el("li", { id: `support-app-${entry.slug}` },
      el("img", { src: logoFor(entry.slug), alt: "", width: 28, height: 28 }),
      el("span", {}, entry.name, entry.available ? null : tr("span", "Not available yet", "未対応", { className: "support-app-soon" })),
      el("span", { className: "support-app-check", innerHTML: ICON.check }));
    option.dataset.slug = entry.slug;
    option.setAttribute("role", "option");
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
  // A product page opens on its product, even one that is not available yet, so
  // it can say so; anywhere else, on the first app that is.
  const wanted = pageApp() || readState().app || "";
  showApp(apps.some(entry => entry.slug === wanted) ? wanted : (apps.find(entry => entry.available) || apps[0]).slug);

  // A new conversation for this app: the header's pencil.
  part("support-new").addEventListener("click", () => {
    saveChat(currentApp, { conversationId: "", transcript: [], turnsLeft: limits.turnsPerConversation });
    show("chat");
  });

  // ---------------------------------------------------------------- sign-in
  watchSignIn(panel, async user => {
    signedIn = Boolean(user);
    for (const node of panel.querySelectorAll("[data-signed-in-only]")) node.hidden = !user;
    if (!user) {
      toggleMenu(false);
      // The popup button shows at once; Google's own "Continue as" button
      // replaces it only once it has actually drawn.
      googleButton ||= renderGoogleButton(part("google-button"), { onError: text => showError(part("sign-in-error"), text) })
        .then(shown => {
          part("google-button").classList.remove("pending");
          part("sign-in").hidden = shown;
          return shown;
        });
      return;
    }
    try {
      const me = await api("/me");
      part("support-admin").hidden = !me.admin;
      usage = me.usage;
    } catch (error) {
      console.error(error);
    }
    const resume = readState().view;
    show(resume && VIEWS[resume] ? resume : "home");
  });
}
