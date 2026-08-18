import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import BatchWidget from '@/components/organisms/shiftview/BatchWidget/index.vue';
import { useShiftStore } from '@/stores/index';

const createWrapper = ({ props = {} } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const shiftStore = useShiftStore(pinia);
  shiftStore.shift = {};

  return shallowMount(BatchWidget, {
    global: { plugins: [pinia] },
    props,
  });
};

const propsDefault = {
  title: 'string',
  productlist: [
    {
      productionOrder: 123, productName: 'Product1', unitId: 'tk', alternativeUnitId: 'kg', producedQty: 10, scrapQty: 0, mainToAltUnitConversion: 0.8, startTime: '2023-03-10T12:00:00',
    },
    {
      productSku: '456', productName: 'Product2', unitId: 'kg', alternativeUnitId: 'm', producedQty: 10, scrapQty: 4, plannedQty: 7, mainToAltUnitConversion: 0.5, startTime: '2023-03-10T00:00:00',
    },
    {
      productSku: '789', productName: 'Product3', unitId: 'pcs', alternativeUnitId: '', producedQty: 10, scrapQty: 0, startTime: '2023-03-08T15:00:00',
    },
    {
      productSku: 'Product3', productName: 'Product3', unitId: 'pcs', alternativeUnitId: '', producedQty: 10, scrapQty: 0, startTime: '2023-03-08T15:00:00',
    },
  ],
};

describe('BatchWidget', () => {
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

  it('renders correctly with tooltip', () => {
    const wrapper = createWrapper({ props: { ...propsDefault, showTooltip: true } });

    expect(wrapper.element).toMatchSnapshot();
  });
});
