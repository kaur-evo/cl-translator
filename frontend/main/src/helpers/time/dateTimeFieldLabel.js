export const dtFieldType = {
  year: 'year',
  quarter: 'quarter',
  month: 'month',
  weekofyear: 'weekOfYear',
  weekday: 'weekday',
  dayofweek: 'weekday',
  date: 'day',
  day: 'day',
};

const fallback = {
  sq: {
    year: 'viti',
    quarter: 'tremujori',
    month: 'muaji',
    weekofyear: 'java e vitit',
    weekday: 'dita e javës',
    dayofweek: 'dita e javës',
    date: 'dita',
    day: 'dita',
  },
};

export function getLongDateTimeField(dtType, language = 'en') {
  if (dtFieldType[dtType.toLowerCase()] === undefined) throw Error(`invalid dateTimeFieldType ${dtType}`);
  if (fallback[language] && fallback[language][dtFieldType[dtType.toLowerCase()]]) {
    return fallback[language][dtFieldType[dtType.toLowerCase()]];
  }
  try {
    const dn = new Intl.DisplayNames(language, { type: 'dateTimeField', style: 'long' });
    return dn.of(dtFieldType[dtType.toLowerCase()]);
  } catch {
    return dtType;
  }
}
