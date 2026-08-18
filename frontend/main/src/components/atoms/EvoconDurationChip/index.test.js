import { shallowMount, flushPromises } from '@vue/test-utils';

import EvoconDurationChip from './index.vue';

describe('EvoconDurationChip', () => {
  it('renders correctly', async () => {
    const wrapper = shallowMount(EvoconDurationChip, {
      props: { modelValue: 0 },
    }); // 0h 0min
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in error state', async () => {
    const wrapper = shallowMount(EvoconDurationChip, {
      props: { modelValue: 0, error: true },
    }); // 0h 0min
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly without value entered', async () => {
    const wrapper = shallowMount(EvoconDurationChip, {
      props: { modelValue: null },
    }); // 0h 0min
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when value is null', async () => {
    const wrapper = shallowMount(EvoconDurationChip, {
      props: { modelValue: null },
    });
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in disabled state', async () => {
    const wrapper = shallowMount(EvoconDurationChip, {
      props: { modelValue: 0, disabled: true },
    });
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if hour input is hidden', async () => {
    const wrapper = shallowMount(EvoconDurationChip, {
      props: { modelValue: 0, hourInputHidden: true },
    });
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('mounts correctly when value is 0', async () => {
    const wrapper = shallowMount(EvoconDurationChip, {
      props: { modelValue: 0 },
    }); // 0h 0min
    await flushPromises();
    expect(wrapper.vm.hours).toBe(0);
    expect(wrapper.vm.minutes).toBe(0);
    expect(wrapper.vm.$refs.hourInput.innerText).toBe('00');
    expect(wrapper.vm.$refs.minuteInput.innerText).toBe('00');
  });

  it('mounts correctly when value is null', async () => {
    const wrapper = shallowMount(EvoconDurationChip, {
      props: { modelValue: null },
    });
    await flushPromises();
    expect(wrapper.vm.hours).toBe('');
    expect(wrapper.vm.minutes).toBe('');
  });

  it('mounts correctly when value is 3600', async () => {
    const wrapper = shallowMount(EvoconDurationChip, {
      props: { modelValue: 3600 },
    }); // 1h 00min
    await flushPromises();
    expect(wrapper.vm.hours).toBe(1);
    expect(wrapper.vm.minutes).toBe(0);
    expect(wrapper.vm.$refs.hourInput.innerText).toBe('01');
    expect(wrapper.vm.$refs.minuteInput.innerText).toBe('00');
  });

  it('mounts correctly when value is 300', async () => {
    const wrapper = shallowMount(EvoconDurationChip, {
      props: { modelValue: 300 },
    }); // 0h 05min
    await flushPromises();
    expect(wrapper.vm.hours).toBe(0);
    expect(wrapper.vm.minutes).toBe(5);
    expect(wrapper.vm.$refs.hourInput.innerText).toBe('00');
    expect(wrapper.vm.$refs.minuteInput.innerText).toBe('05');
  });

  it('mounts correctly when value is 45000', async () => {
    const wrapper = shallowMount(EvoconDurationChip, {
      props: { modelValue: 45000 },
    }); // 12h 30min
    await flushPromises();
    expect(wrapper.vm.hours).toBe(12);
    expect(wrapper.vm.minutes).toBe(30);
    expect(wrapper.vm.$refs.hourInput.innerText).toBe('12');
    expect(wrapper.vm.$refs.minuteInput.innerText).toBe('30');
  });

  test('onHourInput with three digits when 99 is max', async () => {
    const wrapper = shallowMount(EvoconDurationChip, {
      props: {
        modelValue: (1 * 60 * 60) + (30 * 60),
        maxHours: 99,
      },
    }); // 1h 30min
    await flushPromises();

    await wrapper.vm.onHourInput({ target: { innerText: 999 } });
    expect(wrapper.vm.$refs.hourInput.innerText).toBe('99');
    expect(wrapper.vm.hours).toBe(99);
    expect(wrapper.emitted()['update:model-value'][0][0]).toBe((99 * 60 * 60) + (30 * 60));
  });

  test('onHourBlur', async () => {
    const wrapper = shallowMount(EvoconDurationChip, {
      props: { modelValue: (1 * 60 * 60) + (30 * 60) },
    }); // 1h 30min
    await flushPromises();

    wrapper.vm.$refs.hourInput.innerText = '';
    await wrapper.vm.onHourBlur();
    expect(wrapper.vm.$refs.hourInput.innerText).toBe('00');
    expect(wrapper.vm.hours).toBe(0);
    expect(wrapper.emitted()['update:model-value'][0][0]).toBe(30 * 60); // 30min

    wrapper.vm.$refs.hourInput.innerText = '2';
    await wrapper.vm.onHourBlur();
    expect(wrapper.vm.$refs.hourInput.innerText).toBe('02');
    expect(wrapper.vm.hours).toBe(2);
    expect(wrapper.emitted()['update:model-value'][1][0]).toBe((2 * 60 * 60) + (30 * 60)); // 2h30min

    wrapper.vm.$refs.hourInput.innerText = '20';
    await wrapper.vm.onHourBlur();
    expect(wrapper.vm.$refs.hourInput.innerText).toBe('20');
    expect(wrapper.vm.hours).toBe(20);
    expect(wrapper.emitted()['update:model-value'][2][0]).toBe((20 * 60 * 60) + (30 * 60)); // 20h30min
  });

  test('onMinuteInput with edge cases', async () => {
    const wrapper = shallowMount(EvoconDurationChip, {
      props: { modelValue: (1 * 60 * 60) + (30 * 60) },
    }); // 1h 30min
    await flushPromises();

    await wrapper.vm.onMinuteInput({ target: { innerText: 67 } });
    expect(wrapper.vm.$refs.minuteInput.innerText).toBe(59);
    expect(wrapper.vm.minutes).toBe(59);
    expect(wrapper.emitted()['update:model-value'][0][0]).toBe((1 * 60 * 60) + (59 * 60));

    await wrapper.vm.onMinuteInput({ target: { innerText: '0000' } });
    expect(wrapper.vm.$refs.minuteInput.innerText).toBe(59);
    expect(wrapper.vm.minutes).toBe(59);
    expect(wrapper.emitted()['update:model-value'][1][0]).toBe((1 * 60 * 60) + (59 * 60));
  });

  test('onMinuteBlur', async () => {
    const wrapper = shallowMount(EvoconDurationChip, {
      props: { modelValue: (1 * 60 * 60) + (30 * 60) },
    }); // 1h 30min
    await flushPromises();

    wrapper.vm.$refs.minuteInput.innerText = '';
    await wrapper.vm.onMinuteBlur();
    wrapper.vm.$refs.minuteInput.innerText = '';
    expect(wrapper.vm.minutes).toBe(0);
    expect(wrapper.emitted()['update:model-value'][0][0]).toBe((1 * 60 * 60) + (0 * 60)); // 1h00min

    wrapper.vm.$refs.minuteInput.innerText = 2;
    await wrapper.vm.onMinuteBlur();
    wrapper.vm.$refs.minuteInput.innerText = '02';
    expect(wrapper.vm.minutes).toBe(2);
    expect(wrapper.emitted()['update:model-value'][1][0]).toBe((1 * 60 * 60) + (2 * 60)); // 1h02min

    wrapper.vm.$refs.minuteInput.innerText = 20;
    await wrapper.vm.onMinuteBlur();
    wrapper.vm.$refs.minuteInput.innerText = '20';
    expect(wrapper.vm.minutes).toBe(20);
    expect(wrapper.emitted()['update:model-value'][2][0]).toBe((1 * 60 * 60) + (20 * 60)); // 1h20min
  });
});
