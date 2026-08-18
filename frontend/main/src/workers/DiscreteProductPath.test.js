import {
  divideGreenAndYellow, addHourPart, getYScale, groupSlicesByColor,
} from './DiscreteProductPath';
describe('DiscreteProductPath', () => {
  describe('DivideGreenAndYellow', () => {
    it('splits slice correctly into 2 parts when it has yellowEnd', () => {
      const slice = {
        sliceStartTmISO: '2022-03-02T05:34:30.000Z',
        sliceEndTmISO: '2022-03-02T05:40:00.000Z',
        yellowEnd: '2022-03-02T05:39:50.000Z',
      };
      const divisionResult = divideGreenAndYellow(slice, 'UTC');
      expect(divisionResult).toStrictEqual([
        {
          elementDuration: 320,
          sliceEndTmISO: '2022-03-02T05:39:50.000Z',
          sliceStartTmISO: '2022-03-02T05:34:30.000Z',
          yellowEnd: '2022-03-02T05:39:50.000Z',
          type: 'SLOW',
        },
        {
          sliceEndTmISO: '2022-03-02T05:40:00.000Z',
          sliceStartTmISO: '2022-03-02T05:39:50.000Z',
          yellowEnd: null,
        },
      ]);
    });

    test('if it doesnt split when slice does not have yellowEnd', () => {
      const slice = {
        sliceStartTmISO: '2022-03-02T05:34:30.000Z',
        sliceEndTmISO: '2022-03-02T05:34:50.000Z',
      };
      const divisionResult = divideGreenAndYellow(slice, 'UTC');
      expect(divisionResult).toStrictEqual([
        {
          sliceStartTmISO: '2022-03-02T05:34:30.000Z',
          sliceEndTmISO: '2022-03-02T05:34:50.000Z',
        },
      ]);
    });
  });
  describe('addHourPart', () => {
    const hourStatistics = [{
      dateTime: '2022-03-07T15:00:00',
      quantity: 37.42,
      averageQty: 0.98,
      scrapQty: 0,
      range: { empty: false },
      availability: 1,
      idealQty: 20,
      oee: 1.87,
      quality: 1,
      performance: 1.871,
      plannedTime: 2400,
      productIdealQty: 20,
      productionTime: 2400,
      delaysTime: 0,
    }];
    const yScale = getYScale(hourStatistics);

    test('if it adds slow parts correctly', () => {
      const accumulator = {
        greenPath: '',
        yellowPath: '',
        yellows: [],
        greens: [],
        lastXStart: -1,
        lastX: -1,
        lastY: -1,
        yScale,
      };
      const hourPart = {
        hourStart: '2022-03-07T15:00:00',
        startSecond: 15 * 60,
        endSecond: 25 * 60,
        parent: { type: 'SLOW' },
      };
      const result = addHourPart({ ...accumulator }, hourPart);
      expect(result).toStrictEqual({
        greenPath: '',
        greens: [],
        lastXStart: -1,
        lastX: -1,
        lastY: -1,
        yScale,
        yellowPath: 'M 900, 500 H 1500 ',
        yellows: [
          {
            endSecond: 25 * 60,
            hourStart: '2022-03-07T15:00:00',
            parent: {
              type: 'SLOW',
            },
            startSecond: 15 * 60,
          },
        ],
      });
      const hourPart2 = {
        hourStart: '2022-03-07T15:00:00',
        startSecond: 25 * 60,
        endSecond: 30 * 60,
        parent: { type: 'SLOW' },
      };
      const result2 = addHourPart(result, hourPart2);
      expect(result2).toStrictEqual({
        greenPath: '',
        greens: [],
        lastXStart: -1,
        lastX: -1,
        lastY: -1,
        yScale,
        yellowPath: 'M 900, 500 H 1500 M 1500, 500 H 1800 ',
        yellows: [
          {
            endSecond: 25 * 60,
            hourStart: '2022-03-07T15:00:00',
            parent: {
              type: 'SLOW',
            },
            startSecond: 15 * 60,
          },
          {
            endSecond: 30 * 60,
            hourStart: '2022-03-07T15:00:00',
            parent: {
              type: 'SLOW',
            },
            startSecond: 25 * 60,
          },
        ],
      });
    });

    test('if it adds green parts correctly', () => {
      const accumulator = {
        greenPath: '',
        yellowPath: '',
        yellows: [],
        greens: [],
        lastXStart: -1,
        lastX: -1,
        lastY: -1,
        yScale,
      };
      const hourPart = {
        hourStart: '2022-03-07T15:00:00',
        startSecond: 15 * 60,
        endSecond: 25 * 60,
        parent: { type: 'PRODUCT' },
      };
      const result = addHourPart({ ...accumulator }, hourPart);
      expect(result).toStrictEqual({
        greenPath: '',
        yScale,
        yellowPath: '',
        greens: [
          {
            endSecond: 25 * 60,
            hourStart: '2022-03-07T15:00:00',
            parent: {
              type: 'PRODUCT',
            },
            startSecond: 15 * 60,
          },
        ],
        lastX: 1500,
        lastXStart: 900,
        lastY: 500,
        yellows: [],
      });
      const hourPart2 = {
        hourStart: '2022-03-07T15:00:00',
        startSecond: 25 * 60,
        endSecond: 30 * 60,
        parent: { type: 'PRODUCT' },
      };
      const result2 = addHourPart(result, hourPart2);
      expect(result2).toStrictEqual({
        greenPath: '',
        yScale,
        yellowPath: '',
        greens: [
          {
            endSecond: 25 * 60,
            hourStart: '2022-03-07T15:00:00',
            parent: {
              type: 'PRODUCT',
            },
            startSecond: 15 * 60,
          },
          {
            endSecond: 30 * 60,
            hourStart: '2022-03-07T15:00:00',
            parent: {
              type: 'PRODUCT',
            },
            startSecond: 25 * 60,
          },
        ],
        lastX: 1800,
        lastXStart: 900,
        lastY: 500,
        yellows: [],
      });
    });
  });
  describe('groupSlicesByColor', () => {
    test('if it groups list of hourParts correctly', () => {
      const hourStatistics = [{
        dateTime: '2022-03-07T15:00:00',
        quantity: 37.42,
        averageQty: 0.98,
        scrapQty: 0,
        range: { empty: false },
        availability: 1,
        idealQty: 20,
        oee: 1.87,
        quality: 1,
        performance: 1.871,
        plannedTime: 2400,
        productIdealQty: 20,
        productionTime: 2400,
        delaysTime: 0,
      }];
      const hourParts = [
        {
          hourStart: '2022-03-07T15:00:00',
          startSecond: 15 * 60,
          endSecond: 25 * 60,
          parent: { type: 'PRODUCT' },
        },
        {
          hourStart: '2022-03-07T15:00:00',
          startSecond: 25 * 60,
          endSecond: (26 * 60) + 40,
          parent: { type: 'SLOW' },
        },
        {
          hourStart: '2022-03-07T15:00:00',
          startSecond: (26 * 60) + 40,
          endSecond: (28 * 60) + 20,
          parent: { type: 'PRODUCT' },
        },
        {
          hourStart: '2022-03-07T15:00:00',
          startSecond: (28 * 60) + 20,
          endSecond: 30 * 60,
          parent: { type: 'PRODUCT' },
        },
      ];
      const yScale = getYScale(hourStatistics);
      const ret = groupSlicesByColor(hourParts, yScale);
      expect(ret).toStrictEqual(
        {
          greenPath: 'M 900, 500 H 1500 M 1600, 500 H 1800 ',
          greens: [
            {
              endSecond: 25 * 60,
              hourStart: '2022-03-07T15:00:00',
              parent: {
                type: 'PRODUCT',
              },
              startSecond: 15 * 60,
            },
            {
              endSecond: (28 * 60) + 20,
              hourStart: '2022-03-07T15:00:00',
              parent: {
                type: 'PRODUCT',
              },
              startSecond: (26 * 60) + 40,
            },
            {
              endSecond: 30 * 60,
              hourStart: '2022-03-07T15:00:00',
              parent: {
                type: 'PRODUCT',
              },
              startSecond: (28 * 60) + 20,
            },
          ],
          lastX: 1800,
          lastXStart: 1600,
          lastY: 500,
          yellowPath: 'M 1500, 500 H 1600 ',
          yellows: [
            {
              endSecond: (26 * 60) + 40,
              hourStart: '2022-03-07T15:00:00',
              parent: {
                type: 'SLOW',
              },
              startSecond: 25 * 60,
            },
          ],
        },
      );
    });
  });
});
