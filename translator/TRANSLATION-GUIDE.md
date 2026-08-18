# Checklist translation guide

The contract between a checklist-authoring app and the AI translation
pipeline: what may be sent, how it is identified, what comes back, and what
must happen when a translation is incomplete.

Written to be implemented against, by two kinds of reader:

- **An engine integrating this pipeline** needs sections 1–8. These are
  normative, and rules are numbered (`R1`, `R2`, …) so they can be cited.
- **An agent doing the translating** needs section 0 (what the strings are,
  who reads them, how to write them) and R9 (what to do with each of the eight
  kinds). R10, R13 and R14 cover punctuation, source language and length.

Section 9 is rationale, section 10 is a conformance checklist. Where this
document and an implementation disagree, this document is wrong and should be
fixed. It describes an existing working pipeline (`translate_run.py`,
`prototype/js/model.js`), not a proposal.

**Reference implementations.** Producer: `prototype/js/model.js`
(`collectStrings`). Consumer: `translator/translate_run.py`. Browser-side
consumer: `prototype/js/backend-direct.js`.

**Not yet implemented.** Three rules describe intended behaviour rather than
working code, and each is flagged where it appears:

- **R9a (checklist context).** The prototype sends each string with its kind
  but no checklist context, so a partial run translates its strings blind.
- **R14 (length).** The limits are real and enforced in the editor, but no
  `maxLength` reaches the model and no response is checked against one. A
  translation that overflows its field is currently accepted.
- **R15 (glossary).** A glossary exists (`et.json`, 1346 UI phrases) but only
  reaches the review stage, is hardcoded to Estonian whatever the target
  language, and is absent from the browser backend entirely.

Everything else here describes working code.

## 0. What you are translating

You are translating **individual strings taken out of one Evocon checklist**,
which the app reassembles and shows to a machine operator in Shift View.

Every string is **free-form text a tenant typed** into a checklist field in
Settings. None of it is Evocon's own product copy, none of it is drawn from a
fixed vocabulary, and none of it is predictable. The only thing known about a
string is which field it came from, which is why every string arrives with an
explicit `kind` (R8) and why you must never infer meaning from content alone.

**Evocon** is production-monitoring software for factories. Sensors on a
machine record output and stoppages automatically; the operator supplies what
a sensor cannot: why the machine stopped, what was scrapped, and the results
of quality checks. **Checklists** are that last part, a separately licensed
module for structured quality and compliance checks.

**Who wrote the input:** a plant manager, production engineer, or quality
manager, typing into Settings on a desktop. Expect shop-floor shorthand,
plant-local jargon, abbreviations (`tk`, `min`, `pcs`), and fragments rather
than sentences.

**Who reads your output:** a machine operator, at one station, during a shift,
on a touch screen that runs anywhere from a phone to a 4K wall display. They
read in the language selected on the Shift View footer, which is a
station-level setting rather than a personal one: one account is typically
shared per station, and the language can be switched mid-shift by whoever is
standing there. They know the physical process; they may not read the language
the checklist was authored in.

**When they read it:** a checklist appears as a coloured pin on the shift
timeline when its trigger fires. Evocon has seven: Periodical, Regular
intervals, Shift time, Changeover, Quantity produced, Downtime (a specific
stop reason being logged), and Manual activation. The operator taps the pin
and fills the tasks in a modal, sometimes after entering a passcode, sometimes
attaching a photo, sometimes marking a task "not applicable". Then they get
back to running the machine. A checklist not completed in time is marked
missed, so this is read under time pressure.

**What their answers become:** the checklist resolves to New, Successful,
Unsuccessful (some checks not OK), or Missed. That result colours the timeline pin, feeds the
Checklists report and dashboard widgets, and can fire alerts by email or
webhook. A mistranslated threshold or a garbled option does not just confuse
one operator, it corrupts the quality record the plant reports on.

### How to translate, in this context

Evocon's own writing rules apply to tenant content too: **as few words as
possible, as many as necessary**, and phrasing that survives 25+ languages.

1. **Instructional register.** Prefer the imperative. Do not add politeness
   the source does not have.
2. **Keep it as short as the source.** A fragment stays a fragment. Never
   expand `Kontrolli survet` into a full sentence.
3. **Plant vocabulary, not dictionary vocabulary.** Manufacturing terms have
   established shop-floor equivalents. Use the one an operator would say.
4. **No idioms, no wordplay, no cultural references.** They fail across 25+
   languages and are unreadable to a non-native speaker.
5. **Carry specifics through untouched.** Numbers, tolerances, machine and
   part identifiers, product codes, brand names, standard references (ISO,
   HACCP). Never convert units of measure, never round.
6. **Translate the same source term the same way every time.** The operator
   reads the checklist as one document.
7. **When a phrase is ambiguous, pick the reading whose failure is a wasted
   check rather than a missed one.** These strings govern actions on
   machinery and the quality data behind them.

## 1. Scope: what is translatable

**R1.** Exactly these eight string kinds are sent. Each carries its `kind`
verbatim as the wire value in column 3.

| # | String | `kind` | Where it appears to the operator |
|---|--------|--------|----------------------------------|
| 1 | Checklist name | `checklist name` | Shift View checklist modal title, Settings list |
| 2 | Task title | `task` | The prompt the operator reads ("Task" in the editor) |
| 3 | Task description | `task description` | Instruction text under the task title |
| 4 | Unit | `unit` | Next to the numeric input (Measurement tasks) |
| 5 | Warning message (Measurement) | `out-of-range message` | Shown when a value falls outside Min/Max |
| 6 | Warning message (Yes/No) | `no-answer message` | Shown when the operator answers "No" |
| 7 | Option label | `option` | One answer choice (Single/Multi select) |
| 8 | Checklist description | `checklist description` | Standard-operating-procedure text |

**R2.** Nothing else is sent. Specifically never:

- numbers: target value, min/max, sample counts
- system answer labels: Yes / No / Done / Not applicable (the app's own i18n
  owns these; translating them here would produce two competing translations
  of the same word)
- task-setting toggle captions: allow N/A, allow images, multiple samples
- group names: translated at group level, outside checklist scope

**R3.** A producer must not send empty or whitespace-only strings.

The six task types, named as the editor names them, and what each contributes:

| Task type | Contributes |
|-----------|-------------|
| Mark as done | 2, 3 |
| Enter text | 2, 3 |
| Yes/No | 2, 3, 6 |
| Measurement | 2, 3, 4, 5 |
| Single-select | 2, 3, 7 |
| Multi-select | 2, 3, 7 |

Kinds 5 and 6 are the **same input field** in the editor (`warningMessage`).
Its purpose changes with the task type, so it is sent as two kinds: on a
Measurement task the hint reads "Message to operators when measurement is out
of range", on a Yes/No task "Message to operators when the answer is No".
Both are optional.

Character limits, from the editor. These cap the tenant's input *and* the
translation, and each string is sent with its own (R14):

| `kind` | `maxLength` |
|--------|-------------|
| `checklist name` | 50 |
| `task` | 200 |
| `task description` | 500 |
| `unit` | 10 |
| `out-of-range message` | 200 |
| `no-answer message` | 200 |
| `option` | 200 |
| `checklist description` | 500 |

A select task holds 2 to 30 options.

## 2. Identity: the unique string is the unit of translation

**R4.** A translation set is a map from **source string** to translated
string, per language:

```
{ "English": { "Lülita masin välja": "Turn the machine off", … } }
```

Not per task, not per field path. A consumer that stores translations against
field coordinates will not satisfy this contract.

**R5.** Identical source strings are one unit. A producer deduplicates by
exact string before sending; the same text appearing in six places is sent
once and translated once.

**R6.** Deduplication is by exact match, with no trimming, case-folding, or
normalisation. `"Hea"` and `"hea "` are two units.

**R7.** Kind is a property of the unit, not of a field. When one string is
used as two kinds, the first kind encountered in the R11 order wins. A
producer must send each unique string exactly once, with one kind.

Three behaviours follow from R4 and must not be reimplemented as special
cases. They are consequences, and code that special-cases them is a sign the
identity model was not adopted:

- **Editing an original produces a new unit**, which no language has
  translated yet, so it reads as missing. There is no "stale translation"
  state to detect or invalidate.
- **Deleting a task drops its strings** from the collected set, so they are
  neither displayed nor sent. Any translations left in the map are
  unreachable and ignored.
- **Completeness is a property of the set**: a language is complete when every
  currently-collected string has a translation. Deleting a fully-translated
  task cannot make a complete language incomplete.

## 3. Kinds are declared, never inferred

**R8.** Every string is sent with an explicit `kind` (R1). A consumer must
pass it to the model and must not infer it from content. `°C` is knowable as
a unit only because the producer said so; `10` could be a unit, an option, or
a task title.

**R9.** Each kind has its own job. This is what to do with each one.

| `kind` | Where it appears | How to translate it |
|--------|------------------|---------------------|
| `checklist name` | Title of the Shift View modal; also the Settings list, the Checklists report, and dashboard widgets | Short. It is scanned in a list, not read, and it has to stay distinguishable from the other checklists on the same station. |
| `task` | One row in the modal, the thing the operator actually does. The editor prompts for it with "What has to be measured?" on a Measurement task | Imperative and concrete. Highest stakes here: this is the string that decides what someone does to a machine. |
| `task description` | Optional text under the task, read only if the task line is not enough | Same register as the task. May run longer; still no padding. |
| `unit` | Beside the numeric input on a Measurement task. The editor prompts for it with "E.g. pcs, kg, litre" | Convert where the target language has its own convention (`tk` → `pcs`). Leave international symbols alone: `°C`, `kg`, `%`, `mm`, `bar`. The field is 10 characters, so never turn a symbol into a word. |
| `out-of-range message` | Shown when an entered measurement falls outside the configured Min/Max. The editor calls it "Message to operators when measurement is out of range" | The operator has just entered a bad value. Say what to do about it, not that something is wrong. |
| `no-answer message` | Shown when the operator answers "No" on a Yes/No task, which counts as a failed check | Same job as out-of-range. |
| `option` | One choice in a Single or Multi select task, picked at a glance | Translate a task's options as a set: mutually distinguishable and grammatically parallel. If the source options are all nouns, so are the translations. |
| `checklist description` | The checklist's standard-operating-procedure text | The only string an operator may read at length, and the closest to prose. Still no padding. |

**R9a (checklist context).** The strings of one run all belong to one
checklist, and the translator is told so. Every request carries the checklist
it came from, and a partial run (R21) additionally carries the strings it is
*not* re-translating, marked as context rather than as work:

- the checklist name, always, even when it is not itself being translated
- the already-translated strings of the same checklist, in the target
  language, so new work matches the wording the operator already sees
- the untranslated strings of the same checklist, so a term appearing in
  several places is translated once and consistently

Without this a partial run sees a handful of orphaned strings. `Halb` alone
is untranslatable in any useful sense: it could be an option in a visual
quality check or a rating of a surface finish, and the operator reads it in a
list next to options translated during an earlier run. Context is what keeps
the checklist reading as one document instead of a pile of independently
translated fragments.

Context strings are **never returned**. The response contains exactly the
strings that were sent as work (R18).

**R10.** End-of-sentence punctuation is preserved as-is. A source ending
without a full stop returns without one. This matters most for the short
kinds: `task` and `option` are usually fragments, and adding a full stop to
one of a task's options breaks the parallelism R9 requires.

## 4. Source language is not an input

**R11 (ordering).** Strings are sent as an ordered list:

1. checklist name
2. task strings, in task authoring order, fields in on-screen order
3. checklist description: **always last when present**

**R12.** No request field names, implies, or defaults a source language, and
no consumer may require one.

A checklist has an "original text" in the sense of what was authored, but
that is not a fact about any individual string. Real tenants mix languages
inside one checklist (a task typed in Russian among Estonian ones), and both
are equally original.

**R13.** The model detects each string's own language per string, and returns
a string unchanged if it is already in the target language.

**R14 (length).** Every string is sent with the `maxLength` of the field it
came from, because the translator cannot know it otherwise and the limits
differ by an order of magnitude (10 for a unit, 500 for a description).

The limit is a **hard cap on the translation**, not a target:

- Aim for the source's own length. A short source deserves a short
  translation regardless of how much room is left.
- Never pad to fill the space.
- Where a faithful translation would exceed the cap, shorten it: drop
  articles, use the accepted abbreviation, use the shorter synonym. Prefer a
  terse translation that fits over a complete one that does not.

**R14a.** The cap binds in practice, so a consumer must check it. Target
languages routinely run longer than the source: German and Finnish commonly
30–40% longer than English or Estonian, which turns a 200-character task into
an overflow. A response string over its `maxLength` is a failed translation
for that string, handled like any other failure (R19): return the rest, leave
that one missing, never truncate silently. A truncated string is worse than a
missing one, because it looks finished.

The one field where this bites hardest is `unit`: 10 characters. It is also
the field where the answer is usually to keep the international symbol
unchanged (R9) rather than to translate at all.

**R15 (glossary).** Evocon's own UI is already translated into 25+ languages,
and a checklist is read *inside* that UI. A task that says "mark the scrap"
must use the same word as the Shift View scrap button, or the operator sees
two names for one thing on one screen.

Every run is therefore given the Evocon UI terminology for the target
language, as source-term to UI-term pairs:

```json
"glossary": {
  "Scrap": "Praak",
  "Downtime": "Seisakud",
  "Changeover": "Tootevahetus",
  "Station": "Töökeskus",
  "Not applicable": "Pole kohaldatav"
}
```

Rules for using it:

- **A glossary hit wins over a better general translation.** Matching the
  surrounding UI matters more than the most natural rendering of the term in
  isolation.
- **It applies to both stages.** The translate call uses it to get the term
  right; the review call uses it to check the term was kept.
- **It is filtered to the strings in the run.** Sending 1300 UI phrases per
  request wastes tokens; send the entries whose source term actually appears.
- **A miss contributes nothing.** Tenant text is free-form (section 0) and
  mostly will not match. That is expected, not a failure.
- **It never overrides a tenant's own wording.** The glossary settles what an
  Evocon concept is called, not how the tenant phrases their instruction.

**R15a.** The glossary is per target language. An English→Estonian glossary is
useless on a run targeting German, and actively harmful if passed anyway: the
model is handed Estonian text as the reference for German output.

## 5. Request

Sent to stdin of `translate_run.py`, or POSTed to `/translate`:

```json
{
  "language": "English",
  "fields": [
    {"key": "Ohutuskontroll enne tootevahetust", "text": "Ohutuskontroll enne tootevahetust", "kind": "checklist name",        "maxLength": 50},
    {"key": "Mis oli toote kogus?",              "text": "Mis oli toote kogus?",              "kind": "task",                  "maxLength": 200},
    {"key": "tk",                                "text": "tk",                                "kind": "unit",                  "maxLength": 10},
    {"key": "Veenduge, et liin on puhas.",       "text": "Veenduge, et liin on puhas.",       "kind": "checklist description", "maxLength": 500}
  ],
  "context": {
    "checklistName": "Ohutuskontroll enne tootevahetust",
    "translated": [
      {"text": "Kas masin puhastati?", "translation": "Was the machine cleaned?", "kind": "task"}
    ],
    "untranslated": [
      {"text": "Hea", "kind": "option"}
    ]
  },
  "glossary": {
    "Scrap": "Praak",
    "Changeover": "Tootevahetus"
  },
  "translateModel": "claude-haiku-4-5",
  "reviewModel": "claude-opus-4-8",
  "review": true
}
```

| Field | Required | Meaning |
|-------|----------|---------|
| `language` | yes | Target language, as a human-readable name (`"English"`, `"Suomi"`). Not a locale code. |
| `fields` | yes | Ordered list per R11. Empty list = nothing to do; do not call the model. |
| `fields[].key` | yes | Identity of the unit. Opaque to the consumer. |
| `fields[].text` | yes | The source string to translate. |
| `fields[].kind` | yes | One of the eight values in R1. |
| `fields[].maxLength` | yes | Character cap on the translation, from the field the string came from (R14). |
| `context` | yes | The checklist these strings belong to, per R9a. Reference material only, never translated and never returned. |
| `context.checklistName` | yes | The checklist's name, even when it is not in `fields`. |
| `context.translated` | no | Strings of this checklist already translated into `language`, so new work matches existing wording. Omit on a first full run, where there are none. |
| `context.untranslated` | no | Strings of this checklist with no translation yet and not in this run. |
| `glossary` | no | Evocon UI terminology for `language`, per R15. Source term to UI term. Filtered to terms appearing in this run. |
| `translateModel` | no | Defaults to `claude-haiku-4-5`. |
| `reviewModel` | no | Defaults to `claude-opus-4-8`. |
| `review` | no | Defaults to `true`. |

**R16.** `key` is the source string itself (`key === text`), because the
source string is the identity of a unit (R4).

**R17.** A consumer treats `key` as opaque and uses it only to map results
back. This keeps consumers usable by producers with a different identity
scheme, but a producer conforming to this contract sets `key === text`.

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

**R19.** A consumer must never pad a missing translation with its source
text. A partly-failed run returns only what it got, with `type: "error"`. See
section 9 for why this one matters more than it looks.

**R20.** A producer applies `strings` over the existing translation map for
that language. Keys absent from the response keep their existing values.

## 7. Partial runs

**R21.** To translate only what is missing (a task was added, an admin
emptied a field), send only those units as `fields`. R11 ordering applies
within the subset (description last if present). The rest of the checklist
still goes along as `context` (R9a): a partial run is the case where context
matters most, because the strings being translated have to match wording the
operator is already reading.

**R22.** A partial result must never clear or overwrite units that were not
sent. Combined with R20: the response is applied as a merge, never as a
replacement.

This is the ordinary case rather than an optimisation: generating on a
language that already has content always runs missing-only, so cost tracks
what changed rather than checklist size.

## 8. Incomplete translations

**R23.** Missing translations never block saving. A checklist may be saved
with any number of languages incomplete.

**R24.** A string with no translation in the operator's language falls back to
the **original string**, the same rule Shift View already applies to a wholly
untranslated language.

**R25.** The fallback makes no claim about what language the original is in
(R12). A checklist mixing source languages string by string falls back
per string, and the rule does not change.

**R26.** A missing translation must remain visibly missing to the admin.
Together with R19: never write source text into a translation slot, because a
field holding its own source text is indistinguishable from a completed
translation and will never be revisited.

## 9. Rationale (non-normative)

**Why string identity rather than field paths.** Field-path identity forces
you to solve, separately: deduplicating repeated labels, invalidating
translations when an original is edited, and garbage-collecting translations
when a task is deleted. String identity dissolves all three: they become
consequences of the data model rather than features. The cost is R7's
collision rule, which is a genuine but minor loss: a string used as two kinds
gets one kind. In practice a string that reads the same in two roles
translates the same way.

**Why no source language.** Any single declared source language is a lie in a
multi-factory tenant, and a lie the model would then act on. Per-string
detection is both more honest and simpler: there is no field to keep accurate,
no migration when a tenant's assumed base language turns out wrong, and mixed
checklists need no special handling.

**Why never pad with source text (R19, R26).** Padding is the failure mode
that hurts most, because it is invisible. An untranslated field left empty is
obviously unfinished and gets fixed; a field silently holding its source text
looks complete, ships, and reaches an operator who cannot read it. The whole
point of the fallback in R24 is that it happens at *display* time, where it is
recoverable, and never at *storage* time, where it is not.

**Why ordering is load-bearing (R11).** The model returns a bare array of
translations, mapped back by position. This keeps output tokens minimal —
worth real money at 40 strings per run, at the cost of an ordering contract.
A consumer that reorders `fields` breaks every mapping.

## 10. Conformance checklist

Wire-level:

- [ ] result keys == request keys on success (bijective, order-independent)
- [ ] description, when present, is the last element of `fields`
- [ ] a `unit` string carrying an international symbol returns unchanged
- [ ] a `unit` string with a language convention is converted (`tk` → `pcs`)
- [ ] error path returns partial `strings`, never source-language padding
- [ ] no request field names a source language
- [ ] empty `fields` performs no model call
- [ ] a translation longer than its source is accepted while within maxLength
- [ ] every field carries a maxLength matching its kind
- [ ] a translation over maxLength is reported failed, never truncated
- [ ] a 10-character unit cap is enforced on the response
- [ ] every request carries `context.checklistName`
- [ ] a partial run carries the checklist's other strings as context
- [ ] no context string appears in the response
- [ ] the glossary passed matches the target language, never a fixed one
- [ ] a glossary term appearing in a source string survives into the output
- [ ] the glossary reaches the translate call, not only the review call

Identity-level (all observable through the producer's collected set):

- [ ] a string used by two fields appears exactly once in `fields`
- [ ] `"Hea"` and `"hea "` are two units
- [ ] editing an original leaves its old translation unreachable and the new
      text missing
- [ ] deleting a task removes only strings no surviving field uses
- [ ] deleting a fully-translated task leaves completeness unchanged
- [ ] a partial run leaves unsent units untouched

Behaviour-level:

- [ ] a checklist saves while a language is incomplete
- [ ] a missing string displays its original, and still reads as missing to
      the admin
