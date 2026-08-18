# Checklist translation guide

The contract between a checklist-authoring app and the AI translation
pipeline: what may be sent, how it is identified, what comes back, and what
must happen when a translation is incomplete.

Written to be implemented against, by two kinds of reader:

- **An engine integrating this pipeline** needs sections 1–8. These are
  normative, and rules are numbered (`R1`, `R2`, …) so they can be cited.
- **An agent doing the translating** needs section 0 for the domain context
  the strings themselves have been stripped of, then R9 for how to handle each
  of the eight kinds, plus R10 (punctuation) and R13–R14 (source language,
  length).

Section 9 is rationale, section 10 is a conformance checklist. Where this
document and an implementation disagree, this document is wrong and should be
fixed. It describes an existing working pipeline (`translate_run.py`,
`prototype/js/model.js`), not a proposal.

**Reference implementations.** Producer: `prototype/js/model.js`
(`collectStrings`). Consumer: `translator/translate_run.py`. Browser-side
consumer: `prototype/js/backend-direct.js`.

## 0. Domain context: what these strings actually are

An agent translating these strings is not translating documentation, marketing
copy, or a UI shell. It is translating **individual strings pulled out of one
production-floor checklist**, which will be reassembled and shown to a machine
operator mid-shift. This section exists so that context survives the trip.

**The product.** Evocon is a production-monitoring platform for manufacturing.
Sensors on a machine capture output and stoppages automatically; operators add
the context a sensor cannot: why a machine stopped, what was scrapped, and
the results of quality checks. Checklists are that last part: structured
quality and compliance checks, licensed separately, filled on the shop floor.

**Who reads the output.** A machine operator, standing at a station, on a
large touch screen, mid-shift, often wearing gloves, frequently under time
pressure, and reading in their own configured language rather than the one the
checklist was written in. They are a domain expert in the physical process and
not necessarily a fluent reader of the source language. This is the single
most important fact about the audience: **operational clarity beats
elegance.** A blunt, unambiguous instruction is correct; a graceful ambiguous
one is a defect.

**Who writes the input.** A plant manager, production engineer, or quality
manager, authoring in Settings on a desktop. They write in shop-floor
shorthand, use plant-local jargon, abbreviate freely (`tk`, `min`, `pcs`), and
frequently write terse fragments rather than sentences.

**Where each kind is used.** A checklist appears in Shift View as a coloured
pin on the shift timeline, at a moment defined by its frequency: every two
hours, after every 1000 units, on a product changeover, when a specific stop
reason is logged, or on demand. The operator taps the pin, and a modal opens
containing the checklist name, the due time, and every task in order:

- **`checklist name`** titles that modal and identifies the checklist in
  Settings lists, report tables, and dashboard widgets. It is scanned, not
  read, often in a list beside a dozen others, so it must stay
  distinguishable from its neighbours and short enough not to truncate.
- **`task`** is the actual instruction the operator acts on, one per row.
  This is the highest-stakes kind in the set: an operator misreading it takes
  the wrong physical action on a machine. Imperative and concrete.
- **`task description`** is optional supporting text beneath a task, used for
  the detail that would not fit in the task line: a method, a caveat, a
  threshold. Read only when the task alone is not enough.
- **`unit`** sits beside a numeric input (`°C`, `kg`, `tk`, `bar`). Ten
  characters, no room for a word where a symbol belongs. See R9.
- **`out-of-range message`** fires the moment a measurement falls outside its
  configured min/max. The operator has just entered a bad reading; this text
  must say what to do about it, not merely that something is wrong.
- **`no-answer message`** fires when an operator answers "No" on a Yes/No
  task, which by convention means the check failed. Same job as above.
- **`option`** is one choice in a single- or multi-select list, read as a set
  and chosen between at a glance. Options are translated as a group and must
  stay mutually distinguishable and grammatically parallel. If the source
  options are all nouns, the translations are all nouns.
- **`checklist description`** is the standard-operating-procedure text for the
  checklist as a whole: the longest string in the set, the one closest to
  ordinary prose, and the only one an operator may read at length.

**What the answers feed.** Task results are not just displayed and forgotten.
A checklist resolves to successful, unsuccessful, or missed; that status
colours the timeline pin, aggregates into the Checklists report, drives
dashboard widgets, and can trigger alerts by email or webhook. A mistranslated
threshold or a garbled option label therefore corrupts quality data, not just
one screen.

**Consequences for the translation itself:**

- **Register is instructional, not conversational.** Prefer the imperative.
  Address the operator directly if the target language requires a choice; do
  not invent politeness the source does not have.
- **Terminology follows the plant, not the dictionary.** Manufacturing terms
  have established shop-floor equivalents in every target language. Use them.
- **Preserve the source's specificity exactly.** Numbers, tolerances, machine
  and part identifiers, product codes, brand names, and standard references
  (ISO, HACCP) are carried through untouched. Never convert a value or a
  measurement system, and never round.
- **Preserve terseness.** A source fragment stays a fragment. Do not expand
  `Kontrolli survet` into a full polite sentence.
- **Consistency across the set outweighs local perfection.** The same source
  term appearing in several strings is translated the same way every time.
  The operator reads them as one document, and R5 means one string is
  literally one unit.
- **Ambiguity resolves toward the physically safer reading.** These strings
  govern actions on machinery and food-safety-grade quality checks. Where a
  source phrase admits two readings, choose the one whose failure mode is a
  needless check rather than a missed one.

Nothing in this section relaxes any rule below. It exists so an agent can make
the judgement calls the rules do not cover.

## 1. Scope: what is translatable

**R1.** Exactly these eight string kinds are sent. Each carries its `kind`
verbatim as the wire value in column 3.

| # | String | `kind` | Where it appears to the operator |
|---|--------|--------|----------------------------------|
| 1 | Checklist name | `checklist name` | Shift View checklist modal title, Settings list |
| 2 | Task title | `task` | The prompt the operator reads ("Task" in the editor) |
| 3 | Task description | `task description` | Instruction text under the task title |
| 4 | Unit | `unit` | Next to the numeric input (Measurement tasks) |
| 5 | Out-of-range message | `out-of-range message` | Shown when a value falls outside min/max |
| 6 | No-answer message | `no-answer message` | Shown when the operator answers "No" |
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

Which kinds a task contributes depends on its type: Mark-as-done and
Enter-text contribute 2–3; Yes/No contributes 2–3 and 6; Measurement
contributes 2–5; Single/Multi select contribute 2–3 and 7.

Authoring limits, for length-aware translation: task 200, task description
500, unit 10, both message kinds 200, option 200 (max 30 options per select
task). These are source-side limits; see R14.

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

**R9.** Each kind carries its own handling. Section 1 says which kinds exist
and section 0 says where they appear; this is what to do with each one.

| `kind` | Handling |
|--------|----------|
| `checklist name` | Keep it short. It is scanned in a list beside other checklists and in report tables, so it must stay distinguishable from its neighbours and short enough not to truncate. |
| `task` | The instruction the operator acts on. Imperative and concrete. Highest stakes in the set: misreading it means the wrong physical action on a machine. |
| `task description` | Supporting detail below the task. Same register as the task, but it may run longer, and it is only read when the task line alone is not enough. |
| `unit` | Convert to the target language's convention where one exists (`tk` → `pcs`). Return international symbols unchanged: `°C`, `kg`, `%`, `mm`, `bar`. Never expand a symbol into a word: the field is ten characters wide. |
| `out-of-range message` | Fires the instant a measurement falls outside min/max. The operator has just entered a bad reading, so say what to do about it, not merely that something is wrong. |
| `no-answer message` | Fires when the operator answers "No" on a Yes/No task, which by convention means the check failed. Same job as out-of-range. |
| `option` | One choice in a select list, read as a set at a glance. Translate the options of a task as a group: keep them mutually distinguishable and grammatically parallel. If the source options are all nouns, the translations are all nouns. |
| `checklist description` | The standard-operating-procedure text, and the only string an operator may read at length. Closest to ordinary prose; still no padding. |

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

**R14.** Translations may exceed the source length. Authoring limits (section
1) constrain what an admin types, not what a translation may be; German and
Finnish routinely run longer than Estonian. A consumer must not truncate, and
a producer must not reject a longer translation.

**R15.** A glossary (e.g. `et.json`) is keyed on **matching source text**, and
contributes hints only when a phrase matches. It is not a declaration that
inputs are in its language, and a non-matching glossary contributes nothing.

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
| `language` | yes | Target language, as a human-readable name (`"English"`, `"Suomi"`). Not a locale code. |
| `fields` | yes | Ordered list per R11. Empty list = nothing to do; do not call the model. |
| `fields[].key` | yes | Identity of the unit. Opaque to the consumer. |
| `fields[].text` | yes | The source string to translate. |
| `fields[].kind` | yes | One of the eight values in R1. |
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
emptied a field), send only those units. R11 ordering applies within the
subset (description last if present).

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
- [ ] a translation longer than its source is accepted, not truncated

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
