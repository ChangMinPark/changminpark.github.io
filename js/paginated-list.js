(function () {
  function getParams() {
    try {
      return new URLSearchParams(window.location.search);
    } catch (e) {
      return { get: function () { return null; } };
    }
  }

  function getCategoryFromUrl() {
    return getParams().get("category") || "";
  }

  function getPageFromUrl() {
    var raw = parseInt(getParams().get("page") || "1", 10);
    return isNaN(raw) || raw < 1 ? 1 : raw;
  }

  function normalizeBasePath(path) {
    if (!path) return "/";
    return path.charAt(path.length - 1) === "/" ? path : path + "/";
  }

  function listUrl(basePath, category, page) {
    var params = [];
    if (category) params.push("category=" + encodeURIComponent(category));
    if (page && page > 1) params.push("page=" + page);
    return params.length ? basePath + "?" + params.join("&") : basePath;
  }

  function setActiveCategoryLinks(root, category) {
    var links = root.querySelectorAll(".list-filter-chip");
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      var linkCat = link.getAttribute("data-category") || "";
      if (linkCat === category) {
        link.classList.add("is-active");
      } else {
        link.classList.remove("is-active");
      }
    }
  }

  function pageWindow(current, total) {
    if (total <= 7) {
      var all = [];
      for (var i = 1; i <= total; i++) all.push(i);
      return all;
    }

    var pages = [1];
    var start = Math.max(2, current - 1);
    var end = Math.min(total - 1, current + 1);

    if (current <= 3) {
      start = 2;
      end = 4;
    }
    if (current >= total - 2) {
      start = total - 3;
      end = total - 1;
    }

    if (start > 2) pages.push("…");
    for (var p = start; p <= end; p++) pages.push(p);
    if (end < total - 1) pages.push("…");
    pages.push(total);
    return pages;
  }

  function initList(root) {
    var basePath = normalizeBasePath(root.getAttribute("data-base-path") || "/");
    var pageSize = parseInt(root.getAttribute("data-page-size") || "7", 10);
    var items = Array.prototype.slice.call(root.querySelectorAll(".paginated-list-item"));
    var pagination = root.querySelector(".list-pagination");
    var prevBtn = root.querySelector(".list-page-prev");
    var nextBtn = root.querySelector(".list-page-next");
    var numbersEl = root.querySelector(".list-page-numbers");
    var emptyMsg = root.querySelector(".list-empty-filter");
    var currentCategory = getCategoryFromUrl();
    var currentPage = getPageFromUrl();

    function rewritePostLinks() {
      var links = root.querySelectorAll("a.paginated-list-post-link");
      for (var i = 0; i < links.length; i++) {
        var a = links[i];
        var href = a.getAttribute("href") || "";
        var path = href;
        var hash = "";
        var hashIdx = path.indexOf("#");
        if (hashIdx !== -1) {
          hash = path.slice(hashIdx);
          path = path.slice(0, hashIdx);
        }
        var qIdx = path.indexOf("?");
        if (qIdx !== -1) path = path.slice(0, qIdx);
        if (currentCategory) {
          a.setAttribute("href", path + "?category=" + encodeURIComponent(currentCategory) + hash);
        } else {
          a.setAttribute("href", path + hash);
        }
      }
      try {
        sessionStorage.setItem("listCategory:" + basePath, currentCategory || "");
      } catch (e) {}
    }

    function matchingItems() {
      if (!currentCategory) return items;
      return items.filter(function (item) {
        var cats = (item.getAttribute("data-categories") || "")
          .split(",")
          .map(function (c) { return c.trim(); })
          .filter(Boolean);
        return cats.indexOf(currentCategory) !== -1;
      });
    }

    function syncUrl() {
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, "", listUrl(basePath, currentCategory, currentPage));
      }
    }

    function renderNumbers(totalPages) {
      if (!numbersEl) return;
      numbersEl.innerHTML = "";
      pageWindow(currentPage, totalPages).forEach(function (entry) {
        if (entry === "…") {
          var dots = document.createElement("span");
          dots.className = "list-page-ellipsis";
          dots.textContent = "…";
          numbersEl.appendChild(dots);
          return;
        }
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "list-page-num" + (entry === currentPage ? " is-active" : "");
        btn.textContent = String(entry);
        btn.setAttribute("aria-label", "Page " + entry);
        if (entry === currentPage) btn.setAttribute("aria-current", "page");
        btn.addEventListener("click", function () {
          currentPage = entry;
          syncUrl();
          render();
          root.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        numbersEl.appendChild(btn);
      });
    }

    function render() {
      var matched = matchingItems();
      var totalPages = Math.max(1, Math.ceil(matched.length / pageSize));
      if (currentPage > totalPages) currentPage = totalPages;
      if (currentPage < 1) currentPage = 1;

      items.forEach(function (item) {
        item.hidden = true;
        var hr = item.nextElementSibling;
        if (hr && hr.classList.contains("paginated-list-divider")) {
          hr.hidden = true;
          hr.classList.remove("is-last-visible");
        }
      });

      if (matched.length === 0) {
        if (pagination) pagination.hidden = true;
        if (emptyMsg) emptyMsg.hidden = false;
        setActiveCategoryLinks(root, currentCategory);
        rewritePostLinks();
        return;
      }

      if (emptyMsg) emptyMsg.hidden = true;

      var start = (currentPage - 1) * pageSize;
      var visible = matched.slice(start, start + pageSize);
      visible.forEach(function (item, index) {
        item.hidden = false;
        var hr = item.nextElementSibling;
        if (hr && hr.classList.contains("paginated-list-divider")) {
          hr.hidden = false;
          if (index === visible.length - 1) {
            hr.classList.add("is-last-visible");
          } else {
            hr.classList.remove("is-last-visible");
          }
        }
      });

      if (pagination) {
        pagination.hidden = matched.length <= pageSize;
      }
      renderNumbers(totalPages);
      if (prevBtn) prevBtn.disabled = currentPage <= 1;
      if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
      setActiveCategoryLinks(root, currentCategory);
      rewritePostLinks();
    }

    function applyCategory(category) {
      currentCategory = category || "";
      currentPage = 1;
      syncUrl();
      render();
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        if (currentPage > 1) {
          currentPage -= 1;
          syncUrl();
          render();
          root.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        var totalPages = Math.max(1, Math.ceil(matchingItems().length / pageSize));
        if (currentPage < totalPages) {
          currentPage += 1;
          syncUrl();
          render();
          root.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }

    root.addEventListener("click", function (e) {
      var target = e.target.closest(".list-filter-chip");
      if (!target || !root.contains(target)) return;
      e.preventDefault();
      applyCategory(target.getAttribute("data-category") || "");
    });

    render();
  }

  function boot() {
    var lists = document.querySelectorAll(".paginated-list");
    for (var i = 0; i < lists.length; i++) {
      initList(lists[i]);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
