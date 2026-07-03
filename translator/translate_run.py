#!/usr/bin/env python3
"""
translate_run.py — single-language translation runner for the prototype.

Wraps the v3 translate → review → apply pipeline (Anthropic path) into one
callable run that:
  - reads the API key from the environment (ANTHROPIC_API_KEY), not a hardcoded key,
  - translates ONE target language (the user picks it in the UI),
  - lets the caller hot-swap the translate and review models,
  - tracks tokens, per-stage cost, and wall-clock time,
  - streams a log buffer (same style as v3) back to the caller.

Protocol: reads a JSON request on stdin, writes a JSON result on stdout.

Request:
{
  "language": "Spanish",
  "strings": { "key": "Estonian source text", ... },
  "translateModel": "claude-haiku-4-5",
  "reviewModel": "claude-opus-4-8",
  "review": true
}

Result:
{
  "strings": { "key": "translated text", ... },
  "log": ["...", ...],
  "stats": { "translateModel", "reviewModel", "inputTokens", "outputTokens",
             "costUsd", "seconds", "review" }
}
"""
import json
import os
import sys
import time

from anthropic import Anthropic

# --- price table ($ per 1M tokens) for cost estimation ---
# Mirrors the claude-api skill's current pricing. Unknown models fall back to
# the Opus tier so estimates never silently read as free.
PRICES = {
    "claude-opus-4-8":  {"in": 5.0,  "out": 25.0},
    "claude-opus-4-7":  {"in": 5.0,  "out": 25.0},
    "claude-opus-4-6":  {"in": 5.0,  "out": 25.0},
    "claude-sonnet-5":  {"in": 3.0,  "out": 15.0},  # assumed Sonnet-tier pricing
    "claude-sonnet-4-6": {"in": 3.0, "out": 15.0},
    "claude-haiku-4-5": {"in": 1.0,  "out": 5.0},
}
DEFAULT_PRICE = {"in": 5.0, "out": 25.0}

client = Anthropic()  # reads ANTHROPIC_API_KEY from env

# --- glossary (et.json) for terminology consistency, same as v3 ---
GLOSSARY_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "et.json")
glossary = {}
try:
    with open(GLOSSARY_PATH, "r", encoding="utf-8") as f:
        glossary = json.load(f)
except Exception:
    glossary = {}

log_buffer = []
def emit(obj):
    """Write one NDJSON line to stdout and flush immediately (for live streaming)."""
    sys.stdout.write(json.dumps(obj, ensure_ascii=False) + "\n")
    sys.stdout.flush()

def log(msg):
    msg = str(msg)
    log_buffer.append(msg)
    emit({"type": "log", "line": msg})   # stream the line as it happens

# running token + cost totals across both stages
usage = {"in": 0, "out": 0, "cost": 0.0}
def account(model, resp):
    p = PRICES.get(model, DEFAULT_PRICE)
    i = getattr(resp.usage, "input_tokens", 0) or 0
    o = getattr(resp.usage, "output_tokens", 0) or 0
    usage["in"] += i
    usage["out"] += o
    usage["cost"] += (i / 1_000_000) * p["in"] + (o / 1_000_000) * p["out"]


def find_glossary_matches(english_phrase):
    if not glossary:
        return {}
    matches = {}
    phrase_lower = english_phrase.lower()
    phrase_words = set(phrase_lower.split())
    for en_term, et_translation in glossary.items():
        term_lower = en_term.lower()
        if len(term_lower) > 2 and term_lower in phrase_lower:
            matches[en_term] = et_translation
        elif len(term_lower) > 3:
            term_words = set(term_lower.split())
            significant = {w for w in term_words if len(w) > 3}
            if significant and significant.issubset(phrase_words):
                matches[en_term] = et_translation
    return matches


TRANSLATE_TOOLS = [{
    "name": "store_translations",
    "description": "Store translated strings",
    "input_schema": {
        "type": "object",
        "properties": {
            "translations": {
                "type": "array",
                "items": {"type": "string"},
                "description": "List of translated phrases, in the same order as the input",
            }
        },
        "required": ["translations"],
    },
}]

REVIEW_TOOLS = [{
    "name": "store_review_suggestions",
    "description": "List of suggestions to improve translations",
    "input_schema": {
        "type": "object",
        "properties": {
            "suggestions": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "index": {"type": "integer", "description": "0-based index of the phrase"},
                        "existing": {"type": "string"},
                        "suggestion": {"type": "string"},
                        "reason": {"type": "string"},
                    },
                    "required": ["index", "existing", "suggestion", "reason"],
                },
            }
        },
        "required": ["suggestions"],
    },
}]

TRANSLATE_PROMPT = """You are a professional translator for OEE (Overall Equipment Effectiveness) manufacturing software.
Translate each phrase from Estonian into {language}, maintaining consistency and an operator-facing, concise tone suitable for a shop-floor screen.

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
{payload}
"""

REVIEWER_ROLE = "You are a translation quality reviewer specialising in OEE manufacturing software."


def call_translate(language, fields, model, retries=3):
    # Each entry carries its pre-assigned type so the model never guesses
    # (a bare "°C" is only knowable as a unit because we say so).
    prompt = TRANSLATE_PROMPT.format(
        language=language,
        payload=json.dumps(
            [{"type": f["kind"], "text": f["text"]} for f in fields],
            ensure_ascii=False, indent=2,
        ),
    )
    for attempt in range(retries):
        try:
            resp = client.messages.create(
                model=model, max_tokens=4096,
                messages=[{"role": "user", "content": prompt}],
                tools=TRANSLATE_TOOLS,
                tool_choice={"type": "tool", "name": "store_translations"},
            )
            account(model, resp)
            block = next(b for b in resp.content if b.type == "tool_use")
            out = block.input.get("translations", [])
            if isinstance(out, list) and all(isinstance(t, str) for t in out):
                return out
            log(f"⚠️ Invalid translation format for {language}")
        except Exception as e:
            log(f"❌ Translate attempt {attempt+1} failed: {e}")
            time.sleep(2 ** attempt)
    return []


def call_review(language, fields, translations, model, retries=3):
    sources = [f["text"] for f in fields]
    # glossary hints from any matching source phrase
    glossary_matches = {}
    for s in sources:
        glossary_matches.update(find_glossary_matches(s))
    glossary_section = ""
    if glossary_matches:
        glossary_section = (
            "\nEstablished Estonian terminology (et.json) — keep consistent:\n"
            + json.dumps(glossary_matches, ensure_ascii=False, indent=2)
        )
        log(f"  📖 Glossary terms checked: {', '.join(list(glossary_matches.keys())[:8])}")

    pairs = [{"index": i, "type": fields[i]["kind"], "source_et": sources[i],
              "translation": translations[i]}
             for i in range(len(translations))]
    prompt = f"""Review these {language} UI translations of Estonian source strings for OEE software.
Rules:
1. Verify correctness, tone, and any placeholder variables in curly braces.
2. Keep plurals plural and singulars singular.
3. Each phrase carries an explicit "type". Verify type-appropriate handling — in
   particular "unit" strings must use the target language's unit convention
   (international symbols like °C, kg, % stay unchanged).
4. Only suggest a change when the translation is wrong, inconsistent, or unnatural — never if it's already fine.
{glossary_section}

Return suggestions referencing each phrase by its 0-based index. If all are fine, return an empty list.

Phrases:
{json.dumps(pairs, ensure_ascii=False, indent=2)}
"""
    for attempt in range(retries):
        try:
            resp = client.messages.create(
                model=model, max_tokens=4096,
                system=REVIEWER_ROLE,
                messages=[{"role": "user", "content": prompt}],
                tools=REVIEW_TOOLS,
                tool_choice={"type": "tool", "name": "store_review_suggestions"},
            )
            account(model, resp)
            block = next(b for b in resp.content if b.type == "tool_use")
            return block.input.get("suggestions", [])
        except Exception as e:
            log(f"❌ Review attempt {attempt+1} failed: {e}")
            time.sleep(2 ** attempt)
    log("⚠️ Review fallback: no suggestions after retries.")
    return []


def main():
    req = json.load(sys.stdin)
    language = req["language"]
    # Preferred shape: ordered typed fields [{key, text, kind}] — the checklist
    # description is always last. Falls back to the legacy {key: text} map
    # (kind "text") so older callers keep working.
    if "fields" in req:
        fields = req["fields"]
    else:
        fields = [{"key": k, "text": v, "kind": "text"} for k, v in req["strings"].items()]
    do_review = bool(req.get("review", True))
    translate_model = req.get("translateModel", "claude-haiku-4-5")
    review_model = req.get("reviewModel", "claude-opus-4-8")

    keys = [f["key"] for f in fields]
    sources = [f["text"] for f in fields]

    t0 = time.time()
    log(f"🌍 Translating {len(keys)} string(s) → {language}")
    log(f"   translate: {translate_model}" + (f" · review: {review_model}" if do_review else " · review: off"))

    translations = call_translate(language, fields, translate_model)
    if len(translations) != len(sources):
        # Do NOT pad with the Estonian sources — that would silently write the
        # untranslated originals into the fields and look "done". Instead map
        # only what we got; the rest stay untranslated (empty + orange) and the
        # run is flagged as failed so the console shows the error.
        log(f"⚠️ Translation count mismatch ({len(translations)} vs {len(sources)}) — leaving the rest untranslated")
        result_strings = {keys[i]: translations[i] for i in range(min(len(keys), len(translations)))}
        seconds = round(time.time() - t0, 2)
        emit({
            "type": "error",
            "error": f"only {len(translations)} of {len(sources)} strings translated (check the API key / model)",
            "strings": result_strings,
            "log": log_buffer,
            "stats": {
                "translateModel": translate_model,
                "reviewModel": review_model if do_review else None,
                "review": do_review,
                "inputTokens": usage["in"],
                "outputTokens": usage["out"],
                "costUsd": round(usage["cost"], 6),
                "seconds": seconds,
            },
        })
        return
    log(f"✅ Translated {len(translations)} string(s)")

    if do_review and translations:
        log(f"🔍 Reviewing with {review_model}…")
        suggestions = call_review(language, fields, translations, review_model)
        applied = 0
        for s in suggestions:
            idx = s.get("index")
            if isinstance(idx, int) and 0 <= idx < len(translations):
                if translations[idx] == s.get("existing") and s.get("suggestion"):
                    log(f"  ✔️ {translations[idx]} → {s['suggestion']}  ({s.get('reason','')})")
                    translations[idx] = s["suggestion"]
                    applied += 1
        log(f"📝 Review applied {applied} change(s)" if applied else "✅ Review: no changes needed")

    seconds = round(time.time() - t0, 2)
    log(f"⏱  {seconds}s · {usage['in']+usage['out']} tokens · ${usage['cost']:.4f}")

    emit({
        "type": "result",
        "strings": {keys[i]: translations[i] for i in range(len(keys))},
        "log": log_buffer,
        "stats": {
            "translateModel": translate_model,
            "reviewModel": review_model if do_review else None,
            "review": do_review,
            "inputTokens": usage["in"],
            "outputTokens": usage["out"],
            "costUsd": round(usage["cost"], 6),
            "seconds": seconds,
        },
    })


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        emit({"type": "error", "error": str(e), "log": log_buffer})
        sys.exit(1)
