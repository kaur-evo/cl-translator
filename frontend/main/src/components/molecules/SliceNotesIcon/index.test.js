import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import SliceNotesIcon from './index.vue';

import createGlobal from '@/helpers/createGlobal';
import { useDeviceStore } from '@/stores/index';

const global = createGlobal();

const createWrapper = (options) => shallowMount(SliceNotesIcon, {
  global: { ...global },
  ...options,
});

const propsDefault = {
  sliceWidth: 50,
};

describe('SliceNotesIcon', () => {
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

  it('renders correctly in mobile view', () => {
    const pinia = createTestingPinia({ createSpy: vi.fn });
    const deviceStore = useDeviceStore(pinia);
    deviceStore.isMobileView = true;

    const wrapper = shallowMount(SliceNotesIcon, {
      global: { plugins: [pinia] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
