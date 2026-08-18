import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { mdiAbTesting, mdiBacteria } from '@mdi/js';

import SettingsOverviewWrapper from './index.vue';

import { createFilterConfiguration } from '@/components/organisms/settings/SettingsFilterBar/FilterBarConfigurations/checklistsFilterBarConf';
import { useDeviceStore } from '@/stores/index';

const createPinia = () => createTestingPinia({ createSpy: vi.fn });

const propsDefault = {
  header: 'Header',
  btnText: 'Primary btn',
  filterConfiguration: createFilterConfiguration(),
};

describe('SettingsOverviewWrapper', () => {
  it('renders', () => {
    const wrapper = shallowMount(SettingsOverviewWrapper, {
      props: { ...propsDefault },
      global: { plugins: [createPinia()] },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(SettingsOverviewWrapper, {
      props: { ...propsDefault },
      global: { plugins: [createPinia()] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile view', () => {
    const pinia = createPinia();
    const deviceStore = useDeviceStore(pinia);
    deviceStore.isMobileView = true;

    const wrapper = shallowMount(SettingsOverviewWrapper, {
      props: { ...propsDefault },
      global: { plugins: [pinia] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with secondary button', () => {
    const wrapper = shallowMount(SettingsOverviewWrapper, {
      props: { ...propsDefault, secondaryBtnText: 'Secondary btn' },
      global: { plugins: [createPinia()] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly without buttons', () => {
    const wrapper = shallowMount(SettingsOverviewWrapper, {
      props: { ...propsDefault, btnText: '' },
      global: { plugins: [createPinia()] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with primary button disabled', () => {
    const wrapper = shallowMount(SettingsOverviewWrapper, {
      props: { ...propsDefault, primaryBtnDisabled: true },
      global: { plugins: [createPinia()] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with empty filterConfig', () => {
    const wrapper = shallowMount(SettingsOverviewWrapper, {
      props: { ...propsDefault, filterConfiguration: new Map() },
      global: { plugins: [createPinia()] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with menuItems', () => {
    const wrapper = shallowMount(SettingsOverviewWrapper, {
      props: { ...propsDefault, menuItems: [{ onClick: vi.fn(), icon: mdiAbTesting, text: 'menu item 1' }, { onClick: vi.fn(), icon: mdiBacteria, text: 'menu item 2' }] },
      global: { plugins: [createPinia()] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with just one item in menuItems', () => {
    const wrapper = shallowMount(SettingsOverviewWrapper, {
      props: { ...propsDefault, menuItems: [{ onClick: vi.fn(), icon: mdiAbTesting, text: 'menu item 1' }] },
      global: { plugins: [createPinia()] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
