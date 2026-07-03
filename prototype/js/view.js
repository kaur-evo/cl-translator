/* ============================================================
   VIEW
   Pure rendering. Builds HTML strings / DOM from Model data.
   No event wiring here — that lives in the Controller.

   Pixel reference frames (Figma CL-Translations):
   - base card       46012:3499  (card 900, content 16px grid)
   - task cards      46012:3557  (h62, num 24, overline 10/14)
   - translation dlg 46022:3636  (700 wide)
   - review modal    46045:7950  (975 wide, fields 943)
   - language list   46018:6391  (48px rows, 24px flat flags)
   ============================================================ */
window.View = (function () {

  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  /* ---- Material glyphs (24px viewBox), as Evocon uses ---- */
  const mdi = (path, cls = "", size = 24) =>
    `<svg class="${cls}" viewBox="0 0 24 24" width="${size}" height="${size}" fill="currentColor" aria-hidden="true"><path d="${path}"/></svg>`;

  const P = {
    arrowDown: "M7 10l5 5 5-5z",
    add: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
    del: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
    duplicate: "M11 17H4a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h12v2H4v12h7v-2l4 3-4 3v-2m8 4V7H8v6H6V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-8v-2h8z",
    pencil: "M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83zM3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z",
    infoOutline: "M11 9h2V7h-2m1 13c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8m0-18A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2m-1 15h2v-6h-2v6z",
    checkCircle: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
    checkCircleOutline: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z",
    clock: "M12 20a8 8 0 1 1 0-16 8 8 0 0 1 0 16m0-18A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2m.5 5H11v6l4.75 2.85.75-1.23-4-2.37V7z",
    attach: "M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z",
    warn: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
  };

  // public/globe — exact Material glyph from Figma (20x20 in a 24 box)
  const globe = '<svg class="btn-ico" viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg"><path transform="translate(2 2)" fill-rule="evenodd" clip-rule="evenodd" d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM9 17.93C5.05 17.44 2 14.08 2 10C2 9.38 2.08 8.79 2.21 8.21L7 13V14C7 15.1 7.9 16 9 16V17.93ZM14 14C14.9 14 15.64 14.58 15.9 15.39C17.2 13.97 18 12.08 18 10C18 6.65 15.93 3.78 13 2.59V3C13 4.1 12.1 5 11 5H9V7C9 7.55 8.55 8 8 8H6V10H12C12.55 10 13 10.45 13 11V14H14Z" fill="currentColor"/></svg>';

  /* ---- flat rectangular flags (20x14 in a 24px box) per Figma 46018:6391.
     Figma flag palette: navy #1A47B8, red #F93939, yellow #FFDA2C,
     green #249F58, red wine #AF010D, black #151515. */
  const C = { nb: "#1A47B8", rd: "#F93939", yl: "#FFDA2C", gn: "#249F58", rw: "#AF010D", bk: "#151515", wh: "#fff" };
  // 5-point star polygon points around (cx,cy), outer radius r
  function star(cx, cy, r) {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const rad = (i % 2 === 0 ? r : r * 0.4);
      const a = -Math.PI / 2 + i * Math.PI / 5;
      pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`);
    }
    return pts.join(" ");
  }
  const hBands = (...cols) => cols.map((c, i) =>
    `<rect y="${(14 / cols.length * i).toFixed(2)}" width="20" height="${(14 / cols.length).toFixed(2)}" fill="${c}"/>`).join("");
  const vBands = (...cols) => cols.map((c, i) =>
    `<rect x="${(20 / cols.length * i).toFixed(2)}" width="${(20 / cols.length).toFixed(2)}" height="14" fill="${c}"/>`).join("");
  // Nordic cross: bg colour + cross colour (+ optional inner cross)
  const nordic = (bg, cross, inner) =>
    `<rect width="20" height="14" fill="${bg}"/>
     <rect x="6" width="${inner ? 4 : 3}" height="14" fill="${cross}"/><rect y="${inner ? 5 : 5.5}" width="20" height="${inner ? 4 : 3}" fill="${cross}"/>
     ${inner ? `<rect x="7" width="2" height="14" fill="${inner}"/><rect y="6" width="20" height="2" fill="${inner}"/>` : ""}`;

  function flagSvg(code) {
    const flags = {
      ee: hBands(C.nb, C.bk, C.wh),
      gb: `<rect width="20" height="14" fill="${C.nb}"/>
           <path d="M0 0l20 14M20 0L0 14" stroke="#fff" stroke-width="2.8"/>
           <path d="M0 0l20 14M20 0L0 14" stroke="${C.rd}" stroke-width="1.2"/>
           <rect x="8.3" width="3.4" height="14" fill="#fff"/><rect y="5.3" width="20" height="3.4" fill="#fff"/>
           <rect x="9" width="2" height="14" fill="${C.rd}"/><rect y="6" width="20" height="2" fill="${C.rd}"/>`,
      es: `<rect width="20" height="14" fill="${C.yl}"/><rect width="20" height="3.5" fill="${C.rd}"/><rect y="10.5" width="20" height="3.5" fill="${C.rd}"/>`,
      de: hBands(C.bk, C.rd, C.yl),
      pl: hBands(C.wh, C.rd),
      fr: vBands(C.nb, C.wh, C.rd),
      gr: `<rect width="20" height="14" fill="${C.nb}"/>
           <path d="M0 2.33h20M0 5.44h20M0 8.56h20M0 11.67h20" stroke="#fff" stroke-width="1.56"/>
           <rect width="7.78" height="7.78" fill="${C.nb}"/>
           <rect x="3.11" width="1.56" height="7.78" fill="#fff"/><rect y="3.11" width="7.78" height="1.56" fill="#fff"/>`,
      ua: hBands(C.nb, C.yl),
      dk: nordic(C.rd, C.wh),
      fi: nordic(C.wh, C.nb),
      se: nordic(C.nb, C.yl),
      no: nordic(C.rd, C.wh, C.nb),
      it: vBands(C.gn, C.wh, C.rd),
      nl: hBands(C.rd, C.wh, C.nb),
      lv: `<rect width="20" height="14" fill="${C.rw}"/><rect y="5.6" width="20" height="2.8" fill="#fff"/>`,
      lt: hBands(C.yl, C.gn, C.rd),
      cz: `${hBands(C.wh, C.rd)}<path d="M0 0L10 7L0 14z" fill="${C.nb}"/>`,
      bg: hBands(C.wh, C.gn, C.rd),
      hu: hBands(C.rd, C.wh, C.gn),
      ro: vBands(C.nb, C.yl, C.rd),
      ru: hBands(C.wh, C.nb, C.rd),
      th: `<rect width="20" height="14" fill="${C.rd}"/><rect y="2.33" width="20" height="9.33" fill="#fff"/><rect y="4.67" width="20" height="4.67" fill="${C.nb}"/>`,
      rs: hBands(C.rd, C.nb, C.wh),
      hr: hBands(C.rd, C.wh, C.nb),
      tr: `<rect width="20" height="14" fill="${C.rd}"/>
           <circle cx="8" cy="7" r="3.6" fill="#fff"/><circle cx="9" cy="7" r="2.9" fill="${C.rd}"/>
           <polygon points="${star(12.6, 7, 1.6)}" fill="#fff"/>`,
      cn: `<rect width="20" height="14" fill="${C.rd}"/><polygon points="${star(4.2, 4.2, 2.4)}" fill="${C.yl}"/>`,
      vn: `<rect width="20" height="14" fill="${C.rd}"/><polygon points="${star(10, 7, 3.2)}" fill="${C.yl}"/>`,
      il: `<rect width="20" height="14" fill="#fff"/>
           <rect y="1.6" width="20" height="1.8" fill="${C.nb}"/><rect y="10.6" width="20" height="1.8" fill="${C.nb}"/>
           <path d="M10 4.2L12.4 8.4H7.6z M10 9.8L7.6 5.6H12.4z" fill="none" stroke="${C.nb}" stroke-width="0.9"/>`,
      pt: `<rect width="20" height="14" fill="${C.rd}"/><rect width="8" height="14" fill="${C.gn}"/><circle cx="8" cy="7" r="2.6" fill="${C.yl}"/>`,
    };
    // hairline on flags whose edge stripes are white
    const bordered = ["ee", "pl", "gb", "fi", "cz", "bg", "il", "th", "ru"].includes(code);
    return `<span class="flag24"><svg viewBox="0 0 20 14" class="flag-rect${bordered ? " edge" : ""}" aria-hidden="true">${flags[code] || ""}</svg></span>`;
  }

  /* ---- shared bits ---- */
  const iconBtn = (path, action, extra = "") =>
    `<button class="icon-btn${extra ? " " + extra : ""}"${action ? ` data-action="${action}"` : ""}>${mdi(path, "", 18)}</button>`;

  const contentHeader = (title, desc, withInfo) => `
    <div class="content-header">
      <div class="ch-title">${esc(title)}${withInfo ? mdi(P.infoOutline, "ch-info", 16) : ""}</div>
      ${desc ? `<div class="ch-desc">${esc(desc)}</div>` : ""}
    </div>`;

  const inlineMsg = (html, warn) => `
    <div class="inline-msg${warn ? " warn-msg" : ""}">${mdi(warn ? P.warn : P.infoOutline, "inline-msg-ico" + (warn ? " warn" : ""), 18)}<span>${html}</span></div>`;

  /* A single editable field group (review modal). Input value = translation
     (empty + orange underline when missing), caption = original base string.
     The provenance tooltip (Figma 46048:3757) hangs off the CAPTION only and
     opens below it, so it never covers the input. */
  function fieldInput(caption, translation, limit, fieldKey, tip) {
    const tipAttrs = tip ? ` class="cap tip" data-tip="${esc(tip)}"` : ' class="cap"';
    const missing = translation == null;
    const value = missing ? "" : translation;
    return `
      <div class="edit-field-wrap">
        <div class="edit-field${missing ? " missing" : ""}"><textarea rows="1" maxlength="${limit}" data-field="${esc(fieldKey || caption)}">${esc(value)}</textarea></div>
        <span class="input-bottom"><span${tipAttrs}>${esc(caption)}</span><span class="cap cnt">${[...value].length} / ${limit}</span></span>
      </div>`;
  }

  // Task type → uppercase overline label shown on the task card (matches Evocon).
  const TYPE_LABEL = {
    "Mark as done": "MARK AS DONE",
    "Yes / No": "YES/NO",
    "Measurement": "MEASUREMENT",
    "Single select": "SINGLE CHOICE",
    "Multi select": "MULTIPLE CHOICE",
    "Enter text": "TEXT",
  };

  /* ===========================================================
     VIEW 1 — base checklist editor (Figma 46012:3499)
     =========================================================== */
  function renderBase(host, langs, tasks) {
    const taskList = tasks.map((t, i) => `
      <div class="row-card">
        <span class="task-num">${i + 1}</span>
        <div class="row-card-body">
          <div class="row-card-head">Task ${i + 1}</div>
          <div class="row-card-type">${esc(TYPE_LABEL[t.type] || t.type)}</div>
        </div>
        <div class="row-card-icons">
          ${iconBtn(P.del, "", "trash")}${iconBtn(P.duplicate)}${iconBtn(P.pencil)}
        </div>
      </div>`).join("");

    const langRows = langs.map(l => {
      const incomplete = !Model.isComplete(l.name);
      return `
      <div class="row-card">
        ${flagSvg(l.flag)}
        <div class="row-card-body">
          <div class="row-card-head">${esc(l.name)}${incomplete ? '<span class="miss-dot" title="Some translations are missing"></span>' : ""}</div>
        </div>
        <div class="row-card-icons">
          <button class="icon-btn trash" data-action="del-lang" data-lang="${esc(l.name)}" aria-label="Delete ${esc(l.name)} translation">${mdi(P.del, "", 18)}</button>
          <button class="icon-btn" data-action="open-lang" data-lang="${esc(l.name)}" aria-label="Review ${esc(l.name)} translation">${mdi(P.pencil, "", 18)}</button>
        </div>
      </div>`;
    }).join("");

    const warnBanner = Model.hasMissingTranslations()
      ? inlineMsg("Some translations are missing, please review and translate.", true)
      : "";

    const desc = Model.descriptionBase();

    host.innerHTML = `
      <div class="header58"><h2>New: Checklist</h2></div>
      <div class="content">

        <div class="inputs-row">
          <label class="input-group">
            <span class="input-box"><input value="${esc(Model.nameBase())}" readonly></span>
            <span class="input-bottom"><span class="cap">Checklist name</span><span class="cap">${[...Model.nameBase()].length} / 50</span></span>
          </label>
          <label class="input-group">
            <span class="input-box select"><span class="val">Maintenance</span>${mdi(P.arrowDown, "sel-arrow", 24)}</span>
            <span class="input-bottom"><span class="cap">Group</span></span>
          </label>
        </div>

        ${contentHeader("Set frequency", "", true)}

        <div class="conditions">
          <div class="subhead-left"><span class="sh-ico ok">${mdi(P.checkCircle, "", 16)}</span>Filters</div>
          <div class="chips-card">
            <div class="chips">
              <span class="chip-wrap"><span class="chip">Factories: All ${mdi(P.arrowDown, "chip-arrow", 18)}</span></span>
              <span class="chip-wrap"><span class="chip">Stations: All ${mdi(P.arrowDown, "chip-arrow", 18)}</span></span>
              <span class="chip-wrap"><span class="chip">Products: All ${mdi(P.arrowDown, "chip-arrow", 18)}</span></span>
            </div>
            <button class="reset-btn dim">reset</button>
          </div>
          <div class="subhead-left"><span class="sh-ico">${mdi(P.checkCircleOutline, "", 16)}</span>Frequency</div>
          <div class="chips-card">
            <div class="chips">
              <span class="chip-wrap"><span class="chip selected">Regular intervals ${mdi(P.arrowDown, "chip-arrow", 18)}</span></span>
              <span class="chip-text">show every</span>
              <span class="chip-wrap"><span class="chip">${mdi(P.clock, "chip-clock", 16)}<span class="int"><span class="int-n">02</span> h</span><span class="int"><span class="int-n">00</span> m</span></span></span>
            </div>
            <span class="freq-add">${mdi(P.add, "", 18)}</span>
            <button class="reset-btn">reset</button>
          </div>
        </div>

        ${contentHeader("Add checklist tasks", "Create a list of tasks that operators should perform")}

        <div class="row-card-list">${taskList}</div>
        <div class="btn-row"><button class="btn btn-secondary" data-action="add-task">${mdi(P.add, "btn-ico")}task</button></div>

        <div class="desc-block">
          <div class="input-group">
            <div class="textarea-box">
              <div class="ta-text">${esc(desc)}</div>
              <div class="ta-toolbar"><span class="icon-28">${mdi(P.attach, "", 20)}</span></div>
            </div>
            <span class="input-bottom"><span class="cap">Describe the standard operating procedure</span><span class="cap">${[...desc].length} / 500</span></span>
          </div>
        </div>

        <div class="toggles">
          <div class="toggle-row"><span class="toggle"></span><span class="lbl">Require authentication ${mdi(P.infoOutline, "lbl-info", 16)}</span></div>
          <div class="toggle-row"><span class="toggle on"></span><span class="lbl">Checklist status</span></div>
        </div>

        ${contentHeader("Translations", langs.length ? "" : "Please add translations")}

        <div class="row-card-list">${langRows}</div>
        <div class="btn-row"><button class="btn btn-tertiary" data-action="add-trans">${mdi(P.add, "btn-ico")}translation</button></div>

        ${warnBanner}
      </div>

      <div class="footer">
        <span class="spacer"></span>
        <button class="btn btn-text">cancel</button>
        <button class="btn btn-primary">save</button>
      </div>`;
  }

  /* ===========================================================
     VIEW 2 — review & edit modal (Figma 46045:7950, 975 wide)
     =========================================================== */
  function renderReview(host, lang, tasks) {
    let body = fieldInput(
      Model.nameBase(), Model.nameTranslated(lang.name), 50, "__name__",
      "Checklist, Name"
    );

    tasks.forEach((task, i) => {
      task.fields.forEach(([field, limit, kind]) => {
        const tip = `Task ${i + 1}, ${task.type}, ${kind || field}`;
        body += fieldInput(Model.baseText(task, field), Model.translatedText(task, field, lang.name),
          limit, `${task.id}::${field}`, tip);
      });
    });

    body += fieldInput(
      Model.descriptionBase(), Model.descriptionTranslated(lang.name), 500, "__description__",
      "Checklist, Description"
    );

    const complete = Model.isComplete(lang.name);

    host.innerHTML = `
      <div class="header58"><h2>Edit: ${esc(lang.name)}</h2></div>
      ${inlineMsg("All user written text is editable field with original written below.")}
      <div class="review-fields">${body}</div>
      <div class="footer">
        <button class="btn btn-tertiary" data-action="retranslate" ${complete ? "hidden" : ""}>${globe}translate</button>
        <span class="spacer"></span>
        <button class="btn btn-text" data-action="review-cancel">cancel</button>
        <button class="btn btn-secondary" data-action="review-save">apply</button>
      </div>`;
  }

  /* ===========================================================
     OVERLAY — add a language (Figma 46022:3636 + list 46018:6391)
     =========================================================== */
  function renderAddOverlay(host, available) {
    const opts = available.map(a => `
      <div class="dd-opt" data-lang="${esc(a.name)}" data-label="${esc(a.label)}" data-flag="${a.flag}">
        ${flagSvg(a.flag)}<span class="dd-label">${esc(a.label)}</span>
      </div>`).join("");
    host.innerHTML = `
      <div class="card ov-small">
        <div class="header58"><h2>Translation</h2></div>
        <div class="ov-content">
          ${inlineMsg("Translations are automatically generated and can be edited. <u>Read more.</u>")}
          <div class="input-group dd">
            <button class="input-box select dd-trigger" data-action="toggle-dd">
              <span class="val dd-current placeholder">Select language</span>${mdi(P.arrowDown, "sel-arrow", 24)}
            </button>
            <span class="input-bottom"><span class="cap">Language</span></span>
            <div class="dd-menu" hidden>${opts}</div>
          </div>
        </div>
        <div class="footer">
          <span class="spacer"></span>
          <button class="btn btn-text" data-action="close-overlay">cancel</button>
          <button class="btn btn-secondary" data-action="do-translate" disabled>${globe}translate</button>
        </div>
      </div>`;
  }

  /* ===========================================================
     OVERLAY — add a task (free-text question)
     =========================================================== */
  function renderTaskOverlay(host) {
    host.innerHTML = `
      <div class="card ov-small">
        <div class="header58"><h2>New: Task</h2></div>
        <div class="ov-content">
          <div class="edit-field-wrap">
            <div class="edit-field"><textarea id="task-q" rows="1" maxlength="200" placeholder="What has to be checked?"></textarea></div>
            <span class="input-bottom"><span class="cap">Question (Estonian)</span><span class="cap cnt">0 / 200</span></span>
          </div>
        </div>
        <div class="footer">
          <span class="spacer"></span>
          <button class="btn btn-text" data-action="close-task">cancel</button>
          <button class="btn btn-secondary" data-action="save-task" disabled>add task</button>
        </div>
      </div>`;
  }

  /* ===========================================================
     CONSOLE — right-side drawer (prototype tool, not a design surface)
     =========================================================== */
  const MODEL_OPTIONS = [
    "claude-haiku-4-5",
    "claude-sonnet-4-6",
    "claude-sonnet-5",
    "claude-opus-4-8",
  ];

  function modelSelect(id, current) {
    const opts = MODEL_OPTIONS.map(m =>
      `<option value="${m}"${m === current ? " selected" : ""}>${m}</option>`).join("");
    return `<select class="con-select" data-model="${id}">${opts}</select>`;
  }

  function renderConsole(host, state) {
    const { translateModel, reviewModel, review, runs, busy, mock, needKey, hasKey } = state;

    // On static hosting (no proxy), real mode needs the viewer's own key.
    const keyRow = (!mock && needKey) ? `
        <label class="con-row"><span>API key</span>
          <input type="password" class="con-key" autocomplete="off"
                 placeholder="${hasKey ? "•••••••••••• (set)" : "sk-ant-…"}">
        </label>
        <p class="con-note">Your key is kept in this browser session only — never stored or sent anywhere except api.anthropic.com.</p>` : "";
    const totals = runs.reduce((a, r) => r.stats ? ({
      inTok: a.inTok + (r.stats.inputTokens || 0),
      outTok: a.outTok + (r.stats.outputTokens || 0),
      cost: a.cost + (r.stats.costUsd || 0),
      sec: a.sec + (r.stats.seconds || 0),
    }) : a, { inTok: 0, outTok: 0, cost: 0, sec: 0 });

    const runCards = runs.length ? runs.slice().reverse().map(r => {
      const s = r.stats;
      const head = r.running
        ? `<span class="run-lang"><span class="spinner sm"></span> ${esc(r.language)}</span><span class="run-running">translating…</span>`
        : `<span class="run-lang">${esc(r.language)}</span><span class="run-cost">$${((s && s.costUsd) || 0).toFixed(4)}</span>`;
      const meta = s
        ? `<div class="run-meta"><span>${esc(s.translateModel)}${s.reviewModel ? " → " + esc(s.reviewModel) : " · no review"}</span></div>`
        : "";
      const stats = s
        ? `<div class="run-stats"><span>${s.seconds}s</span><span>${(s.inputTokens||0)+(s.outputTokens||0)} tok</span><span>${s.inputTokens||0} in / ${s.outputTokens||0} out</span></div>`
        : "";
      return `<div class="run${r.running ? " is-running" : ""}">
        <div class="run-head">${head}</div>
        ${meta}${stats}
        <pre class="run-log">${esc((r.log || []).join("\n"))}</pre>
      </div>`;
    }).join("")
      : `<p class="con-empty">No runs yet. Add a language and translate, or use “Run on full list”.</p>`;

    host.innerHTML = `
      <div class="con-header">
        <span class="con-title">Translation console</span>
        <button class="icon-btn" data-action="close-console" aria-label="Close console">${mdi("M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z", "", 18)}</button>
      </div>

      <div class="con-controls">
        <div class="con-row">
          <span>Translation</span>
          <span class="con-seg" role="radiogroup" aria-label="Translation source">
            <button class="con-seg-opt${mock ? " on" : ""}" data-action="set-mock" data-mock="1" role="radio" aria-checked="${mock}">mock</button>
            <button class="con-seg-opt${mock ? "" : " on"}" data-action="set-mock" data-mock="0" role="radio" aria-checked="${!mock}">real</button>
          </span>
        </div>
        ${keyRow}
        <label class="con-row"><span>Translate model</span>${modelSelect("translate", translateModel)}</label>
        <label class="con-row"><span>Review model</span>${modelSelect("review", reviewModel)}</label>
        <label class="con-row con-toggle-row">
          <span>Review stage</span>
          <span class="toggle sm ${review ? "on" : ""}" data-action="toggle-review" role="switch" aria-checked="${review}"></span>
        </label>
        <button class="btn con-run" data-action="run-full" ${busy ? "disabled" : ""}>
          ${busy ? `<span class="spinner"></span><span>RUNNING…</span>` : `${globe}RUN ON FULL LIST`}
        </button>
      </div>

      <div class="con-totals">
        <span><b>${runs.length}</b> run${runs.length === 1 ? "" : "s"}</span>
        <span><b>${totals.sec.toFixed(1)}s</b> total</span>
        <span><b>${totals.inTok + totals.outTok}</b> tok</span>
        <span class="con-totalcost"><b>$${totals.cost.toFixed(4)}</b></span>
      </div>

      <div class="con-runs">${runCards}</div>`;
  }

  return { renderBase, renderReview, renderAddOverlay, renderTaskOverlay, renderConsole, flagSvg };
})();
