export const getDateLabelFormats = (dateFormat, granularity, translations) => {
  let labelFormat = dateFormat.short;
  let shortFormat = 'dd';
  if (granularity === 'month') {
    labelFormat = 'MMMM';
    shortFormat = 'M';
  } else if (granularity === 'weekofyear') {
    labelFormat = `'${translations.week}' w`;
    shortFormat = 'w';
  } else if (granularity === 'year') {
    labelFormat = 'yyyy';
    shortFormat = 'yyyy';
  }
  return { labelFormat, shortFormat };
};
