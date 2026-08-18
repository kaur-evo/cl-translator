import { setActivePinia, createPinia } from 'pinia';

import useShiftViewWidgetsStore from '.';

import widgetsApi from '@/api/widgetsApi';
import performanceWidgetType from '@/constants/performanceWidgetType';
import useShiftviewTimelineStore from '@/stores/shiftviewTimeline';
import useUserPreferencesStore from '@/stores/userPreferences';

vi.mock('@/api/widgetsApi', () => ({
  default: {
    getWidgets: vi.fn(),
  },
}));

vi.mock('@/stores/genericNotification', () => ({
  default: vi.fn(() => ({ notifyError: vi.fn() })),
  __esModule: true,
}));

vi.mock('@/stores/shiftviewTimeline', () => ({
  default: vi.fn(() => ({
    currentRoute: null,
    currentBatch: { unitId: 'primaryUnit', alternativeUnitId: 'secondaryUnit' },
  })),
  __esModule: true,
}));

vi.mock('@/stores/shift', () => ({
  default: vi.fn(() => ({})),
  __esModule: true,
}));

vi.mock('@/stores/station', () => ({
  default: vi.fn(() => ({ lineviewStation: { zoneId: 'UTC' } })),
  __esModule: true,
}));

vi.mock('@/stores/userPreferences', () => ({
  default: vi.fn(() => ({
    viewSettings: { usePrimaryUnit: true, performanceWidgetType: 'UNIT_PER_HOUR' },
  })),
  __esModule: true,
}));

describe('useShiftViewWidgetsStore', () => {
  let store;

  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
    store = useShiftViewWidgetsStore();
  });

  test('initial state', () => {
    expect(store.widgetsList).toEqual([]);
    expect(store.activeIndexes).toEqual({});
  });

  describe('actions', () => {
    describe('fetchAndInitializeWidgets', () => {
      it('maps known widget types from API response', async () => {
        widgetsApi.getWidgets.mockResolvedValue([
          { type: 'perform', config: '{"subType":"UNIT_PER_HOUR"}' },
          { type: 'oee' },
          { type: 'measure', config: '{"widgetTitle":"Custom"}' },
        ]);

        await store.fetchAndInitializeWidgets(123);

        expect(widgetsApi.getWidgets).toHaveBeenCalledWith(123);
        expect(store.widgetsList).toEqual([
          expect.objectContaining({ name: 'performance', component: 'performance-widget', type: 'perform', config: { subType: 'UNIT_PER_HOUR' } }),
          expect.objectContaining({ name: 'OEE', component: 'OEE-widget', type: 'oee', config: {} }),
          expect.objectContaining({ name: 'measure', component: 'measure-widget', type: 'measure', config: { widgetTitle: 'Custom' } }),
        ]);
      });

      it('maps widget types with numeric suffixes to correct setup', async () => {
        widgetsApi.getWidgets.mockResolvedValue([
          { type: 'metrics1', config: '{"chartType":"line"}' },
          { type: 'metrics2', config: '{"chartType":"bar"}' },
          { type: 'measure1', config: '{"widgetTitle":"Measure A"}' },
          { type: 'measure2', config: '{"widgetTitle":"Measure B"}' },
        ]);

        await store.fetchAndInitializeWidgets(456);

        expect(store.widgetsList).toEqual([
          expect.objectContaining({ name: 'shiftview-custom-chart', component: 'shiftview-custom-chart-widget', type: 'metrics', config: { chartType: 'line' } }),
          expect.objectContaining({ name: 'shiftview-custom-chart', component: 'shiftview-custom-chart-widget', type: 'metrics', config: { chartType: 'bar' } }),
          expect.objectContaining({ name: 'measure', component: 'measure-widget', type: 'measure', config: { widgetTitle: 'Measure A' } }),
          expect.objectContaining({ name: 'measure', component: 'measure-widget', type: 'measure', config: { widgetTitle: 'Measure B' } }),
        ]);
      });

      it('maps duplicate widget types with unique IDs', async () => {
        widgetsApi.getWidgets.mockResolvedValue([
          { id: 10, type: 'metrics', config: '{"chartType":"line"}' },
          { id: 11, type: 'metrics', config: '{"chartType":"bar"}' },
        ]);

        await store.fetchAndInitializeWidgets(789);

        expect(store.widgetsList).toEqual([
          { id: 10, name: 'shiftview-custom-chart', component: 'shiftview-custom-chart-widget', type: 'metrics', config: { chartType: 'line' } },
          { id: 11, name: 'shiftview-custom-chart', component: 'shiftview-custom-chart-widget', type: 'metrics', config: { chartType: 'bar' } },
        ]);
      });

      it('filters out unknown widget types', async () => {
        widgetsApi.getWidgets.mockResolvedValue([
          { type: 'perform', config: '{}' },
          { type: 'unknown_type', config: '{}' },
        ]);

        await store.fetchAndInitializeWidgets(123);

        expect(store.widgetsList).toHaveLength(1);
        expect(store.widgetsList[0].type).toBe('perform');
      });

      it('falls back to default widgets when API returns empty array', async () => {
        widgetsApi.getWidgets.mockResolvedValue([]);

        await store.fetchAndInitializeWidgets(123);

        expect(store.widgetsList).toEqual([
          expect.objectContaining({ name: 'performance', component: 'performance-widget', type: 'perform' }),
          expect.objectContaining({ name: 'OEE', component: 'OEE-widget', type: 'oee' }),
        ]);
      });

      it('falls back to default widgets when all types are unknown', async () => {
        widgetsApi.getWidgets.mockResolvedValue([
          { type: 'unknown1' },
          { type: 'unknown2' },
        ]);

        await store.fetchAndInitializeWidgets(123);

        expect(store.widgetsList).toHaveLength(2);
        expect(store.widgetsList[0].name).toBe('performance');
        expect(store.widgetsList[1].name).toBe('OEE');
      });

      it('parses invalid JSON config as empty object', async () => {
        widgetsApi.getWidgets.mockResolvedValue([
          { type: 'measure', config: 'invalid-json' },
        ]);

        await store.fetchAndInitializeWidgets(123);

        expect(store.widgetsList[0].config).toEqual({});
      });

      it('falls back to default widgets and notifies error when API rejects', async () => {
        widgetsApi.getWidgets.mockRejectedValue(new Error('Network error'));

        await store.fetchAndInitializeWidgets(123);

        expect(store.widgetsList).toEqual([
          expect.objectContaining({ name: 'performance', component: 'performance-widget', type: 'perform' }),
          expect.objectContaining({ name: 'OEE', component: 'OEE-widget', type: 'oee' }),
        ]);
      });
    });

    test('setIndex', () => {
      store.setIndex({ widgetKey: 1, index: 3 });
      expect(store.activeIndexes[1]).toBe(3);
    });
  });

  describe('getters', () => {
    test('widgetsList', () => {
      const widgets = [
        { name: 'performance', component: 'performance-widget', type: 'perform', config: {} },
      ];
      store.widgetsList = widgets;
      expect(store.widgetsList).toEqual(widgets);
    });

    test('getActiveIndex returns index for given widgetKey', () => {
      store.widgetsList = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }];
      store.setIndex({ widgetKey: 0, index: 3 });
      store.setIndex({ widgetKey: 1, index: 5 });
      expect(store.getActiveIndex(0)).toBe(3);
      expect(store.getActiveIndex(1)).toBe(5);
    });

    test('getActiveIndex clamps to max index when out of range', () => {
      store.widgetsList = [{ id: 1 }, { id: 2 }];
      store.setIndex({ widgetKey: 0, index: 5 });
      expect(store.getActiveIndex(0)).toBe(1);
    });

    test('getActiveIndex returns 0 for unknown widgetKey', () => {
      expect(store.getActiveIndex(99)).toBe(0);
    });

    test('perfWidgetType returns viewSettings.performanceWidgetType', () => {
      expect(store.perfWidgetType).toBe('UNIT_PER_HOUR');
    });

    test('perfWidgetType returns route runTimeType if viewSettings is ROUTE_CONFIG', () => {
      useUserPreferencesStore.mockReturnValue({
        viewSettings: { performanceWidgetType: performanceWidgetType.ROUTE_CONFIG },
      });
      useShiftviewTimelineStore.mockReturnValue({
        currentRoute: { runTimeType: performanceWidgetType.UNIT_PER_SECOND },
        currentBatch: {},
      });

      setActivePinia(createPinia());
      store = useShiftViewWidgetsStore();
      expect(store.perfWidgetType).toBe(performanceWidgetType.UNIT_PER_SECOND);
    });

    test('perfWidgetType returns UNIT_PER_MINUTE if ROUTE_CONFIG and no currentRoute', () => {
      useUserPreferencesStore.mockReturnValue({
        viewSettings: { performanceWidgetType: performanceWidgetType.ROUTE_CONFIG },
      });
      useShiftviewTimelineStore.mockReturnValue({
        currentRoute: null,
        currentBatch: {},
      });

      setActivePinia(createPinia());
      store = useShiftViewWidgetsStore();
      expect(store.perfWidgetType).toBe(performanceWidgetType.UNIT_PER_MINUTE);
    });
  });
});
