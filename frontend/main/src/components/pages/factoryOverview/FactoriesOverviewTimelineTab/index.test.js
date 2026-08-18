import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { DateTime } from 'luxon';

import FactoriesOverviewTimelineTab from './index.vue';

import CentrifugeService from '@/services/CentrifugeService';
import productApi from '@/api/productApi';
import useFactoryOverviewConfigStore from '@/stores/factoryOverviewConfig';
import useStationStore from '@/stores/station';
import useFactoryStore from '@/stores/factory';
import usePositionStore from '@/stores/position';
import usePerfCommentStore from '@/stores/perfComment';
import useDeviceStore from '@/stores/device';

vi.mock('@/api/productApi');
const getProductsMock = vi.fn(() => [{ id: 1, name: 'product test' }]);
productApi.getProducts = getProductsMock;

CentrifugeService.prototype.connectToRollingStations = vi.fn();

const defaultInitialState = {
  factoryOverviewConfig: {
    timelinesInterval: null,
    timelinesStatColumn: null,
    timelinesOrdering: null,
  },
};

const defaultInitialStateStores = {
  profile: {
    currentUser: { tenantId: 1 },
  },
};

const setupStoreGetters = (pinia) => {
  const factoryOverviewConfigStore = useFactoryOverviewConfigStore(pinia);
  factoryOverviewConfigStore.factoryViewStations = [];
  factoryOverviewConfigStore.factoryViewVisibleStationIds = [];

  const stationStore = useStationStore(pinia);
  stationStore.stationGroupsRealMap = new Map();

  const factoryStore = useFactoryStore(pinia);
  factoryStore.factoriesMap = {};

  const positionStore = usePositionStore(pinia);
  positionStore.positionsMap = { 1: { id: 1, name: 'test position' } };

  const perfCommentStore = usePerfCommentStore(pinia);
  perfCommentStore.perfCommentsMap = {};

  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = false;
};

const createWrapper = (options = {}) => {
  const { piniaOptions, ...mountOptions } = options;
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
    initialState: {
      ...defaultInitialState,
      ...defaultInitialStateStores,
    },
    ...piniaOptions,
  });

  setupStoreGetters(pinia);

  if (piniaOptions?.setupStores) {
    piniaOptions.setupStores(pinia);
  }

  return shallowMount(FactoriesOverviewTimelineTab, {
    global: {
      plugins: [pinia],
      mocks: {
        $t: (msg) => msg,
        $router: {},
        $route: { query: {} },
      },
      stubs: ['router-link', 'router-view'],
    },
    ...mountOptions,
  });
};

describe('FactoriesOverviewTimelineTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', async () => {
    const wrapper = createWrapper();
    await wrapper.setData({ connected: true });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that fetchFactoryViewRequirements is called on mount if not initialized', async () => {
    const fetchFactoryViewRequirementsMock = vi.spyOn(FactoriesOverviewTimelineTab.methods, 'fetchFactoryViewRequirements');

    createWrapper({
      piniaOptions: {
        initialState: {
          factoryOverviewConfig: {
            ...defaultInitialState.factoryOverviewConfig,
            loadingRequirements: false,
            initialized: false,
          },
        },
      },
    });

    await flushPromises();

    expect(fetchFactoryViewRequirementsMock).toHaveBeenCalled();
  });

  describe('isYellowSlice', () => {
    it('returns true if processedType is PRODUCT_SLOW_UNCOMMENTED', () => {
      const wrapper = createWrapper();
      const d = {
        typ: 'PRODUCT', processedType: 'PRODUCT_SLOW_UNCOMMENTED', gDur: 60, enTm: '2022-02-02T22:00:00', stTm: '2022-02-02T21:58:00',
      };
      expect(wrapper.vm.isYellowSlice(d)).toBe(true);
    });

    it('returns true if processedType is PRODUCT_SLOW_COMMENTED', () => {
      const wrapper = createWrapper();
      const d = {
        typ: 'PRODUCT', processedType: 'PRODUCT_SLOW_COMMENTED', gDur: 60, enTm: '2022-02-02T22:00:00', stTm: '2022-02-02T21:58:00',
      };
      expect(wrapper.vm.isYellowSlice(d)).toBe(true);
    });

    it('returns false if processedType is PRODUCT_FAST', () => {
      const wrapper = createWrapper();
      const d = {
        typ: 'PRODUCT', processedType: 'PRODUCT_FAST', gDur: 60, enTm: '2022-02-02T22:00:00', stTm: '2022-02-02T21:59:10',
      };
      expect(wrapper.vm.isYellowSlice(d)).toBe(false);
    });
  });

  describe('isChangeoverIcon', () => {
    it('returns true if slice has changeover and icon', () => {
      const wrapper = createWrapper();
      const d = { typ: 'PRODUCT', pChg: true, icon: true };
      expect(wrapper.vm.isChangeoverIcon(d)).toBe(true);
    });

    it('returns false if slice has changeover but no icon', () => {
      const wrapper = createWrapper();
      const d = { typ: 'PRODUCT', pChg: true, icon: false };
      expect(wrapper.vm.isChangeoverIcon(d)).toBe(false);
    });

    it('returns false if slice doesnt have changeover', () => {
      const wrapper = createWrapper();
      const d = { typ: 'PRODUCT', pChg: false };
      expect(wrapper.vm.isChangeoverIcon(d)).toBe(false);
    });
  });

  describe('getDotLabel', () => {
    it('returns Downtime for STOPPAGE_COMMENTED proccesedType', () => {
      const wrapper = createWrapper();
      const d = { processedType: 'STOPPAGE_COMMENTED' };
      const actualDotLabel = wrapper.vm.getDotLabel(d);
      expect(actualDotLabel).toStrictEqual('Downtime');
    });

    it('returns Downtime for STOPPAGE_UNCOMMENTED proccesedType', () => {
      const wrapper = createWrapper();
      const d = { processedType: 'STOPPAGE_UNCOMMENTED' };
      const actualDotLabel = wrapper.vm.getDotLabel(d);
      expect(actualDotLabel).toStrictEqual('Downtime');
    });

    it('returns Downtime for STANDBY_EXCL_OEE proccesedType', () => {
      const wrapper = createWrapper();
      const d = { processedType: 'STANDBY_EXCL_OEE' };
      const actualDotLabel = wrapper.vm.getDotLabel(d);
      expect(actualDotLabel).toStrictEqual('Downtime');
    });

    it('returns Downtime for STANDBY_INCL_OEE proccesedType', () => {
      const wrapper = createWrapper();
      const d = { processedType: 'STANDBY_INCL_OEE' };
      const actualDotLabel = wrapper.vm.getDotLabel(d);
      expect(actualDotLabel).toStrictEqual('Downtime');
    });

    it('returns Changeover for PRODUCT type if slice has changeover', () => {
      const wrapper = createWrapper();
      const d = { processedType: 'PRODUCT', pChg: true, icon: true };
      const actualDotLabel = wrapper.vm.getDotLabel(d);
      expect(actualDotLabel).toStrictEqual('Changeover');
    });

    it('returns Changeover for STOPPAGE_COMMENTED type if slice has changeover', () => {
      const wrapper = createWrapper();
      const d = { processedType: 'STOPPAGE_COMMENTED', pChg: true, icon: true };
      const actualDotLabel = wrapper.vm.getDotLabel(d);
      expect(actualDotLabel).toStrictEqual('Changeover');
    });

    it('returns Speed loss for yellow slice', () => {
      const wrapper = createWrapper();
      const d = {
        typ: 'PRODUCT', processedType: 'PRODUCT_SLOW_UNCOMMENTED', gDur: 60, enTm: '2022-02-02T22:00:00', stTm: '2022-02-02T21:57:00',
      };
      const actualDotLabel = wrapper.vm.getDotLabel(d);
      expect(actualDotLabel).toStrictEqual('Speed loss');
    });

    it('returns quantity for PRODUCT_FAST processedType', () => {
      const wrapper = createWrapper();
      const d = { typ: 'PRODUCT', processedType: 'PRODUCT_FAST' };
      const actualDotLabel = wrapper.vm.getDotLabel(d);
      expect(actualDotLabel).toStrictEqual('quantity');
    });

    it('returns empty string for NO_SHIFT', () => {
      const wrapper = createWrapper();
      const d = { processedType: 'NO_SHIFT' };
      const actualDotLabel = wrapper.vm.getDotLabel(d);
      expect(actualDotLabel).toStrictEqual('');
    });
  });

  describe('getTooltipName', () => {
    it('returns order-number if processedType is PRODUCT_FAST, it has product id and order number', async () => {
      const wrapper = createWrapper();
      const d = {
        prNam: 'product test',
        oN: 'order-114124-124',
        prId: 1,
        typ: 'PRODUCT',
        processedType: 'PRODUCT_FAST',
        stTm: '2022-02-02T21:57:00',
        enTm: '2022-02-02T21:57:30',
        gDur: 60,
      };

      await flushPromises();

      const actualTooltipName = wrapper.vm.getTooltipName(d);
      expect(actualTooltipName).toStrictEqual('order-114124-124 - product test');
    });

    it('returns only product name if it has product id but not order number', async () => {
      const wrapper = createWrapper();
      wrapper.setData({ productsMap: { 1: { id: 1, name: 'product test' } } });
      const d = {
        prId: 1, typ: 'PRODUCT', processedType: 'PRODUCT_FAST', prNam: 'product test',
      };

      await flushPromises();

      const actualTooltipName = wrapper.vm.getTooltipName(d);
      expect(actualTooltipName).toStrictEqual('product test');
    });

    it('returns product name for changeover icon', async () => {
      const wrapper = createWrapper();
      const d = {
        prId: 1, typ: 'STOPPAGE', processedType: 'STOPPAGE_COMMENTED', cId: 1, icon: true, pChg: true, gDur: 60, enTm: '2022-02-02T22:00:00', stTm: '2022-02-02T21:58:00', prNam: 'product test',
      };

      await flushPromises();

      const actualTooltipName = wrapper.vm.getTooltipName(d);
      expect(actualTooltipName).toStrictEqual('product test');
    });

    it('returns sliceLabel for comment slice with changeover', async () => {
      const wrapper = createWrapper();
      const d = {
        prId: 1, typ: 'STOPPAGE', processedType: 'STOPPAGE_COMMENTED', cId: 1, pChg: true, sliceLabel: 'test comment',
      };

      await flushPromises();

      const actualTooltipName = wrapper.vm.getTooltipName(d);
      expect(actualTooltipName).toStrictEqual('test comment');
    });

    it('returns only `Unknown product` if product with id not found and order number is missing', async () => {
      const wrapper = createWrapper();
      wrapper.setData({ productsMap: { 1: { id: 1, name: 'product test' } } });
      const d = { prId: 2, typ: 'PRODUCT', processedType: 'PRODUCT_FAST' };

      await flushPromises();

      const actualTooltipName = wrapper.vm.getTooltipName(d);
      expect(actualTooltipName).toStrictEqual('Unknown product');
    });

    it('returns No active shift if processedType is NO_SHIFT', async () => {
      const wrapper = createWrapper();
      wrapper.setData({ productsMap: { 1: { id: 1, name: 'product test' } } });
      const d = { cId: 0, processedType: 'NO_SHIFT' };

      await flushPromises();

      const actualTooltipName = wrapper.vm.getTooltipName(d);
      expect(actualTooltipName).toStrictEqual('No active shift');
    });

    it('returns "Uncommented" for uncomented stoppage', async () => {
      const wrapper = createWrapper();
      wrapper.setData({ productsMap: { 1: { id: 1, name: 'product test' } } });
      const d = { typ: 'STOPPAGE', cId: 0, processedType: 'STOPPAGE_UNCOMMENTED' };

      await flushPromises();

      const actualTooltipName = wrapper.vm.getTooltipName(d);
      expect(actualTooltipName).toStrictEqual('Uncommented');
    });
  });

  test('that tooltipHTMLFunc returns correct tooltip for changeover icon, yellow slice', async () => {
    const wrapper = createWrapper();
    const d = {
      prNam: 'Candycane',
      uId: 'pcs',
      pChg: true,
      icon: true,
      typ: 'PRODUCT',
      proccesedType: 'PRODUCT_SLOW_UNCOMMENTED',
      stTm: '2022-02-02T12:00:00.000Z',
      enTm: '2022-02-02T20:00:00.000Z',
      gDur: 60,
      prId: 1,
      bpQty: 120,
    };
    const tooltipHtml = await wrapper.vm.tooltipHTMLFunc(d);
    expect(tooltipHtml).toMatchSnapshot();
  });

  test('that tooltipHTMLFunc returns correct tooltip for changeover icon, green slice', async () => {
    const wrapper = createWrapper();
    const d = {
      pChg: true,
      icon: true,
      prNam: 'Candycane',
      uId: 'pcs',
      stTm: '2022-02-02T12:00:00.000Z',
      enTm: '2022-02-02T12:01:00.000Z',
      gDur: 60,
      prId: 1,
      bpQty: 120,
      typ: 'PRODUCT',
      processedType: 'PRODUCT_FAST',
    };
    const tooltipHtml = await wrapper.vm.tooltipHTMLFunc(d);
    expect(tooltipHtml).toMatchSnapshot();
  });

  test('that tooltipHTMLFunc returns correct tooltip for yellow slice', async () => {
    const wrapper = createWrapper({
      piniaOptions: {
        setupStores: (pinia) => {
          const perfCommentStore = usePerfCommentStore(pinia);
          perfCommentStore.perfCommentsMap = { 0: { name: 'Uncommented' } };
        },
      },
    });
    const d = {
      prNam: 'Candycane',
      uId: 'pcs',
      pChg: true,
      stTm: '2022-02-02T12:00:00.000Z',
      enTm: '2022-02-02T12:05:00.000Z',
      gDur: 60,
      prId: 1,
      plc: 0,
      bpQty: 120,
      typ: 'PRODUCT',
      processedType: 'PRODUCT_SLOW_UNCOMMENTED',
    };
    const tooltipHtml = await wrapper.vm.tooltipHTMLFunc(d);
    expect(tooltipHtml).toMatchSnapshot();
  });

  test('that tooltipHTMLFunc returns correct tooltip for green slice', async () => {
    const wrapper = createWrapper();
    const d = {
      prNam: 'Candycane',
      unitId: 'pcs',
      pChg: true,
      stTm: '2022-02-02T12:00:00.000Z',
      enTm: '2022-02-02T12:01:00.000Z',
      gDur: 60,
      prId: 1,
      bpQty: 120,
      typ: 'PRODUCT',
      processedType: 'PRODUCT_FAST',
    };
    const tooltipHtml = await wrapper.vm.tooltipHTMLFunc(d);
    expect(tooltipHtml).toMatchSnapshot();
  });

  test('that tooltipHTMLFunc returns correct tooltip for no shift slice', async () => {
    const wrapper = createWrapper();
    const d = {
      stTm: '2022-02-02T12:00:00.000Z',
      enTm: '2022-02-02T12:01:00.000Z',
      processedType: 'NO_SHIFT',
    };
    const tooltipHtml = await wrapper.vm.tooltipHTMLFunc(d);
    expect(tooltipHtml).toMatchSnapshot();
  });

  test('that tooltipHTMLFunc returns correct tooltip for downtime slice', async () => {
    const wrapper = createWrapper();
    const d = {
      stTm: '2022-02-02T12:00:00.000Z',
      enTm: '2022-02-02T12:01:00.000Z',
      processedType: 'STOPPAGE_COMMENTED',
      cId: 1,
      pId: 1,
      nt: 'test note',
    };
    const tooltipHtml = await wrapper.vm.tooltipHTMLFunc(d);
    expect(tooltipHtml).toMatchSnapshot();
  });

  test('that getDateLabel returns correct date label if end and start are the same day', async () => {
    const wrapper = createWrapper({
      piniaOptions: {
        initialState: {
          factoryOverviewConfig: {
            ...defaultInitialState.factoryOverviewConfig,
            timelinesIntervalEndTime: DateTime.fromISO('2022-02-02T12:00:00.000Z').toUTC(),
            timelinesInterval: 8,
          },
        },
      },
    });

    expect(wrapper.vm.getDateLabel('UTC')).toBe('02.02');
  });

  test('that getDateLabel returns correct date label if end and start are not the same day', async () => {
    const wrapper = createWrapper({
      piniaOptions: {
        initialState: {
          factoryOverviewConfig: {
            ...defaultInitialState.factoryOverviewConfig,
            timelinesIntervalEndTime: DateTime.fromISO('2022-02-02T12:00:00.000Z').toUTC(),
            timelinesInterval: 24,
          },
        },
      },
    });

    expect(wrapper.vm.getDateLabel('UTC')).toBe('01.02 - 02.02');
  });

  describe('getQuantityLabel', () => {
    it('returns correct quantity label for a product slice', () => {
      const wrapper = createWrapper();
      const d = {
        typ: 'PRODUCT', uId: 'pcs', qty: 100, prId: 1,
      };
      const actualQuantityLabel = wrapper.vm.getQuantityLabel(d);
      expect(actualQuantityLabel).toStrictEqual({
        key: 'Total quantity',
        value: '100 pcs',
      });
    });

    it('returns correct quantity label for a product slice with qty but no unit', () => {
      const wrapper = createWrapper();
      const d = {
        typ: 'PRODUCT', uId: '', qty: 123,
      };
      const actualQuantityLabel = wrapper.vm.getQuantityLabel(d);
      expect(actualQuantityLabel).toStrictEqual({
        key: 'Total quantity',
        value: '123 ',
      });
    });

    it('returns correct quantity label for a product when alternative quantity is shown', () => {
      const wrapper = createWrapper({
        piniaOptions: {
          initialState: {
            factoryOverviewConfig: {
              ...defaultInitialState.factoryOverviewConfig,
              timelinesStatColumn: 'Good quantity alternative',
            },
          },
        },
      });
      const d = {
        typ: 'PRODUCT', uId: 'pcs', qty: 123, aQty: 12.3, aUId: 'kg',
      };
      const actualQuantityLabel = wrapper.vm.getQuantityLabel(d);
      expect(actualQuantityLabel).toStrictEqual({
        key: 'Total quantity',
        value: '12,3 kg',
      });
    });

    it('returns null for non-product slice', () => {
      const wrapper = createWrapper();
      const d = {
        typ: 'STOPPAGE', uId: 'pcs',
      };
      const actualQuantityLabel = wrapper.vm.getQuantityLabel(d);
      expect(actualQuantityLabel).toStrictEqual(null);
    });
  });

  describe('getTargetLabel', () => {
    it('returns correct quantity label for a product slice', () => {
      const wrapper = createWrapper();
      const d = {
        typ: 'PRODUCT', bpQty: 100, uId: 'pcs', prId: 1,
      };
      const actualQuantityLabel = wrapper.vm.getTargetLabel(d);
      expect(actualQuantityLabel).toStrictEqual({
        key: 'Target',
        value: '100 pcs',
      });
    });

    it('returns correct quantity label for a product slice with qty but no unitId', () => {
      const wrapper = createWrapper();
      const d = {
        typ: 'PRODUCT', bpQty: 123,
      };
      const actualQuantityLabel = wrapper.vm.getTargetLabel(d);
      expect(actualQuantityLabel).toStrictEqual({
        key: 'Target',
        value: '123',
      });
    });

    it('returns null for non-product slice', () => {
      const wrapper = createWrapper();
      const d = {
        typ: 'STOPPAGE', uId: 'pcs',
      };
      const actualQuantityLabel = wrapper.vm.getTargetLabel(d);
      expect(actualQuantityLabel).toStrictEqual(null);
    });
  });

  describe('getPositionName', () => {
    it('returns correct position name if position exists in positions map', () => {
      const wrapper = createWrapper();
      const actualPositionName = wrapper.vm.getPositionName(1);
      expect(actualPositionName).toStrictEqual('test position');
    });

    it('returns "unknown location" if position does not exist in positions map', () => {
      const wrapper = createWrapper();
      const actualPositionName = wrapper.vm.getPositionName(2);
      expect(actualPositionName).toStrictEqual('Unknown');
    });
  });

  describe('showAlternativeUnit', () => {
    it('returns true if timelinesStatColumn is "Good quantity alternative', () => {
      const wrapper = createWrapper({
        piniaOptions: {
          initialState: {
            factoryOverviewConfig: {
              ...defaultInitialState.factoryOverviewConfig,
              timelinesStatColumn: 'Good quantity alternative',
            },
          },
        },
      });
      expect(wrapper.vm.showAlternativeUnit).toBe(true);
    });

    it('returns false if timelinesStatColumn is "Good quantity', () => {
      const wrapper = createWrapper({
        piniaOptions: {
          initialState: {
            factoryOverviewConfig: {
              ...defaultInitialState.factoryOverviewConfig,
              timelinesStatColumn: 'Good quantity',
            },
          },
        },
      });
      expect(wrapper.vm.showAlternativeUnit).toBe(false);
    });
  });
});
