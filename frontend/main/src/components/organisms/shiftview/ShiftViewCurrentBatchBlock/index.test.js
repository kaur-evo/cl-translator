import { shallowMount } from '@vue/test-utils';

import ShiftViewCurrentBatchBlock from './index.vue';

describe('ShiftViewCurrentBatchBlock', () => {
  it('renders', () => {
    const wrapper = shallowMount(ShiftViewCurrentBatchBlock);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(ShiftViewCurrentBatchBlock);
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when loading is true', () => {
    const wrapper = shallowMount(ShiftViewCurrentBatchBlock, {
      props: { loading: true },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('paddingClass', () => {
    it('returns empty string when loading is true', () => {
      const wrapper = shallowMount(ShiftViewCurrentBatchBlock, {
        props: { loading: true },
      });

      expect(wrapper.vm.paddingClass).toBe('');
    });

    it('returns "pa-4" when loading is false and large is true', () => {
      const wrapper = shallowMount(ShiftViewCurrentBatchBlock, {
        props: { loading: false, large: true },
      });

      expect(wrapper.vm.paddingClass).toBe('pa-4');
    });

    it('returns "pa-2" when loading is false and large is false', () => {
      const wrapper = shallowMount(ShiftViewCurrentBatchBlock, {
        props: { loading: false, large: false },
      });

      expect(wrapper.vm.paddingClass).toBe('pa-2');
    });
  });
});
