// quarto-i18n reviewer mode. Plain browser code, no dependencies.
//
// Normal readers load only this small script; the per-page review data
// (<page>.tr.json) is fetched only when reviewer mode is on.
(function () {
  "use strict";

  var DATA_URL = null;
  var KEY = "quarto-i18n:";
  var data = null;
  var S = {};
  var openFor = null;

  // ---- storage (per-viewer conveniences only; never required) ---------------
  function load(k, dflt) {
    try {
      var v = window.localStorage.getItem(KEY + k);
      return v === null ? dflt : JSON.parse(v);
    } catch (e) {
      return dflt;
    }
  }
  // Returns false when the browser would not store it (private mode, quota, blocked).
  function save(k, v) {
    try {
      if (v === null) window.localStorage.removeItem(KEY + k);
      else window.localStorage.setItem(KEY + k, JSON.stringify(v));
      return true;
    } catch (e) {
      return false;
    }
  }

  // ---- helpers ----------------------------------------------------------------
  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    for (var k in attrs || {}) {
      if (k === "text") e.textContent = attrs[k];
      else if (k === "class") e.className = attrs[k];
      else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== null && attrs[k] !== undefined && attrs[k] !== false) e.setAttribute(k, attrs[k]);
    }
    (children || []).forEach(function (c) {
      if (c) e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return e;
  }
  // Strings with a count may be `one||other`.
  function fill(s, vars) {
    var forms = String(s).split("||");
    if (forms.length === 2 && typeof vars.n === "number") {
      var one = false;
      try { one = new Intl.PluralRules((data && data.lang) || "en").select(vars.n) === "one"; } catch (e) { one = vars.n === 1; }
      s = one ? forms[0] : forms[1];
    }
    return String(s).replace(/\{(\w+)\}/g, function (m, k) { return k in vars ? vars[k] : m; });
  }
  var ICON_GITHUB = '<svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>';
  // A fixed icon (never reader text) inside an element.
  function icon(svg) {
    var s = document.createElement("span");
    s.className = "tr-icon";
    s.innerHTML = svg;
    return s;
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  // Minimal, safe Markdown for display: code, bold, italic; everything escaped first.
  function md(s) {
    return escapeHtml(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/\n/g, " ");
  }
  function mdEl(tag, attrs, text) {
    var e = el(tag, attrs);
    e.innerHTML = md(text);
    return e;
  }
  function people(list) {
    return list.map(function (r) { return r.by.replace(/^gh:/, "@"); }).join(", ");
  }

  // ---- mode -------------------------------------------------------------------
  function reviewRequested() {
    // ?review=1 is remembered, so reviewer mode (and the tray) follows the reader to other pages.
    var q = new URLSearchParams(window.location.search).get("review");
    if (q === "1") save("review", true);
    if (q === "0") save("review", null);
    if (q === "1" || q === "0") return q === "1";
    return load("review", false) === true;
  }

  function setMode(on) {
    save("review", on ? true : null);
    var url = new URL(window.location.href);
    if (on) url.searchParams.set("review", "1");
    else url.searchParams.delete("review");
    try { window.history.replaceState(null, "", url); } catch (e) { /* file:// */ }
    if (on) start(true);
    else stop();
  }

  function toggleLinks() {
    document.querySelectorAll("a.tr-review-toggle").forEach(function (a) {
      a.addEventListener("click", function (ev) {
        ev.preventDefault();
        setMode(!document.body.classList.contains("tr-review-on"));
      });
    });
  }

  function updateToggleText() {
    var on = document.body.classList.contains("tr-review-on");
    document.querySelectorAll("a.tr-review-toggle").forEach(function (a) {
      var label = a.querySelector(".tr-toggle-text") || a;
      if (!a.dataset.label) a.dataset.label = label.textContent;
      label.textContent = on && S.exitReview ? S.exitReview : a.dataset.label;
      a.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  // ---- banner -----------------------------------------------------------------
  // In reviewer mode the banner's call to action becomes a thank-you to the
  // signed-in reviewer, with a link to how reviewing works.
  function updateBanner() {
    var on = document.body.classList.contains("tr-review-on");
    var me = load("login", null);
    var signed = !!(me && load("session", null));
    var reviewing = on && data && (signed || !data.service);
    document.querySelectorAll(".tr-banner").forEach(function (b) {
      var old = b.querySelector(".tr-banner-reviewing");
      if (old) old.parentNode.removeChild(old);
      var cta = b.querySelector(".tr-banner-cta");
      if (cta) cta.hidden = !!reviewing;
      if (!reviewing) return;
      var how = [S.reviewHow + " "];
      if (signed) how.push(S.reviewPr + " ");
      if (data.guide) how.push(el("a", { href: data.guide }, [S.reviewGuide]));
      var text = [
        el("strong", {}, [signed ? fill(S.reviewThanks, { login: "@" + me }) : S.reviewOn]),
        el("span", {}, how),
      ];
      if (signed) {
        text.push(el("span", { class: "tr-banner-signed" }, [
          fill(S.signedInAs, { login: "@" + me }) + " · ",
          el("button", { type: "button", class: "tr-banner-signout", onclick: signOut }, [S.signOut]),
        ]));
      }
      b.appendChild(el("div", { class: "tr-banner-cta tr-banner-reviewing" }, [
        signed ? el("img", { class: "tr-banner-me", src: "https://github.com/" + encodeURIComponent(me) + ".png?size=80", alt: "", width: "40", height: "40" }) : null,
        el("div", { class: "tr-banner-cta-text" }, text),
        el("a", { class: "tr-banner-button tr-banner-button-quiet", href: "?review=0", onclick: function (ev) { ev.preventDefault(); setMode(false); } }, [S.exitReview]),
      ]));
    });
  }

  // ---- units on the page ----------------------------------------------------
  var units = {};
  var targets = [];

  function findCell(u) {
    var c = document.querySelector('[data-tr-cell="' + CSS.escape(u.cell) + '"]');
    if (c) return c.closest(".cell") || c;
    var f = document.getElementById(u.cell);
    if (f && f.closest(".cell")) return f.closest(".cell");
    // Fall back to the cell whose code is this unit's text.
    var probe = (u.text || u.source).split("\n")[0];
    var cells = document.querySelectorAll(".cell");
    for (var i = 0; i < cells.length; i++) {
      var code = cells[i].querySelector("pre code");
      if (code && probe && code.textContent.indexOf(probe) !== -1) return cells[i];
    }
    return null;
  }

  function attach() {
    targets = [];
    data.units.forEach(function (u) { units[u.id] = u; });
    var found = {};
    document.querySelectorAll("main [data-tr-id], #title-block-header [data-tr-id]").forEach(function (node) {
      var u = units[node.getAttribute("data-tr-id")];
      if (u && !found[u.id]) {
        found[u.id] = true;
        targets.push({ node: node, unit: u });
      }
    });
    // Quarto moves a chapter's level-1 heading into the title block without its attributes.
    var h1 = document.querySelector("#title-block-header h1.title");
    var first = data.units.filter(function (u) { return u.heading === 1; })[0];
    if (h1 && first && !found[first.id]) {
      h1.setAttribute("data-tr-id", first.id);
      h1.setAttribute("data-tr-status", first.status);
      h1.setAttribute("data-tr-reviews", String(first.count));
      targets.push({ node: h1, unit: first });
    }
    data.units.filter(function (u) { return u.kind === "code"; }).forEach(function (u) {
      var cell = findCell(u);
      if (!cell) return;
      cell.setAttribute("data-tr-id", u.id);
      cell.setAttribute("data-tr-status", u.status);
      cell.setAttribute("data-tr-reviews", String(u.count));
      cell.classList.add("tr-block", "tr-cell");
      targets.push({ node: cell, unit: u });
    });
    targets.forEach(function (t) {
      var n = t.node;
      n.setAttribute("tabindex", "0");
      n.setAttribute("aria-haspopup", "dialog");
      n.classList.add("tr-reviewable");
      var badge = el("span", { class: "tr-badge", "data-tr-badge": "" }, [statusText(t.unit)]);
      n.insertBefore(badge, n.firstChild);
      n.addEventListener("click", onActivate);
      n.addEventListener("keydown", onKey);
    });
    refreshPendingMarks();
  }

  function detach() {
    targets.forEach(function (t) {
      var n = t.node;
      n.removeAttribute("tabindex");
      n.removeAttribute("aria-haspopup");
      n.classList.remove("tr-reviewable", "tr-pending");
      showEdit(t, null);
      var b = n.querySelector(":scope > [data-tr-badge]");
      if (b) b.remove();
      n.removeEventListener("click", onActivate);
      n.removeEventListener("keydown", onKey);
    });
    targets = [];
  }

  function statusText(u) {
    if (u.status === "reviewed") return fill(S.status_reviewed, { n: u.count }) + " (" + people(u.reviews) + ")";
    return S["status_" + u.status] || u.status;
  }

  function onKey(ev) {
    if (ev.target !== ev.currentTarget) return;
    if (ev.key === "Enter" || ev.key === " ") {
      ev.preventDefault();
      open(ev.currentTarget);
    }
  }
  function onActivate(ev) {
    // Innermost reviewable block only.
    if (ev.target.closest(".tr-reviewable") !== ev.currentTarget) return;
    if (ev.target.closest("a, button, input, textarea, .tr-pop")) return;
    if (window.getSelection && String(window.getSelection()).length) return;
    open(ev.currentTarget);
  }

  // ---- pending operations -----------------------------------------------------
  // One list per language for the whole site; each operation records its page,
  // so changes on several pages go into one pull request.
  //
  // An operation the service did not accept stays in the list with `held` (the
  // reason), so no work is lost: the reader can read why, try again or discard.
  // If the browser will not store the list, it is kept in memory for this page
  // and the reader is warned before leaving.
  var memPending = null;
  function pendingKey() { return "pending:" + data.lang; }
  function pendingAll() {
    if (memPending) return memPending.slice();
    var list = load(pendingKey(), []);
    if (!Array.isArray(list)) list = [];
    migrateOldKeys(list);
    return list;
  }
  // Earlier versions kept one list per page under "pending:<lang>:<file>".
  function migrateOldKeys(list) {
    try {
      var prefix = KEY + "pending:" + data.lang + ":";
      var old = [];
      for (var i = 0; i < window.localStorage.length; i++) {
        var k = window.localStorage.key(i);
        if (k && k.indexOf(prefix) === 0) old.push(k);
      }
      if (!old.length) return;
      old.forEach(function (k) {
        var file = k.slice(prefix.length);
        (JSON.parse(window.localStorage.getItem(k)) || []).forEach(function (op) {
          op.file = op.file || file;
          list.push(op);
        });
        window.localStorage.removeItem(k);
      });
      save(pendingKey(), list.length ? list : null);
    } catch (e) { /* storage unavailable */ }
  }
  function onThisPage(p) { return p.file === data.file; }
  function pending() { return pendingAll().filter(onThisPage); }
  function isHeld(p) { return !!p.held; }
  function isActive(p) { return !p.held; }
  function setPendingAll(list) {
    if (save(pendingKey(), list.length ? list : null)) memPending = null;
    else memPending = list.slice();
    refreshPendingMarks();
    renderTray();
  }
  window.addEventListener("beforeunload", function (ev) {
    if (memPending && memPending.length) { ev.preventDefault(); ev.returnValue = ""; }
  });
  // Another tab changed the list: show the same thing here.
  window.addEventListener("storage", function (ev) {
    if (data && ev.key === KEY + pendingKey()) { refreshPendingMarks(); renderTray(); }
    // Signed out in another tab: leave reviewer mode here too.
    if (ev.key === KEY + "login" && ev.newValue === null && document.body.classList.contains("tr-review-on")) setMode(false);
  });
  function addOp(op) {
    var list = pendingAll().filter(function (p) {
      if (!onThisPage(p) || p.id !== op.id) return true;
      if (op.op === "approve") return p.op !== "approve";
      return p.op !== "replace";
    });
    if (op.op === "replace") list = list.filter(function (p) { return !(onThisPage(p) && p.id === op.id && p.op === "approve"); });
    op.hash = units[op.id].hash;
    op.file = data.file;
    op.url = window.location.pathname;
    op.title = pageTitle();
    list.push(op);
    setPendingAll(list);
  }
  function pageTitle() {
    var h = document.querySelector("#title-block-header h1.title, main h1");
    if (!h) return document.title.trim();
    h = h.cloneNode(true);
    h.querySelectorAll("[data-tr-badge]").forEach(function (b) { b.remove(); });
    var t = h.querySelector(".chapter-title");
    return (t || h).textContent.replace(/\s+/g, " ").trim();
  }
  function refreshPendingMarks() {
    var here = pending();
    var ids = here.map(function (p) { return p.id; });
    targets.forEach(function (t) {
      t.node.classList.toggle("tr-pending", ids.indexOf(t.unit.id) !== -1);
      var edit = here.filter(function (p) { return p.op === "replace" && p.id === t.unit.id && !p.held; })[0];
      showEdit(t, edit && edit.text);
    });
  }

  // Word-level diff (LCS) between two strings, as safe HTML with <del>/<ins>.
  function diffHtml(a, b) {
    var x = a.split(/(\s+)/), y = b.split(/(\s+)/);
    if (x.length * y.length > 250000) return "<ins>" + escapeHtml(b) + "</ins>";
    var n = x.length, m = y.length, t = [], i, j;
    for (i = 0; i <= n; i++) t.push(new Array(m + 1).fill(0));
    for (i = n - 1; i >= 0; i--) for (j = m - 1; j >= 0; j--)
      t[i][j] = x[i] === y[j] ? t[i + 1][j + 1] + 1 : Math.max(t[i + 1][j], t[i][j + 1]);
    var out = [], del = "", ins = "";
    function flush() {
      if (del) out.push("<del>" + escapeHtml(del) + "</del>");
      if (ins) out.push("<ins>" + escapeHtml(ins) + "</ins>");
      del = ins = "";
    }
    i = 0; j = 0;
    while (i < n || j < m) {
      if (i < n && j < m && x[i] === y[j]) { flush(); out.push(escapeHtml(x[i])); i++; j++; }
      else if (j < m && (i === n || t[i][j + 1] >= t[i + 1][j])) ins += y[j++];
      else del += x[i++];
    }
    flush();
    return out.join("");
  }

  // Show a pending suggestion in place of the page's translation, as a diff
  // against the current translation. Only simple prose blocks are rewritten;
  // code cells keep the pending dot only.
  function showEdit(t, text) {
    var n = t.node, u = t.unit;
    var simple = u.kind !== "code" && u.text && !/\n\s*\n|^\s*([-*+]|\d+[.)])\s/m.test(u.text);
    if (t.orig) {
      var cur = n.querySelector(":scope > .tr-edited");
      if (cur) cur.remove();
      t.orig.forEach(function (c) { n.appendChild(c); });
      t.orig = null;
    }
    if (!text || !simple) return;
    var strip = function (s) { return s.replace(/^#{1,6}\s+/, "").replace(/\s*\{[^}]*\}\s*$/, ""); };
    var keep = function (c) {
      return c.nodeType === 1 && (c.matches("[data-tr-badge], .header-section-number") || c.matches("a.anchorjs-link, a.anchorlink"));
    };
    t.orig = Array.prototype.filter.call(n.childNodes, function (c) { return !keep(c); });
    t.orig.forEach(function (c) { n.removeChild(c); });
    var span = el("span", { class: "tr-edited" });
    span.innerHTML = diffHtml(strip(u.text), strip(text));
    n.appendChild(span);
  }
  // Pages with pending changes, this page first.
  function pendingPages(list) {
    var pages = [];
    var byFile = {};
    list.forEach(function (p) {
      if (!byFile[p.file]) {
        byFile[p.file] = { file: p.file, url: p.url, title: p.title || p.file, n: 0 };
        pages.push(byFile[p.file]);
      }
      byFile[p.file].n++;
      if (p.url) byFile[p.file].url = p.url;
      if (p.title) byFile[p.file].title = p.title;
    });
    return pages.sort(function (a, b) { return (b.file === data.file) - (a.file === data.file); });
  }

  // ---- popover --------------------------------------------------------------------
  var pop = null;

  function close() {
    if (!pop) return;
    pop.remove();
    pop = null;
    var n = openFor;
    openFor = null;
    if (n) {
      n.classList.remove("tr-open");
      n.focus({ preventScroll: true });
    }
  }

  function open(node) {
    close();
    var u = units[node.getAttribute("data-tr-id")];
    if (!u) return;
    openFor = node;
    node.classList.add("tr-open");
    var me = load("login", null);
    var mine = pending().filter(function (p) { return p.id === u.id; });
    var approved = me && u.reviews.some(function (r) { return r.by === "gh:" + me; });
    var current = u.status === "machine" || u.status === "reviewed";

    var titleId = "tr-pop-title-" + u.id;
    pop = el("div", { class: "tr-pop" + (u.kind === "code" ? " tr-pop-code" : ""), role: "dialog", "aria-labelledby": titleId });
    pop.addEventListener("keydown", function (ev) { if (ev.key === "Escape") close(); });

    pop.appendChild(el("div", { class: "tr-pop-head" }, [
      el("span", { id: titleId, class: "tr-pop-status tr-status-" + u.status }, [S["status_" + u.status] && u.status !== "reviewed" ? S["status_" + u.status] : fill(S.status_reviewed, { n: u.count })]),
      el("button", { type: "button", class: "tr-x", "aria-label": S.close, onclick: close }, ["×"]),
    ]));

    var body = el("div", { class: "tr-pop-body" });
    var block = u.kind === "code"
      ? function (cls, text, lang) { return el("pre", { class: "tr-code " + cls, lang: lang || null }, [text]); }
      : function (cls, text, lang) { return mdEl("blockquote", { class: cls, lang: lang || null }, text); };
    body.appendChild(el("div", { class: "tr-label" }, [S.source]));
    body.appendChild(block("tr-source", u.source, data.sourceLang));
    if (u.text) {
      body.appendChild(el("div", { class: "tr-label" }, [S.translation]));
      body.appendChild(block("tr-text", u.text));
    }
    if (u.previous) {
      body.appendChild(el("div", { class: "tr-label" }, [S.previous]));
      body.appendChild(block("tr-text tr-previous", u.previous));
    }
    body.appendChild(el("p", { class: "tr-reviewers" }, [u.reviews.length ? S.reviewedBy + " " + people(u.reviews) : S.notReviewed]));
    if (u.reason) body.appendChild(el("p", { class: "tr-reason" }, [u.reason]));
    var mineActive = mine.filter(isActive);
    if (mineActive.length) {
      body.appendChild(el("p", { class: "tr-mine" }, [fill(S.pending, { n: mineActive.length }) + ": " + mineActive.map(function (m) { return m.op; }).join(", ")]));
    }
    mine.filter(isHeld).forEach(function (m) {
      body.appendChild(el("p", { class: "tr-mine tr-held-note" }, [S.heldOne + " (" + (m.op === "approve" ? S.approve : S.suggest) + "): " + m.held]));
    });
    pop.appendChild(body);

    var actions = el("div", { class: "tr-actions" });
    var approveBtn = el("button", { type: "button", class: "btn btn-sm btn-primary", disabled: !current || approved || mineActive.some(function (m) { return m.op === "approve"; }) ? "" : null, onclick: function () { addOp({ op: "approve", id: u.id }); close(); } }, [S.approve]);
    var draft = mine.filter(function (m) { return m.op === "replace"; })[0];
    var suggestBtn = el("button", { type: "button", class: "btn btn-sm btn-outline-secondary", disabled: !current ? "" : null, onclick: function () { showEditor(u, body, actions, draft && draft.text); } }, [S.suggest]);
    actions.appendChild(approveBtn);
    actions.appendChild(suggestBtn);
    if (data.repo) {
      var dir = data.dir ? data.dir.replace(/\/?$/, "/") : "";
      actions.appendChild(el("a", { class: "tr-edit-gh", href: "https://github.com/" + data.repo + "/edit/main/" + dir + data.tfile, target: "_blank", rel: "noopener" }, ["GitHub"]));
    }
    pop.appendChild(actions);

    document.body.appendChild(pop);
    place(node);
    (approveBtn.disabled ? suggestBtn.disabled ? pop.querySelector(".tr-x") : suggestBtn : approveBtn).focus();
  }

  function showEditor(u, body, actions, draft) {
    var form = el("form", { class: "tr-editor" });
    // The whole unit is edited as text; for code, the whole cell. A pending or
    // held-back suggestion is the starting point, so it can be fixed, not retyped.
    var ta = el("textarea", { class: "form-control" + (u.kind === "code" ? " tr-code" : ""), rows: String(u.kind === "code" ? Math.min(20, (draft || u.text || u.source).split("\n").length + 1) : 4), "aria-label": S.translation, spellcheck: u.kind === "code" ? "false" : null });
    ta.value = draft || u.text || "";
    var fields = [{ input: ta, before: u.text || "" }];
    form.appendChild(ta);
    form.appendChild(el("div", { class: "tr-actions" }, [
      el("button", { type: "submit", class: "btn btn-sm btn-primary" }, [S.save]),
      el("button", { type: "button", class: "btn btn-sm btn-link", onclick: close }, [S.cancel]),
    ]));
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      fields.forEach(function (f) {
        var v = u.kind === "code" ? f.input.value.replace(/\s+$/, "") : f.input.value.trim();
        if (v && v !== f.before) addOp({ op: "replace", id: u.id, text: v });
      });
      close();
    });
    actions.replaceWith(form);
    fields[0].input.focus();
  }

  function place(node) {
    if (window.matchMedia("(max-width: 640px)").matches) {
      pop.classList.add("tr-sheet");
      return;
    }
    var r = node.getBoundingClientRect();
    var top = window.scrollY + r.bottom + 8;
    var left = Math.max(16, Math.min(window.scrollX + r.left, window.scrollX + document.documentElement.clientWidth - pop.offsetWidth - 16));
    pop.style.top = top + "px";
    pop.style.left = left + "px";
  }

  // ---- tray and submission -------------------------------------------------------
  var tray = null;

  var resultBox = null;

  function renderTray() {
    if (!document.body.classList.contains("tr-review-on")) return;
    if (!signedIn()) return showSignIn();
    var all = pendingAll();
    if (!tray) {
      tray = el("section", { class: "tr-tray", "aria-live": "polite", "aria-label": S.trayTitle });
      document.body.appendChild(tray);
    }
    tray.innerHTML = "";
    if (resultBox) tray.appendChild(resultBox);
    // Nothing to submit: the banner already shows who is reviewing, so no tray.
    tray.hidden = !all.length && !resultBox;
    if (!all.length) return;
    var list = all.filter(isActive);
    var held = all.filter(isHeld);
    if (!resultBox) tray.appendChild(trayHead(list));
    if (list.length) renderActive(list);
    if (held.length) renderHeld(held);
    if (memPending) tray.appendChild(el("p", { class: "tr-error", role: "alert" }, [S.noStorage]));
  }

  function avatar(size) {
    var me = load("login", null);
    if (!me) return null;
    return el("img", { class: "tr-tray-me", src: "https://github.com/" + encodeURIComponent(me) + ".png?size=" + size * 2, alt: "", width: String(size), height: String(size) });
  }

  // The reviewer and how much they have to submit.
  function trayHead(list) {
    var pages = pendingPages(list);
    var here = list.filter(onThisPage).length;
    var summary = pages.length > 1 ? fill(S.trayPages, { n: list.length, p: pages.length })
      : here ? fill(S.trayHere, { n: list.length }) : fill(S.trayOther, { n: list.length });
    return el("div", { class: "tr-tray-head" }, [
      avatar(36),
      el("div", { class: "tr-tray-who" }, [el("strong", {}, [S.trayTitle]), el("span", {}, [summary])]),
    ]);
  }

  function pageLink(p, text) {
    return p.file === data.file || !p.url ? el("span", {}, [text]) : el("a", { href: p.url + "?review=1" }, [text]);
  }

  // Changes the service did not accept, with the reason; nothing is thrown away
  // until the reader says so.
  function renderHeld(held) {
    var items = held.map(function (p) {
      return el("li", {}, [
        pageLink(p, (p.title || p.file) + " · " + (p.op === "approve" ? S.approve : S.suggest)),
        el("div", { class: "tr-held-reason" }, [p.held]),
        p.text ? el("pre", { class: "tr-held-text" }, [p.text]) : null,
      ]);
    });
    tray.appendChild(el("details", { class: "tr-tray-held", open: "" }, [
      el("summary", {}, [fill(S.held, { n: held.length })]),
      el("ul", {}, items),
      el("div", { class: "tr-held-actions" }, [
        el("button", { type: "button", class: "btn btn-sm btn-outline-secondary", onclick: function () {
          setPendingAll(pendingAll().map(function (p) { if (p.held) { delete p.held; } return p; }));
        } }, [S.retry]),
        el("button", { type: "button", class: "btn btn-sm btn-link", onclick: function () {
          if (!window.confirm(fill(S.discardHeldConfirm, { n: held.length }))) return;
          setPendingAll(pendingAll().filter(isActive));
        } }, [S.discardHeld]),
      ]),
    ]));
  }

  // One row per page: a bar of approvals (teal, as in the banner's "verified")
  // and better translations (blue, "human translated"), with the counts.
  function renderActive(list) {
    var pages = pendingPages(list);
    var rows = pages.map(function (pg) {
      var mine = list.filter(function (p) { return p.file === pg.file; });
      var approved = mine.filter(function (p) { return p.op === "approve"; }).length;
      var improved = mine.length - approved;
      var current = pg.file === data.file;
      var counts = [];
      if (approved) counts.push(fill(S.countApproved, { n: approved }));
      if (improved) counts.push(fill(S.countImproved, { n: improved }));
      var bar = el("span", { class: "tr-tray-bar", "aria-hidden": "true" }, [
        approved ? el("span", { "data-kind": "verified", style: "flex-grow:" + approved }) : null,
        improved ? el("span", { "data-kind": "human", style: "flex-grow:" + improved }) : null,
      ]);
      var countLine = [counts.join(" · ")];
      if (current && pages.length > 1) {
        countLine.push(" · ", el("button", { type: "button", class: "tr-tray-link", onclick: function () {
          setPendingAll(pendingAll().filter(function (p) { return !(onThisPage(p) && isActive(p)); }));
        } }, [S.clear]));
      }
      return el("li", { class: current ? "tr-tray-current" : null }, [
        el("div", { class: "tr-tray-page" }, [
          current || !pg.url
            ? el("span", { class: "tr-tray-title", "aria-current": current ? "page" : null }, [pg.title])
            : el("a", { class: "tr-tray-title", href: pg.url + "?review=1" }, [pg.title]),
          current ? el("span", { class: "tr-tray-tag" }, [S.thisPage]) : null,
        ]),
        bar,
        el("span", { class: "tr-tray-counts" }, countLine),
      ]);
    });
    tray.appendChild(el("ul", { class: "tr-tray-pages" }, rows));

    var submit = el("button", { type: "button", class: "tr-tray-submit", onclick: submitAll }, [icon(ICON_GITHUB), el("span", {}, [S.submit])]);
    if (!data.service) submit.disabled = true;
    tray.appendChild(el("div", { class: "tr-tray-foot" }, [
      submit,
      el("div", { class: "tr-tray-note" }, [
        el("span", {}, [S.submitNote]),
        el("button", { type: "button", class: "tr-tray-link", onclick: function () {
          if (pages.length > 1 && !window.confirm(fill(S.clearAllConfirm, { n: list.length, p: pages.length }))) return;
          setPendingAll(pendingAll().filter(isHeld));
        } }, [S.clearAll]),
      ]),
    ]));
  }

  // ---- GitHub sign-in (like giscus) -----------------------------------------------
  // The service sends the reader back with #verso-session=…&verso-login=… (a
  // fragment never reaches a server). The sealed session is all the page keeps.
  var signInError = null;

  function takeSessionFromUrl() {
    var h = window.location.hash;
    if (!/^#verso-(session|error)=/.test(h)) return;
    var q = new URLSearchParams(h.slice(1));
    if (q.get("verso-session")) {
      save("session", q.get("verso-session"));
      save("login", q.get("verso-login"));
    } else signInError = "denied";
    try {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    } catch (e) {
      window.location.hash = "";
    }
  }

  function serviceUrl(route) {
    var q = "repo=" + encodeURIComponent(data.repo || "") + "&dir=" + encodeURIComponent(data.dir || "");
    return data.service.replace(/\/$/, "") + route + "?" + q;
  }

  function signInHref() {
    return serviceUrl("/auth/login") + "&return=" + encodeURIComponent(window.location.href.split("#")[0]);
  }

  // A site without a PR service can still be reviewed locally; one with a service
  // asks for GitHub sign-in before the review starts, not when it is submitted.
  function signedIn() {
    return !data || !data.service || !!(load("login", null) && load("session", null));
  }

  // Disconnecting GitHub also ends reviewer mode. Pending changes are kept and
  // come back the next time the reader reviews and signs in.
  function signOut() {
    save("session", null);
    save("login", null);
    setMode(false);
  }

  // Shown instead of the review UI while signed out (sign-in cancelled, expired,
  // or signed out). Pending changes are kept and come back after signing in.
  function showSignIn() {
    if (!tray) {
      tray = el("section", { class: "tr-tray", "aria-live": "polite", "aria-label": S.trayTitle });
      document.body.appendChild(tray);
    }
    tray.hidden = false;
    tray.innerHTML = "";
    if (signInError) {
      tray.appendChild(el("p", { class: "tr-error", role: "alert" }, [S.signInDenied]));
      signInError = null;
    }
    tray.appendChild(el("div", { class: "tr-login" }, [
      el("a", { class: "btn btn-sm btn-dark", href: signInHref() }, [S.signIn]),
      el("small", { class: "tr-login-why" }, [" " + S.signInWhy]),
    ]));
  }

  var submitting = false;

  // Only what the service reports as done leaves the list. Anything else
  // (network failure, server error, a check that fails) keeps the reader's work.
  function submitAll() {
    if (submitting) return;
    if (!signedIn()) return renderTray();
    var sent = pendingAll().filter(isActive);
    if (!sent.length) return renderTray();
    submitting = true;
    resultBox = null;
    // Keep the card; only the button changes while the pull request opens.
    var button = tray.querySelector(".tr-tray-submit");
    if (button) {
      button.disabled = true;
      button.setAttribute("aria-busy", "true");
      button.lastChild.textContent = S.submitting;
    }
    fetch(serviceUrl("/api/submit"), {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + load("session", "") },
      body: JSON.stringify({
        repo: data.repo, lang: data.lang,
        ops: sent.map(function (p) { return { op: p.op, id: p.id, text: p.text, hash: p.hash, file: p.file }; }),
      }),
    })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, status: r.status, body: j || {} }; });
      })
      .then(function (res) {
        submitting = false;
        var b = res.body;
        if (b.session) save("session", b.session); // the service renewed the GitHub token
        if (res.status === 401 && b.signin) {
          // Signed out on GitHub's side (expired or revoked): sign in again; nothing is lost.
          save("session", null);
          detach();
          return renderTray();
        }
        var reported = b.applied || b.dropped || b.rejected;
        if (reported) reconcile(sent, b);
        if (res.ok && b.pr) return showResult(b);
        renderTray();
        // Everything was already in effect (a repeat of a submission whose answer was lost).
        var allDone = reported && !(b.rejected || []).length && (b.dropped || []).every(function (d) { return d.done; });
        if (allDone) return;
        var msg = (b.error || S.submitFailed) + (res.status ? " (" + res.status + ")" : "");
        tray.appendChild(el("p", { class: "tr-error", role: "alert" }, [msg + (reported ? "" : ". " + S.kept)]));
      })
      .catch(function () {
        submitting = false;
        renderTray();
        tray.appendChild(el("p", { class: "tr-error", role: "alert" }, [S.submitFailed + ". " + S.kept]));
      });
  }

  function opKey(file, op) { return [file, op.id, op.op, op.text || ""].join("\n"); }

  // Apply the service's answer to the current list (re-read, so changes made
  // meanwhile, here or in another tab, are kept).
  function reconcile(sent, r) {
    var outcome = {};
    (r.applied || []).forEach(function (o) { outcome[opKey(o.file, o)] = null; });
    (r.dropped || []).forEach(function (d) { outcome[opKey(d.file, d.op)] = d.done ? null : d.reason; });
    (r.rejected || []).forEach(function (d) { outcome[opKey(d.file, d.op)] = d.reason; });
    var wasSent = {};
    sent.forEach(function (p) { wasSent[opKey(p.file, p)] = true; });
    var next = [];
    pendingAll().forEach(function (p) {
      var k = opKey(p.file, p);
      if (!wasSent[k] || !(k in outcome)) return next.push(p);
      if (outcome[k] === null) return; // in the pull request, or already was
      p.held = outcome[k];
      next.push(p);
    });
    setPendingAll(next);
  }

  // A thank-you with the pull request; "Keep reviewing" puts the tray away.
  function showResult(r) {
    var me = load("login", null);
    var parts = String(S.submittedBody).split("{pr}");
    var body = [parts[0], el("a", { href: r.pr.url, target: "_blank", rel: "noopener" }, ["#" + r.pr.number])];
    if (parts.length > 1) body.push(parts[1]);
    resultBox = el("div", { class: "tr-result" }, [
      el("div", { class: "tr-tray-head" }, [
        avatar(36),
        el("div", { class: "tr-tray-who" }, [
          el("strong", {}, [me ? fill(S.submittedThanks, { login: "@" + me }) : S.submitted]),
          el("span", {}, body),
        ]),
      ]),
      el("div", { class: "tr-tray-foot tr-tray-foot-row" }, [
        el("a", { class: "tr-tray-submit", href: r.pr.url, target: "_blank", rel: "noopener" }, [icon(ICON_GITHUB), el("span", {}, [S.viewOnGitHub])]),
        el("button", { type: "button", class: "tr-tray-quiet", onclick: function () { resultBox = null; renderTray(); } }, [S.keepReviewing]),
      ]),
    ]);
    renderTray();
  }

  // ---- lifecycle --------------------------------------------------------------------
  // fromClick: the reader chose "Review this page" just now, so a signed-out
  // reader goes straight to GitHub and comes back here in reviewer mode.
  function start(fromClick) {
    document.body.classList.add("tr-review-on");
    var go = function () {
      updateToggleText();
      if (!signedIn()) {
        if (fromClick) return window.location.assign(signInHref());
        updateBanner();
        return renderTray();
      }
      attach();
      renderTray();
      updateBanner();
    };
    if (data) return go();
    fetch(DATA_URL)
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) {
        data = d;
        S = d.strings || {};
        go();
      })
      .catch(function (e) {
        document.body.classList.remove("tr-review-on");
        if (window.console) console.warn("quarto-i18n: reviewer mode unavailable", e);
      });
  }

  function stop() {
    close();
    detach();
    document.body.classList.remove("tr-review-on");
    if (tray) tray.hidden = true;
    updateToggleText();
    updateBanner();
  }

  document.addEventListener("keydown", function (ev) { if (ev.key === "Escape") close(); });
  document.addEventListener("click", function (ev) {
    // composedPath() is fixed at dispatch time, so it still holds a button that was replaced.
    var path = ev.composedPath ? ev.composedPath() : [ev.target];
    if (pop && path.indexOf(pop) === -1 && !(openFor && path.indexOf(openFor) !== -1)) close();
  });

  function init() {
    // The script loads in <head>; the review-data pointer is read once the page is parsed.
    var meta = document.querySelector('meta[name="i18n-review-data"]');
    if (!meta) return;
    takeSessionFromUrl();
    DATA_URL = meta.getAttribute("content");
    toggleLinks();
    if (reviewRequested()) start();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
