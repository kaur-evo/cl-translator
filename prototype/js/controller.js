/* ============================================================
   CONTROLLER
   Wires the flow: add a language → review & edit the AI-seeded
   translation in one long field list → save. Talks to Model + View.
   ============================================================ */
(function () {
  const $ = (sel) => document.querySelector(sel);

  const els = {
    base:     $("#view-base"),
    review:   $("#view-review"),
    ovReview: $("#ov-review"),
    ovAdd:    $("#ov-add"),
    ovTask:   $("#ov-task"),
    console:  $("#console"),
    conTab:   $("#console-tab"),
  };

  // Transient flow state
  let pendingLang = null;   // language chosen in the add overlay, not yet confirmed
  let currentLang = null;   // language being reviewed
  let lastLang = null;      // last language translated (for "run on full list")

  // Where translations run: the local node proxy serves the app on :8787;
  // anywhere else (e.g. GitHub Pages) is static, so "real" uses the direct
  // browser backend with a viewer-supplied key.
  const HAS_PROXY = location.port === "8787";
  const KEY_STORE = "anthropic_key"; // sessionStorage only — never persisted

  // Console state — models are hot-swappable, runs accumulate.
  const con = {
    translateModel: "claude-haiku-4-5",
    reviewModel: "claude-opus-4-8",
    review: true,
    mock: true,   // default: fake local translation, no proxy/key/cost. Flip to real to call Claude.
    runs: [],     // { language, log, stats }
    busy: false,
  };
  function renderConsole() {
    View.renderConsole(els.console, {
      ...con,
      needKey: !HAS_PROXY,                                  // static hosting → viewer's own key
      hasKey: !!sessionStorage.getItem(KEY_STORE),
    });
    // keep the live run's log scrolled to the latest line
    const liveLog = els.console.querySelector(".run.is-running .run-log");
    if (liveLog) liveLog.scrollTop = liveLog.scrollHeight;
  }
  function openConsole() { els.console.hidden = false; els.conTab.hidden = true; }
  function closeConsole() { els.console.hidden = true; els.conTab.hidden = false; }

  /* ---------- View 1: base editor (always visible under the modals) ---------- */
  function showBase() {
    View.renderBase(els.base, Model.getLanguages(), Model.getTasks());
  }

  /* ---------- View 2: review & edit — a modal over the base view ----------
     After a translation the add-language dialog morphs into this modal in the
     same scope; reopening a language (pencil) shows it as a modal again. */
  function showReview(lang) {
    currentLang = lang;
    View.renderReview(els.review, lang, Model.getTasks());
    els.ovReview.hidden = false;
    // size each field to its content so pre-filled long strings wrap to 2+ lines
    els.review.querySelectorAll(".edit-field textarea").forEach(autoGrow);
    els.review.scrollTop = 0;
  }
  function closeReview() {
    els.ovReview.hidden = true;
    currentLang = null;
    showBase(); // refresh dots / warning banner after any edits
  }

  /* Write the review fields back into the model. An emptied field CLEARS its
     translation (making it "missing" → orange, re-translatable); anything else
     is stored as the admin's manual edit. */
  function syncReviewToModel(lang) {
    els.review.querySelectorAll(".edit-field textarea").forEach(ta => {
      const v = ta.value.trim();
      Model.setFieldTranslation(lang.name, ta.dataset.field, v === "" ? null : v);
    });
  }

  /* ---------- Overlay: add a language ---------- */
  function openAddOverlay() {
    pendingLang = null;
    View.renderAddOverlay(els.ovAdd, Model.getAvailable());
    els.ovAdd.hidden = false;
  }
  function closeOverlay() {
    els.ovAdd.hidden = true;
  }

  /* ---------- Overlay: add a task ---------- */
  function openTaskOverlay() {
    View.renderTaskOverlay(els.ovTask);
    els.ovTask.hidden = false;
    const inp = els.ovTask.querySelector("#task-q");
    if (inp) inp.focus();
  }
  function closeTaskOverlay() {
    els.ovTask.hidden = true;
  }

  /* ---------- Loading state on a CTA (Figma 46051:3919) ----------
     The button keeps its icon + label, drops to the disabled look
     (black-12% fill at 25% opacity), and a loader spins AFTER the text. */
  function setLoading(btn, on) {
    if (!btn) return;
    if (on) {
      btn.disabled = true;
      btn.classList.add("is-loading");
      if (!btn.querySelector(".btn-loader")) {
        btn.insertAdjacentHTML("beforeend",
          `<span class="btn-loader" aria-hidden="true"><span class="spinner"></span></span>`);
      }
    } else {
      btn.disabled = false;
      btn.classList.remove("is-loading");
      const l = btn.querySelector(".btn-loader");
      if (l) l.remove();
    }
  }

  /* ---------- Real AI translation via the local proxy (NDJSON stream) ----------
     onlyMissing: translate just the untranslated strings (review re-translate);
     otherwise translate everything. Log lines stream into the console live. */
  async function runTranslation(lang, onlyMissing) {
    // Ordered, TYPED fields: [{key, text, kind}] — the translator is told what
    // each string is (question / unit / option / …) and the checklist
    // description is always the last entry. See translator/TRANSLATION-GUIDE.md.
    const fields = onlyMissing
      ? Model.collectMissingFields(lang.name)
      : Model.collectBaseFields();
    if (fields.length === 0) return; // nothing missing — no-op

    // Open the console and push a live run that grows as lines arrive.
    openConsole();
    const run = { language: lang.name, log: [], stats: null, running: true };
    con.runs.push(run);
    renderConsole();

    // Mock mode: fabricate a translation locally. No proxy, no key, no cost.
    if (con.mock) { await mockRun(lang, fields, run); return; }

    // Static hosting (e.g. GitHub Pages): no proxy exists, so call the
    // Anthropic API directly from the browser with the viewer's own key
    // (pasted in the console, kept in sessionStorage only).
    if (!HAS_PROXY) {
      const key = sessionStorage.getItem(KEY_STORE) || "";
      try {
        if (!key) throw new Error("No API key set. Open the console (top right), paste your Anthropic API key (kept only in this browser session), or switch Translation to mock.");
        const out = await DirectBackend.run(lang.name, fields,
          { key, translateModel: con.translateModel, reviewModel: con.reviewModel, review: con.review },
          (line) => { run.log.push(line); renderConsole(); });
        run.stats = out.stats;
        Model.applyTranslation(lang.name, out.strings);
        lastLang = lang;
        if (out.error) throw new Error(out.error);
        return;
      } catch (e) {
        run.log.push(`❌ ${e.message}`);
        throw e;
      } finally {
        run.running = false;
        renderConsole();
      }
    }

    const res = await fetch("/translate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        language: lang.name,
        fields,
        translateModel: con.translateModel,
        reviewModel: con.reviewModel,
        review: con.review,
      }),
    });

    // Read the NDJSON stream line by line.
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "", finalError = null;
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let nl;
      while ((nl = buf.indexOf("\n")) !== -1) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line) continue;
        let msg; try { msg = JSON.parse(line); } catch { continue; }
        if (msg.type === "log") {
          run.log.push(msg.line);
          renderConsole();
        } else if (msg.type === "result") {
          run.stats = msg.stats;
          run.running = false;
          Model.applyTranslation(lang.name, msg.strings); // merges; edits kept
          lastLang = lang;
          renderConsole();
        } else if (msg.type === "error") {
          // apply whatever partial strings did come back (rest stay missing)
          if (msg.strings) Model.applyTranslation(lang.name, msg.strings);
          if (msg.stats) run.stats = msg.stats;
          run.running = false;
          renderConsole();
          finalError = msg.error || "translation failed";
        }
      }
    }
    run.running = false;
    renderConsole();
    if (finalError) throw new Error(finalError);
  }

  /* ---------- Mock translation (no API) ----------
     Produces a fake but structurally-correct result so the whole flow works
     offline: fields fill, console logs stream, stats show zero cost. Each
     string is prefixed with the language code so it's visibly a placeholder. */
  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  async function mockRun(lang, fields, run) {
    const t0 = performance.now();

    const push = (line) => { run.log.push(line); renderConsole(); };
    push(`🧪 MOCK run · no API call`);
    push(`🌍 Translating ${fields.length} string(s) → ${lang.name}`);
    await delay(250);
    push(`   translate: ${con.translateModel} (mock)` + (con.review ? ` · review: ${con.reviewModel} (mock)` : " · review: off"));
    await delay(400);

    // Fake translation: echo the source string unchanged (no lang prefix).
    const out = {};
    fields.forEach(f => { out[f.key] = f.text; });

    push(`✅ Translated ${fields.length} string(s)`);
    if (con.review) { await delay(300); push(`🔍 Reviewing with ${con.reviewModel} (mock)…`); push(`✅ Review: no changes needed`); }

    const seconds = Math.round((performance.now() - t0) / 100) / 10;
    push(`⏱  ${seconds}s · 0 tokens · $0.0000 (mock)`);

    run.stats = {
      translateModel: con.translateModel,
      reviewModel: con.review ? con.reviewModel : null,
      review: con.review,
      inputTokens: 0, outputTokens: 0, costUsd: 0, seconds,
    };
    run.running = false;
    Model.applyTranslation(lang.name, out);
    lastLang = lang;
    renderConsole();
  }

  // Translate, showing a spinner on `btn`, then open the review on success.
  async function translateAndReview(lang, btn, onlyMissing) {
    setLoading(btn, true);
    try {
      await runTranslation(lang, onlyMissing);
      if (btn === els.ovAdd.querySelector('[data-action="do-translate"]')) closeOverlay();
      showReview(lang);
    } catch (e) {
      alert(`Could not translate into ${lang.name}.\n\n${e.message}\n\n` +
            `Is the proxy running with ANTHROPIC_API_KEY set? (node proxy.js)`);
    } finally {
      setLoading(btn, false);
    }
  }

  /* ---------- Global click delegation ---------- */
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-action]");

    // Backdrop click closes whichever overlay was clicked
    if (e.target.classList.contains("overlay")) {
      closeOverlay(); closeTaskOverlay();
      if (e.target === els.ovReview) closeReview(); // = cancel, edits discarded
      return;
    }

    if (!t) {
      // clicking elsewhere closes the language dropdown
      const menu = els.ovAdd.querySelector(".dd-menu");
      if (menu && !menu.hidden) menu.hidden = true;
      return;
    }

    switch (t.dataset.action) {
      case "add-trans":
        openAddOverlay();
        break;

      case "add-task":
        openTaskOverlay();
        break;

      case "save-task": {
        const inp = els.ovTask.querySelector("#task-q");
        const text = (inp.value || "").trim();
        if (!text) break;
        Model.addTask(text);   // new task → existing languages now incomplete
        closeTaskOverlay();
        showBase();            // re-render: task list, dots, warning banner update
        break;
      }

      case "close-task":
        closeTaskOverlay();
        break;

      case "toggle-dd": {
        const menu = els.ovAdd.querySelector(".dd-menu");
        menu.hidden = !menu.hidden;
        e.stopPropagation();
        break;
      }

      case "open-lang": {
        const lang = Model.getLanguages().find(l => l.name === t.dataset.lang);
        showReview(lang);
        break;
      }

      case "del-lang":
        Model.removeLanguage(t.dataset.lang);
        showBase();
        break;

      case "do-translate":
        if (!pendingLang || t.disabled) break;
        Model.addLanguage(pendingLang);
        translateAndReview(pendingLang, t); // AI fills, then drops into review
        break;

      case "retranslate":
        // Sync edits first (emptied fields become "missing" in the model),
        // then translate ONLY the still-missing strings for this language.
        if (currentLang) {
          syncReviewToModel(currentLang);
          translateAndReview(currentLang, t, true);
        }
        break;

      case "review-save":
        if (currentLang) syncReviewToModel(currentLang);
        closeReview();
        break;

      case "review-cancel":
        closeReview(); // discard edits
        break;

      case "close-overlay":
        closeOverlay();
        break;

      /* ---- console ---- */
      case "close-console":
        closeConsole();
        break;

      case "toggle-review":
        con.review = !con.review;
        renderConsole();
        break;

      case "set-mock":
        con.mock = t.dataset.mock === "1";
        renderConsole();
        break;

      case "run-full":
        runFullList(t);
        break;
    }
  });

  /* ---------- Console toggle tab ---------- */
  els.conTab.addEventListener("click", () => {
    openConsole();
    renderConsole();
  });

  /* ---------- Console model hot-swap (select change) ---------- */
  els.console.addEventListener("change", (e) => {
    if (e.target.classList.contains("con-key")) {
      const v = e.target.value.trim();
      if (v) sessionStorage.setItem(KEY_STORE, v);
      else sessionStorage.removeItem(KEY_STORE);
      renderConsole();
      return;
    }
    const sel = e.target.closest("[data-model]");
    if (!sel) return;
    if (sel.dataset.model === "translate") con.translateModel = sel.value;
    else if (sel.dataset.model === "review") con.reviewModel = sel.value;
  });

  /* ---------- Run translation on the whole list again ---------- */
  async function runFullList(btn) {
    const lang = currentLang || lastLang || Model.getLanguages()[0];
    if (!lang) {
      alert("Add a language first (+ TRANSLATION), then run the full list.");
      return;
    }
    con.busy = true; renderConsole();
    try {
      await runTranslation(lang, false); // false = full list, not just missing
      // if we're on the review screen for this language, refresh it
      if (currentLang && currentLang.name === lang.name) showReview(currentLang);
      else showBase();
    } catch (e) {
      alert(`Could not translate into ${lang.name}.\n\n${e.message}`);
    } finally {
      con.busy = false; renderConsole();
    }
  }

  /* ---------- Dropdown option pick (delegated within the overlay) ---------- */
  els.ovAdd.addEventListener("click", (e) => {
    const opt = e.target.closest(".dd-opt");
    if (!opt) return;
    pendingLang = { name: opt.dataset.lang, label: opt.dataset.label, flag: opt.dataset.flag };
    const current = els.ovAdd.querySelector(".dd-current");
    current.innerHTML = `${View.flagSvg(opt.dataset.flag)}<span>${opt.dataset.label}</span>`;
    current.classList.remove("placeholder");
    // mark the picked row (Figma selected state: green tint + semibold)
    els.ovAdd.querySelectorAll(".dd-opt").forEach(o => o.classList.toggle("selected", o === opt));
    els.ovAdd.querySelector(".dd-menu").hidden = true;
    els.ovAdd.querySelector('[data-action="do-translate"]').disabled = false;
  });

  /* ---------- Live char counters + clear the missing state on type ---------- */
  els.review.addEventListener("input", (e) => {
    if (!e.target.matches(".edit-field textarea")) return;
    const limit = e.target.getAttribute("maxlength");
    const wrap = e.target.closest(".edit-field-wrap");
    wrap.querySelector(".cnt").textContent = `${[...e.target.value].length} / ${limit}`;
    // typing into a missing field fills it → drop the orange underline
    e.target.closest(".edit-field").classList.toggle("missing", e.target.value.trim() === "");
    autoGrow(e.target);
    // TRANSLATE shows only while at least one field is empty/missing —
    // emptying a field is how the admin requests a re-translation of it.
    const btn = els.review.querySelector('[data-action="retranslate"]');
    if (btn) btn.hidden = !els.review.querySelector(".edit-field.missing");
  });

  // Grow a textarea to fit its content (wraps onto extra lines as needed).
  function autoGrow(ta) { ta.style.height = "auto"; ta.style.height = ta.scrollHeight + "px"; }

  /* ---------- Task overlay: enable ADD TASK + live counter ---------- */
  els.ovTask.addEventListener("input", (e) => {
    if (e.target.id !== "task-q") return;
    const len = [...e.target.value].length;
    els.ovTask.querySelector(".cnt").textContent = `${len} / 200`;
    els.ovTask.querySelector('[data-action="save-task"]').disabled = e.target.value.trim() === "";
  });

  /* ---------- Esc closes overlays ---------- */
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeOverlay(); closeTaskOverlay();
    if (!els.ovReview.hidden) closeReview();
  });

  /* ---------- Boot ---------- */
  showBase();
})();
