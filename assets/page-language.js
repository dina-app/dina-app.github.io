(function () {
  "use strict";

  var KEY = "dinalab-lang";
  var root = document.documentElement;
  var toggle = document.querySelector("[data-language-toggle]");
  var label = toggle ? toggle.querySelector(".lang-label") : null;

  function readLang() {
    try { return localStorage.getItem(KEY) === "ja" ? "ja" : "en"; }
    catch (error) { return "en"; }
  }

  function apply(lang) {
    var selected = lang === "ja" ? "ja" : "en";
    root.lang = selected;
    document.querySelectorAll("[data-en][data-ja]").forEach(function (node) {
      node.textContent = node.getAttribute(selected === "en" ? "data-en" : "data-ja");
    });
    document.querySelectorAll("[data-aria-en][data-aria-ja]").forEach(function (node) {
      node.setAttribute("aria-label", node.getAttribute(selected === "en" ? "data-aria-en" : "data-aria-ja"));
    });
    document.querySelectorAll("[data-content-en][data-content-ja]").forEach(function (node) {
      node.setAttribute("content", node.getAttribute(selected === "en" ? "data-content-en" : "data-content-ja"));
    });
    var title = root.getAttribute(selected === "en" ? "data-title-en" : "data-title-ja");
    if (title) document.title = title;
    if (label) label.textContent = selected === "en" ? "日本語" : "English";
    try { localStorage.setItem(KEY, selected); } catch (error) {}
  }

  if (toggle) toggle.addEventListener("click", function () {
    apply(readLang() === "en" ? "ja" : "en");
  });
  apply(readLang());
})();
