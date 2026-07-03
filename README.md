# Checklist translations — Evocon prototype

Interactive prototype of the "Translations to Checklists" feature: an admin adds a
language to a checklist, AI seeds the translation (typed fields, units included),
the admin reviews and edits every string in a modal, operators would then see the
checklist in their language.

## Hosted version (GitHub Pages)

Deployed automatically from `main` by `.github/workflows/pages.yml`
(serves the `prototype/` folder). The page is password-gated; the password is
shared separately (see `prototype/js/gate.js` for how to change it).

Translation modes on the hosted version:

- **mock** (default) — everything works offline, zero cost, no key anywhere.
- **real** — open the console drawer (top right), pick "real" and paste your own
  Anthropic API key. The key lives only in that browser tab's sessionStorage and
  goes only to `api.anthropic.com`.

Why no server-side key: GitHub Pages is static hosting — there are no runtime
environment variables, and anything injected at build time (even from Actions
secrets) ends up world-readable in the served JavaScript. So the key is never in
this repo or the build. If a shared always-on real mode is ever needed, host the
small proxy (below) on a worker/server and point the frontend at it.

## Run locally

```bash
cd prototype
node proxy.js               # mock mode works immediately at http://localhost:8787/
```

For real translations locally, give the proxy a key (either way):

```bash
ANTHROPIC_API_KEY=sk-ant-... node proxy.js
# or put ANTHROPIC_API_KEY=... into prototype/.env (gitignored)
```

The local proxy runs the full Python pipeline (`translator/translate_run.py`,
needs `pip install anthropic` in `translator/.venv`), with live-streamed logs.

## Structure

- `prototype/` — the static app (vanilla JS MVC: `js/model.js`, `js/view.js`,
  `js/controller.js`), `proxy.js` for local dev, password gate, console drawer
  with cost/token/model diagnostics.
- `prototype/js/backend-direct.js` — browser→Anthropic backend used on static
  hosting (viewer-supplied key).
- `translator/translate_run.py` — the two-stage translate→review pipeline
  (typed fields; see the guide).
- `translator/TRANSLATION-GUIDE.md` — the field-type / ordering / unit contract
  developers should implement in the product.
