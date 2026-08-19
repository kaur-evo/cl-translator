/* ============================================================
   MODEL
   State + data only. No DOM, no rendering.

   The checklist's base language is ESTONIAN, but a few fields are deliberately
   authored in Russian (t2, and some options in t5/t6) — real tenant checklists
   are often a mix, whoever set up a given task typed it in their own language.
   Translations into other languages layer on top and start empty — they're
   filled by the real AI translation call (see controller.js → proxy → Claude).
   ============================================================ */
window.Model = (function () {

  // Base language of this checklist (what the admin authored).
  // `name` = English name (used for the translator prompt), `label` = endonym
  // shown in the UI (per Figma dropdown 46018:6391), `flag` = flat-flag code.
  const baseLanguage = { name: "Estonian", label: "Eesti", flag: "ee" };

  // Languages added on top. Start empty — admin adds them via + TRANSLATION.
  const languages = [];

  // Translations keyed by SOURCE STRING, not by task/field:
  //   { "English": { "Lülita masin välja": "Turn the machine off", … } }
  // See the translation layer section at the bottom for why.
  const trans = {};

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
    "Task": "task",
    "Description": "task description",
    "Unit": "unit",
    "Out-of-range message": "out-of-range message",
    "Message": "no-answer message", // Yes/No: shown when the operator answers 'No'
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
      fields: [["Task", 200, "Task"], ["Description", 500, "Description"]],
      base: {
        Task: "Lülita masin välja",
        Description: "Veendu, et kõik ohutusmeetmed on täidetud ja teavitatud.",
      },
      t: {},
    },
    {
      id: "t2",
      type: "Yes / No",
      // Yes/No also carries a Message shown when the operator answers 'No'.
      // Authored in Russian — mixed-source-language checklists are common in
      // multi-factory tenants (whoever set up this task typed it in Russian).
      fields: [["Task", 200, "Task"], ["Description", 500, "Description"], ["Message", 200, "Message"]],
      base: {
        Task: "Достаточно ли места в буферной зоне для поддержания производства?",
        Description: "Проверьте объём буферной зоны перед перезапуском линии.",
        Message: "Не запускайте линию, пока буферная зона не будет освобождена, и сообщите руководителю смены.",
      },
      t: {},
    },
    {
      id: "t3",
      type: "Measurement",
      // EXTREME #1 — every measurement text field at once.
      fields: [
        ["Task", 200, "Task"],
        ["Description", 500, "Description"],
        ["Unit", 10, "Unit"],
        ["Out-of-range message", 200, "Out-of-range message"],
      ],
      base: {
        Task: "Mis oli toote temperatuur väljastusel?",
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
        ["Task", 200, "Task"],
        ["Description", 500, "Description"],
        ["Unit", 10, "Unit"],
        ["Out-of-range message", 200, "Out-of-range message"],
      ],
      base: {
        Task: "Mis oli pakendi kaal?",
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
        ["Task", 200, "Task"],
        ["Description", 500, "Description"],
        ["Option 1", 200, "Option"],
        ["Option 2", 200, "Option"],
        ["Option 3", 200, "Option"],
      ],
      base: {
        // Task/description in Estonian, but the options were typed by a Russian-
        // speaking operator lead — mixed source language within one task.
        Task: "Mis oli toote välimus?",
        Description: "Hinda toote välimust visuaalselt hea valgustuse all.",
        "Option 1": "Плохой", "Option 2": "Хороший", "Option 3": "Отличный",
      },
      t: {},
    },
    {
      id: "t6",
      type: "Multi select",
      // EXTREME #3 — multi-select with description + several options.
      fields: [
        ["Task", 200, "Task"],
        ["Description", 500, "Description"],
        ["Option 1", 200, "Option"],
        ["Option 2", 200, "Option"],
        ["Option 3", 200, "Option"],
        ["Option 4", 200, "Option"],
      ],
      base: {
        // Same mix here: Estonian task/description, Russian option labels.
        Task: "Millised defektid olid pinnal näha?",
        Description: "Märgi kõik täheldatud defektid; vali mitu, kui vajalik.",
        "Option 1": "Царапины", "Option 2": "Пузыри",
        "Option 3": "Värvimuutus", "Option 4": "Mõlgid",
      },
      t: {},
    },
    {
      id: "t7",
      type: "Multi select",
      // EXTREME #4 — a second multi-select to push the harder type twice.
      fields: [
        ["Task", 200, "Task"],
        ["Description", 500, "Description"],
        ["Option 1", 200, "Option"],
        ["Option 2", 200, "Option"],
        ["Option 3", 200, "Option"],
      ],
      base: {
        Task: "Millised tööriistad olid changeoveri ajal kasutusel?",
        Description: "Vali kõik töövahendid, mida tootevahetuse käigus kasutati.",
        "Option 1": "Mutrivõti", "Option 2": "Kruvikeeraja", "Option 3": "Survemõõdik",
      },
      t: {},
    },
    {
      id: "t8",
      type: "Enter text",
      fields: [["Task", 200, "Task"], ["Description", 500, "Description"]],
      base: {
        Task: "Kirjelda, kui midagi ebatavalist toimus tootevahetusel.",
        Description: "Kirjuta vabas vormis kõik kõrvalekalded või tähelepanekud.",
      },
      t: {},
    },
  ];

  let taskSeq = tasks.length;
  let randomTaskCount = 0; // alternates addRandomTask's source language

  // Every unique translatable source string currently in the checklist, in
  // checklist order (name, then tasks, then description). Deduped by string.
  // Module-scoped so pruning can use it without going through the public API.
  function currentStrings() {
    const seen = new Set();
    const out = [];
    const push = (text, kind) => {
      if (text == null || text === "" || seen.has(text)) return;
      seen.add(text);
      out.push({ key: text, text, kind });
    };
    push(name.base, "checklist name");
    tasks.forEach(task => {
      task.fields.forEach(([field]) => push(task.base[field], kindOf(field)));
    });
    push(description.base, "checklist description");
    return out;
  }

  // Spec: "If a task is deleted/edited in a way that a unique phrase is
  // removed, then those translations for that phrase will be removed from the
  // translations." Drop every stored translation whose source string is no
  // longer used anywhere in the checklist. A phrase still used by another task
  // keeps its translation, since strings are deduped and shared.
  function pruneOrphanedTranslations() {
    const live = new Set(currentStrings().map(s => s.key));
    Object.keys(trans).forEach(lang => {
      Object.keys(trans[lang]).forEach(src => {
        if (!live.has(src)) delete trans[lang][src];
      });
    });
  }

  return {
    getBaseLanguage: () => baseLanguage,
    getLanguages: () => languages,
    getAvailable: () => available.filter(a => !languages.some(l => l.name === a.name)),
    addLanguage(lang) {
      // The base language is never a translation target — even if something
      // upstream (a picker built from stale options, a test harness, etc.)
      // hands it in, refuse it structurally rather than trust every caller.
      if (lang.name === baseLanguage.name) return;
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
        fields: [["Task", 200, "Task"]],
        base: { Task: questionText },
        t: {},
      });
    },

    // Mocking helper: generate a random task of a random type with plausible
    // field values, so + TASK can be used repeatedly to build test data
    // without typing anything. Alternates source language on every other
    // call (Estonian, then Russian, then Estonian, …) — same mixed-tenant
    // scenario as the seed data, so repeated use keeps stressing it. No
    // translations yet, so every added language becomes incomplete (same as addTask).
    addRandomTask() {
      taskSeq += 1;
      randomTaskCount += 1;
      const id = `t${taskSeq}`;
      const russian = randomTaskCount % 2 === 0; // every OTHER call
      const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
      const templates = [
        { type: "Mark as done",
          fields: [["Task", 200, "Task"], ["Description", 500, "Description"]],
          et: { Task: pick(["Lülita seade välja", "Puhasta tööpind", "Sulge kaitsekate"]),
                Description: "Kinnita, et toiming on lõpetatud." },
          ru: { Task: pick(["Выключите оборудование", "Очистите рабочую поверхность", "Закройте защитный кожух"]),
                Description: "Подтвердите, что действие завершено." } },
        { type: "Yes / No",
          fields: [["Task", 200, "Task"], ["Description", 500, "Description"], ["Message", 200, "Message"]],
          et: { Task: pick(["Kas kõik anduri on kalibreeritud?", "Kas ohutuslukk on aktiveeritud?"]),
                Description: "Kontrolli enne järgmise etapi alustamist.",
                Message: "Teavita vahetuse juhti enne jätkamist." },
          ru: { Task: pick(["Все ли датчики откалиброваны?", "Активирована ли блокировка безопасности?"]),
                Description: "Проверьте перед началом следующего этапа.",
                Message: "Сообщите руководителю смены перед продолжением." } },
        { type: "Measurement",
          fields: [["Task", 200, "Task"], ["Description", 500, "Description"], ["Unit", 10, "Unit"], ["Out-of-range message", 200, "Out-of-range message"]],
          et: { Task: pick(["Mis oli survetase?", "Mis oli vibratsioonitase?"]),
                Description: "Mõõda kalibreeritud seadmega.",
                Unit: pick(["bar", "Hz", "mm"]),
                "Out-of-range message": "Peata liin ja teavita hooldust." },
          ru: { Task: pick(["Каков был уровень давления?", "Каков был уровень вибрации?"]),
                Description: "Измерьте калиброванным прибором.",
                Unit: pick(["бар", "Гц", "мм"]),
                "Out-of-range message": "Остановите линию и сообщите в службу техобслуживания." } },
        { type: "Single select",
          fields: [["Task", 200, "Task"], ["Description", 500, "Description"], ["Option 1", 200, "Option"], ["Option 2", 200, "Option"], ["Option 3", 200, "Option"]],
          et: { Task: "Milline oli üldine seisukord?", Description: "Vali sobivaim variant.",
                "Option 1": "Halb", "Option 2": "Rahuldav", "Option 3": "Hea" },
          ru: { Task: "Каково было общее состояние?", Description: "Выберите наиболее подходящий вариант.",
                "Option 1": "Плохое", "Option 2": "Удовлетворительное", "Option 3": "Хорошее" } },
        { type: "Multi select",
          fields: [["Task", 200, "Task"], ["Description", 500, "Description"], ["Option 1", 200, "Option"], ["Option 2", 200, "Option"], ["Option 3", 200, "Option"]],
          et: { Task: "Millised probleemid esinesid?", Description: "Vali kõik, mis kehtivad.",
                "Option 1": "Müra", "Option 2": "Leke", "Option 3": "Ülekuumenemine" },
          ru: { Task: "Какие проблемы возникли?", Description: "Выберите все подходящие варианты.",
                "Option 1": "Шум", "Option 2": "Утечка", "Option 3": "Перегрев" } },
        { type: "Enter text",
          fields: [["Task", 200, "Task"], ["Description", 500, "Description"]],
          et: { Task: "Kirjelda vahetuse käigus tekkinud kõrvalekaldeid.",
                Description: "Vabas vormis, too välja ka aeg." },
          ru: { Task: "Опишите отклонения, произошедшие во время смены.",
                Description: "В свободной форме, укажите также время." } },
      ];
      const t = pick(templates);
      const base = russian ? t.ru : t.et;
      tasks.push({ id, type: t.type, fields: t.fields, base: { ...base }, t: {} });
      return id;
    },

    // Duplicate a task (deep-copies base strings; translations start empty on
    // the copy since it's a distinct entity — every language becomes incomplete).
    duplicateTask(id) {
      const src = tasks.findIndex(t => t.id === id);
      if (src === -1) return null;
      taskSeq += 1;
      const copy = { id: `t${taskSeq}`, type: tasks[src].type,
        fields: tasks[src].fields.map(f => [...f]),
        base: { ...tasks[src].base }, t: {} };
      tasks.splice(src + 1, 0, copy);
      return copy.id;
    },
    removeTask(id) {
      const i = tasks.findIndex(t => t.id === id);
      if (i > -1) tasks.splice(i, 1);
      pruneOrphanedTranslations();
    },

    // Edit a single base field's text directly (mocking tool — the flat
    // per-task edit dialog, not the real Evocon task editor). A changed
    // original is a new, untranslated string; if the old one was the last
    // instance of that phrase, its translations go with it.
    setTaskBaseField(id, field, value) {
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      task.base[field] = value;
      // No pruning here: one save writes several fields in a loop, and two
      // fields swapping values would momentarily orphan a phrase that the
      // finished edit still uses. The caller runs syncTranslations() once the
      // whole edit is committed.
    },

    // Re-check the checklist against the stored translations and drop any that
    // no longer have a source string. Call after committing an edit (the spec
    // puts this check on the checklist/task edit or the save attempt).
    syncTranslations() { pruneOrphanedTranslations(); },

    /* ---- Translation layer: UNIQUE STRINGS, not per-field ----
       A translation is keyed by the SOURCE STRING itself, not by which task or
       field it came from. Consequences (all intentional, per the spec):
         - "Good" appearing in five tasks is ONE string to translate once.
         - Editing an original produces a NEW string, which is untranslated —
           the old translation is simply no longer collected.
         - Deleting a task, or editing it so a phrase is no longer used
           anywhere, removes that phrase's translations outright (spec:
           "If a task is deleted/edited in a way that a unique phrase is
           removed, then those translations for that phrase will be removed
           from the translations"). Enforced by pruneOrphanedTranslations()
           after every edit that can orphan a string, so a phrase that later
           comes back returns untranslated rather than resurrecting its old
           translation. If another task still uses the same string, it survives.
       `trans` is { langName: { sourceString: translatedString } }. */

    // Every unique translatable source string, in checklist order:
    // name → tasks (authoring order, fields in on-screen order) → description.
    // Deduped by string, first occurrence wins for `kind`.
    collectStrings() { return currentStrings(); },
    // Same, but only strings this language hasn't translated yet.
    collectMissingStrings(langName) {
      const t = trans[langName] || {};
      return this.collectStrings().filter(s => t[s.key] == null);
    },
    // Is every unique string translated for this language?
    isComplete(langName) {
      return this.collectMissingStrings(langName).length === 0;
    },
    // Does this checklist have anything to translate at all? Used to gate the
    // + TRANSLATION CTA — a checklist with no name/tasks/description yet has
    // no strings, so there is nothing to generate.
    hasTranslatableContent() {
      return this.collectStrings().length > 0;
    },
    // Any added language missing translations?
    hasMissingTranslations() {
      return languages.some(l => !this.isComplete(l.name));
    },
    // Per-language: is this specific row incomplete? (drives the row warning)
    isMissing(langName) {
      return !this.isComplete(langName);
    },

    // Translation for a source string, or null.
    translationOf(sourceString, langName) {
      const t = trans[langName];
      return t && t[sourceString] != null ? t[sourceString] : null;
    },
    // Resolve for display, falling back to the original string.
    resolve(sourceString, langName) {
      return this.translationOf(sourceString, langName) ?? sourceString;
    },

    nameBase() { return name.base; },
    descriptionBase() { return description.base; },
    baseText(task, field) { return task.base[field]; },

    // Store an AI result ({sourceString: translated}) for a language.
    applyTranslation(langName, keyed) {
      trans[langName] = trans[langName] || {};
      Object.keys(keyed).forEach(src => {
        if (keyed[src] != null) trans[langName][src] = keyed[src];
      });
    },
    // Set (or clear, with null) one string's translation.
    setStringTranslation(langName, sourceString, value) {
      trans[langName] = trans[langName] || {};
      if (value == null || value === "") delete trans[langName][sourceString];
      else trans[langName][sourceString] = value;
    },
    // Drop a whole language's translation set.
    clearTranslations(langName) { delete trans[langName]; },
  };
})();
