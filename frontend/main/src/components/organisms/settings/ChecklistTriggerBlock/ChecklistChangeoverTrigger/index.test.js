import { shallowMount } from '@vue/test-utils';

import ChecklistChangeoverTrigger from './index.vue';

import { changeoverTriggerAppearances } from '@/constants/checklistsConstants';

const { BEFORE, AFTER } = changeoverTriggerAppearances;

const defaultProps = {
  requirements: {
    delayTime: 180, // 3 min
    leadTime: 0,
  },
};

describe('ChecklistChangeoverTrigger', () => {
  it('renders correctly with delayTime', () => {
    const wrapper = shallowMount(ChecklistChangeoverTrigger, {
      props: { ...defaultProps },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with leadTime', () => {
    const wrapper = shallowMount(ChecklistChangeoverTrigger, {
      props: {
        requirements: {
          delayTime: 0,
          leadTime: 300, // 5 min
        },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('emits leadTime in seconds when switching to before mode', () => {
    const wrapper = shallowMount(ChecklistChangeoverTrigger, {
      props: { ...defaultProps },
    });

    wrapper.vm.onSelectTiming(BEFORE);
    const emitted = wrapper.emitted()['update:requirements'];
    expect(emitted[emitted.length - 1][0]).toEqual({ delayTime: 0, leadTime: 60 });
  });

  it('emits delayTime reset when switching to after mode', () => {
    const wrapper = shallowMount(ChecklistChangeoverTrigger, {
      props: {
        requirements: {
          delayTime: 0,
          leadTime: 600,
        },
      },
    });

    wrapper.vm.onSelectTiming(AFTER);
    const emitted = wrapper.emitted()['update:requirements'];
    expect(emitted[emitted.length - 1][0]).toEqual({ leadTime: 0, delayTime: 0 });
  });

  it('converts minutes to seconds on leadTime input', () => {
    const wrapper = shallowMount(ChecklistChangeoverTrigger, {
      props: {
        requirements: {
          delayTime: 0,
          leadTime: 300,
        },
      },
    });

    wrapper.vm.onLeadTimeInput(20);
    const emitted = wrapper.emitted()['update:requirements'];
    expect(emitted[emitted.length - 1][0]).toEqual({ leadTime: 1200 });
  });

  it('emits leadTime as null when input is cleared', () => {
    const wrapper = shallowMount(ChecklistChangeoverTrigger, {
      props: {
        requirements: {
          delayTime: 0,
          leadTime: 300,
        },
      },
    });

    wrapper.vm.onLeadTimeInput(null);
    const emitted = wrapper.emitted()['update:requirements'];
    expect(emitted[emitted.length - 1][0]).toEqual({ leadTime: null });
  });

  it('emits has-trigger-error true when leadTime is below minimum', async () => {
    const wrapper = shallowMount(ChecklistChangeoverTrigger, {
      props: {
        requirements: {
          delayTime: 0,
          leadTime: 60,
        },
      },
    });

    await wrapper.setProps({ requirements: { leadTime: 0 } }); // Simulate setting leadTime to 0, which is below minimum of 1 min
    expect(wrapper.emitted()['update:has-trigger-error'].pop()[0]).toBe(true);
  });

  it('emits has-trigger-error true when leadTime exceeds maximum', () => {
    const wrapper = shallowMount(ChecklistChangeoverTrigger, {
      props: {
        requirements: {
          delayTime: 0,
          leadTime: 1860, // 31 min - above maximum of 30
        },
      },
    });

    expect(wrapper.emitted()['update:has-trigger-error'].pop()[0]).toBe(true);
  });

  it('emits has-trigger-error false when leadTime is within limits', () => {
    const wrapper = shallowMount(ChecklistChangeoverTrigger, {
      props: {
        requirements: {
          delayTime: 0,
          leadTime: 900, // 15 min
        },
      },
    });

    expect(wrapper.emitted()['update:has-trigger-error'].pop()[0]).toBe(false);
  });

  it('emits is-trigger-complete false when leadTime is invalid', () => {
    const wrapper = shallowMount(ChecklistChangeoverTrigger, {
      props: {
        requirements: {
          delayTime: 0,
          leadTime: 1860, // 31 min - above maximum of 30
        },
      },
    });

    expect(wrapper.emitted()['update:is-trigger-complete'].pop()[0]).toBe(false);
  });

  it('emits is-trigger-complete true when leadTime is valid', () => {
    const wrapper = shallowMount(ChecklistChangeoverTrigger, {
      props: {
        requirements: {
          delayTime: 0,
          leadTime: 900, // 15 min
        },
      },
    });

    expect(wrapper.emitted()['update:is-trigger-complete'].pop()[0]).toBe(true);
  });

  test('that validate emits requirements when in before mode with no value', async () => {
    const wrapper = shallowMount(ChecklistChangeoverTrigger, {
      props: {
        requirements: {
          delayTime: 0,
          leadTime: 60,
        },
      },
    });

    await wrapper.setProps({ requirements: { delayTime: 0, leadTime: null } });
    wrapper.vm.validate();
    const emitted = wrapper.emitted()['update:requirements'];
    expect(emitted[emitted.length - 1][0]).toEqual({ leadTime: null });
  });
});
