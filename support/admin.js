import { api, bi, showError, watchSignIn } from "./support-common.js";

const el = id => document.getElementById(id);
const STATUSES = [["new", "New", "新規"], ["triaged", "Triaged", "確認済み"], ["done", "Done", "完了"], ["wontfix", "Won't fix", "対応しない"]];
const KINDS = { bug: ["Bug", "不具合"], idea: ["Idea", "要望"], question: ["Question", "質問"], praise: ["Praise", "感想"], other: ["Other", "その他"] };
let appNames = { general: "DinaLab in general" };

for (const [value, en, ja] of STATUSES) el("filter-status").add(bi(new Option(en, value), en, ja));

async function loadApps() {
  const { apps } = await api("/apps");
  for (const entry of apps) { el("filter-app").add(new Option(entry.name, entry.slug)); appNames[entry.slug] = entry.name; }
}

function card(item) {
  const li = document.createElement("li");
  const meta = document.createElement("div");
  meta.className = "meta";
  const kind = bi(document.createElement("span"), ...(KINDS[item.kind] || KINDS.other));
  kind.className = "kind";
  const when = document.createElement("span");
  when.textContent = item.createdAt ? new Date(item.createdAt).toLocaleString() : "";
  const who = document.createElement("span");
  who.textContent = `${item.name || ""} <${item.email}>`;
  const app = document.createElement("span");
  app.textContent = appNames[item.app] || item.app;
  const status = document.createElement("select");
  status.setAttribute("aria-label", "Status");
  for (const [value, en, ja] of STATUSES) status.add(bi(new Option(en, value), en, ja));
  status.value = item.status;
  status.addEventListener("change", async () => {
    status.disabled = true;
    try { await api(`/admin/feedback/${encodeURIComponent(item.id)}`, { method: "PATCH", body: { status: status.value } }); }
    catch (error) { status.value = item.status; showError(el("chat-error"), error.message); }
    finally { status.disabled = false; }
  });
  meta.append(kind, app, who, when, status);
  const title = document.createElement("h3");
  title.textContent = item.summary;
  const details = document.createElement("p");
  details.className = "details";
  details.textContent = item.details;
  const convo = document.createElement("details");
  convo.append(bi(document.createElement("summary"), `Conversation (${(item.conversation || []).length}) · ${item.id}`, `会話 (${(item.conversation || []).length}) · ${item.id}`));
  for (const turn of item.conversation || []) {
    const line = document.createElement("p");
    line.textContent = `${turn.role === "user" ? "User" : "Assistant"}: ${turn.content}`;
    convo.append(line);
  }
  li.append(meta, title, details, convo);
  return li;
}

async function load() {
  showError(el("chat-error"), "");
  const query = new URLSearchParams();
  if (el("filter-app").value) query.set("app", el("filter-app").value);
  if (el("filter-status").value) query.set("status", el("filter-status").value);
  try {
    const { feedback } = await api(`/admin/feedback?${query}`);
    el("inbox").replaceChildren(...feedback.map(card));
    bi(el("summary"), `${feedback.length} items`, `${feedback.length} 件`);
  } catch (error) {
    el("inbox").replaceChildren();
    el("summary").textContent = "";
    showError(el("chat-error"), error.message);
  }
}

el("filter-app").addEventListener("change", load);
el("filter-status").addEventListener("change", load);
const appsLoaded = loadApps().catch(() => {});
watchSignIn(user => { if (user) appsLoaded.then(load); });
