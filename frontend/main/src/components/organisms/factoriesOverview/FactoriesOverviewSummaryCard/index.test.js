import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import FactoriesOverviewSummaryCard from './index.vue';

import factoryOverviewStatuses from '@/constants/factoryOverviewStatuses';
import useFactoryOverviewConfigStore from '@/stores/factoryOverviewConfig';

const defaultTimelines = {
  1: { lineStatus: 'stopped' }, // no shift
  2: { lineStatus: 'running', lastSlice: { typ: 'PRODUCT', dur: 1, gDur: 2 } }, // green
  3: { lineStatus: 'running', lastSlice: { typ: 'PRODUCT', dur: 3, gDur: 2 } }, // yellow
  4: { lineStatus: 'running', lastSlice: { typ: 'STOPPAGE' } }, // red
  5: { lineStatus: 'running', lastSlice: { typ: 'STANDBY' } }, // grey
};

const defaultStations = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];

const createPinia = (overrides = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
    initialState: {
      factoryOverviewConfig: {
        timelines: overrides.timelines ?? defaultTimelines,
      },
    },
  });
  const store = useFactoryOverviewConfigStore(pinia);
  store.filteredFactoryOverviewStations = overrides.stations ?? defaultStations;
  return pinia;
};

describe('FactoriesOverviewSummaryCard', () => {
  it('renders correctly', async () => {
    const pinia = createPinia();
    const wrapper = shallowMount(FactoriesOverviewSummaryCard, {
      global: { plugins: [pinia] },
    });

    await flushPromises();

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('emotion', () => {
    it('returns positive if loading is true', async () => {
      const pinia = createPinia();
      const wrapper = shallowMount(FactoriesOverviewSummaryCard, {
        global: { plugins: [pinia] },
      });
      await wrapper.setData({ loading: true });
      expect(wrapper.vm.emotion).toBe('positive');
    });

    it('returns noshift if loading is false and there are only NO_SHIFT stations', async () => {
      const pinia = createPinia();
      const wrapper = shallowMount(FactoriesOverviewSummaryCard, {
        global: { plugins: [pinia] },
        computed: {
          ...FactoriesOverviewSummaryCard.computed,
          statusCounts: () => ({
            [factoryOverviewStatuses.NO_SHIFT]: 5,
            [factoryOverviewStatuses.GOOD_PRODUCTION]: 0,
            [factoryOverviewStatuses.SLOW_PRODUCTION]: 0,
            [factoryOverviewStatuses.UNCOMMENTED_STOP]: 0,
            [factoryOverviewStatuses.UNPLANNED_STOP]: 0,
            [factoryOverviewStatuses.PLANNED_STOP_EXCL_OEE]: 0,
            [factoryOverviewStatuses.PLANNED_STOP_INCL_OEE]: 0,
          }),
        },
      });
      await wrapper.setData({ loading: false });
      expect(wrapper.vm.emotion).toBe('noshift');
    });

    it('returns positive if loading is false and there are more positive stations than neutral or negative', async () => {
      const pinia = createPinia();
      const wrapper = shallowMount(FactoriesOverviewSummaryCard, {
        global: { plugins: [pinia] },
        computed: {
          ...FactoriesOverviewSummaryCard.computed,
          statusCounts: () => ({
            [factoryOverviewStatuses.NO_SHIFT]: 0,
            [factoryOverviewStatuses.GOOD_PRODUCTION]: 1,
            [factoryOverviewStatuses.SLOW_PRODUCTION]: 2,
            [factoryOverviewStatuses.UNCOMMENTED_STOP]: 1,
            [factoryOverviewStatuses.UNPLANNED_STOP]: 1,
            [factoryOverviewStatuses.PLANNED_STOP_EXCL_OEE]: 2,
            [factoryOverviewStatuses.PLANNED_STOP_INCL_OEE]: 1,
          }),
        },
      });
      await wrapper.setData({ loading: false });
      expect(wrapper.vm.emotion).toBe('positive');
    });

    it('returns negative if loading is false and there are more negative stations than positive or neutral', async () => {
      const pinia = createPinia();
      const wrapper = shallowMount(FactoriesOverviewSummaryCard, {
        global: { plugins: [pinia] },
        computed: {
          ...FactoriesOverviewSummaryCard.computed,
          statusCounts: () => ({
            [factoryOverviewStatuses.NO_SHIFT]: 0,
            [factoryOverviewStatuses.GOOD_PRODUCTION]: 1,
            [factoryOverviewStatuses.SLOW_PRODUCTION]: 2,
            [factoryOverviewStatuses.UNCOMMENTED_STOP]: 10,
            [factoryOverviewStatuses.UNPLANNED_STOP]: 1,
            [factoryOverviewStatuses.PLANNED_STOP_EXCL_OEE]: 2,
            [factoryOverviewStatuses.PLANNED_STOP_INCL_OEE]: 2,
          }),
        },
      });
      await wrapper.setData({ loading: false });
      expect(wrapper.vm.emotion).toBe('negative');
    });

    it('returns neutral if there are more neutral stations than positive or negative', async () => {
      const pinia = createPinia();
      const wrapper = shallowMount(FactoriesOverviewSummaryCard, {
        global: { plugins: [pinia] },
        computed: {
          ...FactoriesOverviewSummaryCard.computed,
          statusCounts: () => ({
            [factoryOverviewStatuses.NO_SHIFT]: 1,
            [factoryOverviewStatuses.GOOD_PRODUCTION]: 1,
            [factoryOverviewStatuses.SLOW_PRODUCTION]: 6,
            [factoryOverviewStatuses.UNCOMMENTED_STOP]: 1,
            [factoryOverviewStatuses.UNPLANNED_STOP]: 1,
            [factoryOverviewStatuses.PLANNED_STOP_EXCL_OEE]: 1,
            [factoryOverviewStatuses.PLANNED_STOP_INCL_OEE]: 1,
          }),
        },
      });
      await wrapper.setData({ loading: false });
      expect(wrapper.vm.emotion).toBe('neutral');
    });
  });
});
