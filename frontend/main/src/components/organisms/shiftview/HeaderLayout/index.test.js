import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { nextTick } from 'vue';

import HeaderLayout from './index.vue';

import { useDeviceStore } from '@/stores/index';

const createWrapper = (options = {}, pinia = createTestingPinia({ createSpy: vi.fn })) => shallowMount(HeaderLayout, {
  global: { plugins: [pinia] },
  ...options,
});

const propsDefault = {
  status: 'online',
};

describe('HeaderLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper({ props: { ...propsDefault } });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly in mobile portrait', () => {
    const pinia = createTestingPinia({ createSpy: vi.fn });
    const deviceStore = useDeviceStore(pinia);
    vi.spyOn(deviceStore, 'isMobileView', 'get').mockReturnValue(true);

    const wrapper = createWrapper({ props: { ...propsDefault } }, pinia);

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in XXL view', () => {
    const pinia = createTestingPinia({ createSpy: vi.fn });
    const deviceStore = useDeviceStore(pinia);
    vi.spyOn(deviceStore, 'isXXLView', 'get').mockReturnValue(true);

    const wrapper = createWrapper({ props: { ...propsDefault } }, pinia);

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if screen size is mdAndUp', () => {
    const wrapper = createWrapper({ props: { ...propsDefault } });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if screen size is not mdAndUp', async () => {
    const wrapper = createWrapper({ props: { ...propsDefault } });

    wrapper.vm.$vuetify.display.mdAndUp = false;
    await nextTick();

    expect(wrapper.element).toMatchSnapshot();
  });
});
