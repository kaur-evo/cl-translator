# Checklist translation: integration contract

What the app sends, what comes back, and what must happen around it. Rules are
numbered (`R1`, `R2`, …) so they can be cited.

The prompt-side instructions, everything about *how* a string should be
translated, live in `TRANSLATION-GUIDE.md`. That file is fed to the model.
This one is implemented by developers.

**Two sides.** *The app* collects the strings and sends the request
(`prototype/js/model.js`, `collectStrings`). *The translator service* receives
it, calls the model, and returns the result (`translator/translate_run.py`,
and `prototype/js/backend-direct.js` for static hosting).

## 1. Scope

**R1.** Exactly these eight kinds are sent, each carrying its `kind` verbatim
as the wire value:

| # | Field | `kind` | Limit |
|---|-------|--------|-------|
| 1 | Checklist name | `checklist name` | 50 |
| 2 | Task title | `task` | 200 |
| 3 | Task description | `task description` | 500 |
| 4 | Unit | `unit` | 10 |
| 5 | Warning message (Measurement) | `out-of-range message` | 200 |
| 6 | Warning message (Yes/No) | `no-answer message` | 200 |
| 7 | Option label | `option` | 200 |
| 8 | Checklist description | `checklist description` | 500 |

Limits are from the checklist editor and are a property of the kind, so the
translator service looks them up rather than receiving them per string.

**R2.** Nothing else is sent. Specifically never:

- numbers: target value, Min/Max, sample counts
- system answer labels: Yes / No / Done / Not applicable (Evocon's own i18n
  owns these; translating them here would produce two competing translations
  of the same word)
- task-setting toggle captions: allow N/A, allow images, multiple samples
- group names: translated at group level, outside checklist scope

**R3.** Empty or whitespace-only strings are never sent.

Which kinds a task contributes depends on its type:

| Task type | Contributes |
|-----------|-------------|
| Mark as done | 2, 3 |
| Enter text | 2, 3 |
| Yes/No | 2, 3, 6 |
| Measurement | 2, 3, 4, 5 |
| Single-select | 2, 3, 7 |
| Multi-select | 2, 3, 7 |

Kinds 5 and 6 are the same editor field (`warningMessage`), sent as two kinds
because its purpose changes with the task type. A select task holds 2 to 30
options.

## 2. Identity: the unique string is the unit of translation

**R4.** A translation set is a map from **source string** to translated
string, per language:

```
{ "English": { "Lülita masin välja": "Turn the machine off", … } }
```

Not per task, not per field path. Storing translations against field
coordinates does not satisfy this contract.

**R5.** Identical source strings are one unit. The app deduplicates by exact
string before sending; the same text appearing in six places is sent once and
translated once.

**R6.** Deduplication is by exact match, with no trimming, case-folding, or
normalisation. `"Hea"` and `"hea "` are two units.

**R7.** Kind is a property of the unit, not of a field. When one string is
used as two kinds, the first kind encountered in the R11 order wins. Each
unique string is sent exactly once, with one kind.

Three behaviours follow from R4 and must not be reimplemented as special
cases. Code that special-cases them is a sign the identity model was not
adopted:

- **Editing an original produces a new unit**, which no language has
  translated yet, so it reads as missing. There is no "stale translation"
  state to detect or invalidate.
- **Deleting a task drops its strings** from the collected set, so they are
  neither displayed nor sent. Any translations left in the map are unreachable
  and ignored.
- **Completeness is a property of the set**: a language is complete when every
  currently-collected string has a translation. Deleting a fully-translated
  task cannot make a complete language incomplete.

**R8.** Every string is sent with an explicit `kind`. The translator service
passes it to the model and never infers it from content.

## 3. Ordering

**R11.** Strings are sent as an ordered list:

1. checklist name
2. task strings, in task authoring order, fields in on-screen order
3. checklist description, always last when present

Ordering is load-bearing: the model returns a bare array mapped back by
position, which keeps output tokens down. Reordering `fields` breaks every
mapping.

## 4. Source language

**R12.** No request field names, implies, or defaults a source language, and
the translator service must not require one. Real tenants mix languages inside
one checklist.

**R13.** The model detects each string's language individually and returns a
string unchanged if it is already in the target language.

## 5. Request

Sent to stdin of `translate_run.py`, or POSTed to `/translate`:

```json
{
  "language": "English",
  "fields": [
    {"key": "Ohutuskontroll enne tootevahetust", "text": "Ohutuskontroll enne tootevahetust", "kind": "checklist name"},
    {"key": "Mis oli toote kogus?",              "text": "Mis oli toote kogus?",              "kind": "task"},
    {"key": "tk",                                "text": "tk",                                "kind": "unit"},
    {"key": "Veenduge, et liin on puhas.",       "text": "Veenduge, et liin on puhas.",       "kind": "checklist description"}
  ],
  "translateModel": "claude-haiku-4-5",
  "reviewModel": "claude-opus-4-8",
  "review": true
}
```

| Field | Required | Meaning |
|-------|----------|---------|
| `language` | yes | Target language as a human-readable name (`"English"`, `"Suomi"`). Not a locale code. |
| `fields` | yes | Ordered list per R11. Empty list means nothing to do; do not call the model. |
| `fields[].key` | yes | Identity of the unit. Opaque to the translator service. |
| `fields[].text` | yes | The source string to translate. |
| `fields[].kind` | yes | One of the eight values in R1. |
| `translateModel` | no | Defaults to `claude-haiku-4-5`. |
| `reviewModel` | no | Defaults to `claude-opus-4-8`. |
| `review` | no | Defaults to `true`. |

**R16.** `key` is the source string itself (`key === text`), because the
source string is the identity of a unit (R4).

**R17.** The translator service treats `key` as opaque and uses it only to map
results back.

## 6. Response

NDJSON, one JSON object per line, streamed as the run progresses:

```
{"type":"log","line":"🌍 Translating 4 string(s) → English"}
{"type":"result","strings":{…},"log":[…],"stats":{…}}
```

| `type` | When | Payload |
|--------|------|---------|
| `log` | Throughout | `line`: one human-readable progress line. |
| `result` | Success, terminal | `strings`, `log`, `stats`. |
| `error` | Failure, terminal | `error`, `strings` (partial, possibly empty), `log`, `stats`. |

**R18.** `strings` maps each input `key` to its translation. On success, the
key set of `strings` equals the key set of `fields`.

`stats` carries `translateModel`, `reviewModel` (`null` when review is off),
`review`, `inputTokens`, `outputTokens`, `costUsd`, `seconds`.

**R19.** A missing translation is never padded with its source text. A
partly-failed run returns only what it got, with `type: "error"`. See R25: a
padded field defeats the completeness check that blocks the save.

**R20.** The app applies `strings` over the existing translation map for that
language. Keys absent from the response keep their existing values.

**R14a (length enforcement).** The translator service checks every returned
string against its kind's limit, after the review stage, since a review
suggestion can push a string back over. Over-length strings get one shortening
pass; anything still too long is omitted from `strings` and left missing.
Never truncate: a cut-off string looks finished and never gets revisited.

## 7. Partial runs

**R21.** To translate only what is missing, send only those units as `fields`.
R11 ordering applies within the subset.

**R22.** A partial result never clears or overwrites units that were not sent.
With R20: the response is applied as a merge, never a replacement.

This is the ordinary case rather than an optimisation. Generating on a
language that already has content always runs missing-only, so cost tracks
what changed rather than checklist size.

## 8. Incomplete translations

**R23.** A checklist cannot be saved with an incomplete translation. Every
language attached to it must have every string translated. The admin fills the
gaps, generates them, or removes the language.

**R24.** Incompleteness is therefore a transient editing state, not a stored
one. It exists while the admin works, and the save is what refuses it.

**R25.** A missing translation stays visibly missing to the admin. With R19:
never write source text into a translation slot, because a field holding its
own source text is indistinguishable from a finished translation and will
never be revisited. This is what makes R23 enforceable, since a padded field
would pass the completeness check while being untranslated.

**R26.** A language whose translation is dropped for exceeding a field limit
(R14a) leaves the checklist incomplete and so blocks the save until resolved.

## 9. Runs in flight

**R27.** A translation run belongs to the editing session that started it.
Leaving the checklist view abandons it: the admin gets the standard "Unsaved
changes" dialog, and on confirming, the run's result is discarded even if it
completes in the background. This gives the admin a way to cancel an unwanted
generation.

**R28.** Several languages can run in parallel. Each gets its own progress
indicator and its own start and finish feedback, and each is discarded
independently under R27.

**R29.** Success and failure feedback is only shown while the admin is in the
checklist view. Nothing is pushed to them elsewhere in the app.

## Implementation status

Everything above describes working code in the prototype, except where a rule
says otherwise. Reference implementations:

- the app: `prototype/js/model.js`, `prototype/js/controller.js`
- translator service: `translator/translate_run.py`
- static-hosting translator service: `prototype/js/backend-direct.js`

Where this document and an implementation disagree, this document is wrong and
should be fixed.
