import { splitSliceByHours, getSecondsFromHourStart } from './timelineUtils';

describe('splitSliceByHours tests', () => {
  it('returns single slice when in same hour', () => {
    const slice = {
      sliceStartTmISO: '2020-01-01T05:12:22.000Z',
      sliceEndTmISO: '2020-01-01T05:22:22.000Z',
    };
    const splitSlice = splitSliceByHours(slice, 'UTC');
    expect(splitSlice.length).toBe(1);
    expect(splitSlice[0]).toEqual({
      parent: { ...slice },
      startTimeISO: '2020-01-01T05:12:22.000Z',
      endTimeISO: '2020-01-01T05:22:22.000Z',
      hourStart: '2020-01-01T05:00:00.000Z',
      elementDuration: 10 * 60,
      startSecond: (12 * 60) + 22,
      endSecond: (22 * 60) + 22,
      isFirstSegment: true,
    });
  });

  it('returns multiple slices when spanning multiple hours', () => {
    const slice = {
      sliceStartTmISO: '2020-01-01T05:12:22.000Z',
      sliceEndTmISO: '2020-01-01T07:22:22.000Z',
    };
    const splitSlice = splitSliceByHours(slice, 'UTC');

    expect(splitSlice.length).toBe(3);
    expect(splitSlice[0]).toEqual(
      {
        parent: { ...slice },
        startTimeISO: '2020-01-01T05:12:22.000Z',
        endTimeISO: '2020-01-01T05:59:59.999Z',
        hourStart: '2020-01-01T05:00:00.000Z',
        elementDuration: (47 * 60) + 38, // 47min38sec
        startSecond: (12 * 60) + 22,
        endSecond: (59 * 60) + 59.999,
        isFirstSegment: true,
      },
    );

    expect(splitSlice[1]).toEqual(
      {
        parent: { ...slice },
        startTimeISO: '2020-01-01T06:00:00.000Z',
        endTimeISO: '2020-01-01T06:59:59.999Z',
        hourStart: '2020-01-01T06:00:00.000Z',
        elementDuration: (60 * 60), // 60min
        startSecond: 0,
        endSecond: (59 * 60) + 59.999,
        isFirstSegment: false,
      },
    );

    expect(splitSlice[2]).toEqual(
      {
        parent: { ...slice },
        startTimeISO: '2020-01-01T07:00:00.000Z',
        endTimeISO: '2020-01-01T07:22:22.000Z',
        hourStart: '2020-01-01T07:00:00.000Z',
        elementDuration: (22 * 60) + 22, // 22min22sec
        startSecond: 0,
        endSecond: (22 * 60) + 22,
        isFirstSegment: false,
      },
    );
  });

  it('returns multiple slices when spanning over midnight', () => {
    const slice = {
      sliceStartTmISO: '2020-01-01T23:12:22.000Z',
      sliceEndTmISO: '2020-01-02T00:22:22.000Z',
    };
    const splitSlice = splitSliceByHours(slice, 'UTC');

    expect(splitSlice.length).toBe(2);
    expect(splitSlice[0]).toEqual(
      {
        parent: { ...slice },
        startTimeISO: '2020-01-01T23:12:22.000Z',
        endTimeISO: '2020-01-01T23:59:59.999Z',
        hourStart: '2020-01-01T23:00:00.000Z',
        elementDuration: (47 * 60) + 38, // 47min38sec
        startSecond: (12 * 60) + 22,
        endSecond: (59 * 60) + 59.999,
        isFirstSegment: true,
      },
    );
    expect(splitSlice[1]).toEqual(
      {
        parent: { ...slice },
        startTimeISO: '2020-01-02T00:00:00.000Z',
        endTimeISO: '2020-01-02T00:22:22.000Z',
        hourStart: '2020-01-02T00:00:00.000Z',
        elementDuration: (22 * 60) + 22, // 22min22sec
        startSecond: 0,
        endSecond: (22 * 60) + 22,
        isFirstSegment: false,
      },
    );
  });
});

test('getSecondsFromHourStart', () => {
  expect(getSecondsFromHourStart('2022-02-12T12:00:00')).toBe(0);
  expect(getSecondsFromHourStart('2022-02-12T13:00:13')).toBe(13);
  expect(getSecondsFromHourStart('2022-02-12T14:01:22')).toBe((1 * 60) + 22);
  expect(getSecondsFromHourStart('2022-02-12T15:22:56')).toBe((22 * 60) + 56);
  expect(getSecondsFromHourStart('2022-02-12T22:59:59')).toBe((59 * 60) + 59);
});
