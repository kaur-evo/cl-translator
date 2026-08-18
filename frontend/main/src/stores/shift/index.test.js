import { setActivePinia, createPinia } from 'pinia';

import useShiftStore from '.';

import shiftApi from '@/api/shiftApi';
import useGenericNotificationStore from '@/stores/genericNotification';
import useStationStore from '@/stores/station';

vi.mock('@/api/shiftApi');

vi.mock('@/stores/genericNotification', () => ({
  default: vi.fn(),
  __esModule: true,
}));

vi.mock('@/stores/station', () => ({
  default: vi.fn(),
  __esModule: true,
}));

describe('useShiftStore', () => {
  let store;

  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
    store = useShiftStore();
  });

  describe('initial state', () => {
    test('has correct default values', () => {
      expect(store.currentShift).toEqual({});
      expect(store.loading).toEqual([]);
      expect(store.shift).toEqual({});
      expect(store.statisticsRaw).toEqual({});
      expect(store.secondsFromLastShiftSignal).toBe(-1);
      expect(store.shiftSetTimeout).toBeNull();
      expect(store.isShiftRunning).toBe(false);
      expect(store.firstShiftOfShiftviewStation).toEqual({});
      expect(store.shifts).toEqual([]);
    });
  });

  describe('actions', () => {
    test('fetchCurrentShift', async () => {
      const mockShift = { id: 1, name: 'Current Shift' };
      shiftApi.getCurrentShift.mockResolvedValue(mockShift);
      await store.fetchCurrentShift({ stationId: 5 });
      expect(shiftApi.getCurrentShift).toHaveBeenCalledWith(5);
      expect(store.currentShift).toEqual(mockShift);
      expect(store.loading).toEqual([]);
    });

    test('setShiftState with no shift in response', () => {
      store.setShiftState({ timelineResponse: {} });
      expect(store.shift).toEqual({ id: 0 });
    });

    test('setShiftState with shift in response', () => {
      useStationStore.mockReturnValue({ lineviewStation: { zoneId: 'UTC' } });
      const timelineResponse = {
        shift: { id: 1, startTimeISO: '2020-01-01T00:00:00Z', endTimeISO: '2020-01-01T08:00:00Z' },
        statistics: { total: 100 },
        secondsFromLastShiftSignal: 30,
      };
      store.setShiftState({ timelineResponse });
      expect(store.shift).toEqual(timelineResponse.shift);
      expect(store.statisticsRaw).toEqual(timelineResponse.statistics);
      expect(store.secondsFromLastShiftSignal).toBe(30);
    });

    test('setShiftVersion', () => {
      store.shift = { id: 1, version: 1 };
      store.setShiftVersion(2);
      expect(store.shift.version).toBe(2);
    });

    test('setStatistics', () => {
      store.setStatistics({ total: 200 });
      expect(store.statisticsRaw).toEqual({ total: 200 });
    });

    test('setCurrentShift', () => {
      const shift = { id: 5, name: 'Test' };
      store.setCurrentShift(shift);
      expect(store.currentShift).toEqual(shift);
    });

    test('setFirstShiftOfStation', async () => {
      const shift = { id: 10 };
      shiftApi.getFirstShift.mockResolvedValue(shift);
      await store.setFirstShiftOfStation({ id: 1 });
      expect(shiftApi.getFirstShift).toHaveBeenCalledWith(1);
      expect(store.firstShiftOfShiftviewStation).toEqual(shift);
    });

    test('setFirstShiftOfStation with null response', async () => {
      shiftApi.getFirstShift.mockResolvedValue(null);
      await store.setFirstShiftOfStation({ id: 1 });
      expect(store.firstShiftOfShiftviewStation).toEqual({});
    });

    test('fetchShifts', async () => {
      const shifts = [{ id: 1 }, { id: 2 }];
      shiftApi.getShifts.mockResolvedValue(shifts);
      await store.fetchShifts({ stationId: 1 });
      expect(store.shifts).toEqual(shifts);
      expect(store.loading).toEqual([]);
    });

    test('fetchShifts with null response', async () => {
      shiftApi.getShifts.mockResolvedValue(null);
      await store.fetchShifts({ stationId: 1 });
      expect(store.shifts).toEqual([]);
    });

    test('deleteShift', async () => {
      const shift = { id: 1, shiftName: 'Shift1' };
      shiftApi.deleteShift.mockResolvedValueOnce();
      const mockNotifyDeleted = vi.fn();
      useGenericNotificationStore.mockReturnValue({ notifyDeleted: mockNotifyDeleted });
      await store.deleteShift(shift);
      expect(shiftApi.deleteShift).toHaveBeenCalledWith(shift.id);
      expect(mockNotifyDeleted).toHaveBeenCalledWith(shift.shiftName);
      expect(store.loading).toEqual([]);
    });

    test('deleteShift with error', async () => {
      const shift = { id: 1, shiftName: 'Shift1' };
      shiftApi.deleteShift.mockRejectedValueOnce({ response: { data: { message: 'Deleting shift failed' } } });
      const mockNotifyError = vi.fn();
      useGenericNotificationStore.mockReturnValue({ notifyError: mockNotifyError });
      await store.deleteShift(shift);
      expect(shiftApi.deleteShift).toHaveBeenCalledWith(shift.id);
      expect(mockNotifyError).toHaveBeenCalledWith('Deleting shift failed');
      expect(store.loading).toEqual([]);
    });
  });

  describe('getters', () => {
    test('isLastShiftSelected when shift is running', () => {
      store.isShiftRunning = true;
      expect(store.isLastShiftSelected).toBe(true);
    });

    test('isLastShiftSelected when shift matches currentShift', () => {
      store.shift = { id: 5 };
      store.currentShift = { id: 5 };
      expect(store.isLastShiftSelected).toBe(true);
    });

    test('isLastShiftSelected returns false otherwise', () => {
      store.shift = { id: 5 };
      store.currentShift = { id: 10 };
      store.isShiftRunning = false;
      expect(store.isLastShiftSelected).toBe(false);
    });

    test('shiftExists', () => {
      expect(store.shiftExists).toBe(false);
      store.shift = { id: 1 };
      expect(store.shiftExists).toBe(true);
    });

    test('statistics returns empty object when no hourStatistics', () => {
      expect(store.statistics).toEqual({});
      store.statisticsRaw = {};
      expect(store.statistics).toEqual({});
    });

    test('statistics recalculates hourStatistics keys', () => {
      useStationStore.mockReturnValue({ lineviewStation: { zoneId: 'UTC' } });
      store.statisticsRaw = {
        hourStatistics: {
          '2020-01-01T08:00:00.000Z': { value: 1 },
        },
        total: 100,
      };
      const result = store.statistics;
      expect(result.total).toBe(100);
      expect(Object.keys(result.hourStatistics)).toHaveLength(1);
    });
  });
});
