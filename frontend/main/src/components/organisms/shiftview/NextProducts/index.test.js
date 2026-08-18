import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import NextProducts from './index.vue';

import { useDeviceStore, useShiftViewStore } from '@/stores/index';

const defaultOrders = [
  { id: 1, productName: 'Product A', productionOrder: 'ORD-001', productionOrderNote: 'Note A' },
  { id: 2, productName: 'Product B', productionOrder: null, productionOrderNote: '' },
  { id: 3, productName: 'Product C', productionOrder: 'ORD-003', productionOrderNote: null },
];

const defaultProps = {
  valueClass: 'value-class',
};

const createWrapper = ({
  props = defaultProps,
  orders = defaultOrders,
  isMobileView = false,
} = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const shiftViewStore = useShiftViewStore(pinia);
  shiftViewStore.orders = orders;

  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = isMobileView;

  return shallowMount(NextProducts, {
    props,
    global: { plugins: [pinia] },
  });
};

describe('NextProducts', () => {
  it('renders', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile view', () => {
    const wrapper = createWrapper({ isMobileView: true });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('mobileBatchItems', () => {
    it('includes Order and Extra note rows when productionOrder and productionOrderNote exist', () => {
      const wrapper = createWrapper({
        props: {},
        orders: [{ id: 21, productName: 'P21', productionOrder: 'ORD-021', productionOrderNote: 'Note 21' }],
      });

      expect(wrapper.vm.mobileBatchItems[0].rows).toEqual([
        { label: 'Order', value: 'ORD-021' },
        { label: 'Product', value: 'P21' },
        { label: 'quantity', slot: { batch: wrapper.vm.orders[0], showGoodQty: false } },
        { label: 'Extra note', value: 'Note 21' },
      ]);
    });

    it('excludes Order row when productionOrder is null', () => {
      const wrapper = createWrapper({
        props: {},
        orders: [{ id: 22, productName: 'P22', productionOrder: null, productionOrderNote: 'Note 22' }],
      });

      expect(wrapper.vm.mobileBatchItems[0].rows).toEqual([
        { label: 'Product', value: 'P22' },
        { label: 'quantity', slot: { batch: wrapper.vm.orders[0], showGoodQty: false } },
        { label: 'Extra note', value: 'Note 22' },
      ]);
    });

    it('excludes Extra note row when productionOrderNote is empty', () => {
      const wrapper = createWrapper({
        props: {},
        orders: [{ id: 23, productName: 'P23', productionOrder: 'ORD-023', productionOrderNote: '' }],
      });

      expect(wrapper.vm.mobileBatchItems[0].rows).toEqual([
        { label: 'Order', value: 'ORD-023' },
        { label: 'Product', value: 'P23' },
        { label: 'quantity', slot: { batch: wrapper.vm.orders[0], showGoodQty: false } },
      ]);
    });
  });
});
