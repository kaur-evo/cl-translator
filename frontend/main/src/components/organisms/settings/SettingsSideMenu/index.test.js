import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { nextTick } from 'vue';

import SettingsSideMenu from './index.vue';

import useProfileStore from '@/stores/profile';
import useSettingsSideMenuStore from '@/stores/settingsSideMenu';

vi.mock('@/components/pages/settings/SettingsMain/settingsTexts', () => ({
  default: () => ([
    [{ id: 'comments', visible: true, subItems: [{ id: 'commentTags' }, { id: 'commentNotes' }] }, { id: 'checklists' }],
    [{ id: 'activitylogs', visible: true, subItems: [{ id: 'shiftview' }, { id: 'settings' }] }],
  ]),
}));

const $route = {
  path: '/settings/products',
};
const mocks = {
  $route,
};

const createWrapper = (options = {}) => {
  const { isCollapsed = false, stubWrapper = false, routeOverride } = options;
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: {
      feature: {
        checklists: true, alerts: true, tags: true, qualityYield: true, apiAccess: true, activityLogs: true,
      },
    },
  });
  const profileStore = useProfileStore(pinia);
  profileStore.currentUser = { fullName: 'Testing User', roles: { 0: 'COMPANY_ADMIN' } };
  profileStore.highestRoleAllows = () => true;
  const sideMenuStore = useSettingsSideMenuStore(pinia);
  sideMenuStore.isCollapsed = isCollapsed;

  const stubs = stubWrapper ? { 'secondary-nav-drawer-wrapper': false } : {};

  return shallowMount(SettingsSideMenu, {
    global: {
      plugins: [pinia],
      mocks: routeOverride ? { $route: routeOverride } : mocks,
      stubs,
    },
  });
};

describe('SettingsSideMenu', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: { getItem: vi.fn().mockReturnValue(null), setItem: vi.fn() },
      writable: true,
    });
  });

  it('mounts', async () => {
    const wrapper = createWrapper();
    wrapper.vm.$vuetify.display.mdAndDown = false;
    await nextTick();
    expect(wrapper.exists()).toBe(true);
  });

  it('mounts correctly when small collapsed view', async () => {
    const wrapper = createWrapper({ isCollapsed: true, stubWrapper: true });
    wrapper.vm.$vuetify.display.mdAndDown = true;
    await nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('mounts correctly when small not collapsed view', async () => {
    const wrapper = createWrapper({ stubWrapper: true });
    wrapper.vm.$vuetify.display.mdAndDown = true;
    await nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('mounts correctly when collapsed large view', async () => {
    const wrapper = createWrapper({ isCollapsed: true, stubWrapper: true });
    wrapper.vm.$vuetify.display.mdAndDown = false;
    await nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('mounts correctly when not collapsed large view', async () => {
    const wrapper = createWrapper({ stubWrapper: true });
    wrapper.vm.$vuetify.display.mdAndDown = false;
    await nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('subModule', () => {
    it('returns undefined when route path does not have third item', () => {
      const wrapper = createWrapper({ routeOverride: { path: '/settings/products' } });
      expect(wrapper.vm.subModule).toBeUndefined();
    });

    it('returns the third item of the route path when it exists', () => {
      const wrapper = createWrapper({ routeOverride: { path: '/settings/products/subitem' } });
      expect(wrapper.vm.subModule).toBe('subitem');
    });
  });

  test('that setDefaultOpenedDrawerItems adds all those modules ids to openedDrawerItems array, that have subItems', () => {
    const wrapper = createWrapper();
    wrapper.vm.openedDrawerItems = [];
    wrapper.vm.setDefaultOpenedDrawerItems();
    expect(wrapper.vm.openedDrawerItems).toEqual(['comments', 'activitylogs']);
  });

  describe('onOpenedDrawerItemsUpdate', () => {
    it('removes an id from openedDrawerItems array if it is already present', () => {
      const wrapper = createWrapper();
      wrapper.vm.openedDrawerItems = ['comments', 'activitylogs'];
      wrapper.vm.onOpenedDrawerItemsUpdate('comments');
      expect(wrapper.vm.openedDrawerItems).toEqual(['activitylogs']);
    });

    it('adds an id to openedDrawerItems array if it is not already present', () => {
      const wrapper = createWrapper();
      wrapper.vm.openedDrawerItems = ['comments', 'activitylogs'];
      wrapper.vm.onOpenedDrawerItemsUpdate('checklists');
      expect(wrapper.vm.openedDrawerItems).toEqual(['comments', 'activitylogs', 'checklists']);
    });
  });
});
