import { flushPromises, shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

import { useFilterbarStore, useDeviceStore, useReportsConfigStore, useConfigurationStore, useAiInsightsStore } from '@/stores';
import configType from '@/stores/reportsConfig/constants/configType';

const desktopScreen = { width: 1920, height: 1080 };

const applyDefaultGetters = (pinia, {
  isMobileView = false,
  configType: cfgType,
  chartLegendState = ['first', 'second', 'third'],
  chartData = [{ id: 1, value: 123 }],
  groupBy = [],
  granularity = 'total',
  orderedDateRange = ['2024-01-01', '2024-01-31'],
  aiNotesInsightsEnabled = false,
  hasEligibleStations,
} = {}) => {
  const reportsConfigStore = useReportsConfigStore(pinia);
  reportsConfigStore.configType = cfgType;
  reportsConfigStore.rawData = [];
  reportsConfigStore.isLoading = undefined;
  reportsConfigStore.chartLegendState = chartLegendState;
  reportsConfigStore.chartData = chartData;
  reportsConfigStore.disabledParams = [];
  reportsConfigStore.groupByMenuItems = {};
  reportsConfigStore.groupBy = groupBy;
  reportsConfigStore.granularity = granularity;
  reportsConfigStore.orderedDateRange = orderedDateRange;
  reportsConfigStore.buildQueryArgs = vi.fn().mockResolvedValue({
    filters: { stationId: [1] },
    query: { invertedFilters: [] },
  });

  const configurationStore = useConfigurationStore(pinia);
  configurationStore.aiNotesInsightsEnabled = aiNotesInsightsEnabled;

  const aiInsightsStore = useAiInsightsStore(pinia);
  aiInsightsStore.hasEligibleStations = hasEligibleStations || (() => false);

  useDeviceStore(pinia).isMobileView = isMobileView;
  useFilterbarStore(pinia);
};

const createPinia = ({
  overrides = {},
  reportsConfigState = {},
  filterbarState = {},
  aiInsightsState = {},
  deviceScreen = desktopScreen,
} = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
    initialState: {
      device: { screen: deviceScreen },
      reportsConfig: {
        tableData: [{ id: 1, value: 123 }],
        chartData: [{ id: 1, value: 123 }],
        totals: [],
        ...reportsConfigState,
      },
      filterbar: {
        requestFilterState: {},
        ...filterbarState,
      },
      aiInsights: {
        eligibleStationsMap: {},
        lastEligibleStationsFetchKey: null,
        ...aiInsightsState,
      },
    },
  });
  applyDefaultGetters(pinia, overrides);
  return pinia;
};

describe('ReportsMain', () => {
  let originalSetTimeout;
  beforeEach(() => {
    originalSetTimeout = globalThis.setTimeout;
    globalThis.setTimeout = (fn) => fn();
    vi.clearAllMocks();
  });
  afterEach(() => {
    globalThis.setTimeout = originalSetTimeout;
  });

  it('renders correctly with empty data', async () => {
    const wrapper = shallowMount(index, {
      shallow: true,
      global: {
        stubs: { 'reports-layout-template': false },
        plugins: [createPinia({ reportsConfigState: { tableData: [] } })],
      },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with tableData set', async () => {
    const wrapper = shallowMount(index, {
      shallow: true,
      global: {
        stubs: { 'reports-layout-template': false },
        plugins: [createPinia({
          reportsConfigState: {
            tableData: [
              { id: 1, value: 123 },
              { id: 2, value: 456 },
              { id: 3, value: 789 },
            ],
          },
        })],
      },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile', async () => {
    const wrapper = shallowMount(index, {
      shallow: true,
      global: {
        stubs: { 'reports-layout-template': false },
        plugins: [createPinia({
          overrides: { isMobileView: true },
          reportsConfigState: {
            tableData: [
              { id: 1, value: 123 },
              { id: 2, value: 456 },
              { id: 3, value: 789 },
            ],
          },
          deviceScreen: { width: 400, height: 800 },
        })],
      },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if type is DOWNTIME', async () => {
    const wrapper = shallowMount(index, {
      shallow: true,
      global: {
        stubs: { 'reports-layout-template': false },
        plugins: [createPinia({ overrides: { configType: configType.DOWNTIME } })],
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('has chart visible if tableData is not empty', async () => {
    const wrapper = shallowMount(index, {
      shallow: true,
      global: {
        stubs: { 'reports-layout-template': false },
        plugins: [createPinia({
          reportsConfigState: {
            tableData: [
              { id: 1, value: 123 },
              { id: 2, value: 456 },
              { id: 3, value: 789 },
            ],
          },
        })],
      },
    });

    await flushPromises();

    expect(wrapper.find('#report-chart').exists()).toBeTruthy();
    expect(wrapper.find('#report-empty-view').exists()).toBeFalsy();
  });

  it('doesnt show chart if tableData is empty', async () => {
    const wrapper = shallowMount(index, {
      shallow: true,
      global: {
        stubs: { 'reports-layout-template': false },
        plugins: [createPinia({ reportsConfigState: { tableData: [] } })],
      },
    });

    await flushPromises();

    expect(wrapper.find('#report-chart').exists()).toBeFalsy();
    expect(wrapper.find('#report-empty-view').exists()).toBeTruthy();
  });

  it('doesnt show chart if legend is empty and type is OEE', async () => {
    const wrapper = shallowMount(index, {
      shallow: true,
      global: {
        stubs: { 'reports-layout-template': false },
        plugins: [createPinia({
          overrides: { configType: 'OEE', chartLegendState: [] },
          reportsConfigState: {
            tableData: [
              { id: 1, value: 123 },
              { id: 2, value: 456 },
              { id: 3, value: 789 },
            ],
          },
        })],
      },
    });

    await flushPromises();

    expect(wrapper.find('#report-chart').exists()).toBeFalsy();
    expect(wrapper.find('#report-empty-view').exists()).toBeTruthy();
  });

  it('has pagination if chart is visible', () => {
    const wrapper = shallowMount(index, {
      shallow: true,
      computed: {
        ...index.computed,
        isChartVisible() {
          return true;
        },
      },
      global: {
        stubs: { 'reports-layout-template': false },
        plugins: [createPinia()],
      },
    });

    expect(wrapper.find('#reports-chart-pagination').exists()).toBeTruthy();
  });

  it('doesnt have pagination if chart is not visible', () => {
    const wrapper = shallowMount(index, {
      shallow: true,
      computed: {
        ...index.computed,
        isChartVisible() {
          return false;
        },
      },
      global: {
        stubs: { 'reports-layout-template': false },
        plugins: [createPinia()],
      },
    });

    expect(wrapper.find('#reports-chart-pagination').exists()).toBeFalsy();
  });

  it('doesnt have table if tableData is empty', () => {
    const wrapper = shallowMount(index, {
      shallow: true,
      global: {
        stubs: { 'reports-layout-template': false },
        plugins: [createPinia({ reportsConfigState: { tableData: [] } })],
      },
    });

    expect(wrapper.find('#report-table').exists()).toBeFalsy();
  });

  it('has table if tableData is not empty', () => {
    const wrapper = shallowMount(index, {
      shallow: true,
      global: {
        stubs: { 'reports-layout-template': false },
        plugins: [createPinia({
          reportsConfigState: {
            tableData: [
              { id: 1, value: 123 },
              { id: 2, value: 456 },
              { id: 3, value: 789 },
            ],
          },
        })],
      },
    });

    expect(wrapper.find('#report-table').exists()).toBeTruthy();
  });

  test('that OEE chart has legend if legendState is empty', () => {
    const wrapper = shallowMount(index, {
      shallow: true,
      global: {
        stubs: { 'reports-layout-template': false },
        plugins: [createPinia({ overrides: { configType: 'OEE', chartLegendState: [] } })],
      },
    });

    expect(wrapper.find('#reports-chart-legend').exists()).toBeTruthy();
  });

  test('that onPdfExport calls generateReportsPdf with correct params', () => {
    const pinia = createPinia();
    const reportsConfigStore = useReportsConfigStore(pinia);
    const wrapper = shallowMount(index, {
      shallow: true,
      global: {
        stubs: { 'reports-layout-template': false },
        plugins: [pinia],
      },
    });

    wrapper.vm.onPdfExport();
    expect(reportsConfigStore.generateReportsPdf).toHaveBeenCalledTimes(1);
    const title = wrapper.find('#report-title').wrapperElement;
    const filterbar = wrapper.find('#report-filter-bar').wrapperElement;
    const chart = wrapper.find('#report-chart').wrapperElement;
    const legend = wrapper.find('#reports-chart-legend').wrapperElement;
    const table = wrapper.find('#report-table').wrapperElement;
    expect(reportsConfigStore.generateReportsPdf).toHaveBeenCalledWith([title, filterbar, chart, legend, table]);
  });

  it('sets page to 1 in filter and triggers data request if requestFilterState changes', async () => {
    const pinia = createPinia({ filterbarState: { requestFilterState: { page: 2 } } });
    const filterbarStore = useFilterbarStore(pinia);
    const wrapper = shallowMount(index, {
      shallow: true,
      global: {
        stubs: { 'reports-layout-template': false },
        plugins: [pinia],
      },
    });

    await wrapper.vm.$options.watch.requestFilterState.call(wrapper.vm, { page: 2 }, { page: 2, stationId: [1] });

    expect(filterbarStore.updateFilterValue).toHaveBeenCalledTimes(1);
    expect(filterbarStore.updateFilterValue).toHaveBeenCalledWith({ page: 1 });
    expect(filterbarStore.triggerDataRequest).toHaveBeenCalledTimes(1);
  });

  describe('getTableWidth', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    Object.defineProperty(document.body, 'scrollWidth', {
      get: () => 1000,
    });

    it('returns correct table width if it is not mobile view, screen display mdAndUp is true, mdAndDown is false and isSideMenuMiniVersion is false', () => {
      const wrapper = shallowMount(index, {
        global: {
          plugins: [createPinia({ overrides: { isMobileView: false } })],
        },
      });

      wrapper.vm.$vuetify.display.mdAndUp = true;
      wrapper.vm.$vuetify.display.mdAndDown = false;
      wrapper.vm.isSideMenuMiniVersion = false;

      const sideMenuWidth = 256;
      const contentPadding = 32;
      const mainDrawerWidth = 64;
      const tableMargin = 32;
      const tablePadding = 16;
      const resultWidth = 1000 - sideMenuWidth - contentPadding - mainDrawerWidth - tableMargin - tablePadding;

      expect(wrapper.vm.getTableWidth()).toBe(resultWidth);
    });

    it('returns correct table width if it is not mobile view, screen display mdAndUp is true, mdAndDown is false and isSideMenuMiniVersion is true', () => {
      const wrapper = shallowMount(index, {
        global: {
          plugins: [createPinia({ overrides: { isMobileView: false } })],
        },
      });

      wrapper.vm.$vuetify.display.mdAndUp = true;
      wrapper.vm.$vuetify.display.mdAndDown = false;
      wrapper.vm.isSideMenuMiniVersion = true;

      const sideMenuWidth = 68;
      const contentPadding = 32;
      const mainDrawerWidth = 64;
      const tableMargin = 32;
      const tablePadding = 16;
      const resultWidth = 1000 - sideMenuWidth - contentPadding - mainDrawerWidth - tableMargin - tablePadding;

      expect(wrapper.vm.getTableWidth()).toBe(resultWidth);
    });

    it('returns correct table width if it is not mobile view, screen display mdAndUp is false, mdAndDown is false and isSideMenuMiniVersion is false', () => {
      const wrapper = shallowMount(index, {
        global: {
          plugins: [createPinia({ overrides: { isMobileView: false } })],
        },
      });

      wrapper.vm.$vuetify.display.mdAndUp = false;
      wrapper.vm.$vuetify.display.mdAndDown = false;
      wrapper.vm.isSideMenuMiniVersion = false;

      const sideMenuWidth = 256;
      const contentPadding = 32;
      const mainDrawerWidth = 0;
      const tableMargin = 32;
      const tablePadding = 16;
      const resultWidth = 1000 - sideMenuWidth - contentPadding - mainDrawerWidth - tableMargin - tablePadding;

      expect(wrapper.vm.getTableWidth()).toBe(resultWidth);
    });

    it('returns correct table width if it is not mobile view, screen display mdAndUp is false, mdAndDown is false and isSideMenuMiniVersion is true', () => {
      const wrapper = shallowMount(index, {
        global: {
          plugins: [createPinia({ overrides: { isMobileView: false } })],
        },
      });

      wrapper.vm.$vuetify.display.mdAndUp = false;
      wrapper.vm.$vuetify.display.mdAndDown = false;
      wrapper.vm.isSideMenuMiniVersion = true;

      const sideMenuWidth = 68;
      const contentPadding = 32;
      const mainDrawerWidth = 0;
      const tableMargin = 32;
      const tablePadding = 16;
      const resultWidth = 1000 - sideMenuWidth - contentPadding - mainDrawerWidth - tableMargin - tablePadding;

      expect(wrapper.vm.getTableWidth()).toBe(resultWidth);
    });

    it('returns correct table width if it is not mobile view, screen display mdAndUp is false and mdAndDown is true', () => {
      const wrapper = shallowMount(index, {
        global: {
          plugins: [createPinia({ overrides: { isMobileView: false } })],
        },
      });

      wrapper.vm.$vuetify.display.mdAndUp = false;
      wrapper.vm.$vuetify.display.mdAndDown = true;

      const sideMenuWidth = 0;
      const contentPadding = 32;
      const mainDrawerWidth = 0;
      const tableMargin = 32;
      const tablePadding = 16;
      const resultWidth = 1000 - sideMenuWidth - contentPadding - mainDrawerWidth - tableMargin - tablePadding;

      expect(wrapper.vm.getTableWidth()).toBe(resultWidth);
    });

    it('returns correct table width if it is mobile view', () => {
      const wrapper = shallowMount(index, {
        global: {
          plugins: [createPinia({
            overrides: { isMobileView: true },
            deviceScreen: { width: 400, height: 800 },
          })],
        },
      });

      wrapper.vm.$vuetify.display.mdAndUp = false;
      wrapper.vm.$vuetify.display.mdAndDown = true;

      const sideMenuWidth = 0;
      const contentPadding = 0;
      const mainDrawerWidth = 0;
      const tableMargin = 32;
      const tablePadding = 16;
      const resultWidth = 1000 - sideMenuWidth - contentPadding - mainDrawerWidth - tableMargin - tablePadding;

      expect(wrapper.vm.getTableWidth()).toBe(resultWidth);
    });
  });

  it('that getLabel returns correct label for each type', () => {
    const wrapper = shallowMount(index, {
      global: {
        plugins: [createPinia()],
      },
    });

    const result = {
      DOWNTIME: 'Stop groups',
      SPEEDLOSS: 'Speed loss groups',
      SCRAPREASON: 'Scrap groups',
    };

    Object.keys(configType).forEach((type) => {
      expect(wrapper.vm.getLabel(type)).toBe(result[type] || '');
    });
  });

  describe('AI Insights integration', () => {
    const aiEnabledOptions = (extra = {}) => ({
      overrides: {
        aiNotesInsightsEnabled: true,
        configType: configType.DOWNTIME,
        groupBy: ['entityId'],
        granularity: 'total',
        ...(extra.overrides || {}),
      },
      reportsConfigState: {
        tableData: [
          { commentId: 42, value: 100, notesCount: 75 },
          { commentId: 43, value: 200, notesCount: 10 },
        ],
        ...(extra.reportsConfigState || {}),
      },
      ...(extra.rest || {}),
    });

    it('dispatches fetchEligibleStations when tableData changes and AI insights is enabled', async () => {
      const pinia = createPinia(aiEnabledOptions());
      const aiInsightsStore = useAiInsightsStore(pinia);
      shallowMount(index, {
        shallow: true,
        global: {
          stubs: { 'reports-layout-template': false },
          plugins: [pinia],
        },
      });

      await flushPromises();

      expect(aiInsightsStore.fetchEligibleStations).toHaveBeenCalledWith(
        expect.objectContaining({
          stopReasonIds: [42],
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          filters: { stationId: [1] },
          inverseFilter: [],
        }),
      );
    });

    it('does not dispatch fetchEligibleStations when all stop reasons have notesCount below threshold', async () => {
      const pinia = createPinia(aiEnabledOptions({
        reportsConfigState: {
          tableData: [
            { commentId: 42, value: 100, notesCount: 10 },
            { commentId: 43, value: 200, notesCount: 0 },
          ],
        },
      }));
      const aiInsightsStore = useAiInsightsStore(pinia);
      shallowMount(index, {
        shallow: true,
        global: {
          stubs: { 'reports-layout-template': false },
          plugins: [pinia],
        },
      });

      await flushPromises();

      expect(aiInsightsStore.fetchEligibleStations).not.toHaveBeenCalled();
    });

    it('deduplicates stop reason IDs before dispatching fetchEligibleStations', async () => {
      const pinia = createPinia(aiEnabledOptions({
        reportsConfigState: {
          tableData: [
            { commentId: 42, value: 100, notesCount: 75 },
            { commentId: 42, value: 200, notesCount: 80 },
            { commentId: 43, value: 300, notesCount: 60 },
          ],
        },
      }));
      const aiInsightsStore = useAiInsightsStore(pinia);
      shallowMount(index, {
        shallow: true,
        global: {
          stubs: { 'reports-layout-template': false },
          plugins: [pinia],
        },
      });

      await flushPromises();

      expect(aiInsightsStore.fetchEligibleStations).toHaveBeenCalledWith(
        expect.objectContaining({
          stopReasonIds: [42, 43],
          filters: { stationId: [1] },
          inverseFilter: [],
        }),
      );
    });

    it('enrichedTableData returns tableData unchanged when groupBy is not entityId', () => {
      const pinia = createPinia(aiEnabledOptions({ overrides: { groupBy: ['stationId'] } }));
      const reportsConfigStore = useReportsConfigStore(pinia);

      const wrapper = shallowMount(index, {
        shallow: true,
        global: {
          stubs: { 'reports-layout-template': false },
          plugins: [pinia],
        },
      });

      expect(wrapper.vm.enrichedTableData).toEqual(reportsConfigStore.tableData);
    });

    it('enrichedTableData returns tableData unchanged when granularity is not total', () => {
      const pinia = createPinia(aiEnabledOptions({ overrides: { granularity: 'month' } }));
      const reportsConfigStore = useReportsConfigStore(pinia);

      const wrapper = shallowMount(index, {
        shallow: true,
        global: {
          stubs: { 'reports-layout-template': false },
          plugins: [pinia],
        },
      });

      expect(wrapper.vm.enrichedTableData).toEqual(reportsConfigStore.tableData);
    });

    it('dispatches clearEligibleStations when filter state changes', async () => {
      const pinia = createPinia(aiEnabledOptions());
      const aiInsightsStore = useAiInsightsStore(pinia);
      const wrapper = shallowMount(index, {
        shallow: true,
        global: {
          stubs: { 'reports-layout-template': false },
          plugins: [pinia],
        },
      });

      await wrapper.vm.$options.watch.requestFilterState.call(
        wrapper.vm,
        { stationId: [2] },
        { stationId: [1] },
      );

      expect(aiInsightsStore.clearEligibleStations).toHaveBeenCalled();
    });

    it('renders AiInsightsStationMenu when AI insights is enabled', () => {
      const wrapper = shallowMount(index, {
        shallow: true,
        global: {
          stubs: { 'reports-layout-template': false },
          plugins: [createPinia(aiEnabledOptions())],
        },
      });

      expect(wrapper.findComponent({ name: 'AiInsightsStationMenu' }).exists()).toBe(true);
    });

    it('renders AiInsightsEmailConfirmation when AI insights is enabled', () => {
      const wrapper = shallowMount(index, {
        shallow: true,
        global: {
          stubs: { 'reports-layout-template': false },
          plugins: [createPinia(aiEnabledOptions())],
        },
      });

      expect(wrapper.findComponent({ name: 'AiInsightsEmailConfirmation' }).exists()).toBe(true);
    });

    it('renders AiInsightsTutorial when AI insights is enabled', () => {
      const wrapper = shallowMount(index, {
        shallow: true,
        global: {
          stubs: { 'reports-layout-template': false },
          plugins: [createPinia(aiEnabledOptions())],
        },
      });

      expect(wrapper.findComponent({ name: 'AiInsightsTutorial' }).exists()).toBe(true);
    });

    it('dispatches fetchEligibleStations when shouldEnrichWithAiInsights transitions to true', async () => {
      const pinia = createPinia(aiEnabledOptions());
      const aiInsightsStore = useAiInsightsStore(pinia);
      const wrapper = shallowMount(index, {
        shallow: true,
        global: {
          stubs: { 'reports-layout-template': false },
          plugins: [pinia],
        },
      });

      await flushPromises();
      vi.clearAllMocks();
      // Reset dedup key in the store so the watcher can trigger a new fetch
      // (immediate: true on tableData already set the key during mount)
      aiInsightsStore.lastEligibleStationsFetchKey = null;

      // Simulate shouldEnrichWithAiInsights transitioning to true
      // (e.g., user switches groupBy to entityId/stop-reasons x-axis)
      wrapper.vm.$options.watch.shouldEnrichWithAiInsights.call(wrapper.vm, true);
      await flushPromises();

      expect(aiInsightsStore.fetchEligibleStations).toHaveBeenCalled();
    });

    it('dispatches clearEligibleStations when shouldEnrichWithAiInsights transitions to false', async () => {
      const pinia = createPinia(aiEnabledOptions());
      const aiInsightsStore = useAiInsightsStore(pinia);
      const wrapper = shallowMount(index, {
        shallow: true,
        global: {
          stubs: { 'reports-layout-template': false },
          plugins: [pinia],
        },
      });

      await flushPromises();
      vi.clearAllMocks();

      wrapper.vm.$options.watch.shouldEnrichWithAiInsights.call(wrapper.vm, false);
      await flushPromises();

      expect(aiInsightsStore.clearEligibleStations).toHaveBeenCalled();
    });

    it('does not dispatch fetchEligibleStations when shouldEnrichWithAiInsights transitions to false', async () => {
      const pinia = createPinia(aiEnabledOptions());
      const aiInsightsStore = useAiInsightsStore(pinia);
      const wrapper = shallowMount(index, {
        shallow: true,
        global: {
          stubs: { 'reports-layout-template': false },
          plugins: [pinia],
        },
      });

      await flushPromises();
      vi.clearAllMocks();

      wrapper.vm.$options.watch.shouldEnrichWithAiInsights.call(wrapper.vm, false);
      await flushPromises();

      expect(aiInsightsStore.fetchEligibleStations).not.toHaveBeenCalled();
    });

    it('enrichedTableData adds _hasAiInsights flag based on eligible stations', () => {
      const pinia = createPinia(aiEnabledOptions({
        overrides: { hasEligibleStations: (stopReasonId) => stopReasonId === 42 },
      }));
      const wrapper = shallowMount(index, {
        shallow: true,
        global: {
          stubs: { 'reports-layout-template': false },
          plugins: [pinia],
        },
      });

      const enriched = wrapper.vm.enrichedTableData;
      expect(enriched[0]._hasAiInsights).toBe(true);
      expect(enriched[1]._hasAiInsights).toBe(false);
    });

    it('onAiInsightsSubmit passes orderedDateRange and report filters to submitAnalysis', async () => {
      const pinia = createPinia(aiEnabledOptions());
      const reportsConfigStore = useReportsConfigStore(pinia);
      const aiInsightsStore = useAiInsightsStore(pinia);
      reportsConfigStore.buildQueryArgs = vi.fn().mockResolvedValue({
        filters: { productId: [10] },
        query: { invertedFilters: ['productId'] },
      });
      const wrapper = shallowMount(index, {
        shallow: true,
        global: {
          stubs: { 'reports-layout-template': false },
          plugins: [pinia],
        },
      });

      await wrapper.vm.onAiInsightsSubmit();

      expect(reportsConfigStore.buildQueryArgs).toHaveBeenCalled();
      expect(aiInsightsStore.submitAnalysis).toHaveBeenCalledWith(
        {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          filters: { productId: [10] },
          inverseFilter: ['productId'],
        },
      );
    });

    it('does not render AI menu components when AI insights is disabled', () => {
      const wrapper = shallowMount(index, {
        shallow: true,
        global: {
          stubs: { 'reports-layout-template': false },
          plugins: [createPinia()],
        },
      });

      expect(wrapper.findComponent({ name: 'AiInsightsStationMenu' }).exists()).toBe(false);
      expect(wrapper.findComponent({ name: 'AiInsightsEmailConfirmation' }).exists()).toBe(false);
      expect(wrapper.findComponent({ name: 'AiInsightsTutorial' }).exists()).toBe(false);
    });

    it('does not render AI insights components on non-DOWNTIME reports', () => {
      const wrapper = shallowMount(index, {
        shallow: true,
        global: {
          stubs: { 'reports-layout-template': false },
          plugins: [createPinia(aiEnabledOptions({ overrides: { configType: configType.OEE } }))],
        },
      });

      expect(wrapper.findComponent({ name: 'AiInsightsStationMenu' }).exists()).toBe(false);
      expect(wrapper.findComponent({ name: 'AiInsightsEmailConfirmation' }).exists()).toBe(false);
      expect(wrapper.findComponent({ name: 'AiInsightsTutorial' }).exists()).toBe(false);
    });

    it('does not fetch eligible stations when orderedDateRange has null startDate', async () => {
      const pinia = createPinia(aiEnabledOptions({
        overrides: { orderedDateRange: [null, '2024-01-31'] },
      }));
      const aiInsightsStore = useAiInsightsStore(pinia);
      shallowMount(index, {
        shallow: true,
        global: {
          stubs: { 'reports-layout-template': false },
          plugins: [pinia],
        },
      });

      await flushPromises();

      expect(aiInsightsStore.fetchEligibleStations).not.toHaveBeenCalled();
    });

    it('does not fetch eligible stations when orderedDateRange has null endDate', async () => {
      const pinia = createPinia(aiEnabledOptions({
        overrides: { orderedDateRange: ['2024-01-01', null] },
      }));
      const aiInsightsStore = useAiInsightsStore(pinia);
      shallowMount(index, {
        shallow: true,
        global: {
          stubs: { 'reports-layout-template': false },
          plugins: [pinia],
        },
      });

      await flushPromises();

      expect(aiInsightsStore.fetchEligibleStations).not.toHaveBeenCalled();
    });

    it('does not fetch eligible stations when tableData is empty and AI insights is enabled', async () => {
      const pinia = createPinia(aiEnabledOptions({ reportsConfigState: { tableData: [] } }));
      const aiInsightsStore = useAiInsightsStore(pinia);
      shallowMount(index, {
        shallow: true,
        global: {
          stubs: { 'reports-layout-template': false },
          plugins: [pinia],
        },
      });

      await flushPromises();

      expect(aiInsightsStore.fetchEligibleStations).not.toHaveBeenCalled();
    });
  });
});
