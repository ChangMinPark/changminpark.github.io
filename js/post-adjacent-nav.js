(function () {
  function getParams() {
    try {
      return new URLSearchParams(window.location.search);
    } catch (e) {
      return { get: function () { return null; } };
    }
  }

  function normalizePath(path) {
    if (!path) return "/";
    try {
      path = new URL(path, window.location.origin).pathname;
    } catch (e) {}
    if (path.length > 1 && path.charAt(path.length - 1) === "/") {
      path = path.slice(0, -1);
    }
    return path || "/";
  }

  function withCategory(url, category) {
    var path = url;
    var hash = "";
    var hashIdx = path.indexOf("#");
    if (hashIdx !== -1) {
      hash = path.slice(hashIdx);
      path = path.slice(0, hashIdx);
    }
    var qIdx = path.indexOf("?");
    if (qIdx !== -1) path = path.slice(0, qIdx);
    if (category) {
      return path + "?category=" + encodeURIComponent(category) + hash;
    }
    return path + hash;
  }

  function listUrl(listPath, category) {
    var path = listPath || "/writing/";
    if (category) return path + "?category=" + encodeURIComponent(category);
    return path;
  }

  function readIndex() {
    var el = document.getElementById("post-nav-index");
    if (!el) return null;
    try {
      return JSON.parse(el.textContent);
    } catch (e) {
      return null;
    }
  }

  function emptySlot(sideClass) {
    var span = document.createElement("span");
    span.className = "post-adjacent__link " + sideClass + " post-adjacent__link--empty";
    span.setAttribute("aria-hidden", "true");
    return span;
  }

  function fillLink(el, sideClass, post, category, dirLabel) {
    var link = el;
    if (!link || link.tagName !== "A") {
      link = document.createElement("a");
      link.className = "post-adjacent__link " + sideClass;
      link.innerHTML =
        '<span class="post-adjacent__dir"></span><span class="post-adjacent__title"></span>';
      if (el) el.replaceWith(link);
    }
    link.classList.remove("post-adjacent__link--empty");
    link.href = withCategory(post.url, category);
    link.removeAttribute("rel");
    link.querySelector(".post-adjacent__dir").textContent = dirLabel;
    link.querySelector(".post-adjacent__title").textContent = post.title;
    return link;
  }

  function updateCategoryChip(nav, listPath, category) {
    var chip = nav.querySelector(".post-adjacent__category");
    if (!chip) {
      chip = document.createElement("a");
      chip.className = "post-adjacent__category";
      chip.innerHTML =
        '<span class="post-adjacent__category-label">Category</span>' +
        '<span class="post-adjacent__category-value"></span>';
      var older = nav.querySelector(".post-adjacent__link--older");
      if (older) nav.insertBefore(chip, older);
      else nav.appendChild(chip);
    }
    var valueEl = chip.querySelector(".post-adjacent__category-value");
    if (valueEl) valueEl.textContent = category || "All";
    chip.href = listUrl(listPath, category);
    chip.setAttribute("aria-label", "Back to list: " + (category || "All"));
  }

  function resolveCategory(index) {
    var storageKey = "listCategory:" + (index.listPath || "/writing/");
    var category = getParams().get("category") || "";
    if (category) {
      try { sessionStorage.setItem(storageKey, category); } catch (e) {}
      return category;
    }
    try {
      return sessionStorage.getItem(storageKey) || "";
    } catch (e) {
      return "";
    }
  }

  function boot() {
    var index = readIndex();
    if (!index || !index.posts || !index.posts.length) return;

    var listPath = index.listPath || "/writing/";
    var category = resolveCategory(index);

    var nav = document.querySelector(".post-adjacent");
    if (!nav) return;

    updateCategoryChip(nav, listPath, category);

    // No active category → keep server-rendered all-list neighbors
    if (!category) {
      return;
    }

    var posts = index.posts.filter(function (p) {
      return (p.categories || []).indexOf(category) !== -1;
    });
    if (!posts.length) return;

    var currentPath = normalizePath(window.location.pathname);
    var idx = -1;
    for (var i = 0; i < posts.length; i++) {
      if (normalizePath(posts[i].url) === currentPath) {
        idx = i;
        break;
      }
    }
    if (idx === -1) return;

    // newest-first: newer = idx-1, older = idx+1
    // left = Newer, right = Older (same direction as scrolling the list)
    var newerPost = idx > 0 ? posts[idx - 1] : null;
    var olderPost = idx < posts.length - 1 ? posts[idx + 1] : null;

    var newerEl = nav.querySelector(".post-adjacent__link--newer");
    var olderEl = nav.querySelector(".post-adjacent__link--older");

    if (newerPost) {
      fillLink(newerEl, "post-adjacent__link--newer", newerPost, category, "← Newer");
    } else if (newerEl) {
      newerEl.replaceWith(emptySlot("post-adjacent__link--newer"));
    } else {
      nav.insertBefore(emptySlot("post-adjacent__link--newer"), nav.firstChild);
    }

    olderEl = nav.querySelector(".post-adjacent__link--older");
    if (olderPost) {
      fillLink(olderEl, "post-adjacent__link--older", olderPost, category, "Older →");
    } else if (olderEl) {
      olderEl.replaceWith(emptySlot("post-adjacent__link--older"));
    } else {
      nav.appendChild(emptySlot("post-adjacent__link--older"));
    }

    updateCategoryChip(nav, listPath, category);

    if (!getParams().get("category") && category && window.history && window.history.replaceState) {
      window.history.replaceState({}, "", withCategory(window.location.pathname, category));
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
