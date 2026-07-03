# Checklist translations — prototype

Interactive prototype of AI-seeded checklist translations for Evocon.

The checklist is authored in **Estonian** (base language). The admin adds a
target language, hits **TRANSLATE**, and the strings are translated for real by
Claude (Haiku) into an editable review screen.

## Run it

The page talks to a tiny local proxy that holds your Anthropic key server-side
(the key never reaches the browser, and the proxy also serves the static files
so there's no CORS issue).

```sh
cd prototype
ANTHROPIC_API_KEY=sk-ant-... node proxy.js
```

Then open http://localhost:8787/

- Default model is `claude-haiku-4-5`. Override with `CLAUDE_MODEL=...`.
- Override the port with `PORT=...`.

## Flow

1. Base editor (Settings → Checklists), checklist + 6 tasks in Estonian, one of
   every Evocon task type.
2. **+ TRANSLATION** → pick a language → **TRANSLATE** (spinner on the button
   while Claude runs).
3. Review screen: every user-written string as an editable field, the original
   Estonian shown below each. **TRANSLATE** (bottom-left) re-runs the AI.

## Files (MVC)

- `index.html` — view container
- `css/styles.css` — styling (Evocon design tokens from Figma)
- `js/model.js` — data + state (base strings, translations, AI plumbing)
- `js/view.js` — pure render functions
- `js/controller.js` — flow wiring + the translate call
- `proxy.js` — local dev server + `/translate` endpoint
