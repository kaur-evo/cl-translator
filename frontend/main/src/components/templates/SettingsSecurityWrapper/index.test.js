import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import SettingsSecurityWrapper from './index.vue';

import { useDeviceStore } from '@/stores/index';

const createPinia = () => createTestingPinia({ createSpy: vi.fn });

const defaultProps = {
  sections: [
    { title: 'Section 1', items: [{ id: 1, name: 'Item 1' }] },
    { title: 'Section 2', items: [{ id: 2, name: 'Item 2' }] },
  ],
  isLoading: false,
};

describe('SettingsSecurityWrapper', () => {
  it('renders', () => {
    const wrapper = shallowMount(SettingsSecurityWrapper, {
      global: { plugins: [createPinia()] },
      props: { ...defaultProps },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(SettingsSecurityWrapper, {
      global: { plugins: [createPinia()] },
      props: { ...defaultProps },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile', () => {
    const pinia = createPinia();
    const deviceStore = useDeviceStore(pinia);
    deviceStore.isMobileView = true;

    const wrapper = shallowMount(SettingsSecurityWrapper, {
      global: { plugins: [pinia] },
      props: { ...defaultProps },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when loading', () => {
    const wrapper = shallowMount(SettingsSecurityWrapper, {
      global: { plugins: [createPinia()] },
      props: { ...defaultProps, isLoading: true },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
