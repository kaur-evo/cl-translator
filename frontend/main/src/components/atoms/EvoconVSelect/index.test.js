import { shallowMount } from '@vue/test-utils';

import index from './index.vue';

import createGlobal from '@/helpers/createGlobal';

const global = createGlobal();

const createWrapper = (options) => shallowMount(index, {
  global: { ...global },
  ...options,
});

const propsDefault = {
  itemText: 'string',
  itemValue: 'id',
  light: true,
};

describe('EvoconVSelect', () => {
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

  describe('toggleAll', () => {
    it('emits update:model-value with empty array if all items are selected', async () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, items: [{ id: 1, string: 'item1' }, { id: 2, string: 'item2' }], modelValue: [1, 2] },
      });

      await wrapper.vm.toggleAll();

      expect(wrapper.emitted('update:model-value')).toEqual([[[]]]);
    });

    it('emits update:model-value with all items if there are items that are not selected', async () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, items: [{ id: 1, string: 'item1' }, { id: 2, string: 'item2' }], modelValue: [1] },
      });

      await wrapper.vm.toggleAll();

      expect(wrapper.emitted('update:model-value')).toEqual([[[1, 2]]]);
    });
  });

  describe('onRemoveChip', () => {
    it('emits update:model-value with modelValue without item on removed index', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, items: [{ id: 1, string: 'item1' }, { id: 2, string: 'item2' }], modelValue: [1, 2] },
      });

      wrapper.vm.onRemoveChip(1);

      expect(wrapper.emitted('update:model-value')).toEqual([[[1]]]);
    });
  });
});
