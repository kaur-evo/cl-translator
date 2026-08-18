import { setActivePinia, createPinia } from 'pinia';

import useAlertStore from './index';

import alertApi from '@/api/alertApi';
import useGenericNotificationStore from '@/stores/genericNotification';

vi.mock('@/api/alertApi', () => ({
  default: {
    getAlerts: vi.fn(),
    getAlert: vi.fn(),
    deleteAlert: vi.fn(),
    putAlert: vi.fn(),
    postAlert: vi.fn(),
  },
  __esModule: true,
}));

vi.mock('@/services/i18n', () => ({
  default: { global: { t: (key, params) => (params ? key.replace('{value}', params.value) : key) } },
  __esModule: true,
}));

describe('useAlertStore', () => {
  let store;
  let notificationStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useAlertStore();
    notificationStore = useGenericNotificationStore();
    vi.spyOn(notificationStore, 'notifyError');
    vi.spyOn(notificationStore, 'notifyAdded');
    vi.spyOn(notificationStore, 'notifyUpdated');
    vi.spyOn(notificationStore, 'notifyDeleted');
    vi.spyOn(notificationStore, 'notifySuccess');
    vi.clearAllMocks();
  });

  test('initial state', () => {
    expect(store.alerts).toEqual([]);
    expect(store.loading).toEqual([]);
  });

  describe('actions', () => {
    test('setAlerts', () => {
      const alerts = [{ id: 1, name: 'alert1' }, { id: 2, name: 'alert2' }];
      store.setAlerts(alerts);
      expect(store.alerts).toEqual(alerts);
    });

    test('removeAlertFromState when alert exists', () => {
      store.alerts = [{ id: 1, name: 'alert1' }, { id: 2, name: 'alert2' }];
      store.removeAlertFromState(1);
      expect(store.alerts).toEqual([{ id: 2, name: 'alert2' }]);
    });

    test('removeAlertFromState when alert does not exist', () => {
      store.alerts = [{ id: 1, name: 'alert1' }, { id: 2, name: 'alert2' }];
      store.removeAlertFromState(3);
      expect(store.alerts).toEqual([{ id: 1, name: 'alert1' }, { id: 2, name: 'alert2' }]);
    });

    test('saveAlertToState when alert exists', () => {
      store.alerts = [{ id: 1, name: 'alert1' }, { id: 2, name: 'alert2' }];
      store.saveAlertToState({ id: 1, name: 'alert1 updated' });
      expect(store.alerts).toEqual([{ id: 1, name: 'alert1 updated' }, { id: 2, name: 'alert2' }]);
    });

    test('saveAlertToState when alert does not exist', () => {
      store.alerts = [{ id: 1, name: 'alert1' }];
      store.saveAlertToState({ id: 3, name: 'alert3' });
      expect(store.alerts).toEqual([{ id: 1, name: 'alert1' }, { id: 3, name: 'alert3' }]);
    });

    test('fetchAlerts with success', async () => {
      const alerts = [{ id: 1, name: 'alert1' }, { id: 2, name: 'alert2' }];
      alertApi.getAlerts.mockResolvedValueOnce(alerts);
      await store.fetchAlerts();
      expect(alertApi.getAlerts).toHaveBeenCalledTimes(1);
      expect(store.alerts).toEqual(alerts);
      expect(store.loading).toEqual([]);
    });

    test('fetchAlerts with error', async () => {
      alertApi.getAlerts.mockRejectedValueOnce();
      await store.fetchAlerts();
      expect(notificationStore.notifyError).toHaveBeenCalledWith('We are sorry! There is a problem with your request');
    });

    test('fetchAlerts skips when alerts already loaded', async () => {
      store.alerts = [{ id: 1, name: 'alert1' }];
      await store.fetchAlerts();
      expect(alertApi.getAlerts).not.toHaveBeenCalled();
    });

    test('saveAlert new alert with success', async () => {
      const alert = { name: 'new alert' };
      alertApi.postAlert.mockResolvedValueOnce(alert);
      await store.saveAlert(alert);
      expect(alertApi.postAlert).toHaveBeenCalledWith(alert);
      expect(notificationStore.notifyAdded).toHaveBeenCalledWith('new alert');
    });

    test('saveAlert with SCRAPREASON type and active', async () => {
      const alert = { name: 'scrap alert', requirements: { type: 'SCRAPREASON' }, active: true };
      alertApi.postAlert.mockResolvedValueOnce(alert);
      await store.saveAlert(alert);
      expect(notificationStore.notifySuccess).toHaveBeenCalledWith('scrap alert saved and will become active after the next changeover');
    });

    test('saveAlert with SCRAPREASON type and not active', async () => {
      const alert = { name: 'scrap alert', requirements: { type: 'SCRAPREASON' }, active: false };
      alertApi.postAlert.mockResolvedValueOnce(alert);
      await store.saveAlert(alert);
      expect(notificationStore.notifyAdded).toHaveBeenCalledWith('scrap alert');
    });

    test('saveAlert existing alert with success', async () => {
      const alert = { id: 1, name: 'alert1' };
      alertApi.putAlert.mockResolvedValueOnce(alert);
      await store.saveAlert(alert);
      expect(alertApi.putAlert).toHaveBeenCalledWith(alert);
      expect(notificationStore.notifyUpdated).toHaveBeenCalledWith('alert1');
    });

    test('saveAlert with error', async () => {
      alertApi.postAlert.mockRejectedValueOnce();
      await store.saveAlert({ name: 'new alert' });
      expect(notificationStore.notifyError).toHaveBeenCalledWith('We are sorry! There is a problem with your request');
    });

    test('removeAlert with success', async () => {
      store.alerts = [{ id: 1, name: 'alert1' }];
      alertApi.deleteAlert.mockResolvedValueOnce();
      await store.deleteAlert({ id: 1, name: 'alert1' });
      expect(alertApi.deleteAlert).toHaveBeenCalledWith(1);
      expect(notificationStore.notifyDeleted).toHaveBeenCalledWith('alert1');
      expect(store.alerts).toEqual([]);
    });

    test('removeAlert with error', async () => {
      alertApi.deleteAlert.mockRejectedValueOnce();
      await store.deleteAlert({ id: 1, name: 'alert1' });
      expect(notificationStore.notifyError).toHaveBeenCalledWith('We are sorry! There is a problem with your request');
    });
  });

  describe('getters', () => {
    test('alerts', () => {
      store.alerts = [{ id: 1, name: 'alert1' }, { id: 2, name: 'alert2' }];
      expect(store.alerts).toEqual([{ id: 1, name: 'alert1' }, { id: 2, name: 'alert2' }]);
    });

    test('alertsMap', () => {
      store.alerts = [{ id: 1, name: 'alert1' }, { id: 2, name: 'alert2' }];
      expect(store.alertsMap).toEqual({ 1: { id: 1, name: 'alert1' }, 2: { id: 2, name: 'alert2' } });
    });

    test('isLoading', () => {
      expect(store.isLoading).toBe(false);
      store.loading.push('loading');
      expect(store.isLoading).toBe(true);
    });
  });
});
