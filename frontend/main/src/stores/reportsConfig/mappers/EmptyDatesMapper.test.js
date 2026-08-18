import EmptyDates from './EmptyDatesMapper';

describe('EmptyDates', () => {
  const mapperFunc = (item) => item;
  const granularities = ['total', 'year', 'month', 'weekofyear', 'date'];

  const expectedResults = {
    total: {},
    year: {
      1970: { year: '1970' },
    },
    month: {
      197001: { month: '197001' },
      197002: { month: '197002' },
    },
    weekofyear: {
      197004: { weekofyear: '197004' },
      197005: { weekofyear: '197005' },
      197006: { weekofyear: '197006' },
    },
    date: {
      '1970-01-25': { date: '1970-01-25' },
      '1970-01-26': { date: '1970-01-26' },
      '1970-01-27': { date: '1970-01-27' },
      '1970-01-28': { date: '1970-01-28' },
      '1970-01-29': { date: '1970-01-29' },
      '1970-01-30': { date: '1970-01-30' },
      '1970-01-31': { date: '1970-01-31' },
      '1970-02-01': { date: '1970-02-01' },
      '1970-02-02': { date: '1970-02-02' },
      '1970-02-03': { date: '1970-02-03' },
    },
  };

  describe('returns correct dates', () => {
    granularities.forEach((granularity) => {
      test(`while granularity is "${granularity}" `, () => {
        const args = {
          startDate: new Date('1970-01-25T00:00:00.000'),
          endDate: new Date('1970-02-03T00:00:00.000'),
          granularity,
        };
        const emptyDates = new EmptyDates(args);

        const result = emptyDates.mapAsObject(mapperFunc);
        expect(result).toStrictEqual(expectedResults[granularity]);
      });

      test(`reduceToMap while granularity is "${granularity}" `, () => {
        const args = {
          startDate: new Date('1970-01-25T00:00:00.000'),
          endDate: new Date('1970-02-03T00:00:00.000'),
          granularity,
        };
        const emptyDates = new EmptyDates(args);

        const result = emptyDates.reduceToMap(mapperFunc);
        const expectedMap = new Map(Object.entries(expectedResults[granularity]));
        expect(result).toEqual(expectedMap);
      });
    });
  });

  describe('handles different weekStartsOn values', () => {
    test('weekStartsOn is 1 (Monday)', () => {
      const args = {
        startDate: new Date('1970-01-25T00:00:00.000'),
        endDate: new Date('1970-02-03T00:00:00.000'),
        granularity: 'weekofyear',
        weekStartsOn: 1,
      };
      const emptyDates = new EmptyDates(args);

      const result = emptyDates.reduceToMap(mapperFunc);
      const expectedMap = new Map([
        ['197004', { weekofyear: '197004' }],
        ['197005', { weekofyear: '197005' }],
        ['197006', { weekofyear: '197006' }],
      ]);
      expect(result).toEqual(expectedMap);
    });
  });

  describe('handles different date ranges', () => {
    test('single day range', () => {
      const args = {
        startDate: new Date('1970-01-25T00:00:00.000'),
        endDate: new Date('1970-01-25T00:00:00.000'),
        granularity: 'date',
      };
      const emptyDates = new EmptyDates(args);

      const result = emptyDates.mapAsObject(mapperFunc);
      const expected = {
        '1970-01-25': { date: '1970-01-25' },
      };
      expect(result).toStrictEqual(expected);
    });

    test('multiple years range', () => {
      const args = {
        startDate: new Date('1969-01-01T00:00:00.000'),
        endDate: new Date('1971-12-31T00:00:00.000'),
        granularity: 'year',
      };
      const emptyDates = new EmptyDates(args);

      const result = emptyDates.mapAsObject(mapperFunc);
      const expected = {
        1969: { year: '1969' },
        1970: { year: '1970' },
        1971: { year: '1971' },
      };
      expect(result).toStrictEqual(expected);
    });
  });
});
