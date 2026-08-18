import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import OeePercentageValue from './index.vue';

const defaultInitialState = {
  shift: { statisticsRaw: { shiftTotal: { oee: 0.6087 }, hourStatistics: {} } },
  station: { lineviewStation: { oeeGoalHappy: 70 } },
};

const defaultProps = {
  valueClass: 'value-class',
};

const createWrapper = (initialState = defaultInitialState, props = defaultProps) => shallowMount(OeePercentageValue, {
  props,
  global: {
    plugins: [createTestingPinia({ createSpy: vi.fn, initialState })],
  },
});

describe('OeePercentageValue', () => {
  it('renders correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('isGoodOEE', () => {
    it('returns false if oee is lower than oeeGoalHappy', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.isGoodOEE).toBe(false);
    });

    it('returns true if oee is higher than oeeGoalHappy', () => {
      const wrapper = createWrapper({
        ...defaultInitialState,
        station: { lineviewStation: { oeeGoalHappy: 50 } },
      });
      expect(wrapper.vm.isGoodOEE).toBe(true);
    });

    it('returns true if oee is same as oeeGoalHappy', () => {
      const wrapper = createWrapper({
        ...defaultInitialState,
        station: { lineviewStation: { oeeGoalHappy: 60 } },
      });
      expect(wrapper.vm.isGoodOEE).toBe(true);
    });
  });

  describe('oeeValue', () => {
    it('returns formatted oee value if it exists', () => {
      const wrapper = createWrapper({
        ...defaultInitialState,
        shift: { statisticsRaw: { shiftTotal: { oee: 0.67, delaysTime: 1800 }, hourStatistics: {} } },
      });
      expect(wrapper.vm.oeeValue).toBe('67%');
    });

    it('returns formatted oee value if oee is 0, but there is delaysTime', () => {
      const wrapper = createWrapper({
        ...defaultInitialState,
        shift: { statisticsRaw: { shiftTotal: { oee: 0, delaysTime: 1800 }, hourStatistics: {} } },
      });
      expect(wrapper.vm.oeeValue).toBe('0%');
    });

    it('returns - if oee and delaysTime are both 0', () => {
      const wrapper = createWrapper({
        ...defaultInitialState,
        shift: { statisticsRaw: { shiftTotal: { oee: 0, delaysTime: 0 }, hourStatistics: {} } },
      });
      expect(wrapper.vm.oeeValue).toBe('-');
    });
  });
});
