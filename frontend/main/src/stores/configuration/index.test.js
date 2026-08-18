import { setActivePinia, createPinia } from 'pinia';

import useConfigurationStore from '.';

import authConfigApi from '@/api/authConfiguration';
import configurationApi from '@/api/configurationApi';
import { isRoleSameLevelOrAbove } from '@/helpers/permissions/isRoleSameLevelOrAbove';
import useGenericNotificationStore from '@/stores/genericNotification';
import useFeatureStore from '@/stores/feature';
import useProfileStore from '@/stores/profile';
import useStationStore from '@/stores/station';
import useFactoryStore from '@/stores/factory';

vi.mock('@/helpers/permissions/isRoleSameLevelOrAbove', () => ({
  isRoleSameLevelOrAbove: vi.fn(),
}));

vi.mock('@/api/authConfiguration', () => ({
  default: {
    getAuthConfigList: vi.fn(),
    saveAuthMFAConfig: vi.fn(),
  },
  __esModule: true,
}));

vi.mock('@/api/configurationApi', () => ({
  default: {
    getConfiguration: vi.fn(),
  },
  __esModule: true,
}));

vi.mock('@/stores/genericNotification', () => ({
  default: vi.fn(),
  __esModule: true,
}));

vi.mock('@/stores/profile', () => ({
  default: vi.fn(),
  __esModule: true,
}));

vi.mock('@/stores/feature', () => ({
  default: vi.fn(),
  __esModule: true,
}));

vi.mock('@/stores/station', () => ({
  default: vi.fn(),
  __esModule: true,
}));

vi.mock('@/stores/factory', () => ({
  default: vi.fn(),
  __esModule: true,
}));

vi.mock('@/helpers/config-helper', () => ({
  default: vi.fn((config) => {
    if (!config) return {};
    return Object.entries(config).reduce((acc, [key, value]) => {
      const cleanKey = key.replace('feature.', '');
      acc[cleanKey] = value;
      return acc;
    }, {});
  }),
}));

const mockNotificationStore = {
  notifyError: vi.fn(),
};

describe('useConfigurationStore', () => {
  let store;

  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
    store = useConfigurationStore();
    useGenericNotificationStore.mockReturnValue(mockNotificationStore);
  });

  test('initial state', () => {
    expect(store.configuration).toEqual({});
    expect(store.authConfig).toEqual({});
    expect(store.loading).toEqual([]);
    expect(store.confPromise).toBeNull();
  });

  describe('actions', () => {
    test('fetchConfiguration', async () => {
      const params = { test: 'params' };
      const configuration = { 'feature.testConf': true };
      const authConfigList = [{ SK: 'testConfig' }];
      configurationApi.getConfiguration.mockResolvedValueOnce(configuration);
      authConfigApi.getAuthConfigList.mockResolvedValueOnce(authConfigList);
      const result = await store.fetchConfiguration(params);
      expect(configurationApi.getConfiguration).toHaveBeenCalledWith(params);
      expect(authConfigApi.getAuthConfigList).toHaveBeenCalled();
      expect(store.configuration).toEqual({ testConf: true });
      expect(store.authConfig).toEqual({ testConfig: { SK: 'testConfig' } });
      expect(result).toEqual(configuration);
    });

    test('saveAuthMFAConfig', async () => {
      const formData = { test: 'formData' };
      authConfigApi.saveAuthMFAConfig.mockResolvedValueOnce(formData);
      await store.saveAuthMFAConfig(formData);
      expect(authConfigApi.saveAuthMFAConfig).toHaveBeenCalledWith(formData);
      expect(store.authConfig).toEqual({ MultiFactorAuthConfig: formData });
    });

    test('saveAuthMFAConfig with error', async () => {
      const formData = { test: 'formData' };
      const error = { response: { data: { message: 'testError' } } };
      authConfigApi.saveAuthMFAConfig.mockRejectedValueOnce(error);
      await store.saveAuthMFAConfig(formData);
      expect(authConfigApi.saveAuthMFAConfig).toHaveBeenCalledWith(formData);
    });
  });

  describe('getters', () => {
    test('isLoading', () => {
      expect(store.isLoading).toBe(false);
      store.loading.push('loading');
      expect(store.isLoading).toBe(true);
    });

    test('globalAnnouncement', () => {
      store.configuration = { globalAnnouncement: 'test' };
      expect(store.globalAnnouncement).toBe('test');
    });

    test('productChangeTabs', () => {
      store.configuration = { productChangeTabs: 'test1,test2' };
      useFeatureStore.mockReturnValue({ productionOrdersEnabled: true });
      expect(store.productChangeTabs).toEqual(['test1', 'test2']);
    });

    test('productChangeTabs filters orders when productionOrdersEnabled is false', () => {
      store.configuration = { productChangeTabs: 'products,orders' };
      useFeatureStore.mockReturnValue({ productionOrdersEnabled: false });
      expect(store.productChangeTabs).toEqual(['products']);
    });

    test('showOperatorsReport when conf is boolean', () => {
      store.configuration = { showOperatorsReport: true };
      expect(store.showOperatorsReport).toBe(true);
    });

    test('showOperatorsReport when conf is string', () => {
      store.configuration = { showOperatorsReport: 'testRole' };
      useProfileStore.mockReturnValue({ highestUserRole: 'highestRole' });
      isRoleSameLevelOrAbove.mockReturnValueOnce(true);
      expect(store.showOperatorsReport).toBe(true);
    });

    test('showOperatorsReport when conf is missing', () => {
      store.configuration = {};
      expect(store.showOperatorsReport).toBe(false);
    });

    describe('showLocationBeforeGroup', () => {
      it('returns true if showLocationBeforeGroup is true', () => {
        store.configuration = { showLocationBeforeGroup: true };
        expect(store.showLocationBeforeGroup).toBe(true);
      });

      it('returns false if showLocationBeforeGroup is false', () => {
        store.configuration = { showLocationBeforeGroup: false };
        expect(store.showLocationBeforeGroup).toBe(false);
      });

      it('returns false if showLocationBeforeGroup is missing', () => {
        store.configuration = {};
        expect(store.showLocationBeforeGroup).toBe(false);
      });

      it('returns false if value is true, but so is showLocationBeforeReason', () => {
        store.configuration = { showLocationBeforeGroup: true, showLocationBeforeReason: true };
        expect(store.showLocationBeforeGroup).toBe(false);
      });
    });

    describe('showLocationBeforeReason', () => {
      it('returns true if showLocationBeforeReason is true', () => {
        store.configuration = { showLocationBeforeReason: true };
        expect(store.showLocationBeforeReason).toBe(true);
      });

      it('returns false if showLocationBeforeReason is false', () => {
        store.configuration = { showLocationBeforeReason: false };
        expect(store.showLocationBeforeReason).toBe(false);
      });

      it('returns false if showLocationBeforeReason is missing', () => {
        store.configuration = {};
        expect(store.showLocationBeforeReason).toBe(false);
      });

      it('returns false if value is true, but so is showLocationBeforeGroup', () => {
        store.configuration = { showLocationBeforeReason: true, showLocationBeforeGroup: true };
        expect(store.showLocationBeforeReason).toBe(false);
      });
    });

    describe('checklistStations', () => {
      it('returns empty array if checklists feature is disabled', () => {
        useFeatureStore.mockReturnValue({ checklistsEnabled: false });
        expect(store.checklistStations).toEqual([]);
      });

      it('returns all station IDs if checklists config is missing and feature is enabled', () => {
        store.configuration = {};
        useFeatureStore.mockReturnValue({ checklistsEnabled: true });
        useStationStore.mockReturnValue({
          stations: [{ id: 1 }, { id: 2 }],
          stationsRealMap: new Map([[1, { id: 1 }], [2, { id: 2 }]]),
        });
        expect(store.checklistStations).toEqual([1, 2]);
      });

      it('returns configured checklist stations if feature is enabled', () => {
        store.configuration = { checklistStations: [1, 3] };
        useFeatureStore.mockReturnValue({ checklistsEnabled: true });
        useStationStore.mockReturnValue({
          stations: [{ id: 1 }, { id: 2 }, { id: 3 }],
          stationsRealMap: new Map([[1, { id: 1 }], [2, { id: 2 }], [3, { id: 3 }]]),
        });
        expect(store.checklistStations).toEqual([1, 3]);
      });

      it('returns only existing stations if checklist stations configured', () => {
        store.configuration = { checklistStations: [1, 3, 4] };
        useFeatureStore.mockReturnValue({ checklistsEnabled: true });
        useStationStore.mockReturnValue({
          stationsRealMap: new Map([[1, { id: 1 }], [2, { id: 2 }], [3, { id: 3 }]]),
        });
        expect(store.checklistStations).toEqual([1, 3]);
      });
    });

    describe('adminChecklistStations', () => {
      it('filters checklist stations to only admin stations', () => {
        store.configuration = { checklistStations: [1, 2, 3] };
        useFeatureStore.mockReturnValue({ checklistsEnabled: true });
        useStationStore.mockReturnValue({
          stationsRealMap: new Map([[1, { id: 1 }], [2, { id: 2 }], [3, { id: 3 }]]),
          adminStationsMap: { 2: true },
        });
        expect(store.adminChecklistStations).toEqual([2]);
      });
    });

    describe('checklistFactories', () => {
      it('returns unique factories for checklist stations', () => {
        store.configuration = { checklistStations: [1, 2, 3, 4] };
        useFeatureStore.mockReturnValue({ checklistsEnabled: true });
        useStationStore.mockReturnValue({
          stationsRealMap: new Map([
            [1, { id: 1, factoryId: 10 }],
            [2, { id: 2, factoryId: 20 }],
            [3, { id: 3, factoryId: 10 }],
            [4, { id: 4, factoryId: 20 }],
          ]),
        });
        useFactoryStore.mockReturnValue({
          factoriesRealMap: new Map([
            [10, { id: 10, name: 'Factory 10' }],
            [20, { id: 20, name: 'Factory 20' }],
          ]),
        });
        expect(store.checklistFactories).toEqual([
          { id: 10, name: 'Factory 10' },
          { id: 20, name: 'Factory 20' },
        ]);
      });
    });

    describe('productionSpeedReportEnabled', () => {
      it('returns true when set to true', () => {
        store.configuration = { productionSpeedReportEnabled: true };
        expect(store.productionSpeedReportEnabled).toBe(true);
      });

      it('returns false when set to false', () => {
        store.configuration = { productionSpeedReportEnabled: false };
        expect(store.productionSpeedReportEnabled).toBe(false);
      });

      it('returns false when not set', () => {
        store.configuration = {};
        expect(store.productionSpeedReportEnabled).toBe(false);
      });
    });

    describe('aiNotesInsightsEnabled', () => {
      it('returns true when value is boolean true', () => {
        store.configuration = { aiNotesInsightsEnabled: true };
        expect(store.aiNotesInsightsEnabled).toBe(true);
      });

      it('returns false when value is boolean false', () => {
        store.configuration = { aiNotesInsightsEnabled: false };
        expect(store.aiNotesInsightsEnabled).toBe(false);
      });

      it('returns false when value is string "true"', () => {
        store.configuration = { aiNotesInsightsEnabled: 'true' };
        expect(store.aiNotesInsightsEnabled).toBe(false);
      });

      it('returns false when value is number 1', () => {
        store.configuration = { aiNotesInsightsEnabled: 1 };
        expect(store.aiNotesInsightsEnabled).toBe(false);
      });

      it('returns false when value is undefined', () => {
        store.configuration = {};
        expect(store.aiNotesInsightsEnabled).toBe(false);
      });

      it('returns false when value is null', () => {
        store.configuration = { aiNotesInsightsEnabled: null };
        expect(store.aiNotesInsightsEnabled).toBe(false);
      });
    });

    test('includeNoDataDatapoints', () => {
      store.configuration = {};
      expect(store.includeNoDataDatapoints).toBe(true);
      store.configuration = { includeNoDataDatapoints: false };
      expect(store.includeNoDataDatapoints).toBe(false);
    });

    test('disableTrendline', () => {
      store.configuration = {};
      expect(store.disableTrendline).toBe(false);
      store.configuration = { disableTrendline: true };
      expect(store.disableTrendline).toBe(true);
    });
  });
});
