import getSliceYellowEnd from './getSliceYellowEnd';

describe('getSliceYellowEnd', () => {
  it('should return null if duration is less than or equal to quantity times cycleTimeGood', () => {
    const slice = {
      duration: 10,
      quantity: 2,
      cycleTimeGood: 5,
      sliceEndTmISO: '2023-10-01T12:00:00.000Z',
    };
    const timezone = 'UTC';
    expect(getSliceYellowEnd(slice, timezone)).toBeNull();
  });

  it('should return the correct ISO string when duration is greater than quantity times cycleTimeGood', () => {
    const slice = {
      duration: 20,
      quantity: 2,
      cycleTimeGood: 5,
      sliceEndTmISO: '2023-10-01T12:00:00.000Z',
    };
    const timezone = 'UTC';
    expect(getSliceYellowEnd(slice, timezone)).toBe('2023-10-01T11:59:50.000Z');
  });

  it('should handle cases with zero quantity or cycleTimeGood', () => {
    const slice = {
      duration: 20,
      quantity: 0,
      cycleTimeGood: 0,
      sliceEndTmISO: '2023-10-01T12:00:00.000Z',
    };
    const timezone = 'UTC';
    expect(getSliceYellowEnd(slice, timezone)).toBe('2023-10-01T12:00:00.000Z');
  });

  it('should handle cases with missing quantity or cycleTimeGood', () => {
    const slice = {
      duration: 20,
      sliceEndTmISO: '2023-10-01T12:00:00.000Z',
    };
    const timezone = 'UTC';
    expect(getSliceYellowEnd(slice, timezone)).toBe('2023-10-01T12:00:00.000Z');
  });
});
