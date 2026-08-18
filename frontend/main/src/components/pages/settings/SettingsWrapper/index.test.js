import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import SettingsWrapper from './index.vue';

import useDeviceStore from '@/stores/device';

const $router = {};
const $route = {
  name: 'testOverview',
  query: { isGroupEdit: 'false' },
};
const mocks = { $router, $route };

const createPinia = (overrides = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
    initialState: {
      profile: {
        currentUser: { roles: { 0: overrides.role || 'COMPANY_ADMIN' } },
        highestUserRole: overrides.role || 'COMPANY_ADMIN',
      },
      device: {
        screen: overrides.screen || { width: 1920, height: 1080 },
      },
      routeModule: {},
    },
  });
  useDeviceStore(pinia).isMobileView = overrides.screen?.width < 768;
  return pinia;
};

describe('SettingsWrapper', () => {
  it('renders correctly in main view', () => {
    const wrapper = shallowMount(SettingsWrapper, {
      global: {
        plugins: [createPinia()],
        mocks: {
          ...mocks,
          $route: { name: 'settings' },
        },
        stubs: ['router-link', 'router-view'],
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in a view where side menu is visible', () => {
    const wrapper = shallowMount(SettingsWrapper, {
      global: {
        plugins: [createPinia()],
        mocks: { ...mocks, $route: { ...$route, meta: { isSideMenuVisible: true } } },
        stubs: ['router-link', 'router-view'],
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in a view where side menu is not visible', () => {
    const wrapper = shallowMount(SettingsWrapper, {
      global: {
        plugins: [createPinia()],
        mocks,
        stubs: ['router-link', 'router-view'],
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if side menu is visible for view, but not allowed for user', () => {
    const wrapper = shallowMount(SettingsWrapper, {
      global: {
        plugins: [createPinia({ role: 'LINEVIEW_USER' })],
        mocks: { ...mocks, $route: { ...$route, meta: { isSideMenuVisible: true } } },
        stubs: ['router-link', 'router-view'],
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in groupEdit', () => {
    const wrapper = shallowMount(SettingsWrapper, {
      global: {
        plugins: [createPinia()],
        mocks: { ...mocks, $route: { ...$route, meta: { isSideMenuVisible: true }, query: { isGroupEdit: 'true' } } },
        stubs: ['router-link', 'router-view'],
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile view', () => {
    const wrapper = shallowMount(SettingsWrapper, {
      global: {
        plugins: [createPinia({ screen: { width: 400, height: 800 } })],
        mocks: { ...mocks, $route: { ...$route, meta: { isSideMenuVisible: true } } },
        stubs: ['router-link', 'router-view'],
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
