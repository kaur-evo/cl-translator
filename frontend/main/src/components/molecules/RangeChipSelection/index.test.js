import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import RangeChipSelection from './index.vue';

import { useDeviceStore } from '@/stores/index';

const createPinia = ({ isMobileView = false } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });
  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = isMobileView;
  return pinia;
};

const defaultProps = {
  rangeLabel: 'Range',
  isChipActive: true,
  previousDisabled: false,
  nextDisabled: false,
  isOpen: false,
};

describe('RangeChipSelection', () => {
  it('renders', () => {
    const wrapper = shallowMount(RangeChipSelection, {
      global: {
        plugins: [createPinia()],
      },
      props: defaultProps,
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(RangeChipSelection, {
      global: {
        plugins: [createPinia()],
      },
      props: defaultProps,
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when open', () => {
    const wrapper = shallowMount(RangeChipSelection, {
      global: {
        plugins: [createPinia()],
      },
      props: { ...defaultProps, isOpen: true },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile view', () => {
    const wrapper = shallowMount(RangeChipSelection, {
      global: {
        plugins: [createPinia({ isMobileView: true })],
      },
      props: defaultProps,
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile view when open', () => {
    const wrapper = shallowMount(RangeChipSelection, {
      global: {
        plugins: [createPinia({ isMobileView: true })],
      },
      props: { ...defaultProps, isOpen: true },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('onClick', () => {
    it('emits update:isOpen with true if isMobileView is true', () => {
      const wrapper = shallowMount(RangeChipSelection, {
        global: {
          plugins: [createPinia({ isMobileView: true })],
        },
        props: defaultProps,
      });
      wrapper.vm.onClick();
      expect(wrapper.emitted('update:isOpen')).toEqual([[true]]);
    });

    it('does not emit update:isOpen with true if isMobileView is false', () => {
      const wrapper = shallowMount(RangeChipSelection, {
        global: {
          plugins: [createPinia()],
        },
        props: defaultProps,
      });
      wrapper.vm.onClick();
      expect(wrapper.emitted('update:isOpen')).toBeUndefined();
    });
  });
});
