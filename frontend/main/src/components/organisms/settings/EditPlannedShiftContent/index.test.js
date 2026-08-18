import { describe, it, expect, beforeEach, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { DateTime } from 'luxon';
import { computed } from 'vue';

import EditPlannedShiftContent from './index.vue';

import useDeviceStore from '@/stores/device';
import { formatTimeRange } from '@/helpers/time/formatTimeRange';
import * as dateHelpers from '@/helpers/date/getDateTimeFromTimeString';

const defaultPiniaState = {
  profile: {
    currentUser: {
      timeFormat: 12,
      dateFormat: 'MM.DD.YYYY',
    },
    language: 'et',
    firstDayOfWeek: 1,
  },
};

describe('EditPlannedShiftContent', () => {
  let wrapper;
  const factory = (props = {}, options = {}) => {
    const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaState });
    useDeviceStore(pinia).isMobileView = false;
    return shallowMount(EditPlannedShiftContent, {
      props: {
        station: { zoneId: 'UTC' },
        shift: { running: false },
        shiftTemplate: null,
        loading: false,
        error: null,
        minStartTime: DateTime.fromISO('2024-01-01T08:00:00Z'),
        minEndTime: DateTime.fromISO('2024-01-01T09:00:00Z'),
        maxStartTime: DateTime.fromISO('2024-01-31T08:00:00Z'),
        maxEndTime: DateTime.fromISO('2024-01-31T09:00:00Z'),
        ...props,
      },
      global: {
        plugins: [pinia],
      },
      ...options,
    });
  };

  beforeEach(() => {
    wrapper = factory();
  });

  it('renders component', () => {
    expect(wrapper.exists()).toBe(true);
  });

  describe('EditPlannedShiftContent date/time computed properties', () => {
    const zoneId = 'Europe/Tallinn';
    const startDate = '2024-06-01';
    const endDate = '2024-06-02';
    const startTime = '08:00';
    const endTime = '17:00';

    beforeEach(() => {
      vi.spyOn(dateHelpers, 'getDateTimeFromTimeString').mockImplementation((date, time, zone) => DateTime.fromISO(`${date}T${time}`, { zone }));

      wrapper = factory({
        station: { zoneId },
        startDate,
        endDate,
        startTime,
        endTime,
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('computes startDateTime correctly', () => {
      const { vm } = wrapper;
      expect(vm.startDateTime.toISO()).toBe('2024-06-01T08:00:00.000+03:00');
    });

    it('computes endDateTime correctly', () => {
      const { vm } = wrapper;
      expect(vm.endDateTime.toISO()).toBe('2024-06-02T17:00:00.000+03:00');
    });
  });

  describe('getShiftStartRange computed property', () => {
    const zoneId = 'Europe/Tallinn';

    it('returns range with current time when shift is running', () => {
      wrapper = factory({
        station: { zoneId },
        shift: { running: true },
        minStartTime: DateTime.fromISO('2024-01-01T08:00:00Z'),
      });

      const { vm } = wrapper;
      const now = DateTime.local().setZone(zoneId).startOf('minute');
      expect(vm.getShiftStartRange).toEqual([
        DateTime.fromISO('2024-01-01T08:00:00Z'),
        now,
      ]);
    });

    it('returns range with shift end time minus 1 minute when shift is not running', () => {
      wrapper = factory({
        station: { zoneId },
        shift: { running: false, endTimeISO: '2024-01-01T18:00:00Z' },
        minStartTime: DateTime.fromISO('2024-01-01T08:00:00Z'),
      });

      const { vm } = wrapper;
      expect(vm.getShiftStartRange).toEqual([
        DateTime.fromISO('2024-01-01T08:00:00Z'),
        DateTime.fromISO('2024-01-01T18:00:00Z', { zone: zoneId }).minus({ minutes: 1 }),
      ]);
    });
  });

  describe('getShiftEndRange computed property', () => {
    const zoneId = 'Europe/Tallinn';

    it('returns range with current time plus 1 minute when shift is running', () => {
      wrapper = factory({
        station: { zoneId },
        shift: { running: true },
        maxEndTime: DateTime.fromISO('2024-01-01T20:00:00Z'),
      });

      const { vm } = wrapper;
      const now = DateTime.local().setZone(zoneId).plus({ minutes: 1 }).startOf('minute');
      expect(vm.getShiftEndRange).toEqual([
        now,
        DateTime.fromISO('2024-01-01T20:00:00Z'),
      ]);
    });

    it('returns range with shift start time plus 1 minute when shift is not running', () => {
      wrapper = factory({
        station: { zoneId },
        shift: { running: false, startTimeISO: '2024-01-01T08:00:00Z' },
        maxEndTime: DateTime.fromISO('2024-01-01T20:00:00Z'),
      });

      const { vm } = wrapper;
      expect(vm.getShiftEndRange).toEqual([
        DateTime.fromISO('2024-01-01T08:00:00Z', { zone: zoneId }).plus({ minutes: 1 }),
        DateTime.fromISO('2024-01-01T20:00:00Z'),
      ]);
    });
  });

  describe('formattedStartRange', () => {
    const mockDateFormat = { short: 'MM/dd/yyyy' };
    const mockTimeFormat = { luxonShort: 'HH:mm' };

    const mockGetShiftStartRange = computed(() => [
      DateTime.fromISO('2025-11-10T08:00:00'),
      DateTime.fromISO('2025-11-10T17:00:00'),
    ]);

    const formattedStartRange = computed(() => formatTimeRange(mockGetShiftStartRange.value, mockDateFormat, mockTimeFormat));

    it('should return formatted time range for valid inputs', () => {
      expect(formattedStartRange.value).toBe('08:00 - 17:00 (11/10/2025)');
    });

    it('should return empty string for invalid time range', () => {
      const invalidGetShiftStartRange = computed(() => [
        DateTime.invalid('Invalid DateTime'),
        DateTime.invalid('Invalid DateTime'),
      ]);

      const invalidFormattedStartRange = computed(() => formatTimeRange(invalidGetShiftStartRange.value, mockDateFormat, mockTimeFormat));

      expect(invalidFormattedStartRange.value).toBe('');
    });

    it('should handle time ranges spanning different days', () => {
      const differentDayGetShiftStartRange = computed(() => [
        DateTime.fromISO('2025-11-10T23:00:00'),
        DateTime.fromISO('2025-11-11T01:00:00'),
      ]);

      const differentDayFormattedStartRange = computed(() => formatTimeRange(differentDayGetShiftStartRange.value, mockDateFormat, mockTimeFormat));

      expect(differentDayFormattedStartRange.value).toBe('23:00 (11/10/2025) - 01:00 (11/11/2025)');
    });
  });

  describe('formattedEndRange', () => {
    const mockDateFormat = { short: 'MM/dd/yyyy' };
    const mockTimeFormat = { luxonShort: 'HH:mm' };

    const mockGetShiftEndRange = computed(() => [
      DateTime.fromISO('2025-11-10T17:00:00'),
      DateTime.fromISO('2025-11-10T23:00:00'),
    ]);

    const formattedEndRange = computed(() => formatTimeRange(mockGetShiftEndRange.value, mockDateFormat, mockTimeFormat));

    it('should return formatted time range for valid inputs', () => {
      expect(formattedEndRange.value).toBe('17:00 - 23:00 (11/10/2025)');
    });

    it('should return empty string for invalid time range', () => {
      const invalidGetShiftEndRange = computed(() => [
        DateTime.invalid('Invalid DateTime'),
        DateTime.invalid('Invalid DateTime'),
      ]);

      const invalidFormattedEndRange = computed(() => formatTimeRange(invalidGetShiftEndRange.value, mockDateFormat, mockTimeFormat));

      expect(invalidFormattedEndRange.value).toBe('');
    });

    it('should handle time ranges spanning different days', () => {
      const differentDayGetShiftEndRange = computed(() => [
        DateTime.fromISO('2025-11-10T23:00:00'),
        DateTime.fromISO('2025-11-11T01:00:00'),
      ]);

      const differentDayFormattedEndRange = computed(() => formatTimeRange(differentDayGetShiftEndRange.value, mockDateFormat, mockTimeFormat));

      expect(differentDayFormattedEndRange.value).toBe('23:00 (11/10/2025) - 01:00 (11/11/2025)');
    });
  });
});
