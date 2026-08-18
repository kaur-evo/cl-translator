import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import SecondaryNavDrawerWrapper from './index.vue';

import { useDeviceStore } from '@/stores/index';

const createPinia = () => createTestingPinia({ createSpy: vi.fn });

const defaultProps = {
  collapsed: false,
  selectedItem: 'name',
};

describe('SecondaryNavDrawerWrapper', () => {
  it('renders', () => {
    const wrapper = shallowMount(SecondaryNavDrawerWrapper, {
      props: { ...defaultProps },
      global: { plugins: [createPinia()] },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(SecondaryNavDrawerWrapper, {
      props: { ...defaultProps },
      global: { plugins: [createPinia()] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile view', () => {
    const pinia = createPinia();
    const deviceStore = useDeviceStore(pinia);
    deviceStore.isMobileView = true;

    const wrapper = shallowMount(SecondaryNavDrawerWrapper, {
      props: { ...defaultProps },
      global: { plugins: [pinia] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
