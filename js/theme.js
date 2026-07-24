(function () {
  var STORAGE_KEY = "theme";

  function isDark() {
    return document.documentElement.classList.contains("theme-dark");
  }

  function applyTheme(theme) {
    var dark = theme === "dark";
    document.documentElement.classList.toggle("theme-dark", dark);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {}

    var meta = document.getElementById("theme-color-meta");
    if (meta) {
      meta.setAttribute("content", dark ? "#121212" : "#ffffff");
    }

    var toggle = document.getElementById("theme-toggle");
    if (toggle) {
      toggle.setAttribute("aria-pressed", dark ? "true" : "false");
      toggle.classList.toggle("is-dark", dark);
      var nextLabel = dark ? "Switch to light mode" : "Switch to dark mode";
      toggle.setAttribute("aria-label", nextLabel);
      toggle.setAttribute("title", nextLabel);
    }
  }

  function currentTheme() {
    return isDark() ? "dark" : "light";
  }

  function toggleTheme() {
    applyTheme(isDark() ? "light" : "dark");
  }

  function init() {
    // Sync UI with class already set by the head script (or default).
    applyTheme(currentTheme());

    var toggle = document.getElementById("theme-toggle");
    if (toggle) {
      toggle.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        toggleTheme();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
