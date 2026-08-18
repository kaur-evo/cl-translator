import { shallowMount } from '@vue/test-utils';

import ChecklistIntervalTrigger from './index.vue';

const defaultProps = {
  requirements: {
    intervalTime: 180, // 3 min
  },
};

describe('ChecklistIntervalTrigger', () => {
  it('renders correctly', () => {
    const wrapper = shallowMount(ChecklistIntervalTrigger, {
      props: { ...defaultProps },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if intervalTime is less than a minute', () => {
    const wrapper = shallowMount(ChecklistIntervalTrigger, {
      props: { requirements: { intervalTime: 30 } },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('isTriggerComplete', () => {
    it('returns false if intervalTime is null', () => {
      const wrapper = shallowMount(ChecklistIntervalTrigger, {
        props: { requirements: { intervalTime: null } },
      });

      expect(wrapper.vm.isTriggerComplete).toBe(false);
    });

    it('returns true if intervalTime is not null', () => {
      const wrapper = shallowMount(ChecklistIntervalTrigger, {
        props: { requirements: { intervalTime: 180 } },
      });

      expect(wrapper.vm.isTriggerComplete).toBe(true);
    });
  });

  describe('hasIntervalError', () => {
    it('returns false if intervalTime is null', () => {
      const wrapper = shallowMount(ChecklistIntervalTrigger, {
        props: { requirements: { intervalTime: null } },
      });

      expect(wrapper.vm.hasIntervalError).toBe(false);
    });

    it('returns false if intervalTime is more than a minute', () => {
      const wrapper = shallowMount(ChecklistIntervalTrigger, {
        props: { requirements: { intervalTime: 120 } },
      });

      expect(wrapper.vm.hasIntervalError).toBe(false);
    });

    it('returns true if intervalTime is less than a minute', () => {
      const wrapper = shallowMount(ChecklistIntervalTrigger, {
        props: { requirements: { intervalTime: 30 } },
      });

      expect(wrapper.vm.hasIntervalError).toBe(true);
    });
  });

  describe('validate', () => {
    it('does not emit update:requirements if intervalTime has a value', () => {
      const wrapper = shallowMount(ChecklistIntervalTrigger, {
        props: { requirements: { intervalTime: 180 } },
      });

      wrapper.vm.validate();
      expect(wrapper.emitted('update:requirements')).toBeUndefined();
    });

    it('emits update:requirements with intervalTime as 0 if intervalTime is null', () => {
      const wrapper = shallowMount(ChecklistIntervalTrigger, {
        props: { requirements: { intervalTime: null } },
      });

      wrapper.vm.validate();
      expect(wrapper.emitted('update:requirements')[0][0]).toEqual({ intervalTime: 0 });
    });
  });

  test('isTriggerComplete watcher emitting update:is-trigger-complete', async () => {
    const wrapper = shallowMount(ChecklistIntervalTrigger, {
      props: { requirements: { intervalTime: null } },
    });

    expect(wrapper.emitted('update:is-trigger-complete')[0][0]).toBe(false);

    await wrapper.setProps({ requirements: { intervalTime: 60 } });
    expect(wrapper.emitted('update:is-trigger-complete')[1][0]).toBe(true);
  });

  test('hasIntervalError watcher emitting update:has-trigger-error', async () => {
    const wrapper = shallowMount(ChecklistIntervalTrigger, {
      props: { requirements: { intervalTime: 60 } },
    });

    expect(wrapper.emitted('update:has-trigger-error')[0][0]).toBe(false);

    await wrapper.setProps({ requirements: { intervalTime: 30 } });
    expect(wrapper.emitted('update:has-trigger-error')[1][0]).toBe(true);
  });
});
