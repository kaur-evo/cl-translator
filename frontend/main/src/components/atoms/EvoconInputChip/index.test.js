import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';

import EvoconInputChip from './index.vue';

describe('EvoconInputChip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders correctly if input value is missing', () => {
    const wrapper = shallowMount(EvoconInputChip, {
      props: {
        modelValue: '',
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if input value is present', () => {
    const wrapper = shallowMount(EvoconInputChip, {
      props: {
        modelValue: 'Test',
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if input has bottom border', () => {
    const wrapper = shallowMount(EvoconInputChip, {
      props: {
        modelValue: '',
        inputWithBottomBorder: true,
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if it is plain input chip', () => {
    const wrapper = shallowMount(EvoconInputChip, {
      props: {
        modelValue: '',
        isPlainInputChip: true,
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if it is dynamic chip', () => {
    const wrapper = shallowMount(EvoconInputChip, {
      props: {
        modelValue: '',
        isDynamicChip: true,
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if it is dynamic chip and input is opened', () => {
    const wrapper = shallowMount(EvoconInputChip, {
      props: {
        modelValue: 'Test',
        isDynamicChip: true,
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if it is disabled', () => {
    const wrapper = shallowMount(EvoconInputChip, {
      props: {
        modelValue: '',
        disabled: true,
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('update:input-chip-opened', () => {
    it('is emitted when isInputOpened is becoming true after clickedOpen is set to true', async () => {
      const wrapper = shallowMount(EvoconInputChip, {
        props: {
          modelValue: '',
        },
      });

      expect(wrapper.vm.isInputOpened).toBe(false);

      wrapper.vm.clickedOpen = true;

      expect(wrapper.vm.isInputOpened).toBe(true);

      await nextTick();
      vi.advanceTimersByTime(500);
      await nextTick();

      expect(wrapper.emitted('update:input-chip-opened')).toBeTruthy();
    });

    it('is emitted when isInputOpened is becoming false after modelValue is set to empty string', async () => {
      const wrapper = shallowMount(EvoconInputChip, {
        props: {
          modelValue: 'test',
        },
      });

      expect(wrapper.vm.isInputOpened).toBe(true);

      await wrapper.setProps({ modelValue: '' });

      expect(wrapper.vm.isInputOpened).toBe(false);

      expect(wrapper.emitted('update:input-chip-opened')).toBeTruthy();
    });
  });
});
