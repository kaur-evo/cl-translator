import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import PerfChart from './PerformanceChart.vue';

import sliceType from '@/constants/sliceType';
import { useDeviceStore } from '@/stores/index';

vi.mock('./PerformanceChart', async () => ({
  default: class PerformanceChart {},
  __esModule: true,
}));

const MOCK_INSTANCE_ID = 'performance-test';

const createWrapper = ({ props = {} } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = false;

  return shallowMount(PerfChart, {
    global: { plugins: [pinia] },
    data() {
      return { instanceId: MOCK_INSTANCE_ID };
    },
    props,
  });
};

const propsDefault = {
  data: [],
  screenWidth: 0,
  xDomainMinStart: null,
  xDomainMinFinish: null,
};

describe('PerformanceChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper({ props: propsDefault });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper({ props: propsDefault });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('should format tooltip value correctly', () => {
    const d = [
      {
        type: sliceType.PRODUCT,
        value: 100,
        unitId: 'kg',
      },
    ];
    const wrapper = createWrapper({ props: propsDefault });
    const formattedValue = wrapper.vm.formatTooltipValue(d);

    expect(formattedValue).toBe('100 {unit}_PER_MINUTE');
  });

  it('should format tooltip target correctly', () => {
    const d = [
      {
        target: 200,
        unitId: 'kg',
      },
    ];
    const wrapper = createWrapper({ props: propsDefault });
    const formattedTarget = wrapper.vm.formatTooltipTarget(d);

    expect(formattedTarget).toBe('200 {unit}_PER_MINUTE');
  });

  it('should return tooltip template correctly', () => {
    const d = [
      {
        measure: 'measure',
        dotColor: 'red',
        measureLabel: 'Measure',
        productName: 'Product',
        value: 100,
        target: 200,
        unitId: 'kg',
        type: sliceType.PRODUCT,
      },
    ];
    const wrapper = createWrapper({ props: propsDefault });
    const tooltipTemplate = wrapper.vm.getTooltipTemplate(d, wrapper.vm.formatTooltipValue, wrapper.vm.formatTooltipTarget);

    expect(tooltipTemplate).toMatchSnapshot();
  });
});
