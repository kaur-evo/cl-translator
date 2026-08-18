import { setActivePinia, createPinia } from 'pinia';

import useFeatureStore from './index';

import featureApi from '@/api/featureApi';
import useConfigurationStore from '@/stores/configuration';


vi.mock('@/api/featureApi');

const featureData = {
  'feature.activityLogs': true,
  'feature.alerts': true,
  'feature.apiAccess': false,
  'feature.checklists': true,
  'feature.customReporting': true,
  'feature.tags': true,
  'feature.qualityYield': true,
  'feature.improvements': false,
  'feature.enableIncreaseQtyWithScrap': true,
  'feature.semiFinished': false,
  'feature.showProductTour': true,
  'feature.overdueInvoiceNotificationEnabled': false,
  'feature.securitySettings': false,
};
featureApi.getFeatures.mockResolvedValue(featureData);

describe('useFeatureStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useFeatureStore();
  });

  test('initial state', () => {
    expect(store.activityLogs).toBe(false);
    expect(store.alerts).toBe(false);
    expect(store.loading).toBe(false);
    expect(store.promise).toBe(null);
  });

  describe('fetchFeatures', () => {
    test('sets loading and then applies fetched features', async () => {
      await store.fetchFeatures();
      expect(store.loading).toBe(false);
      expect(store.activityLogs).toBe(true);
      expect(store.alerts).toBe(true);
      expect(store.apiAccess).toBe(false);
      expect(store.checklists).toBe(true);
      expect(store.tags).toBe(true);
    });

    test('handles API error gracefully', async () => {
      featureApi.getFeatures.mockRejectedValueOnce(new Error('API Error'));
      vi.spyOn(console, 'error').mockImplementationOnce(() => {});
      await store.fetchFeatures();
      expect(store.loading).toBe(false);
    });
  });

  describe('getters', () => {
    test('isLoading', () => {
      expect(store.isLoading).toBe(false);
      store.loading = true;
      expect(store.isLoading).toBe(true);
    });

    test('activityLogsEnabled', () => {
      expect(store.activityLogsEnabled).toBe(false);
      store.activityLogs = true;
      expect(store.activityLogsEnabled).toBe(true);
    });

    test('alertsEnabled', () => {
      expect(store.alertsEnabled).toBe(false);
      store.alerts = true;
      expect(store.alertsEnabled).toBe(true);
    });

    test('checklistsEnabled', () => {
      store.checklists = true;
      expect(store.checklistsEnabled).toBe(true);
    });

    test('customReportingEnabled', () => {
      store.customReporting = true;
      expect(store.customReportingEnabled).toBe(true);
    });

    test('apiAccessEnabled', () => {
      store.apiAccess = true;
      expect(store.apiAccessEnabled).toBe(true);
    });

    test('tagsEnabled', () => {
      store.tags = true;
      expect(store.tagsEnabled).toBe(true);
    });

    test('qualityYieldEnabled', () => {
      store.qualityYield = true;
      expect(store.qualityYieldEnabled).toBe(true);
    });

    test('improvementsEnabled', () => {
      store.improvements = true;
      expect(store.improvementsEnabled).toBe(true);
    });

    test('productionOrdersEnabled', () => {
      store.productionOrders = true;
      expect(store.productionOrdersEnabled).toBe(true);
    });

    test('increaseQtyWithScrapEnabled', () => {
      store.enableIncreaseQtyWithScrap = true;
      expect(store.increaseQtyWithScrapEnabled).toBe(true);
    });

    test('semiFinishedEnabled', () => {
      store.semiFinished = true;
      expect(store.semiFinishedEnabled).toBe(true);
    });

    test('productTourEnabled', () => {
      store.showProductTour = true;
      expect(store.productTourEnabled).toBe(true);
    });

    test('overdueInvoiceNotificationEnabled', () => {
      expect(store.overdueInvoiceNotificationEnabled).toBe(false);
      store.overdueInvoiceNotificationEnabled = true;
      expect(store.overdueInvoiceNotificationEnabled).toBe(true);
    });

    test('securitySettingsEnabled', () => {
      store.securitySettings = true;
      expect(store.securitySettingsEnabled).toBe(true);
    });

    describe('productionSpeedReportEnabled', () => {
      test.each([
        [true, true, true],
        [true, false, false],
        [false, true, false],
        [false, false, false],
      ])('config=%s, feature=%s -> %s', (configEnabled, featureEnabled, expected) => {
        const configurationStore = useConfigurationStore();
        configurationStore.configuration = { productionSpeedReportEnabled: configEnabled };
        store.productionSpeedReport = featureEnabled;
        expect(store.productionSpeedReportEnabled).toBe(expected);
      });
    });
  });
});
