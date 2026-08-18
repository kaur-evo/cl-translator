import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { nextTick } from 'vue';

import ChecklistShiftTrigger from './index.vue';

const createPinia = () => createTestingPinia({ createSpy: vi.fn, stubActions: false });

const defaultProps = {
  requirements: {
    offsetFromStartSeconds: null,
    offsetFromEndSeconds: null,
  },
};

describe('ChecklistShiftTrigger', () => {
  it('renders correctly with both offsets null', () => {
    const wrapper = shallowMount(ChecklistShiftTrigger, {
      global: { plugins: [createPinia()] },
      props: { ...defaultProps },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with only start offset enabled', () => {
    const wrapper = shallowMount(ChecklistShiftTrigger, {
      global: { plugins: [createPinia()] },
      props: { requirements: { offsetFromStartSeconds: 0, offsetFromEndSeconds: null } },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with only end offset enabled', () => {
    const wrapper = shallowMount(ChecklistShiftTrigger, {
      global: { plugins: [createPinia()] },
      props: { requirements: { offsetFromStartSeconds: null, offsetFromEndSeconds: 1800 } },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with both offsets enabled', () => {
    const wrapper = shallowMount(ChecklistShiftTrigger, {
      global: { plugins: [createPinia()] },
      props: { requirements: { offsetFromStartSeconds: 3600, offsetFromEndSeconds: 1800 } },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with start error', () => {
    const wrapper = shallowMount(ChecklistShiftTrigger, {
      global: { plugins: [createPinia()] },
      props: { requirements: { offsetFromStartSeconds: 90000, offsetFromEndSeconds: null } },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with end error', () => {
    const wrapper = shallowMount(ChecklistShiftTrigger, {
      global: { plugins: [createPinia()] },
      props: { requirements: { offsetFromStartSeconds: null, offsetFromEndSeconds: 90000 } },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('isTriggerComplete', () => {
    it('returns false if both offsets are null', () => {
      const wrapper = shallowMount(ChecklistShiftTrigger, {
        global: { plugins: [createPinia()] },
        props: { requirements: { offsetFromStartSeconds: null, offsetFromEndSeconds: null } },
      });

      expect(wrapper.vm.isTriggerComplete).toBe(false);
    });

    it('returns true if only start offset is set', () => {
      const wrapper = shallowMount(ChecklistShiftTrigger, {
        global: { plugins: [createPinia()] },
        props: { requirements: { offsetFromStartSeconds: 300, offsetFromEndSeconds: null } },
      });

      expect(wrapper.vm.isTriggerComplete).toBe(true);
    });

    it('returns true if only end offset is set', () => {
      const wrapper = shallowMount(ChecklistShiftTrigger, {
        global: { plugins: [createPinia()] },
        props: { requirements: { offsetFromStartSeconds: null, offsetFromEndSeconds: 300 } },
      });

      expect(wrapper.vm.isTriggerComplete).toBe(true);
    });
  });

  describe('hasTriggerError', () => {
    it('returns false if both offsets are null', () => {
      const wrapper = shallowMount(ChecklistShiftTrigger, {
        global: { plugins: [createPinia()] },
        props: { requirements: { offsetFromStartSeconds: null, offsetFromEndSeconds: null } },
      });

      expect(wrapper.vm.hasTriggerError).toBe(false);
    });

    it('returns false if offsets are within 24 hours', () => {
      const wrapper = shallowMount(ChecklistShiftTrigger, {
        global: { plugins: [createPinia()] },
        props: { requirements: { offsetFromStartSeconds: 3600, offsetFromEndSeconds: 1800 } },
      });

      expect(wrapper.vm.hasTriggerError).toBe(false);
    });

    it('returns true if start offset exceeds 24 hours', () => {
      const wrapper = shallowMount(ChecklistShiftTrigger, {
        global: { plugins: [createPinia()] },
        props: { requirements: { offsetFromStartSeconds: 90000, offsetFromEndSeconds: null } },
      });

      expect(wrapper.vm.hasTriggerError).toBe(true);
    });

    it('returns true if end offset exceeds 24 hours', () => {
      const wrapper = shallowMount(ChecklistShiftTrigger, {
        global: { plugins: [createPinia()] },
        props: { requirements: { offsetFromStartSeconds: null, offsetFromEndSeconds: 90000 } },
      });

      expect(wrapper.vm.hasTriggerError).toBe(true);
    });
  });

  test('isTriggerComplete watcher emitting update:is-trigger-complete', async () => {
    const wrapper = shallowMount(ChecklistShiftTrigger, {
      global: { plugins: [createPinia()] },
      props: { requirements: { offsetFromStartSeconds: null, offsetFromEndSeconds: null } },
    });

    expect(wrapper.emitted('update:is-trigger-complete')[0][0]).toBe(false);

    await wrapper.setProps({ requirements: { offsetFromStartSeconds: 0, offsetFromEndSeconds: null } });
    expect(wrapper.emitted('update:is-trigger-complete')[1][0]).toBe(true);
  });

  test('hasTriggerError watcher emitting update:has-trigger-error', async () => {
    const wrapper = shallowMount(ChecklistShiftTrigger, {
      global: { plugins: [createPinia()] },
      props: { requirements: { offsetFromStartSeconds: 3600, offsetFromEndSeconds: null } },
    });

    expect(wrapper.emitted('update:has-trigger-error')[0][0]).toBe(false);

    await wrapper.setProps({ requirements: { offsetFromStartSeconds: 90000, offsetFromEndSeconds: null } });
    expect(wrapper.emitted('update:has-trigger-error')[1][0]).toBe(true);
  });

  describe('validate', () => {
    it('sets hasTriggerError to true and emits update:has-trigger-error when no checkbox is selected', async () => {
      const wrapper = shallowMount(ChecklistShiftTrigger, {
        global: { plugins: [createPinia()] },
        props: { ...defaultProps },
      });

      wrapper.vm.validate();
      await nextTick();

      expect(wrapper.vm.hasTriggerError).toBe(true);
      const errorEmits = wrapper.emitted('update:has-trigger-error');
      expect(errorEmits[errorEmits.length - 1][0]).toBe(true);
    });

    it('does not set hasTriggerError when a checkbox is already selected', async () => {
      const wrapper = shallowMount(ChecklistShiftTrigger, {
        global: { plugins: [createPinia()] },
        props: { requirements: { offsetFromStartSeconds: 0, offsetFromEndSeconds: null } },
      });

      wrapper.vm.validate();
      await nextTick();

      expect(wrapper.vm.hasTriggerError).toBe(false);
    });

    it('clears the error state when a checkbox is selected after validate', async () => {
      const wrapper = shallowMount(ChecklistShiftTrigger, {
        global: { plugins: [createPinia()] },
        props: { ...defaultProps },
      });

      wrapper.vm.validate();
      await nextTick();
      expect(wrapper.vm.hasTriggerError).toBe(true);

      await wrapper.setProps({ requirements: { offsetFromStartSeconds: 0, offsetFromEndSeconds: null } });
      expect(wrapper.vm.hasTriggerError).toBe(false);
    });

    it('renders checkboxes with error state after validate with no selection', async () => {
      const wrapper = shallowMount(ChecklistShiftTrigger, {
        global: { plugins: [createPinia()] },
        props: { ...defaultProps },
      });

      wrapper.vm.validate();
      await nextTick();

      expect(wrapper.element).toMatchSnapshot();
    });
  });
});
