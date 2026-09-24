// Sign-in and API access shared by the chat and the inbox. Google accounts only;
// every API call carries the Firebase ID token, and the server checks it.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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
// so each can have its own copy on one page without clashing ids.
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
    part("user-email").textContent = user?.email || "";
    onChange(user);
  });
}
