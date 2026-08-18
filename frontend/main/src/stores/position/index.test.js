import { setActivePinia, createPinia } from 'pinia';

import usePositionStore from './index';

import positionApi from '@/api/positionApi';
import useGenericNotificationStore from '@/stores/genericNotification';
import useStationStore from '@/stores/station';

vi.mock('@/api/positionApi', () => ({
  default: {
    getPositions: vi.fn(),
    postPosition: vi.fn(),
    putPosition: vi.fn(),
    deletePosition: vi.fn(),
    patchPosition: vi.fn(),
  },
  __esModule: true,
}));

vi.mock('@/stores/genericNotification', () => ({
  default: vi.fn(),
  __esModule: true,
}));

vi.mock('@/stores/station', () => ({
  default: vi.fn(),
  __esModule: true,
}));

vi.mock('@/services/i18n', () => ({
  default: { global: { t: (key) => key } },
  __esModule: true,
}));

describe('usePositionStore', () => {
  let store;
  const mockNotificationStore = {
    notifyError: vi.fn(),
    notifyUpdated: vi.fn(),
    notifyAdded: vi.fn(),
    notifyDeleted: vi.fn(),
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    store = usePositionStore();
    useGenericNotificationStore.mockReturnValue(mockNotificationStore);
    useStationStore.mockReturnValue({
      adminStationsMap: { 1: { id: 1 }, 2: { id: 2 } },
      lineviewStation: { id: 1 },
    });
    vi.clearAllMocks();
  });

  describe('actions', () => {
    test('setPositions maps stationOrder to ordering', () => {
      const positions = [
        { id: 1, name: 'Position 1', primaryName: 'Position 1', stationOrder: [{ stationId: 1, ordering: 2 }] },
        { id: 2, name: 'Position 2', primaryName: 'Position 2', stationOrder: [{ stationId: 1, ordering: 1 }, { stationId: 2, ordering: 2 }] },
      ];
      store.setPositions(positions);
      expect(store.positions[0].ordering).toEqual({ 1: 2 });
      expect(store.positions[1].ordering).toEqual({ 1: 1, 2: 2 });
    });

    test('setPosition adds new position', () => {
      const position = { id: 1, name: 'Position 1', stationOrder: [{ stationId: 1, ordering: 2 }] };
      store.setPosition(position);
      expect(store.positions).toHaveLength(1);
      expect(store.positions[0].ordering).toEqual({ 1: 2 });
    });

    test('removePosition', () => {
      store.positions = [
        { id: 1, name: 'Position 1', ordering: { 1: 2 } },
        { id: 2, name: 'Position 2', ordering: { 1: 1 } },
      ];
      store.removePosition(1);
      expect(store.positions).toHaveLength(1);
      expect(store.positions[0].id).toBe(2);
    });

    test('startLoading and finishLoading', () => {
      store.startLoading();
      expect(store.loading).toEqual(['loading']);
      store.finishLoading();
      expect(store.loading).toEqual([]);
    });

    test('fetchPositions', async () => {
      const positions = [{ id: 1, primaryName: 'Position 1', stationOrder: [] }, { id: 2, primaryName: 'Position 2', stationOrder: [] }];
      positionApi.getPositions.mockResolvedValueOnce(positions);
      await store.fetchPositions();
      expect(positionApi.getPositions).toHaveBeenCalledWith({});
      expect(store.positions).toHaveLength(2);
      expect(store.loading).toEqual([]);
    });

    test('savePosition creates new position', async () => {
      const data = { primaryName: 'New Position' };
      const response = { id: 1, primaryName: 'New Position', stationOrder: [{ stationId: 1, ordering: 0 }] };
      positionApi.postPosition.mockResolvedValueOnce(response);
      await store.savePosition(data);
      expect(positionApi.postPosition).toHaveBeenCalledWith(data);
      expect(mockNotificationStore.notifyAdded).toHaveBeenCalledWith('New Position');
    });

    test('savePosition updates existing position', async () => {
      const data = { id: 1, primaryName: 'Updated Position' };
      const response = { id: 1, primaryName: 'Updated Position', stationOrder: [] };
      positionApi.putPosition.mockResolvedValueOnce(response);
      await store.savePosition(data);
      expect(positionApi.putPosition).toHaveBeenCalledWith(data);
      expect(mockNotificationStore.notifyUpdated).toHaveBeenCalledWith('Updated Position');
    });

    test('savePosition handles error', async () => {
      const error = { response: { data: { message: 'Error saving position' } } };
      positionApi.postPosition.mockRejectedValueOnce(error);
      const result = await store.savePosition({ primaryName: 'New Position' });
      expect(mockNotificationStore.notifyError).toHaveBeenCalledWith('Error saving position');
      expect(result).toEqual(error);
    });
  });

  describe('getters', () => {
    test('positionsWithAdminPermissions', () => {
      useStationStore.mockReturnValue({
        adminStationsMap: { 1: { id: 1 }, 2: { id: 2 } },
        lineviewStation: { id: 1 },
      });
      store.positions = [
        { id: 1, name: 'Position 1', stationIds: [1, 2] },
        { id: 2, name: 'Position 2', stationIds: [3] },
        { id: 3, name: 'Global Position', stationIds: [] },
      ];
      expect(store.positionsWithAdminPermissions).toEqual([
        { id: 1, name: 'Position 1', stationIds: [1, 2] },
        { id: 3, name: 'Global Position', stationIds: [] },
      ]);
    });

    test('getPositionsByStationIds', () => {
      store.positions = [{ id: 1, stationIds: [1] }, { id: 2, stationIds: [2] }];
      expect(store.getPositionsByStationIds([1])).toEqual([{ id: 1, stationIds: [1] }]);
    });

    test('isLoading', () => {
      expect(store.isLoading).toBe(false);
      store.loading.push('loading');
      expect(store.isLoading).toBe(true);
    });
  });
});
