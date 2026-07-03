# Checklist translation guide (for developers)

How to send checklist content to the AI translator so nothing is guessed,
nothing is skipped, and results map back deterministically. This is the
contract between the app and the translation pipeline
(`translate_run.py`); the prototype (`prototype/js/model.js`) implements it.

## 1. What gets translated

Every user-written string in a checklist, and nothing else.

| # | String | Kind (sent as `kind`) | Where it appears |
|---|--------|----------------------|------------------|
| 1 | Checklist name | `checklist name` | Shift View checklist modal title, Settings list |
| 2 | Task question | `question` | The task prompt operators answer |
| 3 | Task description | `task description` | Instruction text under a question |
| 4 | Unit (Measurement) | `unit` | Next to the numeric input |
| 5 | Out-of-range message (Measurement) | `out-of-range message` | Warning when a value is outside min/max |
| 6 | Option label (Single/Multi select) | `option` | One answer choice in the list |
| 7 | Checklist description | `checklist description` | The standard-operating-procedure text |

Never sent (not user language content):

- numbers: target value, min/max, sample counts
- system answer labels: Yes / No / Done / Not applicable (translated by the app's own i18n)
- group names (translated at group level, out of checklist scope — open question)

Task-type coverage: Mark as done and Yes/No and Enter text contribute rows 2–3;
Measurement contributes rows 2–5; Single/Multi select contribute rows 2–3 + 6.

## 2. Pre-assigned field kinds — the translator never guesses

Every string is sent with an explicit `kind`. This is mandatory. A bare
string like `tk` or `°C` is only knowable as a unit because the sender says
so; the model must not infer it.

Unit policy (encoded in the translate prompt):

- units MUST be translated to the target language's convention when one
  exists (Estonian `tk` → English `pcs`)
- international symbols stay unchanged: `°C`, `kg`, `%`, `mm`, …

## 3. Ordering contract

Strings are sent as an **ordered list** and returned in the same order:

1. checklist name — first
2. task fields, in task authoring order, fields in on-screen order
3. checklist description — **always the very last string**

## 4. Wire format

Request (stdin to `translate_run.py`, or POST `/translate` via the proxy):

```json
{
  "language": "English",
  "fields": [
    {"key": "__name__",        "text": "Ohutuskontroll...", "kind": "checklist name"},
    {"key": "t3::Question",    "text": "Mis oli toote...",  "kind": "question"},
    {"key": "t3::Unit",        "text": "tk",                "kind": "unit"},
    {"key": "__description__", "text": "Veenduge, et...",   "kind": "checklist description"}
  ],
  "translateModel": "claude-haiku-4-5",
  "reviewModel": "claude-opus-4-8",
  "review": true
}
```

Key format: `__name__` and `__description__` are checklist-level;
task fields are `<taskId>::<FieldLabel>` (e.g. `t3::Unit`, `t5::Option 2`).

Response is NDJSON, one object per line:

- `{"type":"log","line":"..."}` — streamed progress lines
- `{"type":"result","strings":{key: translated},"log":[...],"stats":{...}}`
- `{"type":"error","error":"...","strings":{partial},"log":[...],"stats":{...}}`

`strings` maps each input `key` to its translation. On a count mismatch the
runner returns only what it got and flags an error — it never pads with the
source language (untranslated fields must stay visibly missing in the UI).

## 5. Partial translation (missing-only runs)

To translate only what's missing (new task added, admin emptied a field),
send only those fields — same ordering rules apply within the subset
(description last if included). Apply the result over the existing
translation set; never overwrite admin edits that weren't sent.

## 6. Pipeline stages

1. **Translate** (default `claude-haiku-4-5`) — one call, all fields, typed
   payload, tool-forced array output.
2. **Review** (default `claude-opus-4-8`, optional) — checks correctness,
   tone, plurals, type-appropriate handling (units!), glossary consistency
   (`et.json`); suggestions referenced by index and applied only when the
   `existing` text still matches.

Cost/latency reference from live runs: ~40 strings ≈ 2–4k tokens ≈ under a
cent with Haiku translate + Opus review; a 4-string partial run ≈ $0.001.

## 7. Invariants worth testing

- result keys == request keys (bijective, order-independent by key)
- description present ⇒ last element of `fields`
- a `unit` field with an international symbol returns unchanged
- error path returns partial `strings`, never source-language padding
- glossary terms in `et.json` survive review unchanged
