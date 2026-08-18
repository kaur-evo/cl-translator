# Translation test kit

Runs real checklists through the same engine the prototype uses, checks the
result against the rules, and produces a sheet a native speaker can fill in
without reading any of this.

## Run it

```bash
cd translator/testkit

# try the harness without spending anything (echoes sources back)
python3 run.py --languages English --mock

# the real thing
ANTHROPIC_API_KEY=sk-ant-... python3 run.py --languages English,Suomi,German

# one checklist, no review stage, cheaper
ANTHROPIC_API_KEY=sk-ant-... python3 run.py \
    --languages German --checklists checklists/03-tight-limits.json --no-review
```

Everything lands in `out/` (gitignored):

| File | For |
|------|-----|
| `review__<language>.csv` | the native speaker |
| `report.md` | you: rule violations, cost |
| `raw/<checklist>__<language>.json` | debugging a specific run |

## Adding checklists

Drop a checklist into `checklists/` as the app exports it, the payload from
`GET /checklists/{id}`:

```json
{
  "name": "Ohutuskontroll enne tootevahetust",
  "description": "Veenduge, et ...",
  "elements": [
    {
      "type": "MEASUREMENT",
      "name": "Mis oli toote kaal?",
      "description": "Kaalu kolm juhuslikku pakendit ...",
      "unit": "kg",
      "warningMessage": "Eemalda partii ja märgi praaki, kui ..."
    },
    {
      "type": "SINGLE_SELECT",
      "name": "Milline oli toote välimus?",
      "selectionOptions": [{ "value": "Hea" }, { "value": "Halb" }]
    }
  ]
}
```

`type` is the app's own enum: `MEASUREMENT`, `YES_NO`, `TEXT`, `CHECK`,
`SINGLE_SELECT`, `MULTI_SELECT`. Extra keys are ignored, so an export can go in
untouched. Only `MEASUREMENT` and `YES_NO` carry a `warningMessage`.

The three checklists already here are deliberate: `01` has duplicate options
across two tasks so deduplication is visible, `02` mixes Estonian and Russian
inside one checklist, and `03` sits close to the character limits so a longer
target language has to shorten rather than overflow.

## What gets checked

**Violations** — the string cannot be stored, so the run is wrong:

- `missing` / `empty` — a string was sent and nothing usable came back
- `over-limit(n>m)` — longer than the field allows
- `options-collapsed` — two options of one task became the same string, so the
  operator cannot tell them apart

**Worth eyeballing** — the rule has legitimate exceptions, so a human decides:

- `identical-to-source` — correct for `°C` or text already in the target
  language, wrong everywhere else
- `punctuation-changed` — a full stop gained or lost
- `number-dropped` — a figure in the source is missing from the translation

The report also lists any source string that came back differently in two
checklists, since an operator should meet the same wording everywhere.

## The review sheet

`review__<language>.csv` opens in Excel or Sheets. One row per string, with the
checklist it belongs to, where the string is used, the original, the
translation, its length against the limit, and any automated flags. The last
two columns are empty for the reviewer: **Verdict** (ok / wrong / awkward) and
**Your comment**.

Worth telling the reviewer: judge it as something an operator reads on a
machine mid-shift, not as prose. Blunt and short is correct.
