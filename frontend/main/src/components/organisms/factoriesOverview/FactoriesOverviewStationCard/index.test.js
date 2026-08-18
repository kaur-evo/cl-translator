import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { cloneDeep } from 'lodash';

import FactoriesOverviewStationCard from './index.vue';

import CustomInterval from '@/helpers/interval/CustomInterval';
import factoryOverviewStatuses from '@/constants/factoryOverviewStatuses';
import { useCommentStore, useDeviceStore } from '@/stores';


const defaultTimelines = {
  1: {
    productName: 'test product',
    productionOrder: '124',
    lastSlice: {
      typ: 'PRODUCT',
      stTmISO: '2022-02-02T22:00:00.000Z',
      dur: 20,
      gDur: 60,
    },
    oee: 0.55,
    producedQty: 55,
    scrapQty: 5,
    plannedQty: 100,
    lineStatus: 'running',
    unitId: 'test id',
    performanceData: [],
    productSku: 'sku',
  },
};

const createPinia = (overrides = {}) => {
  const {
    timelines = cloneDeep(defaultTimelines),
    unitType = 'primary',
    commentsMap = { 1: { name: 'test standby comment' }, 2: { name: 'planned stoppage' } },
    isBrowserTabActive = true,
    isMobileView = false,
  } = overrides;

  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
    initialState: {
      factoryOverviewConfig: {
        timelines,
        unitType,
      },
      device: {
        isBrowserTabActive,
      },
    },
  });

  const commentStore = useCommentStore(pinia);
  commentStore.commentsMap = commentsMap;

  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = isMobileView;

  return pinia;
};

const propsDefault = {
  stationData: { id: 1, zoneId: 'Europe/Tallinn', name: 'Evocon Test Station 1' },
  quantityElementVisible: true,
};

describe('FactoriesOverviewStationCard', () => {
  vi.useFakeTimers();
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly when theres no data', async () => {
    const pinia = createPinia({ timelines: {} });

    const wrapper = shallowMount(FactoriesOverviewStationCard, {
      props: { ...propsDefault },
      global: { plugins: [pinia] },
    });

    await flushPromises();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when theres no active shift', async () => {
    const pinia = createPinia({
      timelines: {
        1: {
          productName: 'test product',
          productionOrder: '124',
          lastSlice: {
            typ: 'PRODUCT',
            stTmISO: '2022-02-02T22:00:00.000Z',
            dur: 20,
            gDur: 60,
          },
          oee: 0.55,
          producedQty: 55,
          scrapQty: 5,
          plannedQty: 100,
          lineStatus: 'stopped',
          unitId: 'test id',
          performanceData: [],
          productSku: 'sku',
          shiftProducedQty: 3000,
          shiftPlannedQty: 4000,
        },
      },
    });

    const wrapper = shallowMount(FactoriesOverviewStationCard, {
      props: { ...propsDefault },
      global: { plugins: [pinia] },
    });

    await flushPromises();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when last slice is standby', async () => {
    const pinia = createPinia({
      timelines: {
        1: {
          productName: 'test product',
          productionOrder: '124',
          lastSlice: {
            typ: 'STANDBY',
            stTmISO: '2022-02-02T22:00:00.000Z',
            dur: 20,
            gDur: 60,
            cId: 1,
          },
          oee: 0.55,
          producedQty: 55,
          scrapQty: 5,
          plannedQty: 100,
          lineStatus: 'running',
          unitId: 'test id',
          performanceData: [],
          productSku: 'sku',
          shiftProducedQty: 3000,
          shiftPlannedQty: 4000,
        },
      },
    });

    const wrapper = shallowMount(FactoriesOverviewStationCard, {
      props: { ...propsDefault },
      global: { plugins: [pinia] },
    });

    await flushPromises();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when last slice is planned stoppage', async () => {
    const pinia = createPinia({
      timelines: {
        1: {
          productName: 'test product',
          productionOrder: '124',
          lastSlice: {
            typ: 'PLANNED_STOPPAGE',
            stTmISO: '2022-02-02T22:00:00.000Z',
            dur: 20,
            gDur: 60,
            cId: 2,
          },
          oee: 0.55,
          producedQty: 55,
          scrapQty: 5,
          plannedQty: 100,
          lineStatus: 'running',
          unitId: 'test id',
          performanceData: [],
          productSku: 'sku',
          shiftProducedQty: 3000,
          shiftPlannedQty: 4000,
        },
      },
    });

    const wrapper = shallowMount(FactoriesOverviewStationCard, {
      props: { ...propsDefault },
      global: { plugins: [pinia] },
    });

    await flushPromises();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when last slice is stoppage', async () => {
    const pinia = createPinia({
      timelines: {
        1: {
          productName: 'test product',
          productionOrder: '124',
          lastSlice: {
            typ: 'STOPPAGE',
            stTmISO: '2022-02-02T22:00:00.000Z',
            dur: 20,
            gDur: 60,
            cId: 0,
          },
          oee: 0.55,
          producedQty: 55,
          scrapQty: 5,
          plannedQty: 100,
          lineStatus: 'running',
          unitId: 'test id',
          performanceData: [],
          productSku: 'sku',
          shiftProducedQty: 3000,
          shiftPlannedQty: 4000,
        },
      },
    });

    const wrapper = shallowMount(FactoriesOverviewStationCard, {
      props: { ...propsDefault },
      global: { plugins: [pinia] },
    });

    await flushPromises();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when last slice is slow product', async () => {
    const pinia = createPinia({
      timelines: {
        1: {
          productName: 'test product',
          productionOrder: '124',
          lastSlice: {
            typ: 'PRODUCT',
            stTmISO: '2022-02-02T22:00:00.000Z',
            dur: 80,
            gDur: 60,
          },
          oee: 0.55,
          producedQty: 55,
          scrapQty: 5,
          plannedQty: 100,
          lineStatus: 'running',
          unitId: 'test id',
          performanceData: [],
          productSku: 'sku',
          shiftProducedQty: 3000,
          shiftPlannedQty: 4000,
        },
      },
    });

    const wrapper = shallowMount(FactoriesOverviewStationCard, {
      props: { ...propsDefault },
      global: { plugins: [pinia] },
    });

    await flushPromises();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when last slice is fast product', async () => {
    const pinia = createPinia({
      timelines: {
        1: {
          productName: 'test product',
          productionOrder: '124',
          lastSlice: {
            typ: 'PRODUCT',
            stTmISO: '2022-02-02T22:00:00.000Z',
            dur: 50,
            gDur: 60,
          },
          oee: 0.55,
          producedQty: 55,
          scrapQty: 5,
          plannedQty: 100,
          lineStatus: 'running',
          unitId: 'test id',
          performanceData: [],
          productSku: 'sku',
          shiftProducedQty: 3000,
          shiftPlannedQty: 4000,
        },
      },
    });

    const wrapper = shallowMount(FactoriesOverviewStationCard, {
      props: { ...propsDefault },
      global: { plugins: [pinia] },
    });

    await flushPromises();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when last slice is fast product and alternative unit is visible', async () => {
    const pinia = createPinia({
      unitType: 'alternative',
      timelines: {
        1: {
          productName: 'test product',
          productionOrder: '124',
          lastSlice: {
            typ: 'PRODUCT',
            stTmISO: '2022-02-02T22:00:00.000Z',
            dur: 50,
            gDur: 60,
          },
          oee: 0.55,
          producedQty: 55,
          altProducedQty: 550,
          scrapQty: 5,
          altScrapQty: 50,
          plannedQty: 100,
          altPlannedQty: 1000,
          lineStatus: 'running',
          unitId: 'test id',
          alternativeUnitId: 'test alt id',
          performanceData: [],
          productSku: 'sku',
          shiftProducedQty: 3000,
          altShiftProducedQty: 30000,
          shiftPlannedQty: 4000,
          altShiftPlannedQty: 40000,
        },
      },
    });

    const wrapper = shallowMount(FactoriesOverviewStationCard, {
      props: { ...propsDefault },
      global: { plugins: [pinia] },
    });

    await flushPromises();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobileView', async () => {
    const pinia = createPinia({
      isMobileView: true,
      timelines: {
        1: {
          productName: 'test product',
          productionOrder: '124',
          lastSlice: {
            typ: 'PRODUCT',
            stTmISO: '2022-02-02T22:00:00.000Z',
            dur: 50,
            gDur: 60,
          },
          oee: 0.55,
          producedQty: 55,
          scrapQty: 5,
          plannedQty: 100,
          lineStatus: 'running',
          unitId: 'test id',
          performanceData: [],
          productSku: 'sku',
          shiftProducedQty: 3000,
          shiftPlannedQty: 4000,
        },
      },
    });

    const wrapper = shallowMount(FactoriesOverviewStationCard, {
      props: { ...propsDefault },
      global: { plugins: [pinia] },
    });

    await flushPromises();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in xl view', async () => {
    const pinia = createPinia({
      timelines: {
        1: {
          productName: 'test product',
          productionOrder: '124',
          lastSlice: {
            typ: 'PRODUCT',
            stTmISO: '2022-02-02T22:00:00.000Z',
            dur: 50,
            gDur: 60,
          },
          oee: 0.55,
          producedQty: 55,
          scrapQty: 5,
          plannedQty: 100,
          lineStatus: 'running',
          unitId: 'test id',
          performanceData: [],
          productSku: 'sku',
          shiftProducedQty: 3000,
          shiftPlannedQty: 4000,
        },
      },
    });

    const wrapper = shallowMount(FactoriesOverviewStationCard, {
      props: { ...propsDefault },
      global: { plugins: [pinia] },
    });

    wrapper.vm.$vuetify.display.xlAndUp = true;

    await flushPromises();

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('updateInterval', () => {
    it('is set on mount', () => {
      const pinia = createPinia();
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault },
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.updateInterval).toBeInstanceOf(CustomInterval);
      expect(wrapper.vm.updateInterval.cbFun).toBe(wrapper.vm.updateViewData);
      expect(wrapper.vm.updateInterval.delay).toBe(1000);
      const spy = vi.spyOn(wrapper.vm.updateInterval, 'cbFun');
      const passedSeconds = 6;
      vi.advanceTimersByTime(passedSeconds * 1000);
      expect(spy).toHaveBeenCalledTimes(passedSeconds);
    });

    it('is cleared on unmount', () => {
      const pinia = createPinia();
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault },
        global: { plugins: [pinia] },
      });

      const spy = vi.spyOn(wrapper.vm.updateInterval, 'cbFun');
      wrapper.unmount();

      expect(wrapper.vm.updateInterval).toBe(null);
      const passedSeconds = 6;
      vi.advanceTimersByTime(passedSeconds * 1000);
      expect(spy).toHaveBeenCalledTimes(0);
    });
  });

  describe('getBatchSectionTooltipText', () => {
    it('returns tooltip about quantity if quantityElementVisible is true', () => {
      const pinia = createPinia();
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault },
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.getBatchSectionTooltipText).toBe('Since changeover / Target');
    });

    it('returns tooltip about estimated time if quantityElementVisible is false', () => {
      const pinia = createPinia();
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault, quantityElementVisible: false },
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.getBatchSectionTooltipText).toBe('Estimated time of completion');
    });

    it('returns "Since changeover / Target" if quantityElementVisible is true and viewData has plannedQty', () => {
      const pinia = createPinia({
        timelines: {
          1: {
            producedQty: 100,
            scrapQty: 10,
            plannedQty: 200,
            estimatedTimeLeft: 6000,
            performanceData: [],
          },
        },
      });
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault, quantityElementVisible: true, stationData: { id: 1, zoneId: 'Europe/Tallinn', name: 'Evocon Test Station 1' } },
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.getBatchSectionTooltipText).toBe('Since changeover / Target');
    });

    it('returns "Since changeover / Target" if quantityElementVisible is true and viewData does not have plannedQty', () => {
      const pinia = createPinia({
        timelines: {
          1: {
            producedQty: 100,
            scrapQty: 10,
            plannedQty: 0,
            estimatedTimeLeft: 6000,
            performanceData: [],
          },
        },
      });
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault, quantityElementVisible: true, stationData: { id: 1, zoneId: 'Europe/Tallinn', name: 'Evocon Test Station 1' } },
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.getBatchSectionTooltipText).toBe('Since changeover / Target');
    });

    it('returns "Since changeover / Target" if quantityElementVisible is false and viewData does not have plannedQty', () => {
      const pinia = createPinia({
        timelines: {
          1: {
            producedQty: 100,
            scrapQty: 10,
            plannedQty: 0,
            estimatedTimeLeft: 6000,
            performanceData: [],
          },
        },
      });
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault, quantityElementVisible: false, stationData: { id: 1, zoneId: 'Europe/Tallinn', name: 'Evocon Test Station 1' } },
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.getBatchSectionTooltipText).toBe('Since changeover / Target');
    });

    it('returns "Estimated time of completion" if quantityElementVisible is false and viewData has plannedQty', () => {
      const pinia = createPinia({
        timelines: {
          1: {
            producedQty: 100,
            scrapQty: 10,
            plannedQty: 200,
            estimatedTimeLeft: 6000,
            performanceData: [],
          },
        },
      });
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault, quantityElementVisible: false, stationData: { id: 1, zoneId: 'Europe/Tallinn', name: 'Evocon Test Station 1' } },
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.getBatchSectionTooltipText).toBe('Estimated time of completion');
    });
  });

  describe('estimatedTimeLeftLabel', () => {
    it('returns target reached if producedQty - scrapQty is greater than or equal to plannedQty', () => {
      const pinia = createPinia({
        timelines: {
          1: {
            producedQty: 100,
            scrapQty: 0,
            plannedQty: 100,
            performanceData: [],
            shiftUnitIds: ['pcs'],
          },
        },
      });
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault, stationData: { id: 1, zoneId: 'Europe/Tallinn', name: 'Evocon Test Station 1' } },
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.estimatedTimeLeftLabel).toBe('Target reached');
    });

    it('returns qties if producedQty is bigger than plannedQty, but goodQty is not', () => {
      const pinia = createPinia({
        timelines: {
          1: {
            producedQty: 105,
            scrapQty: 20,
            plannedQty: 100,
            performanceData: [],
            unitId: 'pcs',
          },
        },
      });
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault, stationData: { id: 1, zoneId: 'Europe/Tallinn', name: 'Evocon Test Station 1' } },
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.estimatedTimeLeftLabel).toBe('85/100 pcs');
    });

    it('returns qties if plannedQty is 0', () => {
      const pinia = createPinia({
        timelines: {
          1: {
            producedQty: 105,
            scrapQty: 20,
            plannedQty: 0,
            performanceData: [],
            unitId: 'pcs',
          },
        },
      });
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault, stationData: { id: 1, zoneId: 'Europe/Tallinn', name: 'Evocon Test Station 1' } },
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.estimatedTimeLeftLabel).toBe('85/0 pcs');
    });

    it('returns goodQty/plannedQty if estimatedTime is missing, but producedQty is less than plannedQty', () => {
      const pinia = createPinia({
        timelines: {
          1: {
            producedQty: 100,
            scrapQty: 10,
            plannedQty: 200,
            performanceData: [],
            unitId: 'pcs',
          },
        },
      });
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault, stationData: { id: 1, zoneId: 'Europe/Tallinn', name: 'Evocon Test Station 1' } },
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.estimatedTimeLeftLabel).toBe('90/200 pcs');
    });

    it('returns estimated time if it is available', () => {
      const pinia = createPinia({
        timelines: {
          1: {
            producedQty: 100,
            scrapQty: 10,
            plannedQty: 200,
            estimatedTimeLeft: 6000,
            performanceData: [],
          },
        },
      });
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault, stationData: { id: 1, zoneId: 'Europe/Tallinn', name: 'Evocon Test Station 1' } },
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.estimatedTimeLeftLabel).toBe('1h 40m');
    });
  });

  describe('showPrimaryUnit', () => {
    it('returns true if unitType is primary', () => {
      const pinia = createPinia({ unitType: 'primary' });

      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault },
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.showPrimaryUnit).toBe(true);
    });

    it('returns false if unitType is alternative', () => {
      const pinia = createPinia({ unitType: 'alternative' });
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault },
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.showPrimaryUnit).toBe(false);
    });
  });

  describe('shiftProducedQty', () => {
    it('returns zero if viewData is not available', () => {
      const pinia = createPinia({ timelines: {} });
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault, stationData: { id: 1 } },
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.shiftProducedQty).toBe('0');
    });

    it('returns viewData.shiftProducedQty if it is available and primary unit is shown', () => {
      const pinia = createPinia({
        unitType: 'primary',
        timelines: {
          1: {
            shiftProducedQty: 100, altShiftProducedQty: 10, performanceData: [],
          },
        },
      });
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault, stationData: { id: 1 } },
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.shiftProducedQty).toBe('100');
    });

    it('returns viewData.altShiftProducedQty if it is available and primary unit is shown', () => {
      const pinia = createPinia({
        unitType: 'alternative',
        timelines: {
          1: {
            shiftProducedQty: 100, altShiftProducedQty: 10, performanceData: [],
          },
        },
      });
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault, stationData: { id: 1 } },
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.shiftProducedQty).toBe('10');
    });
  });

  describe('shiftPlannedQty', () => {
    it('returns zero if viewData is not available', () => {
      const pinia = createPinia({ timelines: {} });
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault, stationData: { id: 1 } },
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.shiftPlannedQty).toBe('0');
    });

    it('returns viewData.shiftPlannedQty if it is available and primary unit is shown', () => {
      const pinia = createPinia({
        unitType: 'primary',
        timelines: {
          1: {
            shiftPlannedQty: 100, altShiftPlannedQty: 10, performanceData: [],
          },
        },
      });
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault, stationData: { id: 1 } },
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.shiftPlannedQty).toBe('100');
    });

    it('returns viewData.altShiftPlannedQty if it is available and alternative unit is shown', () => {
      const pinia = createPinia({
        unitType: 'alternative',
        timelines: {
          1: {
            shiftPlannedQty: 100, altShiftPlannedQty: 10, performanceData: [],
          },
        },
      });
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault, stationData: { id: 1 } },
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.shiftPlannedQty).toBe('10');
    });
  });

  describe('batchGoodQty', () => {
    it('returns zero if viewData is not available', () => {
      const pinia = createPinia({ timelines: {} });
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault, stationData: { id: 1 } },
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.batchGoodQty).toBe('0');
    });

    it('returns producedQty-scrapQty if viewData is available and primary unit is shown', () => {
      const pinia = createPinia({
        unitType: 'primary',
        timelines: {
          1: {
            producedQty: 100, scrapQty: 10, altProducedQty: 10, altScrapQty: 1, performanceData: [],
          },
        },
      });
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault, stationData: { id: 1 } },
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.batchGoodQty).toBe('90');
    });

    it('returns altProducedQty-altScrapQty if viewData is available and alternative unit is shown', () => {
      const pinia = createPinia({
        unitType: 'alternative',
        timelines: {
          1: {
            producedQty: 100, scrapQty: 10, altProducedQty: 10, altScrapQty: 1, performanceData: [],
          },
        },
      });
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault, stationData: { id: 1 } },
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.batchGoodQty).toBe('9');
    });
  });

  describe('batchPlannedQty', () => {
    it('returns zero if viewData is not available', () => {
      const pinia = createPinia({ timelines: {} });
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault, stationData: { id: 1 } },
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.batchPlannedQty).toBe('0');
    });

    it('returns plannedQty if viewData is available and primary unit is shown', () => {
      const pinia = createPinia({
        unitType: 'primary',
        timelines: {
          1: {
            plannedQty: 100, altPlannedQty: 10, performanceData: [],
          },
        },
      });
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault, stationData: { id: 1 } },
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.batchPlannedQty).toBe('100');
    });

    it('returns altPlannedQty if viewData is available and alternative unit is shown', () => {
      const pinia = createPinia({
        unitType: 'alternative',
        timelines: {
          1: {
            plannedQty: 100, altPlannedQty: 10, performanceData: [],
          },
        },
      });
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault, stationData: { id: 1 } },
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.batchPlannedQty).toBe('10');
    });
  });

  describe('batchUnit', () => {
    it('returns primary unit if primary unit is selected', () => {
      const pinia = createPinia({
        unitType: 'primary',
        timelines: {
          1: {
            plannedQty: 100, altPlannedQty: 10, performanceData: [], unitId: 'pcs', alternativeUnitId: 'kg',
          },
        },
      });
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault, stationData: { id: 1 } },
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.batchUnit).toBe('pcs');
    });

    it('returns primary unit if alternative unit is selected, but not available', () => {
      const pinia = createPinia({
        unitType: 'alternative',
        timelines: {
          1: {
            plannedQty: 100, altPlannedQty: 10, performanceData: [], unitId: 'pcs', alternativeUnitId: '',
          },
        },
      });
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault, stationData: { id: 1 } },
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.batchUnit).toBe('pcs');
    });

    it('returns alternative unit if alternative unit is selected and available', () => {
      const pinia = createPinia({
        unitType: 'alternative',
        timelines: {
          1: {
            plannedQty: 100, altPlannedQty: 10, performanceData: [], unitId: 'pcs', alternativeUnitId: 'kg',
          },
        },
      });
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault, stationData: { id: 1 } },
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.batchUnit).toBe('kg');
    });
  });

  test('that viewData watcher calls createChart', () => {
    const pinia = createPinia();
    const wrapper = shallowMount(FactoriesOverviewStationCard, {
      props: { ...propsDefault },
      global: { plugins: [pinia] },
    });

    const spy = vi.spyOn(wrapper.vm, 'createChart');
    wrapper.vm.$options.watch.viewData.call(wrapper.vm, { qty: 1 }, { qty: 2 });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('that unitType watcher calls createChart', () => {
    const pinia = createPinia();
    const wrapper = shallowMount(FactoriesOverviewStationCard, {
      props: { ...propsDefault },
      global: { plugins: [pinia] },
    });

    const spy = vi.spyOn(wrapper.vm, 'createChart');
    wrapper.vm.$options.watch.viewData.call(wrapper.vm, 'primary', 'alternative');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  describe('shiftUnit', () => {
    it('returns unit if primary units are selected and whole shift has one unit', () => {
      const pinia = createPinia({
        unitType: 'primary',
        timelines: {
          1: {
            shiftUnitIds: ['pcs'],
            performanceData: [],
          },
        },
      });
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault },
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.shiftUnit).toBe('pcs');
    });

    it('returns empty string if primary units are selected and multiple units have been produced', () => {
      const pinia = createPinia({
        unitType: 'primary',
        timelines: {
          1: {
            shiftUnitIds: ['pcs', 'kg'],
            performanceData: [],
          },
        },
      });
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault },
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.shiftUnit).toBe('');
    });

    it('returns primary unit if alternative unit is selected, but missing and one primary unit exists', () => {
      const pinia = createPinia({
        unitType: 'alternative',
        timelines: {
          1: {
            shiftUnitIds: ['pcs'],
            shiftAltUnitIds: [''],
            performanceData: [],
          },
        },
      });
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault },
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.shiftUnit).toBe('pcs');
    });

    it('returns empty string if alternative unit is selected, but missing and multiple primary units exist', () => {
      const pinia = createPinia({
        unitType: 'alternative',
        timelines: {
          1: {
            shiftUnitIds: ['pcs', 'kg'],
            shiftAltUnitIds: [''],
            performanceData: [],
          },
        },
      });
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault },
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.shiftUnit).toBe('');
    });

    it('returns alternative unit if alternative unit is selected, available and just one unit exists', () => {
      const pinia = createPinia({
        unitType: 'alternative',
        timelines: {
          1: {
            shiftUnitIds: ['pcs'],
            shiftAltUnitIds: ['kg'],
            performanceData: [],
          },
        },
      });
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault },
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.shiftUnit).toBe('kg');
    });

    it('returns empty string if alternative unit is selected and available, but multiple units exist', () => {
      const pinia = createPinia({
        unitType: 'alternative',
        timelines: {
          1: {
            shiftUnitIds: ['pcs', 'kg'],
            shiftAltUnitIds: ['kg', 'pcs'],
            performanceData: [],
          },
        },
      });
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault },
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.shiftUnit).toBe('');
    });
  });

  describe('getBackgroundColor', () => {
    const pinia = createPinia();
    const wrapper = shallowMount(FactoriesOverviewStationCard, {
      props: { ...propsDefault },
      global: { plugins: [pinia] },
    });
    it('returns black when viewData does not have statusTypes', () => {
      expect(wrapper.vm.getBackgroundColor({})).toBe('black');
    });

    it('returns black when statusTypes is empty array', () => {
      expect(wrapper.vm.getBackgroundColor({ statusTypes: [] })).toBe('black');
    });

    it('returns black when statusTypes includes NO_SHIFT', () => {
      expect(wrapper.vm.getBackgroundColor({ statusTypes: [factoryOverviewStatuses.NO_SHIFT] })).toBe('black');
    });

    it('returns lw-red when statusTypes includes UNCOMMENTED_STOP', () => {
      expect(wrapper.vm.getBackgroundColor({ statusTypes: [factoryOverviewStatuses.UNCOMMENTED_STOP] })).toBe('lw-red');
    });

    it('returns lw-dark-red when statusTypes includes UNPLANNED_STOP', () => {
      expect(wrapper.vm.getBackgroundColor({ statusTypes: [factoryOverviewStatuses.UNPLANNED_STOP] })).toBe('lw-dark-red');
    });

    it('returns secondary-dark when statusTypes includes PLANNED_STOP_INCL_OEE', () => {
      expect(wrapper.vm.getBackgroundColor({ statusTypes: [factoryOverviewStatuses.PLANNED_STOP_INCL_OEE] })).toBe('secondary-dark');
    });

    it('returns lw-gray when statusTypes includes PLANNED_STOP_EXCL_OEE', () => {
      expect(wrapper.vm.getBackgroundColor({ statusTypes: [factoryOverviewStatuses.PLANNED_STOP_EXCL_OEE] })).toBe('lw-gray');
    });

    it('returns lw-yellow-bg when statusTypes includes SLOW_PRODUCTION', () => {
      expect(wrapper.vm.getBackgroundColor({ statusTypes: [factoryOverviewStatuses.SLOW_PRODUCTION] })).toBe('lw-yellow-bg');
    });

    it('returns lw-green when statusTypes includes GOOD_PRODUCTION', () => {
      expect(wrapper.vm.getBackgroundColor({ statusTypes: [factoryOverviewStatuses.GOOD_PRODUCTION] })).toBe('lw-green');
    });
  });

  describe('isDark', () => {
    it('returns true if getBackgroundColor returns black', () => {
      const pinia = createPinia();
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault },
        global: { plugins: [pinia] },
      });
      wrapper.vm.getBackgroundColor = () => 'black';
      expect(wrapper.vm.isDark).toBe(true);
    });

    it('returns true if getBackgroundColor returns secondary-dark', () => {
      const pinia = createPinia();
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault },
        global: { plugins: [pinia] },
      });
      wrapper.vm.getBackgroundColor = () => 'secondary-dark';
      expect(wrapper.vm.isDark).toBe(true);
    });

    it('returns true if getBackgroundColor returns lw-gray', () => {
      const pinia = createPinia();
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault },
        global: { plugins: [pinia] },
      });
      wrapper.vm.getBackgroundColor = () => 'lw-gray';
      expect(wrapper.vm.isDark).toBe(true);
    });

    it('returns false if getBackgroundColor returns lw-red', () => {
      const pinia = createPinia();
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault },
        global: { plugins: [pinia] },
      });
      wrapper.vm.getBackgroundColor = () => 'lw-red';
      expect(wrapper.vm.isDark).toBe(false);
    });

    it('returns false if getBackgroundColor returns lw-dark-red', () => {
      const pinia = createPinia();
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault },
        global: { plugins: [pinia] },
      });
      wrapper.vm.getBackgroundColor = () => 'lw-dark-red';
      expect(wrapper.vm.isDark).toBe(false);
    });

    it('returns false if getBackgroundColor returns lw-yellow', () => {
      const pinia = createPinia();
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault },
        global: { plugins: [pinia] },
      });
      wrapper.vm.getBackgroundColor = () => 'lw-yellow';
      expect(wrapper.vm.isDark).toBe(false);
    });

    it('returns false if getBackgroundColor returns lw-yellow-bg', () => {
      const pinia = createPinia();
      const wrapper = shallowMount(FactoriesOverviewStationCard, {
        props: { ...propsDefault },
        global: { plugins: [pinia] },
      });
      wrapper.vm.getBackgroundColor = () => 'lw-yellow-bg';
      expect(wrapper.vm.isDark).toBe(false);
    });
  });
});
