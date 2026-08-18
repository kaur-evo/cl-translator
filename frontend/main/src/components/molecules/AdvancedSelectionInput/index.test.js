import { shallowMount } from '@vue/test-utils';

import AdvancedSelectionInput from './index.vue';

import filterItemsApi from '@/api/filterItemsApi';

vi.mock('@/api/filterItemsApi');
filterItemsApi.getFilterItems = vi.fn();

describe('AdvancedSelectionInput', () => {
  describe('onApply', () => {
    it('emits update:modelValue with the selected value if backendFilteringConfig is false', async () => {
      const wrapper = shallowMount(AdvancedSelectionInput, {
        props: {
          limit: 10,
          configuration: {
            backendFilteringConfig: false,
          },
        },
      });

      const newState = [1, 2, 3];
      wrapper.setData({ temporaryState: newState });

      await wrapper.vm.onApply();
      expect(wrapper.emitted('update:model-value')[0]).toEqual([newState]);
    });

    it('emits update:modelValue with selected value if backEndFilteringConfig is true and selectAllAsEmpty is false and some items are selected', async () => {
      const wrapper = shallowMount(AdvancedSelectionInput, {
        props: {
          limit: 10,
          configuration: {
            backendFilteringConfig: true,
          },
          selectAllAsEmpty: false,
        },
      });

      const newState = [1, 2, 3];
      const items = [1, 2, 3, 4, 5];
      wrapper.setData({ temporaryState: newState, items });

      await wrapper.vm.onApply();
      expect(wrapper.emitted('update:model-value')[0]).toEqual([newState]);
    });

    it('emits update:modelValue with selected value if backEndFilteringConfig is true and selectAllAsEmpty is false and all items are selected', async () => {
      const wrapper = shallowMount(AdvancedSelectionInput, {
        props: {
          limit: 10,
          configuration: {
            backendFilteringConfig: true,
          },
          selectAllAsEmpty: false,
        },
      });
      const items = [1, 2, 3, 4, 5];
      wrapper.setData({ temporaryState: items, items });

      await wrapper.vm.onApply();
      expect(wrapper.emitted('update:model-value')[0]).toEqual([items]);
    });

    it('emits update:modelValue with selected value if selectAllAsEmpty is true and some visible items are selected when limit amount of items are shown', async () => {
      const wrapper = shallowMount(AdvancedSelectionInput, {
        props: {
          limit: 10,
          configuration: {
            backendFilteringConfig: true,
          },
          selectAllAsEmpty: true,
        },
      });
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const newState = [1, 2, 3];
      wrapper.setData({ temporaryState: newState, items });

      await wrapper.vm.onApply();
      expect(wrapper.emitted('update:model-value')[0]).toEqual([newState]);
    });

    it('emits update:modelValue with selected value if selectAllAsEmpty is true and some visible items are selected when less than limit of items is shown', async () => {
      const wrapper = shallowMount(AdvancedSelectionInput, {
        props: {
          limit: 10,
          configuration: {
            backendFilteringConfig: true,
          },
          selectAllAsEmpty: true,
        },
      });
      const items = [1, 2, 3, 4, 5, 6, 7];
      const newState = [1, 2, 3];
      wrapper.setData({ temporaryState: newState, items });

      await wrapper.vm.onApply();
      expect(wrapper.emitted('update:model-value')[0]).toEqual([newState]);
    });

    it('emits update:modelValue with empty array if selectAllAsEmpty is true and all visible items are selected', async () => {
      const wrapper = shallowMount(AdvancedSelectionInput, {
        props: {
          limit: 10,
          configuration: {
            backendFilteringConfig: true,
          },
          selectAllAsEmpty: true,
        },
      });
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      wrapper.setData({ temporaryState: items, items });

      await wrapper.vm.onApply();
      expect(wrapper.emitted('update:model-value')[0]).toEqual([[]]);
    });

    it('emits single item if it is the only search result and selectAllAsEmpty is true and backEndFiltering is enabled', async () => {
      const wrapper = shallowMount(AdvancedSelectionInput, {
        props: {
          limit: 10,
          configuration: {
            backendFilteringConfig: {
              entity: 'products',
            },
          },
          selectAllAsEmpty: true,
        },
      });

      await wrapper.setData({ temporaryState: [123], isSearchActive: true, items: [{ id: 123, name: 'test' }] });
      await wrapper.vm.onApply();
      expect(wrapper.emitted('update:model-value')[0]).toEqual([[123]]);
    });
  });
});
