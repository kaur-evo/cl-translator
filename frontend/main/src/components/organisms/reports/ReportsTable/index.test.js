import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ReportsTable from './index.vue';

import { useReportsConfigStore } from '@/stores';
import ConfigType from '@/stores/reportsConfig/constants/configType';

const defaultPiniaState = {
  filterbar: {
    requestFilterState: {
      orderBy: ['value'], orderDir: ['desc'], groupBy: ['entityId'], page: 1, itemsPerPage: 10,
    },
  },
};

const applyReportsConfigGetters = (pinia, overrides = {}) => {
  const reportsConfigStore = useReportsConfigStore(pinia);
  reportsConfigStore.configType = ConfigType.DOWNTIME;
  reportsConfigStore.activeHeaders = () => [];
  reportsConfigStore.groupBy = [];
  reportsConfigStore.yAxis = undefined;
  reportsConfigStore.yAxisRight = undefined;
  reportsConfigStore.granularity = undefined;
  Object.assign(reportsConfigStore, overrides);
};

const createPinia = ({ initialOverrides = {}, reportsConfigOverrides = {} } = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
    initialState: {
      ...defaultPiniaState,
      ...initialOverrides,
    },
  });
  applyReportsConfigGetters(pinia, reportsConfigOverrides);
  return pinia;
};

describe('ReportsTable', () => {
  it('tableOptions returns sorting info from requestFilterState', async () => {
    const wrapper = shallowMount(ReportsTable, {
      props: {
        title: 'Test title',
        tableTotals: {},
      },
      global: {
        plugins: [createPinia({
          reportsConfigOverrides: { granularity: 'total', configType: 'DOWNTIME' },
        })],
      },
    });
    await flushPromises();
    expect(wrapper.vm.tableOptions).toStrictEqual({
      mustSort: true, sortBy: { key: ['value'], order: ['desc'] }, itemsPerPage: 10, page: 1,
    });
  });

  test('that hasTotalRow is false if sortBy has SINGLE_OPERATOR', async () => {
    const wrapper = shallowMount(ReportsTable, {
      props: {
        title: 'Test title',
        tableTotals: {},
      },
      global: {
        plugins: [createPinia({
          reportsConfigOverrides: { granularity: 'total', groupBy: ['singleOperator', 'commentgroup'] },
        })],
      },
    });
    await flushPromises();
    expect(wrapper.vm.hasTotalRow).toBe(false);
  });

  test('that hasTotalRow is true if sortBy does not have SINGLE_OPERATOR', async () => {
    const wrapper = shallowMount(ReportsTable, {
      props: {
        title: 'Test title',
        tableTotals: {},
      },
      global: {
        plugins: [createPinia({
          reportsConfigOverrides: { granularity: 'total', groupBy: ['factory', 'commentgroup'] },
        })],
      },
    });
    await flushPromises();
    expect(wrapper.vm.hasTotalRow).toBe(true);
  });
});
