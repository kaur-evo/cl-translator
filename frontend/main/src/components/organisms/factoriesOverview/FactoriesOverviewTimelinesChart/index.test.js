import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { cloneDeep } from 'lodash';

import index from './index.vue';

import CustomInterval from '@/helpers/interval/CustomInterval';
import oeeComponents from '@/constants/oeeComponents';


const defaultInitialState = {
  device: {
    isBrowserTabActive: true,
  },
  factoryOverviewConfig: {
    timelinesInterval: {},
    rollingTimelines: {},
  },
};

const propsDefault = {
  items: [],
  id: 1,
  measure: 'string',
  tooltipHTMLFunc: (val) => val || {},
  groupName: 'groupname',
};

const createPinia = (initialState = defaultInitialState) => createTestingPinia({
  createSpy: vi.fn,
  stubActions: true,
  initialState: cloneDeep(initialState),
});

describe('FactoriesOverviewTimelinesChart', () => {
  vi.useFakeTimers();
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = shallowMount(index, {
      props: { ...propsDefault },
      global: {
        plugins: [createPinia()],
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(index, {
      props: { ...propsDefault },
      global: {
        plugins: [createPinia()],
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('test that interval is set on mount', () => {
    const wrapper = shallowMount(index, {
      props: { ...propsDefault },
      global: {
        plugins: [createPinia()],
      },
    });

    expect(wrapper.vm.updateTimer).toBeInstanceOf(CustomInterval);
    expect(wrapper.vm.updateTimer.cbFun).toBe(wrapper.vm.setScale);
    expect(wrapper.vm.updateTimer.delay).toBe(60000);
    const spy = vi.spyOn(wrapper.vm.updateTimer, 'cbFun');
    const passedMinutes = 7;
    vi.advanceTimersByTime(passedMinutes * 60 * 1000);
    expect(spy).toHaveBeenCalledTimes(passedMinutes);
  });
  it('test that interval is cleared on unmount', () => {
    const wrapper = shallowMount(index, {
      props: { ...propsDefault },
      global: {
        plugins: [createPinia()],
      },
    });

    const spy = vi.spyOn(wrapper.vm.updateTimer, 'cbFun');
    wrapper.unmount();
    expect(wrapper.vm.updateTimer).toBe(null);

    const passedMinutes = 7;
    vi.advanceTimersByTime(passedMinutes);
    expect(spy).toHaveBeenCalledTimes(0);
  });

  describe('getUnitLabel', () => {
    it('returns correct value if measure is "Good quantity" and all slices have same unit', () => {
      const testState = cloneDeep(defaultInitialState);
      testState.factoryOverviewConfig.rollingTimelines = {
        1: {
          stats: {
            total: {
              quantity: 10,
              scrapQty: 5,
              altQuantity: 20,
              altScrapQty: 10,
            },
          },
          timeline: [
            { typ: 'PRODUCT', uId: 'tk', aUId: '' },
            { typ: 'PRODUCT', uId: 'tk', aUId: 'kg' },
            { typ: 'PRODUCT', uId: 'tk', aUId: 'kg' },
          ],
        },
      };
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, measure: 'Good quantity' },
        global: {
          plugins: [createPinia(testState)],
        },
      });

      expect(wrapper.vm.getUnitLabel({ id: 1 })).toBe('tk');
    });

    it('returns empty string if measure is "Good quantity" and slices have different unit', () => {
      const testState = cloneDeep(defaultInitialState);
      testState.factoryOverviewConfig.rollingTimelines = {
        1: {
          stats: {
            total: {
              quantity: 10,
              scrapQty: 5,
              altQuantity: 20,
              altScrapQty: 10,
            },
          },
          timeline: [
            { typ: 'PRODUCT', uId: 'tk', aUId: '' },
            { typ: 'PRODUCT', uId: 'kg', aUId: '' },
            { typ: 'PRODUCT', uId: 'kg', aUId: '' },
          ],
        },
      };
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, measure: 'Good quantity' },
        global: {
          plugins: [createPinia(testState)],
        },
      });

      expect(wrapper.vm.getUnitLabel({ id: 1 })).toBe('');
    });

    it('returns correct value if measure is "Good quantity alternative" and all slices have same unit', () => {
      const testState = cloneDeep(defaultInitialState);
      testState.factoryOverviewConfig.rollingTimelines = {
        1: {
          stats: {
            total: {
              quantity: 10,
              scrapQty: 5,
              altQuantity: 20,
              altScrapQty: 10,
            },
          },
          timeline: [
            { typ: 'PRODUCT', uId: 'tk', aUId: 'kg' },
            { typ: 'PRODUCT', uId: 'tk', aUId: 'kg' },
            { typ: 'PRODUCT', uId: 'tk', aUId: 'kg' },
          ],
        },
      };
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, measure: 'Good quantity alternative' },
        global: {
          plugins: [createPinia(testState)],
        },
      });

      expect(wrapper.vm.getUnitLabel({ id: 1 })).toBe('kg');
    });

    it('returns correct value if measure is "Good quantity alternative", but it is not available', () => {
      const testState = cloneDeep(defaultInitialState);
      testState.factoryOverviewConfig.rollingTimelines = {
        1: {
          stats: {
            total: {
              quantity: 10,
              scrapQty: 5,
              altQuantity: 20,
              altScrapQty: 10,
            },
          },
          timeline: [
            { typ: 'PRODUCT', uId: 'tk', aUId: '' },
            { typ: 'PRODUCT', uId: 'tk', aUId: '' },
            { typ: 'PRODUCT', uId: 'tk', aUId: '' },
          ],
        },
      };
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, measure: 'Good quantity alternative' },
        global: {
          plugins: [createPinia(testState)],
        },
      });

      expect(wrapper.vm.getUnitLabel({ id: 1 })).toBe('tk');
    });

    it('returns empty string if measure is "Good quantity alternative" and slices have different unit', () => {
      const testState = cloneDeep(defaultInitialState);
      testState.factoryOverviewConfig.rollingTimelines = {
        1: {
          stats: {
            total: {
              quantity: 10,
              scrapQty: 5,
              altQuantity: 20,
              altScrapQty: 10,
            },
          },
          timeline: [
            { typ: 'PRODUCT', uId: 'tk', aUId: 'kg' },
            { typ: 'PRODUCT', uId: 'kg', aUId: 'l' },
            { typ: 'PRODUCT', uId: 'kg', aUId: 'l' },
          ],
        },
      };
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, measure: 'Good quantity alternative' },
        global: {
          plugins: [createPinia(testState)],
        },
      });

      expect(wrapper.vm.getUnitLabel({ id: 1 })).toBe('');
    });
  });

  describe('measureName', () => {
    it('returns correct value if measure is "Good quantity"', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, measure: 'Good quantity' },
        global: {
          plugins: [createPinia()],
        },
      });

      expect(wrapper.vm.measureName).toBe('Good quantity (Primary unit)');
    });

    it('returns correct value if measure is "Good quantity alternative"', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, measure: 'Good quantity alternative' },
        global: {
          plugins: [createPinia()],
        },
      });

      expect(wrapper.vm.measureName).toBe('Good quantity (Alternative unit)');
    });

    it('returns correct value if measure is "OEE"', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, measure: 'OEE' },
        global: {
          plugins: [createPinia()],
        },
      });

      expect(wrapper.vm.measureName).toBe('OEE');
    });
  });

  describe('showAlternativeUnit', () => {
    it('returns true if measure is "Good quantity alternative"', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, measure: 'Good quantity alternative' },
        global: {
          plugins: [createPinia()],
        },
      });

      expect(wrapper.vm.showAlternativeUnit).toBe(true);
    });

    it('returns false if measure is "Good quantity"', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, measure: 'Good quantity' },
        global: {
          plugins: [createPinia()],
        },
      });

      expect(wrapper.vm.showAlternativeUnit).toBe(false);
    });
  });

  describe('getStatValue', () => {
    const testState = cloneDeep(defaultInitialState);
    testState.factoryOverviewConfig.rollingTimelines = {
      1: {
        stats: {
          total: {
            quantity: 10,
            scrapQty: 5,
            altQuantity: 20,
            altScrapQty: 10,
            availability: 0.89,
            performance: 0.95,
            quality: 0.98,
            oee: 0.85,
          },
          timeline: [],
        },
      },
    };
    it('returns "-" if shouldShowStat returns false', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, measure: 'unknown' },
        global: {
          plugins: [createPinia(testState)],
        },
      });
      wrapper.vm.shouldShowStat = () => false;
      expect(wrapper.vm.getStatValue({ id: 1 })).toBe('-');
    });

    it('returns correct value when measure is "Good quantity alternative"', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, measure: 'Good quantity alternative' },
        global: {
          plugins: [createPinia(testState)],
        },
      });
      expect(wrapper.vm.getStatValue({ id: 1 })).toBe('10');
    });

    it('returns correct value when measure is "Good quantity"', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, measure: 'Good quantity' },
        global: {
          plugins: [createPinia(testState)],
        },
      });
      expect(wrapper.vm.getStatValue({ id: 1 })).toBe('5');
    });

    it('returns correct value when measure is "availability"', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, measure: 'availability' },
        global: {
          plugins: [createPinia(testState)],
        },
      });
      expect(wrapper.vm.getStatValue({ id: 1 })).toBe('89%');
    });

    it('returns correct value when measure is "performance"', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, measure: 'performance' },
        global: {
          plugins: [createPinia(testState)],
        },
      });
      expect(wrapper.vm.getStatValue({ id: 1 })).toBe('95%');
    });

    it('returns correct value when measure is "quality"', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, measure: 'quality' },
        global: {
          plugins: [createPinia(testState)],
        },
      });
      expect(wrapper.vm.getStatValue({ id: 1 })).toBe('98%');
    });

    it('returns correct value when measure is "oee"', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, measure: 'oee' },
        global: {
          plugins: [createPinia(testState)],
        },
      });
      expect(wrapper.vm.getStatValue({ id: 1 })).toBe('85%');
    });
  });

  describe('shouldShowStat', () => {
    test('with QUALITY measure', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, measure: oeeComponents.QUALITY },
        global: {
          plugins: [createPinia()],
        },
      });

      expect(wrapper.vm.shouldShowStat(0, [])).toBe(false);
      expect(wrapper.vm.shouldShowStat(0.2, [])).toBe(true);
    });

    test('with PERFORMANCE measure', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, measure: oeeComponents.PERFORMANCE },
        global: {
          plugins: [createPinia()],
        },
      });

      expect(wrapper.vm.shouldShowStat(0, [])).toBe(false);
      expect(wrapper.vm.shouldShowStat(0.2, [])).toBe(true);
    });

    test('with AVAILABILITY measure', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, measure: oeeComponents.AVAILABILITY },
        global: {
          plugins: [createPinia()],
        },
      });

      expect(wrapper.vm.shouldShowStat(0.2, [])).toBe(true);
      expect(wrapper.vm.shouldShowStat(0, [{ inOee: true }])).toBe(true);
      expect(wrapper.vm.shouldShowStat(0, [{ inOee: false }])).toBe(false);
    });

    test('with OEE measure', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, measure: oeeComponents.OEE },
        global: {
          plugins: [createPinia()],
        },
      });

      expect(wrapper.vm.shouldShowStat(0.2, [])).toBe(true);
      expect(wrapper.vm.shouldShowStat(0, [{ inOee: true }])).toBe(true);
      expect(wrapper.vm.shouldShowStat(0, [{ inOee: false }])).toBe(false);
    });

    test('with OTHER measure', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, measure: 'OTHER' },
        global: {
          plugins: [createPinia()],
        },
      });

      expect(wrapper.vm.shouldShowStat(0.2, [])).toBe(true);
      expect(wrapper.vm.shouldShowStat(0, [{ inOee: true }])).toBe(true);
      expect(wrapper.vm.shouldShowStat(0, [{ inOee: false }])).toBe(true);
    });
  });
});
