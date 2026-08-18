import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ShiftViewShiftOeeBlock from './index.vue';

import { useStationStore } from '@/stores/index';

const propsDefault = {
  labelClass: 'label-class',
  valueClass: 'value-class',
  compact: false,
  expanded: false,
};

const createWrapper = ({ props = propsDefault } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const stationStore = useStationStore(pinia);
  stationStore.lineviewStation = { oeeGoalHappy: 70 };

  return shallowMount(ShiftViewShiftOeeBlock, {
    props,
    global: { plugins: [pinia] },
  });
};

describe('ShiftViewShiftOeeBlock', () => {
  it('renders correctly', () => {
    const wrapper = createWrapper();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in compact mode', () => {
    const wrapper = createWrapper({ props: { ...propsDefault, compact: true } });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in expanded mode', () => {
    const wrapper = createWrapper({ props: { ...propsDefault, expanded: true } });

    expect(wrapper.element).toMatchSnapshot();
  });
});
