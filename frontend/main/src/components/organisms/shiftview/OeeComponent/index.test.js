import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import OeeComponent from '.';

import { useShiftStore } from '@/stores/index';

const defaultProps = {
  oeeClass: 'text-body-medium font-weight-medium',
  oeeComponentsClass: 'text-label-small',
  expanded: false,
};

const defaultStatistics = {
  shiftTotal: {
    oee: 0.755,
    availability: 0.802,
    performance: 0.901,
    quality: 0.950,
    delaysTime: 1200,
  },
};

const createWrapper = ({ props = defaultProps, statistics = defaultStatistics } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const shiftStore = useShiftStore(pinia);
  shiftStore.statistics = statistics;

  return shallowMount(OeeComponent, {
    props,
    global: { plugins: [pinia] },
  });
};

describe('OeeComponent', () => {
  it('renders correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly when loading', () => {
    const wrapper = createWrapper({ props: { ...defaultProps, loading: true } });
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly with zero data', () => {
    const wrapper = createWrapper({
      statistics: {
        shiftTotal: {
          oee: 0,
          availability: 0,
          performance: 0,
          quality: 0,
          delaysTime: 0,
        },
      },
    });
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly when vertical prop is true', () => {
    const wrapper = createWrapper({ props: { ...defaultProps, vertical: true } });
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly in expanded mode', () => {
    const wrapper = createWrapper({ props: { ...defaultProps, expanded: true } });
    expect(wrapper.html()).toMatchSnapshot();
  });

  test('that tooltipRows returns correct values', () => {
    const wrapper = createWrapper();

    expect(wrapper.vm.tooltipRows).toEqual([
      { dotColor: 'primary', key: 'availability', value: wrapper.vm.shiftAvailability },
      { dotColor: 'lw-yellow', key: 'performance', value: wrapper.vm.shiftPerformance },
      { dotColor: 'lw-orange', key: 'quality', value: wrapper.vm.shiftQuality },
    ]);
  });
});
