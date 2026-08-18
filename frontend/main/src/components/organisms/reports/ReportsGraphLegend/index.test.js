import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

import { useReportsConfigStore, useStationStore, useGenericNotificationStore } from '@/stores';
import configType from '@/stores/reportsConfig/constants/configType';
import yAxisKey from '@/stores/reportsConfig/constants/yAxisKey';
import productionSpeedLegendType from '@/stores/reportsConfig/constants/productionSpeedLegendType';
import { formatPercentage } from '@/helpers/numbers/formatNumber';

const applyReportsConfigDefaults = (pinia, overrides = {}) => {
  const reportsConfigStore = useReportsConfigStore(pinia);
  reportsConfigStore.configType = configType.DOWNTIME;
  reportsConfigStore.stackLegend = new Map();
  reportsConfigStore.hiddenGroupingValues = [];
  reportsConfigStore.chartLegendState = [];
  reportsConfigStore.yAxis = yAxisKey.VALUE;
  Object.assign(reportsConfigStore, overrides);
};

const applyStationDefaults = (pinia, adminStationsMap) => {
  const stationStore = useStationStore(pinia);
  stationStore.adminStationsMap = adminStationsMap;
};

const createPinia = ({ reportsConfigOverrides = {}, requestFilterState = {}, adminStationsMap = {} } = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
    initialState: {
      filterbar: {
        requestFilterState,
      },
    },
  });
  applyReportsConfigDefaults(pinia, reportsConfigOverrides);
  applyStationDefaults(pinia, adminStationsMap);
  return pinia;
};

const createWrapper = (options = {}, piniaOptions = {}) => shallowMount(index, {
  global: { plugins: [createPinia(piniaOptions)] },
  ...options,
});

const propsDefault = {
  data: [],
  totals: {},
};

describe('ReportsGraphLegend', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('sanitizeLegendSelectedState', () => {
    it('removes non-existent legend values from deselected', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });
      const newVal = new Map([['key1', 'value1'], ['key3', 'value3']]);
      const deselected = ['key1', 'key2'];
      const result = wrapper.vm.sanitizeLegendSelectedState(newVal, deselected);
      expect(result).toStrictEqual({ deSelected: ['key1'] });
    });
  });

  describe('onStackLegendChange', () => {
    it('calls expected methods', async () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });
      const sanitizeLegendSelectedStateSpy = vi.spyOn(wrapper.vm, 'sanitizeLegendSelectedState');
      wrapper.vm.onStackLegendChange(new Map(), undefined);
      expect(wrapper.vm.hiddenGroupingValues).toStrictEqual([]);
      expect(sanitizeLegendSelectedStateSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('onLegendToggle', () => {
    it('calls expected methods', async () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });
      const initMapperCalculationSpy = vi.spyOn(wrapper.vm, 'initMapperCalculation');
      wrapper.vm.onLegendToggle([]);
      expect(wrapper.vm.hiddenGroupingValues).toStrictEqual([]);
      expect(initMapperCalculationSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('legendData', () => {
    it('returns empty array when stackLegend is empty', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });
      expect(wrapper.vm.legendData).toStrictEqual([]);
    });

    it('returns formatted legend data when stackLegend is not empty', () => {
      const stackLegend = new Map([['key1', { color: 'color1', text: 'value1' }], ['key2', { color: 'color2', text: 'value2' }]]);
      const wrapper = createWrapper(
        { props: { ...propsDefault } },
        { reportsConfigOverrides: { stackLegend } },
      );
      expect(wrapper.vm.legendData).toStrictEqual([
        { color: 'color2', text: 'value2', value: 'key2' },
        { color: 'color1', text: 'value1', value: 'key1' },
      ]);
    });
  });
});
describe('legendData with configType.PRODUCTION_SPEED', () => {
  it('returns production speed custom items when stackLegend is empty', () => {
    const wrapper = createWrapper(
      { props: { ...propsDefault } },
      {
        reportsConfigOverrides: {
          configType: configType.PRODUCTION_SPEED,
          stackLegend: new Map([]),
        },
      },
    );

    expect(wrapper.vm.legendData).toStrictEqual([
      {
        color: '#000',
        text: 'Target speed',
        value: 'TARGET_SPEED',
      },
      {
        clickAction: expect.any(Function),
        customSlot: 'button',
        disabled: true,
        text: 'Edit',
        value: 'editButton',
        visible: false,
      },
      {
        color: '#0066CC',
        text: 'Most frequent',
        value: 'MOST_FREQUENT',
      },
    ]);
  });

  it('returns formatted legend data when stackLegend is not empty', () => {
    const stackLegend = new Map([['key1', { color: 'color1', text: 'value1' }], ['key2', { color: 'color2', text: 'value2' }]]);
    const wrapper = createWrapper(
      { props: { ...propsDefault } },
      {
        reportsConfigOverrides: {
          configType: configType.PRODUCTION_SPEED,
          stackLegend,
        },
      },
    );
    expect(wrapper.vm.legendData).toStrictEqual([
      {
        color: '#000',
        text: 'Target speed',
        value: 'TARGET_SPEED',
      },
      {
        clickAction: expect.any(Function),
        customSlot: 'button',
        disabled: true,
        text: 'Edit',
        value: 'editButton',
        visible: false,
      },
      {
        color: '#0066CC',
        text: 'Most frequent',
        value: 'MOST_FREQUENT',
      },
      { color: 'color2', text: 'value2', value: 'key2' },
      { color: 'color1', text: 'value1', value: 'key1' },
    ]);
  });
});

describe('legendData with production speed ABOVE/BELOW target labels', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates "Faster than target" label with percentage for BELOW_TARGET', () => {
    const belowTargetCount = 60;
    const productionCount = 100;
    const expectedPercentage = (belowTargetCount / productionCount) * 100;

    const stackLegend = new Map([
      ['key1', { color: 'red', text: productionSpeedLegendType.BELOW_TARGET }],
    ]);

    const wrapper = createWrapper(
      {
        props: {
          data: [],
          totals: {
            belowTargetCount,
            productionCount,
          },
        },
      },
      {
        reportsConfigOverrides: {
          configType: configType.PRODUCTION_SPEED,
          stackLegend,
        },
      },
    );

    const { legendData } = wrapper.vm;
    const belowTargetEntry = legendData.find((item) => item.value === 'key1');

    expect(belowTargetEntry).toBeDefined();
    expect(belowTargetEntry.text).toContain('Faster than target');
    expect(belowTargetEntry.text).toContain(formatPercentage(expectedPercentage));
    expect(belowTargetEntry.color).toBe('red');
  });

  it('generates "Slower than target" label with percentage for ABOVE_TARGET', () => {
    const belowTargetCount = 60;
    const productionCount = 100;
    const expectedPercentage = (belowTargetCount / productionCount) * 100;

    const stackLegend = new Map([
      ['key1', { color: 'green', text: productionSpeedLegendType.ABOVE_TARGET }],
    ]);

    const wrapper = createWrapper(
      {
        props: {
          data: [],
          totals: {
            belowTargetCount,
            productionCount,
          },
        },
      },
      {
        reportsConfigOverrides: {
          configType: configType.PRODUCTION_SPEED,
          stackLegend,
        },
      },
    );

    const { legendData } = wrapper.vm;
    const aboveTargetEntry = legendData.find((item) => item.value === 'key1');

    expect(aboveTargetEntry).toBeDefined();
    expect(aboveTargetEntry.text).toContain('Slower than target');
    expect(aboveTargetEntry.text).toContain(formatPercentage(100 - expectedPercentage));
    expect(aboveTargetEntry.color).toBe('green');
  });

  it('calls notifyError with updated message when edit button is clicked with invalid filters', () => {
    const pinia = createPinia({
      reportsConfigOverrides: {
        configType: configType.PRODUCTION_SPEED,
        stackLegend: new Map([]),
      },
      requestFilterState: {},
    });
    const notificationStore = useGenericNotificationStore(pinia);

    const wrapper = shallowMount(index, {
      props: {
        data: [],
        totals: {},
      },
      global: { plugins: [pinia] },
    });

    const { legendData } = wrapper.vm;
    const editButton = legendData.find((item) => item.value === 'editButton');

    expect(editButton).toBeDefined();
    expect(editButton.disabled).toBe(true);

    editButton.clickAction();

    expect(notificationStore.notifyError).toHaveBeenCalledWith('Something went wrong. Please try again.');
  });
});

describe('roleAllowsTargetEdit', () => {
  it('returns true when user has required role', () => {
    const wrapper = createWrapper(
      { props: { ...propsDefault } },
      {
        requestFilterState: { stationId: [123] },
        adminStationsMap: { 123: {} },
      },
    );
    expect(wrapper.vm.roleAllowsTargetEdit).toBe(true);
  });

  it('returns false when user does not have required role', () => {
    const wrapper = createWrapper(
      { props: { ...propsDefault } },
      {
        requestFilterState: { stationId: [123] },
        adminStationsMap: { 321: {} },
      },
    );
    expect(wrapper.vm.roleAllowsTargetEdit).toBe(false);
  });
});
