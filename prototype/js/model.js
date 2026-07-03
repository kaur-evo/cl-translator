/* ============================================================
   MODEL
   State + data only. No DOM, no rendering.

   The checklist is authored in ESTONIAN (the base language). Translations
   into other languages layer on top and start empty — they're filled by the
   real AI translation call (see controller.js → proxy → Claude Haiku).
   ============================================================ */
window.Model = (function () {

  // Base language of this checklist (what the admin authored).
  // `name` = English name (used for the translator prompt), `label` = endonym
  // shown in the UI (per Figma dropdown 46018:6391), `flag` = flat-flag code.
  const baseLanguage = { name: "Estonian", label: "Eesti", flag: "ee" };

  // Languages added on top. Start empty — admin adds them via + TRANSLATION.
  const languages = [];

  // Languages an admin can pick from in the add-translation overlay — the full
  // set the translator system supports (translator-v3 LANGUAGES, normalized to
  // clean product names; Estonian excluded because it is this checklist's base).
  // Sorted by endonym, as in the Figma language dropdown (46018:6391).
  const available = [
    { name: "Bulgarian",  label: "Български",    flag: "bg" },
    { name: "Chinese Simplified", label: "简体中文", flag: "cn" },
    { name: "Croatian",   label: "Hrvatski",     flag: "hr" },
    { name: "Czech",      label: "Čeština",      flag: "cz" },
    { name: "Danish",     label: "Dansk",        flag: "dk" },
    { name: "Dutch",      label: "Nederlands",   flag: "nl" },
    { name: "English",    label: "English",      flag: "gb" },
    { name: "Finnish",    label: "Suomi",        flag: "fi" },
    { name: "French",     label: "Français",     flag: "fr" },
    { name: "German",     label: "Deutsch",      flag: "de" },
    { name: "Greek",      label: "Ελληνικά",     flag: "gr" },
    { name: "Hebrew",     label: "עברית",        flag: "il" },
    { name: "Hungarian",  label: "Magyar",       flag: "hu" },
    { name: "Italian",    label: "Italiano",     flag: "it" },
    { name: "Latvian",    label: "Latviešu",     flag: "lv" },
    { name: "Lithuanian", label: "Lietuvių",     flag: "lt" },
    { name: "Norwegian",  label: "Norsk",        flag: "no" },
    { name: "Polish",     label: "Polski",       flag: "pl" },
    { name: "Portuguese", label: "Português",    flag: "pt" },
    { name: "Romanian",   label: "Română",       flag: "ro" },
    { name: "Russian",    label: "Русский",      flag: "ru" },
    { name: "Serbian",    label: "Српски",       flag: "rs" },
    { name: "Spanish",    label: "Español",      flag: "es" },
    { name: "Swedish",    label: "Svenska",      flag: "se" },
    { name: "Thai",       label: "ไทย",          flag: "th" },
    { name: "Turkish",    label: "Türkçe",       flag: "tr" },
    { name: "Ukrainian",  label: "Українська",   flag: "ua" },
    { name: "Vietnamese", label: "Tiếng Việt",   flag: "vn" },
  ].sort((a, b) => a.label.localeCompare(b.label));

  // The checklist's name (translatable — operators see it on the Shift View
  // checklist modal) and its standard-operating-procedure description.
  // `base` is the Estonian source; other keys get filled by AI translation.
  const name = {
    base: "Ohutuskontroll enne tootevahetust",
  };
  const description = {
    base: "Veenduge, et olete teostanud ja teavitanud kõikidest ohutusmeetmetest.",
  };

  // Field label → explicit translation kind. The translator NEVER guesses what
  // a string is — every string is sent with a pre-assigned kind (see the dev
  // guide in translator/TRANSLATION-GUIDE.md). Option N labels map to "option".
  const FIELD_KIND = {
    "Question": "question",
    "Description": "task description",
    "Unit": "unit",
    "Out-of-range message": "out-of-range message",
  };
  const kindOf = (field) => FIELD_KIND[field] || (field.startsWith("Option") ? "option" : "text");

  // One task of EVERY Evocon task type, so the preview covers the extreme case.
  // `fields`: [label, charLimit] — the user-generated content that gets translated.
  // `base`: the Estonian source strings. `t`: translations keyed by language,
  // filled by the AI call.
  const tasks = [
    // ---- All six Evocon task types, every translatable field covered ----
    // `fields`: [label, charLimit, kind] — kind drives the hover tooltip.
    // Translatable text = tenant-authored: Question, Description, Unit,
    // Out-of-range message, and select Option labels. NOT translatable (so not
    // listed): Min/Max/target/sample-count (numbers) and Yes/No/Done/Not-
    // applicable (system answer labels, translated automatically).

    {
      id: "t1",
      type: "Mark as done",
      fields: [["Question", 100, "Question"], ["Description", 500, "Description"]],
      base: {
        Question: "Lülita masin välja",
        Description: "Veendu, et kõik ohutusmeetmed on täidetud ja teavitatud.",
      },
      t: {},
    },
    {
      id: "t2",
      type: "Yes / No",
      fields: [["Question", 200, "Question"], ["Description", 500, "Description"]],
      base: {
        Question: "Kas puhvertsoonis on piisavalt ruumi, et hoida tootmist üleval?",
        Description: "Kontrolli puhvertsooni mahtu enne liini taaskäivitamist.",
      },
      t: {},
    },
    {
      id: "t3",
      type: "Measurement",
      // EXTREME #1 — every measurement text field at once.
      fields: [
        ["Question", 200, "Question"],
        ["Description", 500, "Description"],
        ["Unit", 10, "Unit"],
        ["Out-of-range message", 200, "Out-of-range message"],
      ],
      base: {
        Question: "Mis oli toote temperatuur väljastusel?",
        Description: "Mõõda temperatuuri kalibreeritud anduriga liini keskelt.",
        Unit: "°C",
        "Out-of-range message": "Teavita vahetuse juhti enne jätkamist.",
      },
      t: {},
    },
    {
      id: "t4",
      type: "Measurement",
      // EXTREME #2 — a second measurement (different unit + message).
      fields: [
        ["Question", 200, "Question"],
        ["Description", 500, "Description"],
        ["Unit", 10, "Unit"],
        ["Out-of-range message", 200, "Out-of-range message"],
      ],
      base: {
        Question: "Mis oli pakendi kaal?",
        // deliberately long: spans two lines in the review field for most languages
        Description: "Kaalu kolm juhuslikku pakendit otse liinilt, veendu enne mõõtmist, et kaal on tareeritud ja puhas, sisesta kolme mõõtmise aritmeetiline keskmine ning märgi kõik kõrvalekalded kommentaari väljale enne partii vabastamist lattu.",
        Unit: "kg",
        "Out-of-range message": "Eemalda partii ja märgi praaki, kui kaal on vahemikust väljas.",
      },
      t: {},
    },
    {
      id: "t5",
      type: "Single select",
      fields: [
        ["Question", 100, "Question"],
        ["Description", 500, "Description"],
        ["Option 1", 100, "Option"],
        ["Option 2", 100, "Option"],
        ["Option 3", 100, "Option"],
      ],
      base: {
        Question: "Mis oli toote välimus?",
        Description: "Hinda toote välimust visuaalselt hea valgustuse all.",
        "Option 1": "Kole", "Option 2": "Ilus", "Option 3": "Väga ilus",
      },
      t: {},
    },
    {
      id: "t6",
      type: "Multi select",
      // EXTREME #3 — multi-select with description + several options.
      fields: [
        ["Question", 100, "Question"],
        ["Description", 500, "Description"],
        ["Option 1", 100, "Option"],
        ["Option 2", 100, "Option"],
        ["Option 3", 100, "Option"],
        ["Option 4", 100, "Option"],
      ],
      base: {
        Question: "Millised defektid olid pinnal näha?",
        Description: "Märgi kõik täheldatud defektid; vali mitu, kui vajalik.",
        "Option 1": "Kriimustused", "Option 2": "Mullid",
        "Option 3": "Värvimuutus", "Option 4": "Mõlgid",
      },
      t: {},
    },
    {
      id: "t7",
      type: "Multi select",
      // EXTREME #4 — a second multi-select to push the harder type twice.
      fields: [
        ["Question", 100, "Question"],
        ["Description", 500, "Description"],
        ["Option 1", 100, "Option"],
        ["Option 2", 100, "Option"],
        ["Option 3", 100, "Option"],
      ],
      base: {
        Question: "Millised tööriistad olid changeoveri ajal kasutusel?",
        Description: "Vali kõik töövahendid, mida tootevahetuse käigus kasutati.",
        "Option 1": "Mutrivõti", "Option 2": "Kruvikeeraja", "Option 3": "Survemõõdik",
      },
      t: {},
    },
    {
      id: "t8",
      type: "Enter text",
      fields: [["Question", 200, "Question"], ["Description", 500, "Description"]],
      base: {
        Question: "Kirjelda, kui midagi ebatavalist toimus tootevahetusel.",
        Description: "Kirjuta vabas vormis kõik kõrvalekalded või tähelepanekud.",
      },
      t: {},
    },
  ];

  let taskSeq = tasks.length;

  return {
    getBaseLanguage: () => baseLanguage,
    getLanguages: () => languages,
    getAvailable: () => available.filter(a => !languages.some(l => l.name === a.name)),
    addLanguage(lang) {
      if (!languages.some(l => l.name === lang.name)) languages.push(lang);
    },
    removeLanguage(name) {
      const i = languages.findIndex(l => l.name === name);
      if (i > -1) languages.splice(i, 1);
    },
    getTasks: () => tasks,
    getTask: (id) => tasks.find(t => t.id === id),

    // Add a new free-text question task (Estonian base). It has no translations
    // yet, so every added language becomes incomplete until re-translated.
    addTask(questionText) {
      taskSeq += 1;
      tasks.push({
        id: `t${taskSeq}`,
        type: "Enter text",
        fields: [["Question", 200, "Question"]],
        base: { Question: questionText },
        t: {},
      });
    },

    // Is every translatable field translated for this language?
    isComplete(langName) {
      const nameOk = name[langName] != null;
      const descOk = description[langName] != null;
      const tasksOk = tasks.every(task =>
        task.fields.every(([field]) => task.t[langName] && task.t[langName][field] != null)
      );
      return nameOk && descOk && tasksOk;
    },
    // Any added language missing translations?
    hasMissingTranslations() {
      return languages.some(l => !this.isComplete(l.name));
    },

    // Resolve a translatable string for a language, falling back to base.
    text(task, field, langName) {
      return (task.t[langName] && task.t[langName][field]) || task.base[field];
    },
    // The translation only, or null if this field isn't translated yet.
    translatedText(task, field, langName) {
      return (task.t[langName] && task.t[langName][field]) != null
        ? task.t[langName][field] : null;
    },
    // The original (base-language, Estonian) string — shown as the caption.
    baseText(task, field) {
      return task.base[field];
    },
    nameBase() {
      return name.base;
    },
    nameTranslated(langName) {
      return name[langName] != null ? name[langName] : null;
    },
    descriptionFor(langName) {
      return description[langName] || description.base;
    },
    descriptionTranslated(langName) {
      return description[langName] != null ? description[langName] : null;
    },
    descriptionBase() {
      return description.base;
    },

    /* ---- AI translation plumbing ----
       Wire format: an ORDERED list of typed fields, so the translator knows
       exactly what each string is (never guesses, e.g. units) and the general
       description is always the very LAST string. See translator/TRANSLATION-GUIDE.md. */

    // Every base string as [{key, text, kind}], in canonical order:
    // checklist name → tasks (authoring order) → checklist description (last).
    collectBaseFields() {
      const out = [{ key: "__name__", text: name.base, kind: "checklist name" }];
      tasks.forEach(task => {
        task.fields.forEach(([field]) => {
          out.push({ key: `${task.id}::${field}`, text: task.base[field], kind: kindOf(field) });
        });
      });
      out.push({ key: "__description__", text: description.base, kind: "checklist description" });
      return out;
    },
    // Same order, but ONLY the fields still missing a translation for this language.
    collectMissingFields(langName) {
      const missing = (task, field) => !(task.t[langName] && task.t[langName][field] != null);
      const out = [];
      if (name[langName] == null) out.push({ key: "__name__", text: name.base, kind: "checklist name" });
      tasks.forEach(task => {
        task.fields.forEach(([field]) => {
          if (missing(task, field)) {
            out.push({ key: `${task.id}::${field}`, text: task.base[field], kind: kindOf(field) });
          }
        });
      });
      if (description[langName] == null) {
        out.push({ key: "__description__", text: description.base, kind: "checklist description" });
      }
      return out;
    },
    // Store the AI result ({key: translated} map) for a language.
    applyTranslation(langName, keyed) {
      if (keyed.__name__ != null) name[langName] = keyed.__name__;
      if (keyed.__description__ != null) description[langName] = keyed.__description__;
      tasks.forEach(task => {
        task.t[langName] = task.t[langName] || {};
        task.fields.forEach(([field]) => {
          const v = keyed[`${task.id}::${field}`];
          if (v != null) task.t[langName][field] = v;
        });
      });
    },
    // Set (or clear, with null) one field's translation — used when the admin
    // edits a review field by hand or empties it to request a re-translation.
    setFieldTranslation(langName, key, value) {
      if (key === "__name__") {
        if (value == null) delete name[langName]; else name[langName] = value;
        return;
      }
      if (key === "__description__") {
        if (value == null) delete description[langName]; else description[langName] = value;
        return;
      }
      const sep = key.indexOf("::");
      const task = tasks.find(t => t.id === key.slice(0, sep));
      if (!task) return;
      const field = key.slice(sep + 2);
      task.t[langName] = task.t[langName] || {};
      if (value == null) delete task.t[langName][field];
      else task.t[langName][field] = value;
    },
  };
})();
