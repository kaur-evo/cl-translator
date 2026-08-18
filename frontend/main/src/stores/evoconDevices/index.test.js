import { setActivePinia, createPinia } from 'pinia';

import useEvoconDevicesStore from './index';

import devicesApi from '@/api/devicesApi';

vi.mock('@/api/devicesApi', () => ({
  default: {
    getDevices: vi.fn(),
    saveDeviceDescription: vi.fn(),
  },
  __esModule: true,
}));

const mockNotifyUpdated = vi.fn();
const mockNotifyError = vi.fn();
vi.mock('@/stores/genericNotification', () => ({
  default: () => ({ notifyUpdated: mockNotifyUpdated, notifyError: mockNotifyError }),
}));

describe('useEvoconDevicesStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useEvoconDevicesStore();
    vi.clearAllMocks();
  });

  test('initial state', () => {
    expect(store.devices).toEqual({});
    expect(store.loading).toEqual([]);
    expect(store.isLoading).toBe(false);
  });

  describe('fetchDevices', () => {
    test('fetches and sets devices', async () => {
      const devices = { device1: { id: 'device1', description: 'Device 1' } };
      devicesApi.getDevices.mockResolvedValue(devices);
      await store.fetchDevices();
      expect(devicesApi.getDevices).toHaveBeenCalledTimes(1);
      expect(store.devices).toEqual(devices);
      expect(store.isLoading).toBe(false);
    });

    test('sets empty object when API returns falsy', async () => {
      devicesApi.getDevices.mockResolvedValue(null);
      await store.fetchDevices();
      expect(store.devices).toEqual({});
      expect(store.isLoading).toBe(false);
    });
  });

  describe('saveDevice', () => {
    beforeEach(() => {
      store.devices = {
        1: { id: 1, description: 'Device 1', serialNumber: 'SN-1' },
        2: { id: 2, description: 'Device 2', serialNumber: 'SN-2' },
      };
    });

    test('saves device description and notifies', async () => {
      const deviceResponse = { id: 1, description: 'New description', serialNumber: 'SN-1' };
      devicesApi.saveDeviceDescription.mockResolvedValue(deviceResponse);
      await store.saveDevice({ deviceId: 1, description: 'New description' });
      expect(devicesApi.saveDeviceDescription).toHaveBeenCalledWith(1, 'New description');
      expect(store.devices[1].description).toBe('New description');
      expect(mockNotifyUpdated).toHaveBeenCalledWith('SN-1');
      expect(store.isLoading).toBe(false);
    });

    test('notifies error on failure', async () => {
      const error = { response: { data: { message: 'Save failed' } } };
      devicesApi.saveDeviceDescription.mockRejectedValue(error);
      await store.saveDevice({ deviceId: 1, description: 'New description' });
      expect(mockNotifyError).toHaveBeenCalledWith('Save failed');
      expect(store.isLoading).toBe(false);
    });
  });
});
