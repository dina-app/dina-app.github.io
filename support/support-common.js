// Sign-in and API access shared by the chat and the inbox. Google accounts only;
// every API call carries the Firebase ID token, and the server checks it.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithCredential, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Public web config: these values identify the project, they grant nothing.
// authDomain can become "dina.jp" (so the Google window names dina.jp) only once
// https://dina.jp/__/auth/handler is an authorized redirect URI on the OAuth
// client; until then Google answers redirect_uri_mismatch and nobody can sign in.
const app = initializeApp({
  apiKey: "AIzaSyDO2r_ogyrHlJIOe8PEzpB0AoViWBY9zqs",
  authDomain: "gen-lang-client-0492217856.firebaseapp.com",
  projectId: "gen-lang-client-0492217856"
});
export const auth = getAuth(app);

// The OAuth web client Firebase's Google provider uses. Google Identity Services
// signs in with the same client, so its ID token is one Firebase accepts.
const GOOGLE_CLIENT_ID = "168722585380-ugkjplplf1fj6aivtnj5aloalefea7eu.apps.googleusercontent.com";

export const lang = () => (document.documentElement.lang === "ja" ? "ja" : "en");

// A node the language toggle can switch later: page-language.js swaps every
// element carrying both attributes, including ones added after it ran.
export function bi(node, en, ja) {
  node.setAttribute("data-en", en);
  node.setAttribute("data-ja", ja);
  node.textContent = lang() === "ja" ? ja : en;
  return node;
}

export function showError(node, message) {
  node.hidden = !message;
  node.textContent = message || "";
}

export async function api(path, { method = "GET", body } = {}) {
  const user = auth.currentUser;
  const headers = { "Content-Type": "application/json" };
  if (user) headers.Authorization = `Bearer ${await user.getIdToken()}`;
  const response = await fetch(`/api/support${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status}).`);
  return data;
}

// Wires the sign-in and sign-out buttons inside `root` and calls back with the
// user or null. The panel and the inbox mark their parts with data attributes,
// so each can have its own copy on one page without clashing ids. Parts a view
// does not have (the inbox shows no photo) are skipped.
export function watchSignIn(root, onChange) {
  const part = name => root.querySelector(`[data-${name}]`);
  const signInError = part("sign-in-error");
  part("sign-in").addEventListener("click", async () => {
    showError(signInError, "");
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user" || error.code === "auth/cancelled-popup-request") return;
      showError(signInError, error.code === "auth/popup-blocked"
        ? (lang() === "ja" ? "ポップアップがブロックされました。このサイトのポップアップを許可して、もう一度お試しください。" : "The sign-in window was blocked. Allow pop-ups for this site and try again.")
        : error.message);
    }
  });
  part("sign-out").addEventListener("click", () => signOut(auth));
  onAuthStateChanged(auth, user => {
    part("signed-out").hidden = Boolean(user);
    part("signed-in").hidden = !user;
    const email = part("user-email");
    if (email) email.textContent = user?.email || "";
    const name = part("user-name");
    if (name) name.textContent = user?.displayName || "";
    const photo = part("user-photo");
    if (photo) {
      photo.hidden = !user?.photoURL;
      if (user?.photoURL) photo.src = user.photoURL;
    }
    const initial = part("user-initial");
    if (initial) {
      initial.hidden = Boolean(user?.photoURL);
      initial.textContent = (user?.displayName || user?.email || "?").trim().charAt(0).toUpperCase();
    }
    onChange(user);
  });
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const found = document.querySelector(`script[src="${src}"]`);
    if (found?.dataset.loaded) return resolve();
    const script = found || Object.assign(document.createElement("script"), { src, async: true });
    script.addEventListener("load", () => { script.dataset.loaded = "1"; resolve(); }, { once: true });
    script.addEventListener("error", reject, { once: true });
    if (!found) document.head.append(script);
  });
}

// Google's own button, which reads the account already signed in to the browser
// and offers "Continue as <name>". It only works on a site listed as an
// Authorized JavaScript origin on GOOGLE_CLIENT_ID; anywhere else Google answers
// 403 and draws the button's frame at 0x0. That is the signal: resolves true
// when the button came up, false when it did not, and the caller keeps its own
// popup button for that case.
export async function renderGoogleButton(container, { onError } = {}) {
  try {
    await loadScript("https://accounts.google.com/gsi/client");
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async ({ credential }) => {
        try { await signInWithCredential(auth, GoogleAuthProvider.credential(credential)); }
        catch (error) { onError?.(error.message); }
      },
      context: "signin",
      ux_mode: "popup",
      itp_support: true
    });
    window.google.accounts.id.renderButton(container, {
      type: "standard", theme: "outline", size: "large", shape: "pill",
      text: "continue_with", logo_alignment: "left",
      width: Math.min(320, Math.max(200, container.clientWidth || 280)),
      locale: lang() === "ja" ? "ja" : "en"
    });
    for (let waited = 0; waited < 5000; waited += 250) {
      await new Promise(done => setTimeout(done, 250));
      if (container.querySelector("iframe")?.offsetWidth > 0) return true;
    }
  } catch (_error) {
    // The script could not load (blocked, offline): the popup button stays.
  }
  container.replaceChildren();
  return false;
}
