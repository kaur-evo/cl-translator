import { DateTime } from 'luxon';

import shiftTimelineDataMapper from '@/stores/shiftTemplate/shiftTimelineDataMapper';
import { userSelectableColors } from '@/constants/userSelectableColors';
import colorConstants from '@/constants/colorConstants';

// Mock luxon's DateTime.now() to control the current time
const mockNow = DateTime.fromISO('2023-06-15T12:00:00Z');

beforeEach(() => {
  vi.spyOn(DateTime, 'now').mockReturnValue(mockNow);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('shiftTimelineDataMapper', () => {
  const defaultZoneId = 'UTC';

  test('should return empty array when input data is empty', () => {
    const result = shiftTimelineDataMapper([], defaultZoneId);
    expect(result).toEqual([]);
  });

  test('should mark shift as disabled when started before current time', () => {
    const pastShift = {
      id: 1,
      name: 'Past Shift',
      startTimeISO: '2023-06-15T10:00:00Z', // 2 hours before mockNow
      endTimeISO: '2023-06-15T18:00:00Z',
      color: '#FF0000',
      shiftTemplateId: 123,
    };

    const result = shiftTimelineDataMapper([pastShift], defaultZoneId);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      ...pastShift,
      disabled: true,
    });
  });

  test('should mark shift as not disabled when started at or after current time', () => {
    const futureShift = {
      id: 1,
      name: 'Future Shift',
      startTimeISO: '2023-06-15T14:00:00Z', // 2 hours after mockNow
      endTimeISO: '2023-06-15T22:00:00Z',
      color: '#00FF00',
      shiftTemplateId: 123,
    };

    const result = shiftTimelineDataMapper([futureShift], defaultZoneId);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      ...futureShift,
      disabled: false,
    });
  });

  test('should mark shift as not disabled when started exactly at current time', () => {
    const currentShift = {
      id: 1,
      name: 'Current Shift',
      startTimeISO: '2023-06-15T12:00:00Z', // exactly at mockNow
      endTimeISO: '2023-06-15T20:00:00Z',
      color: '#0000FF',
      shiftTemplateId: 123,
    };

    const result = shiftTimelineDataMapper([currentShift], defaultZoneId);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      ...currentShift,
      disabled: false,
    });
  });

  test('should set fallback color when color is null', () => {
    const shiftWithNullColor = {
      id: 1,
      name: 'Shift with null color',
      startTimeISO: '2023-06-15T14:00:00Z',
      endTimeISO: '2023-06-15T22:00:00Z',
      color: null,
      shiftTemplateId: 123,
    };

    const result = shiftTimelineDataMapper([shiftWithNullColor], defaultZoneId);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      ...shiftWithNullColor,
      color: colorConstants.light.error,
      disabled: false,
    });
  });

  test('should set grey color when shiftTemplateId is 0', () => {
    const shiftWithZeroTemplateId = {
      id: 1,
      name: 'Shift with zero template ID',
      startTimeISO: '2023-06-15T14:00:00Z',
      endTimeISO: '2023-06-15T22:00:00Z',
      color: '#FF0000',
      shiftTemplateId: 0,
    };

    const result = shiftTimelineDataMapper([shiftWithZeroTemplateId], defaultZoneId);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      ...shiftWithZeroTemplateId,
      color: userSelectableColors.GREY,
      disabled: false,
    });
  });

  test('should handle both null color and zero shiftTemplateId (grey color should override fallback)', () => {
    const shiftWithBothConditions = {
      id: 1,
      name: 'Shift with null color and zero template ID',
      startTimeISO: '2023-06-15T14:00:00Z',
      endTimeISO: '2023-06-15T22:00:00Z',
      color: null,
      shiftTemplateId: 0,
    };

    const result = shiftTimelineDataMapper([shiftWithBothConditions], defaultZoneId);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      ...shiftWithBothConditions,
      color: userSelectableColors.GREY, // Grey overrides the fallback color
      disabled: false,
    });
  });

  test('should preserve original color when not null and shiftTemplateId is not 0', () => {
    const normalShift = {
      id: 1,
      name: 'Normal shift',
      startTimeISO: '2023-06-15T14:00:00Z',
      endTimeISO: '2023-06-15T22:00:00Z',
      color: '#00FF00',
      shiftTemplateId: 123,
    };

    const result = shiftTimelineDataMapper([normalShift], defaultZoneId);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      ...normalShift,
      disabled: false,
    });
  });

  test('should handle multiple shifts with different conditions', () => {
    const shifts = [
      {
        id: 1,
        name: 'Past shift with null color',
        startTimeISO: '2023-06-15T10:00:00Z',
        endTimeISO: '2023-06-15T18:00:00Z',
        color: null,
        shiftTemplateId: 123,
      },
      {
        id: 2,
        name: 'Future shift with zero template',
        startTimeISO: '2023-06-15T16:00:00Z',
        endTimeISO: '2023-06-15T24:00:00Z',
        color: '#FF0000',
        shiftTemplateId: 0,
      },
      {
        id: 3,
        name: 'Normal future shift',
        startTimeISO: '2023-06-15T20:00:00Z',
        endTimeISO: '2023-06-16T04:00:00Z',
        color: '#0000FF',
        shiftTemplateId: 456,
      },
    ];

    const result = shiftTimelineDataMapper(shifts, defaultZoneId);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      ...shifts[0],
      color: colorConstants.light.error,
      disabled: true,
    });
    expect(result[1]).toEqual({
      ...shifts[1],
      color: userSelectableColors.GREY,
      disabled: false,
    });
    expect(result[2]).toEqual({
      ...shifts[2],
      disabled: false,
    });
  });

  test('should work with different timezones', () => {
    const shift = {
      id: 1,
      name: 'Timezone test shift',
      startTimeISO: '2023-06-15T15:00:00Z', // This is 17:00 in Europe/Berlin (UTC+2)
      endTimeISO: '2023-06-15T23:00:00Z',
      color: '#00FF00',
      shiftTemplateId: 123,
    };

    // Mock DateTime.now() to return a time in Berlin timezone
    const berlinMockNow = DateTime.fromISO('2023-06-15T18:00:00+02:00'); // 16:00 UTC
    DateTime.now.mockReturnValue(berlinMockNow);

    const result = shiftTimelineDataMapper([shift], 'Europe/Berlin');

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      ...shift,
      disabled: true, // Should be disabled because 15:00 UTC < 16:00 UTC
    });
  });

  test('should handle edge case with undefined color', () => {
    const shiftWithUndefinedColor = {
      id: 1,
      name: 'Shift with undefined color',
      startTimeISO: '2023-06-15T14:00:00Z',
      endTimeISO: '2023-06-15T22:00:00Z',
      color: undefined,
      shiftTemplateId: 123,
    };

    const result = shiftTimelineDataMapper([shiftWithUndefinedColor], defaultZoneId);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      ...shiftWithUndefinedColor,
      disabled: false,
    });
  });

  test('should handle shift that started exactly one millisecond before current time', () => {
    const almostCurrentShift = {
      id: 1,
      name: 'Almost current shift',
      startTimeISO: '2023-06-15T11:59:59.999Z', // 1ms before mockNow
      endTimeISO: '2023-06-15T20:00:00Z',
      color: '#FF0000',
      shiftTemplateId: 123,
    };

    const result = shiftTimelineDataMapper([almostCurrentShift], defaultZoneId);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      ...almostCurrentShift,
      disabled: true,
    });
  });

  test('should preserve additional properties in shift objects', () => {
    const shiftWithExtraProps = {
      id: 1,
      name: 'Shift with extra properties',
      startTimeISO: '2023-06-15T14:00:00Z',
      endTimeISO: '2023-06-15T22:00:00Z',
      color: '#00FF00',
      shiftTemplateId: 123,
      extraProp1: 'value1',
      extraProp2: { nested: 'object' },
      extraProp3: [1, 2, 3],
    };

    const result = shiftTimelineDataMapper([shiftWithExtraProps], defaultZoneId);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      ...shiftWithExtraProps,
      disabled: false,
    });
  });

  test('should not mutate original data array', () => {
    const originalShifts = [
      {
        id: 1,
        name: 'Test shift',
        startTimeISO: '2023-06-15T10:00:00Z',
        endTimeISO: '2023-06-15T18:00:00Z',
        color: null,
        shiftTemplateId: 0,
      },
    ];
    const originalShiftsCopy = JSON.parse(JSON.stringify(originalShifts));

    shiftTimelineDataMapper(originalShifts, defaultZoneId);

    expect(originalShifts).toEqual(originalShiftsCopy);
  });

  test('should handle very large arrays efficiently', () => {
    const largeShiftArray = Array.from({ length: 1000 }, (_, index) => ({
      id: index + 1,
      name: `Shift ${index + 1}`,
      startTimeISO: `2023-06-${String(15 + (index % 10)).padStart(2, '0')}T${String(10 + (index % 12)).padStart(2, '0')}:00:00Z`,
      endTimeISO: `2023-06-${String(15 + (index % 10)).padStart(2, '0')}T${String(18 + (index % 6)).padStart(2, '0')}:00:00Z`,
      color: index % 5 === 0 ? null : `#${index.toString(16).padStart(6, '0')}`,
      shiftTemplateId: index % 10 === 0 ? 0 : index,
    }));

    const startTime = performance.now();
    const result = shiftTimelineDataMapper(largeShiftArray, defaultZoneId);
    const endTime = performance.now();

    expect(result).toHaveLength(1000);
    expect(endTime - startTime).toBeLessThan(500); // Should complete within 500ms (relaxed for CI environments)
  });
});
