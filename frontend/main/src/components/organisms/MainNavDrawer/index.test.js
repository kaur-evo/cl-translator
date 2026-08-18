import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import MainNavDrawer from './index.vue';

import {
  useConfigurationStore, useDeviceStore, useFeatureStore, useProfileStore,
} from '@/stores/index';

vi.mock('@/router', () => ({
  routes: [
    { path: '/', name: 'home', meta: { menuitem: true, menugroup: 'main' } },
    { path: '/dashboard', name: 'dashboard', meta: { menuitem: true, menugroup: 'main' } },
    { path: '/settings', name: 'settings', meta: { menuitem: true, menugroup: 'settings' } },
  ],
}));

const mocks = {
  $route: { meta: { tab: vi.fn() } },
};

const defaultPiniaState = {
  dashboardConfig: { pages: [] },
  profile: { currentUser: { avatar: 'avatar', email: 'email', fullName: 'fullName' } },
};

const createWrapper = ({
  isMobileView = false,
  improvementsEnabled = false,
  highestRoleAllows = () => true,
  checklistStations = [1, 23],
  ...piniaOverrides
} = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
    initialState: { ...defaultPiniaState, ...piniaOverrides },
  });
  useProfileStore(pinia).highestRoleAllows = highestRoleAllows;
  useDeviceStore(pinia).isMobileView = isMobileView;
  useFeatureStore(pinia).improvementsEnabled = improvementsEnabled;
  useConfigurationStore(pinia).checklistStations = checklistStations;

  return shallowMount(MainNavDrawer, {
    global: { plugins: [pinia], mocks },
  });
};

describe('MainNavDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    expect(createWrapper().exists()).toBe(true);
  });

  it('renders correctly', () => {
    expect(createWrapper().element).toMatchSnapshot();
  });

  it('renders correctly in mobile view', () => {
    expect(createWrapper({ isMobileView: true }).element).toMatchSnapshot();
  });

  describe('menuItems', () => {
    let originalLocation;

    beforeEach(() => {
      originalLocation = window.location;
      delete window.location;
      window.location = { ...originalLocation, origin: 'https://mocked-origin.com' };
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2020-01-01T12:34:56.000Z'));
    });

    afterEach(() => {
      window.location = originalLocation;
      vi.useRealTimers();
    });

    it('returns grouped router items including dashboard menu item without newIndicatorShownUntil if none of the tabs have sharedAtISO and no checklist stations', () => {
      const wrapper = createWrapper({
        checklistStations: [],
        dashboardConfig: { pages: [{ id: 1, name: 'Tab 1', sharedAtISO: null }, { id: 2, name: 'Tab 2', sharedAtISO: null }] },
      });

      expect(wrapper.vm.menuItems).toEqual({
        group_main: [
          {
            disabled: false, href: 'https://mocked-origin.com/#/', meta: { menugroup: 'main', menuitem: true }, name: 'home', path: '/',
          },
          {
            disabled: false, href: 'https://mocked-origin.com/#/dashboard', meta: { menugroup: 'main', menuitem: true, newIndicatorShownUntil: null }, name: 'dashboard', path: '/dashboard',
          },
        ],
        group_settings: [
          {
            disabled: false, href: 'https://mocked-origin.com/#/settings', meta: { menugroup: 'settings', menuitem: true }, name: 'settings', path: '/settings',
          },
        ],
      });
    });

    it('returns grouped router items including dashboard menu item with newIndicatorShownUntil if none of the tabs have sharedAtISO and there are checklist stations', () => {
      const wrapper = createWrapper({
        checklistStations: [1, 2],
        dashboardConfig: { pages: [{ id: 1, name: 'Tab 1', sharedAtISO: null }, { id: 2, name: 'Tab 2', sharedAtISO: null }] },
      });

      expect(wrapper.vm.menuItems).toEqual({
        group_main: [
          {
            disabled: false, href: 'https://mocked-origin.com/#/', meta: { menugroup: 'main', menuitem: true }, name: 'home', path: '/',
          },
          {
            disabled: false, href: 'https://mocked-origin.com/#/dashboard', meta: { menugroup: 'main', menuitem: true, newIndicatorShownUntil: '2026-04-01' }, name: 'dashboard', path: '/dashboard',
          },
        ],
        group_settings: [
          {
            disabled: false, href: 'https://mocked-origin.com/#/settings', meta: { menugroup: 'settings', menuitem: true }, name: 'settings', path: '/settings',
          },
        ],
      });
    });

    it('returns grouped router items including dashboard menu item without newIndicatorShownUntil if one of the tabs has sharedAtISO which is more than 30 days ago and there are no checklist stations', () => {
      const wrapper = createWrapper({
        checklistStations: [],
        dashboardConfig: { pages: [{ id: 1, name: 'Tab 1', sharedAtISO: null }, { id: 2, name: 'Tab 2', sharedAtISO: '2019-11-12T00:00:00Z' }] },
      });

      expect(wrapper.vm.menuItems).toEqual({
        group_main: [
          {
            disabled: false, href: 'https://mocked-origin.com/#/', meta: { menugroup: 'main', menuitem: true }, name: 'home', path: '/',
          },
          {
            disabled: false, href: 'https://mocked-origin.com/#/dashboard', meta: { menugroup: 'main', menuitem: true, newIndicatorShownUntil: null }, name: 'dashboard', path: '/dashboard',
          },
        ],
        group_settings: [
          {
            disabled: false, href: 'https://mocked-origin.com/#/settings', meta: { menugroup: 'settings', menuitem: true }, name: 'settings', path: '/settings',
          },
        ],
      });
    });

    it('returns grouped router items including dashboard menu item with newIndicatorShownUntil set to sharedAtISO + 30 days from the only tab that has a sharedAtISO within the last 30 days and there are no checklist stations', () => {
      const wrapper = createWrapper({
        checklistStations: [],
        dashboardConfig: { pages: [{ id: 1, name: 'Tab 1', sharedAtISO: null }, { id: 2, name: 'Tab 2', sharedAtISO: '2019-12-12T00:00:00Z' }] },
      });

      expect(wrapper.vm.menuItems).toEqual({
        group_main: [
          {
            disabled: false, href: 'https://mocked-origin.com/#/', meta: { menugroup: 'main', menuitem: true }, name: 'home', path: '/',
          },
          {
            disabled: false,
            href: 'https://mocked-origin.com/#/dashboard',
            meta: { newIndicatorShownUntil: '2020-01-11T00:00:00.000Z', menugroup: 'main', menuitem: true },
            name: 'dashboard',
            path: '/dashboard',
          },
        ],
        group_settings: [
          {
            disabled: false, href: 'https://mocked-origin.com/#/settings', meta: { menugroup: 'settings', menuitem: true }, name: 'settings', path: '/settings',
          },
        ],
      });
    });

    it('returns grouped router items including dashboard menu item with newIndicatorShownUntil set to sharedAtISO + 30 days from the latest tab that has a sharedAtISO within the last 30 days', () => {
      const wrapper = createWrapper({
        dashboardConfig: { pages: [{ id: 1, name: 'Tab 1', sharedAtISO: '2019-12-24T00:00:00Z' }, { id: 2, name: 'Tab 2', sharedAtISO: '2019-12-12T00:00:00Z' }] },
      });

      expect(wrapper.vm.menuItems).toEqual({
        group_main: [
          {
            disabled: false, href: 'https://mocked-origin.com/#/', meta: { menugroup: 'main', menuitem: true }, name: 'home', path: '/',
          },
          {
            disabled: false,
            href: 'https://mocked-origin.com/#/dashboard',
            meta: { newIndicatorShownUntil: '2020-01-23T00:00:00.000Z', menugroup: 'main', menuitem: true },
            name: 'dashboard',
            path: '/dashboard',
          },
        ],
        group_settings: [
          {
            disabled: false, href: 'https://mocked-origin.com/#/settings', meta: { menugroup: 'settings', menuitem: true }, name: 'settings', path: '/settings',
          },
        ],
      });
    });
  });

  describe('isMenuItemVisible', () => {
    test('that gridview is visible if its not mobile view', () => {
      expect(createWrapper({ isMobileView: false }).vm.isMenuItemVisible({ name: 'gridview' })).toBe(true);
    });

    test('that gridview is not visible if its mobile view', () => {
      expect(createWrapper({ isMobileView: true }).vm.isMenuItemVisible({ name: 'gridview' })).toBe(false);
    });

    test('that gridview is not visible if highestRoleAllows returns false', () => {
      expect(createWrapper({ highestRoleAllows: () => false }).vm.isMenuItemVisible({ name: 'gridview' })).toBe(false);
    });

    test('that improvements is visible if improvementsEnabled is true and highestRoleAllows returns true', () => {
      expect(createWrapper({ improvementsEnabled: true, highestRoleAllows: () => true }).vm.isMenuItemVisible({ name: 'improvements' })).toBe(true);
    });

    test('that improvements is not visible if improvementsEnabled is false and highestRoleAllows returns false', () => {
      expect(createWrapper({ improvementsEnabled: false, highestRoleAllows: () => false }).vm.isMenuItemVisible({ name: 'improvements' })).toBe(false);
    });

    test('that improvements is not visible if improvementsEnabled is false and highestRoleAllows returns true', () => {
      expect(createWrapper({ improvementsEnabled: false, highestRoleAllows: () => true }).vm.isMenuItemVisible({ name: 'improvements' })).toBe(false);
    });
  });
});
