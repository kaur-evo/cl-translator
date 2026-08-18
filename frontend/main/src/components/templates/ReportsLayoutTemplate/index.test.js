import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ReportsLayoutTemplate from './index.vue';

import { useDeviceStore } from '@/stores/index';

const createPinia = () => createTestingPinia({ createSpy: vi.fn });

describe('ReportsLayoutTemplate', () => {
  it('renders', () => {
    const wrapper = shallowMount(ReportsLayoutTemplate, {
      global: { plugins: [createPinia()] },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly on large screen', () => {
    const wrapper = shallowMount(ReportsLayoutTemplate, {
      global: { plugins: [createPinia()] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly on medium screen', () => {
    const wrapper = shallowMount(ReportsLayoutTemplate, {
      global: { plugins: [createPinia()] },
    });

    wrapper.vm.$vuetify.display.mdAndDown = true;
    wrapper.vm.$vuetify.display.lgAndDown = false;

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile view', () => {
    const pinia = createPinia();
    const deviceStore = useDeviceStore(pinia);
    deviceStore.isMobileView = true;

    const wrapper = shallowMount(ReportsLayoutTemplate, {
      global: { plugins: [pinia] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly on medium screen when isSideMenuMini is true', () => {
    const wrapper = shallowMount(ReportsLayoutTemplate, {
      global: { plugins: [createPinia()] },
      props: {
        isSideMenuMini: true,
      },
    });

    wrapper.vm.$vuetify.display.mdAndDown = true;
    wrapper.vm.$vuetify.display.lgAndDown = false;

    expect(wrapper.element).toMatchSnapshot();
  });
});
