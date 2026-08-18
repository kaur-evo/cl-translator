#!/usr/bin/env python3
"""
Translation test harness.

Takes a folder of checklists, runs each one through the SAME engine the
prototype uses (translate_run.py), checks the result against the rules in
INTEGRATION-CONTRACT.md, and writes a review sheet a native speaker can fill
in without reading any of this.

  python3 run.py --languages English,Suomi
  python3 run.py --languages German --checklists checklists/03-tight-limits.json
  python3 run.py --languages English --mock        # no API calls, no cost

Outputs, all under out/:
  raw/<checklist>__<language>.json   what the engine returned, plus stats
  review__<language>.csv             one row per string, for a native speaker
  report.md                          rule violations and cost, for you
"""
import argparse
import csv
import json
import os
import re
import subprocess
import sys
import unicodedata
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
TRANSLATOR_DIR = os.path.dirname(HERE)
RUNNER = os.path.join(TRANSLATOR_DIR, "translate_run.py")
VENV_PY = os.path.join(TRANSLATOR_DIR, ".venv", "bin", "python")
PY = VENV_PY if os.path.exists(VENV_PY) else sys.executable

# Character limits per kind, from the checklist editor (R1).
LIMITS = {
    "checklist name": 50,
    "task": 200,
    "task description": 500,
    "unit": 10,
    "out-of-range message": 200,
    "no-answer message": 200,
    "option": 200,
    "checklist description": 500,
}

# The warning message is one editor field whose kind depends on the task type
# (checkTypes in the app: MEASUREMENT, YES_NO, TEXT, CHECK, SINGLE_SELECT,
# MULTI_SELECT). Only these two types have a message at all.
MESSAGE_KIND = {
    "MEASUREMENT": "out-of-range message",
    "YES_NO": "no-answer message",
}


# ---------------------------------------------------------------- collection

def collect_strings(checklist):
    """Ordered, typed, deduped strings for one checklist (R5, R7, R11).

    Input is a checklist as the app exports it: GET /checklists/{id}, with
    tasks under `elements`, each carrying `name`, `description`, `unit`,
    `warningMessage` and `selectionOptions[].value`.

    Order is checklist name, then each task's fields in on-screen order, then
    the checklist description last. Identical strings appear once, keeping the
    kind they were first seen with.
    """
    out, seen = [], set()

    def push(text, kind):
        if not isinstance(text, str) or not text.strip() or text in seen:
            return
        seen.add(text)
        out.append({"key": text, "text": text, "kind": kind})

    push(checklist.get("name"), "checklist name")
    for element in checklist.get("elements") or []:
        push(element.get("name"), "task")
        push(element.get("description"), "task description")
        push(element.get("unit"), "unit")
        message_kind = MESSAGE_KIND.get(element.get("type"))
        if message_kind:
            push(element.get("warningMessage"), message_kind)
        for option in element.get("selectionOptions") or []:
            # Exports carry {"value": "..."}; tolerate a bare string too.
            push(option.get("value") if isinstance(option, dict) else option, "option")
    push(checklist.get("description"), "checklist description")
    return out


# ------------------------------------------------------------------ engine

def translate(language, fields, models, mock=False):
    """Run one checklist through translate_run.py and return (strings, stats, error).

    Mock mode echoes the source back so the harness itself can be exercised
    without spending anything. It deliberately produces a result that FAILS
    the identical-to-source check, which is the correct verdict for it.
    """
    if mock:
        return {f["key"]: f["text"] for f in fields}, {"mock": True}, None

    request = {
        "language": language,
        "fields": fields,
        "translateModel": models["translate"],
        "reviewModel": models["review"],
        "review": models["do_review"],
    }
    proc = subprocess.run(
        [PY, RUNNER],
        input=json.dumps(request, ensure_ascii=False),
        capture_output=True, text=True,
    )
    strings, stats, error = {}, {}, None
    for line in proc.stdout.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            msg = json.loads(line)
        except json.JSONDecodeError:
            continue
        if msg.get("type") in ("result", "error"):
            strings = msg.get("strings") or {}
            stats = msg.get("stats") or {}
            error = msg.get("error")
    if not strings and not error:
        error = (proc.stderr or "engine produced no result").strip()[:300]
    return strings, stats, error


# --------------------------------------------------------------- validation

TRAILING_PUNCT = ".!?:;"


def strip_accents(s):
    return "".join(c for c in unicodedata.normalize("NFD", s)
                   if unicodedata.category(c) != "Mn")


def check(field, translation):
    """Rule checks for one string. Returns (fails, warns).

    Fails are contract violations: the string cannot be stored as-is.
    Warns need a human, because the rule they touch has legitimate exceptions.
    """
    kind, source = field["kind"], field["text"]
    limit = LIMITS.get(kind, 200)
    fails, warns = [], []

    if translation is None:
        return ["missing"], []
    if not translation.strip():
        return ["empty"], []

    if len(translation) > limit:
        fails.append(f"over-limit({len(translation)}>{limit})")

    # Identical output is correct for symbols and for text already in the
    # target language, and wrong everywhere else, so a human decides.
    if translation.strip() == source.strip():
        warns.append("identical-to-source")

    # Punctuation is preserved as-is (guide rule 7).
    src_end = source.strip()[-1] if source.strip() else ""
    out_end = translation.strip()[-1] if translation.strip() else ""
    if (src_end in TRAILING_PUNCT) != (out_end in TRAILING_PUNCT):
        warns.append("punctuation-changed")

    # Numbers, tolerances and codes carry through untouched (guide rule 4).
    src_digits = re.findall(r"\d+(?:[.,]\d+)?", source)
    missing_digits = [d for d in src_digits if d not in translation]
    if missing_digits:
        warns.append("number-dropped:" + ",".join(missing_digits[:3]))

    return fails, warns


def check_option_sets(checklist, strings):
    """Options of one task must stay mutually distinguishable (guide, kinds table)."""
    problems = []
    for task in checklist.get("tasks", []):
        options = task.get("options") or []
        if len(options) < 2:
            continue
        translated = [strings.get(o) for o in options if strings.get(o)]
        collapsed = defaultdict(list)
        for original, out in zip(options, translated):
            collapsed[strip_accents(out).casefold().strip()].append(original)
        for group in collapsed.values():
            if len(group) > 1:
                problems.append(
                    f"{task.get('task', '?')!r}: options {group} collapsed to one string")
    return problems


# ------------------------------------------------------------------- output

def write_review_csv(path, rows):
    """One row per string, with empty columns for the reviewer to fill in."""
    with open(path, "w", newline="", encoding="utf-8-sig") as fh:
        writer = csv.writer(fh)
        writer.writerow([
            "Checklist", "Where it is used", "Original", "Translation",
            "Chars", "Limit", "Automated flags", "Verdict (ok / wrong / awkward)", "Your comment",
        ])
        for r in rows:
            writer.writerow([
                r["checklist"], r["kind"], r["source"], r["translation"],
                len(r["translation"] or ""), r["limit"], " ".join(r["flags"]), "", "",
            ])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--languages", required=True,
                    help="comma-separated target languages, e.g. English,Suomi,German")
    ap.add_argument("--checklists", nargs="*",
                    help="specific checklist files (default: every .json in checklists/)")
    ap.add_argument("--translate-model", default="claude-haiku-4-5")
    ap.add_argument("--review-model", default="claude-opus-4-8")
    ap.add_argument("--no-review", action="store_true", help="skip the review stage")
    ap.add_argument("--mock", action="store_true", help="echo sources instead of calling the API")
    ap.add_argument("--out", default=os.path.join(HERE, "out"))
    args = ap.parse_args()

    if not args.mock and not os.environ.get("ANTHROPIC_API_KEY"):
        sys.exit("ANTHROPIC_API_KEY is not set. Either export it:\n"
                 "    ANTHROPIC_API_KEY=sk-ant-... python3 run.py --languages English\n"
                 "or run without calling the API:\n"
                 "    python3 run.py --languages English --mock")

    paths = args.checklists or sorted(
        os.path.join(HERE, "checklists", f)
        for f in os.listdir(os.path.join(HERE, "checklists")) if f.endswith(".json"))
    languages = [l.strip() for l in args.languages.split(",") if l.strip()]
    models = {"translate": args.translate_model, "review": args.review_model,
              "do_review": not args.no_review}

    os.makedirs(os.path.join(args.out, "raw"), exist_ok=True)

    report = ["# Translation test report", ""]
    if args.mock:
        report.append("Run in **mock mode**: sources were echoed back, not translated. "
                      "Every string is expected to flag `identical-to-source`.\n")
    report.append(f"Engine: `{os.path.relpath(RUNNER, TRANSLATOR_DIR)}` via `{PY}`  ")
    report.append(f"Models: translate `{models['translate']}`, "
                  f"review `{models['review'] if models['do_review'] else 'off'}`\n")

    total_cost, total_fails, total_warns = 0.0, 0, 0
    # Same source string across different checklists should land the same way.
    across_checklists = defaultdict(lambda: defaultdict(set))

    for language in languages:
        rows = []
        report.append(f"## {language}\n")
        for path in paths:
            with open(path, encoding="utf-8") as fh:
                checklist = json.load(fh)
            slug = os.path.splitext(os.path.basename(path))[0]
            fields = collect_strings(checklist)

            strings, stats, error = translate(language, fields, models, args.mock)
            total_cost += (stats or {}).get("costUsd", 0) or 0

            with open(os.path.join(args.out, "raw", f"{slug}__{language}.json"),
                      "w", encoding="utf-8") as fh:
                json.dump({"language": language, "checklist": slug, "fields": fields,
                           "strings": strings, "stats": stats, "error": error},
                          fh, ensure_ascii=False, indent=2)

            if error:
                report.append(f"- **{slug}**: engine error — {error}")

            file_fails, file_warns = [], []
            for field in fields:
                translation = strings.get(field["key"])
                fails, warns = check(field, translation)
                total_fails += len(fails)
                total_warns += len(warns)
                for f in fails:
                    file_fails.append(f"`{f}` {field['kind']}: {field['text'][:60]!r}")
                for w in warns:
                    file_warns.append(f"`{w}` {field['kind']}: {field['text'][:60]!r}")
                rows.append({
                    "checklist": checklist.get("name", slug),
                    "kind": field["kind"],
                    "source": field["text"],
                    "translation": translation or "",
                    "limit": LIMITS.get(field["kind"], 200),
                    "flags": fails + warns,
                })
                if translation:
                    across_checklists[field["text"]][language].add(translation)

            for problem in check_option_sets(checklist, strings):
                total_fails += 1
                file_fails.append(f"`options-collapsed` {problem}")

            status = "ok" if not file_fails else f"**{len(file_fails)} to fix**"
            report.append(f"- **{slug}** — {len(fields)} strings, {status}"
                          + (f", {len(file_warns)} to eyeball" if file_warns else ""))
            for line in file_fails:
                report.append(f"    - {line}")
            for line in file_warns[:12]:
                report.append(f"    - {line}")
            if len(file_warns) > 12:
                report.append(f"    - …and {len(file_warns) - 12} more warnings")

        csv_path = os.path.join(args.out, f"review__{language}.csv")
        write_review_csv(csv_path, rows)
        report.append(f"\nReview sheet: `{os.path.basename(csv_path)}` ({len(rows)} strings)\n")

    inconsistent = {src: langs for src, langs in across_checklists.items()
                    if any(len(v) > 1 for v in langs.values())}
    if inconsistent:
        report.append("## Same source, different translations\n")
        report.append("The same string should read the same way everywhere an "
                      "operator meets it.\n")
        for src, langs in list(inconsistent.items())[:20]:
            for lang, variants in langs.items():
                if len(variants) > 1:
                    report.append(f"- {src[:50]!r} in {lang}: {sorted(variants)}")

    report.append("")
    report.append(f"**{total_fails} rule violations, {total_warns} to eyeball.** "
                  f"Cost ${total_cost:.4f}.")

    report_path = os.path.join(args.out, "report.md")
    with open(report_path, "w", encoding="utf-8") as fh:
        fh.write("\n".join(report) + "\n")

    print("\n".join(report[-1:]))
    print(f"\nWrote {report_path}")
    print(f"      {args.out}/review__<language>.csv")
    return 1 if total_fails else 0


if __name__ == "__main__":
    sys.exit(main())
