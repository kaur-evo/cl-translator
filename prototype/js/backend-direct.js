/* ============================================================
   Direct-browser translation backend (for static hosting, e.g.
   GitHub Pages, where no local proxy exists).

   Calls the Anthropic API straight from the browser using a key the
   viewer pastes into the console drawer. The key lives ONLY in
   sessionStorage of this browser tab — it is never in the repo, the
   build, or any server we control. Same two-stage pipeline as
   translator/translate_run.py (typed fields → translate → optional
   review), minus streaming.
   ============================================================ */
window.DirectBackend = (function () {

  const API = "https://api.anthropic.com/v1/messages";
  const PRICES = {
    "claude-opus-4-8":   { in: 5.0, out: 25.0 },
    "claude-sonnet-4-6": { in: 3.0, out: 15.0 },
    "claude-haiku-4-5":  { in: 1.0, out: 5.0 },
  };
  const DEFAULT_PRICE = { in: 5.0, out: 25.0 };

  const TRANSLATE_TOOLS = [{
    name: "store_translations",
    description: "Store translated strings",
    input_schema: {
      type: "object",
      properties: {
        translations: { type: "array", items: { type: "string" },
          description: "List of translated phrases, in the same order as the input" },
      },
      required: ["translations"],
    },
  }];

  const REVIEW_TOOLS = [{
    name: "store_review_suggestions",
    description: "List of suggestions to improve translations",
    input_schema: {
      type: "object",
      properties: {
        suggestions: { type: "array", items: { type: "object", properties: {
          index: { type: "integer" }, existing: { type: "string" },
          suggestion: { type: "string" }, reason: { type: "string" },
        }, required: ["index", "existing", "suggestion", "reason"] } },
      },
      required: ["suggestions"],
    },
  }];

  // Same typed-field contract as translator/TRANSLATION-GUIDE.md
  const TRANSLATE_PROMPT = (language, payload) =>
`You are a professional translator for OEE (Overall Equipment Effectiveness) manufacturing software.
Translate each phrase from Estonian into ${language}, maintaining consistency and an operator-facing, concise tone suitable for a shop-floor screen.

Every phrase comes with an explicit "type" — never guess what a string is:
- "checklist name": short title operators see on the checklist; keep it concise.
- "question": the task prompt shown to the operator.
- "task description": supporting instruction text under a question.
- "unit": a unit of measurement. Units MUST be translated to the target language's
  convention when one exists (e.g. Estonian "tk" → English "pcs"). International
  symbols (°C, kg, %, mm) stay unchanged.
- "out-of-range message": warning shown when a measurement is outside its range.
- "option": one answer choice in a select list; keep parallel phrasing across options.
- "checklist description": the standard-operating-procedure text; always the last phrase.

Do not modify end-of-sentence punctuation. Return the translations in the same order as the input.

Phrases:
${payload}`;

  async function call(key, body) {
    const res = await fetch(API, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        // explicit opt-in for browser-side calls; the key is the viewer's own
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error((json.error && json.error.message) || `API error ${res.status}`);
    }
    return json;
  }

  const toolInput = (resp, name) => {
    const block = (resp.content || []).find(b => b.type === "tool_use" && b.name === name);
    return block ? block.input : null;
  };

  /* Run one translation: fields = [{key, text, kind}] in canonical order.
     cfg = {key, translateModel, reviewModel, review}; log = line sink.
     Returns {strings, stats}. */
  async function run(language, fields, cfg, log) {
    const t0 = performance.now();
    const usage = { in: 0, out: 0, cost: 0 };
    const account = (model, resp) => {
      const p = PRICES[model] || DEFAULT_PRICE;
      const i = (resp.usage && resp.usage.input_tokens) || 0;
      const o = (resp.usage && resp.usage.output_tokens) || 0;
      usage.in += i; usage.out += o;
      usage.cost += (i / 1e6) * p.in + (o / 1e6) * p.out;
    };

    log(`🌐 Direct browser run (no proxy) — key from this session only`);
    log(`🌍 Translating ${fields.length} string(s) → ${language}`);
    log(`   translate: ${cfg.translateModel}` + (cfg.review ? ` · review: ${cfg.reviewModel}` : " · review: off"));

    const payload = JSON.stringify(fields.map(f => ({ type: f.kind, text: f.text })), null, 2);
    const tResp = await call(cfg.key, {
      model: cfg.translateModel, max_tokens: 4096,
      messages: [{ role: "user", content: TRANSLATE_PROMPT(language, payload) }],
      tools: TRANSLATE_TOOLS,
      tool_choice: { type: "tool", name: "store_translations" },
    });
    account(cfg.translateModel, tResp);
    let translations = (toolInput(tResp, "store_translations") || {}).translations || [];

    const strings = {};
    if (translations.length !== fields.length) {
      // never pad with the source language — missing strings must stay missing
      log(`⚠️ Translation count mismatch (${translations.length} vs ${fields.length}) — leaving the rest untranslated`);
      fields.slice(0, translations.length).forEach((f, i) => { strings[f.key] = translations[i]; });
      const seconds = Math.round((performance.now() - t0) / 10) / 100;
      return { strings, stats: stats(cfg, usage, seconds), error: `only ${translations.length} of ${fields.length} strings translated` };
    }
    log(`✅ Translated ${translations.length} string(s)`);

    if (cfg.review && translations.length) {
      log(`🔍 Reviewing with ${cfg.reviewModel}…`);
      const pairs = fields.map((f, i) => ({ index: i, type: f.kind, source_et: f.text, translation: translations[i] }));
      const rResp = await call(cfg.key, {
        model: cfg.reviewModel, max_tokens: 4096,
        system: "You are a translation quality reviewer specialising in OEE manufacturing software.",
        messages: [{ role: "user", content:
`Review these ${language} UI translations of Estonian source strings for OEE software.
Rules:
1. Verify correctness, tone, and any placeholder variables in curly braces.
2. Keep plurals plural and singulars singular.
3. Each phrase carries an explicit "type". Verify type-appropriate handling — in
   particular "unit" strings must use the target language's unit convention
   (international symbols like °C, kg, % stay unchanged).
4. Only suggest a change when the translation is wrong, inconsistent, or unnatural — never if it's already fine.

Return suggestions referencing each phrase by its 0-based index. If all are fine, return an empty list.

Phrases:
${JSON.stringify(pairs, null, 2)}` }],
        tools: REVIEW_TOOLS,
        tool_choice: { type: "tool", name: "store_review_suggestions" },
      });
      account(cfg.reviewModel, rResp);
      const suggestions = (toolInput(rResp, "store_review_suggestions") || {}).suggestions || [];
      let applied = 0;
      suggestions.forEach(s => {
        if (Number.isInteger(s.index) && s.index >= 0 && s.index < translations.length
            && translations[s.index] === s.existing && s.suggestion) {
          log(`  ✔️ ${translations[s.index]} → ${s.suggestion}  (${s.reason || ""})`);
          translations[s.index] = s.suggestion;
          applied++;
        }
      });
      log(applied ? `📝 Review applied ${applied} change(s)` : `✅ Review: no changes needed`);
    }

    fields.forEach((f, i) => { strings[f.key] = translations[i]; });
    const seconds = Math.round((performance.now() - t0) / 10) / 100;
    log(`⏱  ${seconds}s · ${usage.in + usage.out} tokens · $${usage.cost.toFixed(4)}`);
    return { strings, stats: stats(cfg, usage, seconds) };
  }

  const stats = (cfg, usage, seconds) => ({
    translateModel: cfg.translateModel,
    reviewModel: cfg.review ? cfg.reviewModel : null,
    review: cfg.review,
    inputTokens: usage.in,
    outputTokens: usage.out,
    costUsd: Math.round(usage.cost * 1e6) / 1e6,
    seconds,
  });

  return { run };
})();
