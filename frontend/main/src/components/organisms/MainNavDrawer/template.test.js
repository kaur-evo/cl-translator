import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import template from './template.vue';

import { useProfileStore } from '@/stores/index';

const defaultMocks = {
  $route: { name: vi.fn() },
};

const defaultPiniaState = {
  releasesInfo: { lastRelease: {} },
  mainNavDrawerConfig: { drawerOpen: false },
};

const propsDefault = {
  avatar: 'string',
  email: 'string',
  fullName: 'Hello user!',
  canEditProfile: true,
  canSuggestFeature: true,
  menuItems: {
    group_bottom: [
      {
        name: 'bottom1', disabled: false, meta: { icon: 'icon', title: () => 'Bottom item 1' }, newIndicatorShownUntil: '2021-12-31',
      },
    ],
    group_middle: [
      { name: 'middle1', disabled: false, meta: { icon: 'icon', title: () => 'Middle item 1', newIndicatorShownUntil: '2022-01-24' } },
      { name: 'middle2', disabled: false, meta: { icon: 'icon', title: () => 'Middle item 2' } },
    ],
  },
};

const createWrapper = ({
  props, mocks, highestRoleAllows = () => true, ...piniaOverrides
} = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
    initialState: { ...defaultPiniaState, ...piniaOverrides },
  });
  useProfileStore(pinia).highestRoleAllows = highestRoleAllows;

  return shallowMount(template, {
    props: { ...propsDefault, ...props },
    global: {
      plugins: [pinia],
      mocks: { ...defaultMocks, ...mocks },
    },
  });
};

describe('template', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    expect(createWrapper().exists()).toBe(true);
  });

  it('renders correctly', () => {
    expect(createWrapper().element).toMatchSnapshot();
  });

  test('that evocon logo is visible and close icon is hidden if menu is closed', () => {
    const wrapper = createWrapper({ mainNavDrawerConfig: { drawerOpen: false } });

    expect(wrapper.find('#evocon-logo').classes('hidden')).toBe(false);
    expect(wrapper.find('#app-close-menu').classes('hidden')).toBe(true);
  });

  test('that evocon logo is hidden and close icon is visible if menu is open', () => {
    const wrapper = createWrapper({ mainNavDrawerConfig: { drawerOpen: true } });

    expect(wrapper.find('#evocon-logo').classes('hidden')).toBe(true);
    expect(wrapper.find('#app-close-menu').classes('hidden')).toBe(false);
  });

  test('isActive in settings main view', () => {
    const wrapper = createWrapper({
      mocks: { $route: { name: 'settings', matched: [{ name: 'settings' }] } },
    });

    expect(wrapper.vm.isActive({ name: 'dashboard', matched: [] })).toBe(false);
    expect(wrapper.vm.isActive({ name: 'shiftview', matched: [] })).toBe(false);
    expect(wrapper.vm.isActive({ name: 'settings', matched: [] })).toBe(true);
  });

  test('isActive in settings module view', () => {
    const wrapper = createWrapper({
      mocks: { $route: { name: 'moduleView', matched: [{ name: 'settings' }, { name: 'moduleView' }] } },
    });

    expect(wrapper.vm.isActive({ name: 'dashboard', matched: [] })).toBe(false);
    expect(wrapper.vm.isActive({ name: 'shiftview', matched: [] })).toBe(false);
    expect(wrapper.vm.isActive({ name: 'settings', matched: [] })).toBe(true);
  });
});
