import { dtFieldType, getLongDateTimeField } from './dateTimeFieldLabel';

describe('dateTimeFieldLabel', () => {
  const expectedResultMapInEnglish = {
    year: 'year',
    quarter: 'quarter',
    month: 'month',
    weekOfYear: 'week',
    weekofyear: 'week',
    weekday: 'day of the week',
    day: 'day',
    date: 'day',
    dayofweek: 'day of the week',
  };

  const expectedResultMapInEstonian = {
    year: 'aasta',
    quarter: 'kvartal',
    month: 'kuu',
    weekOfYear: 'nädal',
    weekofyear: 'nädal',
    weekday: 'nädalapäev',
    day: 'päev',
    dayofweek: 'nädalapäev',
    date: 'päev',
  };

  Object.keys(dtFieldType).forEach((key) => {
    it(`returns correct label for ${key} in English`, () => {
      expect(getLongDateTimeField(key)).toBe(expectedResultMapInEnglish[key]);
    });
  });

  Object.keys(dtFieldType).forEach((key) => {
    it(`returns correct label for ${key} in Estonian`, () => {
      expect(getLongDateTimeField(key, 'et')).toBe(expectedResultMapInEstonian[key]);
    });
  });
});
