(function () {
  "use strict";

  // Loaded synchronously from <head> so data-theme lands on <html> before the
  // first paint. Without that, a dark-mode visitor sees a flash of the light
  // palette on every navigation.
  var KEY = "dinalab-theme";
  var root = document.documentElement;
  var query = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function stored() {
    try {
      var value = localStorage.getItem(KEY);
      return value === "dark" || value === "light" ? value : null;
    } catch (error) {
      return null;
    }
  }

  function preferred() {
    return query && query.matches ? "dark" : "light";
  }

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    var buttons = document.querySelectorAll("[data-theme-toggle]");
    for (var i = 0; i < buttons.length; i += 1) {
      buttons[i].setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    }
  }

  apply(stored() || preferred());

  // Follow the OS while the visitor has not made an explicit choice.
  if (query) {
    var onSystemChange = function () {
      if (!stored()) apply(preferred());
    };
    if (query.addEventListener) query.addEventListener("change", onSystemChange);
    else if (query.addListener) query.addListener(onSystemChange);
  }

  function wire() {
    var buttons = document.querySelectorAll("[data-theme-toggle]");
    for (var i = 0; i < buttons.length; i += 1) {
      buttons[i].addEventListener("click", function () {
        var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        try {
          localStorage.setItem(KEY, next);
        } catch (error) {}
        apply(next);
      });
    }
    apply(root.getAttribute("data-theme"));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire);
  else wire();
})();
