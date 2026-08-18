import { shallowMount } from '@vue/test-utils';

import ChecklistQuantityTrigger from './index.vue';

const defaultProps = {
  requirements: {
    targetQty: 10,
  },
};

describe('ChecklistQuantityTrigger', () => {
  it('renders correctly', () => {
    const wrapper = shallowMount(ChecklistQuantityTrigger, {
      props: { ...defaultProps },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('isTriggerComplete', () => {
    it('returns false if targetQty is 0', () => {
      const wrapper = shallowMount(ChecklistQuantityTrigger, {
        props: { requirements: { targetQty: 0 } },
      });

      expect(wrapper.vm.isTriggerComplete).toBe(false);
    });

    it('returns true if targetQty is greater than 0', () => {
      const wrapper = shallowMount(ChecklistQuantityTrigger, {
        props: { requirements: { targetQty: 5 } },
      });

      expect(wrapper.vm.isTriggerComplete).toBe(true);
    });
  });

  describe('hasTriggerError', () => {
    it('returns false if targetQty is greater than 0', () => {
      const wrapper = shallowMount(ChecklistQuantityTrigger, {
        props: { requirements: { targetQty: 5 } },
      });

      expect(wrapper.vm.hasTriggerError).toBe(false);
    });

    it('returns true if targetQty is 0', () => {
      const wrapper = shallowMount(ChecklistQuantityTrigger, {
        props: { requirements: { targetQty: 0 } },
      });

      expect(wrapper.vm.hasTriggerError).toBe(true);
    });
  });

  describe('validate', () => {
    it('does not emit update:requirements if targetQty is greater than 0', () => {
      const wrapper = shallowMount(ChecklistQuantityTrigger, {
        props: { requirements: { targetQty: 5 } },
      });

      wrapper.vm.validate();
      expect(wrapper.emitted('update:requirements')).toBeUndefined();
    });

    it('emits update:requirements with targetQty as 0 if targetQty is null', () => {
      const wrapper = shallowMount(ChecklistQuantityTrigger, {
        props: { requirements: { targetQty: null } },
      });

      wrapper.vm.validate();
      expect(wrapper.emitted('update:requirements')[0][0]).toEqual({ targetQty: 0 });
    });
  });

  test('isTriggerComplete watcher emitting update:is-trigger-complete', async () => {
    const wrapper = shallowMount(ChecklistQuantityTrigger, {
      props: { requirements: { targetQty: 0 } },
    });

    expect(wrapper.emitted('update:is-trigger-complete')[0][0]).toBe(false);

    await wrapper.setProps({ requirements: { targetQty: 5 } });
    expect(wrapper.emitted('update:is-trigger-complete')[1][0]).toBe(true);
  });

  test('hasTriggerError watcher emitting update:has-trigger-error', async () => {
    const wrapper = shallowMount(ChecklistQuantityTrigger, {
      props: { requirements: { targetQty: 5 } },
    });

    expect(wrapper.emitted('update:has-trigger-error')[0][0]).toBe(false);

    await wrapper.setProps({ requirements: { targetQty: 0 } });
    expect(wrapper.emitted('update:has-trigger-error')[1][0]).toBe(true);
  });
});
