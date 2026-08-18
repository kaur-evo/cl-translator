import { shallowMount } from '@vue/test-utils';
import { mdiCloseCircle } from '@mdi/js';

import EvoconBooleanChip from './index.vue';

const defaultProps = {
  modelValue: true,
  appendInnerIcon: mdiCloseCircle,
};

describe('EvoconBooleanChip', () => {
  it('renders correctly', () => {
    const wrapper = shallowMount(EvoconBooleanChip, {
      props: { ...defaultProps },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with modelValue false', () => {
    const wrapper = shallowMount(EvoconBooleanChip, {
      props: { ...defaultProps, modelValue: false },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('emits', () => {
    it('emits update:model-value with first element when SelectionInput updates', async () => {
      const wrapper = shallowMount(EvoconBooleanChip, {
        props: { ...defaultProps },
      });

      await wrapper.findComponent({ name: 'SelectionInput' }).vm.$emit('update:model-value', [false]);

      expect(wrapper.emitted('update:model-value')).toEqual([[false]]);
    });

    it('emits click:append-inner when append icon is clicked', async () => {
      const wrapper = shallowMount(EvoconBooleanChip, {
        props: { ...defaultProps },
        global: {
          stubs: { SelectionInput: { template: '<div><slot name="append" /></div>' } },
        },
      });

      await wrapper.find('.selection-chip-icon').trigger('click');

      expect(wrapper.emitted('click:append-inner')).toHaveLength(1);
    });
  });
});
