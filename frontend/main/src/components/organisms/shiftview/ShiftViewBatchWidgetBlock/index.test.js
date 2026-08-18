import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { nextTick } from 'vue';

import ShiftViewBatchWidgetBlock from './index.vue';

import PreviousProducts from '@/components/organisms/shiftview/PreviousProducts/index.vue';
import CurrentBatch from '@/components/organisms/shiftview/CurrentBatch/index.vue';
import NextProducts from '@/components/organisms/shiftview/NextProducts/index.vue';
import { useConfigurationStore } from '@/stores/index';

const defaultProps = {
  large: false,
  showCurrentBatch: true,
  valueClass: 'value-class',
};

const createWrapper = ({ props = defaultProps, productChangeTabs = ['products', 'orders'] } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const configurationStore = useConfigurationStore(pinia);
  configurationStore.productChangeTabs = productChangeTabs;

  return shallowMount(ShiftViewBatchWidgetBlock, {
    props,
    global: { plugins: [pinia] },
  });
};

describe('ShiftViewBatchWidgetBlock', () => {
  it('renders', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly when loading', () => {
    const wrapper = createWrapper({ props: { ...defaultProps, loading: true } });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders next products component by default when showCurrentBatch is false and orders exist', () => {
    const wrapper = createWrapper({ props: { ...defaultProps, showCurrentBatch: false } });

    expect(wrapper.vm.index).toBe(1);
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders current batch component', async () => {
    const wrapper = createWrapper();

    wrapper.vm.index = 1;
    await nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders next products component', async () => {
    const wrapper = createWrapper();

    wrapper.vm.index = 2;
    await nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('batchList', () => {
    it('returns all 3 items when showCurrentBatch is true and orders tab is enabled', () => {
      const wrapper = createWrapper();

      expect(wrapper.vm.batchList).toEqual([
        { key: 'completed', title: 'Completed batches' },
        { key: 'current', title: 'Current batch' },
        { key: 'upcoming', title: 'Upcoming batches' },
      ]);
    });

    it('returns 2 items when showCurrentBatch is false', () => {
      const wrapper = createWrapper({ props: { ...defaultProps, showCurrentBatch: false } });

      expect(wrapper.vm.batchList).toEqual([
        { key: 'completed', title: 'Completed batches' },
        { key: 'upcoming', title: 'Upcoming batches' },
      ]);
    });

    it('returns 2 items when orders tab is disabled', () => {
      const wrapper = createWrapper({ productChangeTabs: ['products'] });

      expect(wrapper.vm.batchList).toEqual([
        { key: 'completed', title: 'Completed batches' },
        { key: 'current', title: 'Current batch' },
      ]);
    });

    it('returns 1 item when orders tab is disabled and showCurrentBatch is false', () => {
      const wrapper = createWrapper({
        props: { ...defaultProps, showCurrentBatch: false },
        productChangeTabs: ['products'],
      });

      expect(wrapper.vm.batchList).toEqual([
        { key: 'completed', title: 'Completed batches' },
      ]);
    });
  });

  describe('batchList watcher', () => {
    it('resets index to default when batchList changes', async () => {
      const wrapper = createWrapper(); // showCurrentBatch: true → 3 items

      // Navigate to "upcoming" tab (index 2)
      wrapper.vm.index = 2;
      await nextTick();

      // Removing current batch shrinks batchList from 3 → 2, watcher resets to default index 1
      await wrapper.setProps({ showCurrentBatch: false });

      expect(wrapper.vm.index).toBe(1);
    });

    it('resets index to 0 when only completed remains', async () => {
      const wrapper = createWrapper({ productChangeTabs: ['products'] }); // showCurrentBatch: true → 2 items (no orders)

      // Removing current batch shrinks batchList to 1 item
      await wrapper.setProps({ showCurrentBatch: false });

      expect(wrapper.vm.index).toBe(0);
    });
  });

  describe('activeComponentData', () => {
    it('returns PreviousProducts with valueClass when on completed tab', () => {
      const wrapper = createWrapper({ props: { ...defaultProps, showCurrentBatch: false } });

      wrapper.vm.index = 0;

      expect(wrapper.vm.activeComponentData).toEqual({
        component: PreviousProducts,
        props: { valueClass: 'value-class' },
      });
    });

    it('returns CurrentBatch with progressType when on current tab', () => {
      const wrapper = createWrapper({ props: { ...defaultProps, progressType: 'bar' } });

      wrapper.vm.index = 1;

      expect(wrapper.vm.activeComponentData).toEqual({
        component: CurrentBatch,
        props: { expanded: false, progressType: 'bar', valueClass: 'text-body-medium' },
      });
    });

    it('returns NextProducts with valueClass when on upcoming tab', () => {
      const wrapper = createWrapper();

      wrapper.vm.index = 2;

      expect(wrapper.vm.activeComponentData).toEqual({
        component: NextProducts,
        props: { valueClass: 'value-class' },
      });
    });

    it('returns null when the index is out of bounds', () => {
      const wrapper = createWrapper();

      wrapper.vm.index = 99;

      expect(wrapper.vm.activeComponentData).toBeNull();
    });
  });

  describe('paddingClass', () => {
    it('returns empty string when loading is true', () => {
      const wrapper = createWrapper({ props: { ...defaultProps, loading: true } });

      expect(wrapper.vm.paddingClass).toBe('');
    });

    it('returns "pa-4" when loading is false and large is true', () => {
      const wrapper = createWrapper({ props: { ...defaultProps, loading: false, large: true } });

      expect(wrapper.vm.paddingClass).toBe('pa-4');
    });

    it('returns "pa-2" when loading is false and large is false', () => {
      const wrapper = createWrapper({ props: { ...defaultProps, loading: false, large: false } });

      expect(wrapper.vm.paddingClass).toBe('pa-2');
    });
  });
});
