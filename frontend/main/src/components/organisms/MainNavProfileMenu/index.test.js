import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import MainNavProfileMenu from '@/components/organisms/MainNavProfileMenu/index.vue';
import openSupportDialog from '@/helpers/support/openSupportDialog';

vi.mock('@/helpers/support/openSupportDialog', () => ({
  default: vi.fn((val) => val),
  __esModule: true,
}));

const defaultPropsData = {
  email: 'test@email.com',
  fullName: 'full name',
  isUserInfoVisible: true,
};

const createWrapper = (propsData = {}) => mount(MainNavProfileMenu, {
  propsData: { ...defaultPropsData, ...propsData },
  global: {
    plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })],
  },
});

describe('MainNavProfileMenu', () => {
  it('is showing user info in menu', () => {
    const wrapper = createWrapper();

    expect(wrapper.find('#profile-menu-user-name').isVisible()).toBe(true);
    expect(wrapper.find('#profile-menu-user-email').isVisible()).toBe(true);
  });

  it('is showing back button in menu', () => {
    const wrapper = createWrapper({ isUserInfoVisible: false });

    expect(wrapper.find('#profile-menu-back-btn').isVisible()).toBe(true);
  });

  it('is showing all menu items', () => {
    const wrapper = createWrapper({ canEditProfile: true, canSuggestFeature: true });

    expect(wrapper.findAll('.profile-menu-item').length).toBe(3);
    expect(wrapper.vm.visibleMenuItems).toBeDefined();
    expect(wrapper.vm.visibleMenuItems.filter((i) => i.name === 'Suggest a feature').length === 1).toBeTruthy();
    expect(wrapper.vm.visibleMenuItems.filter((i) => i.name === 'Contact support').length === 1).toBeTruthy();
    expect(wrapper.vm.visibleMenuItems.filter((i) => i.name === 'Edit profile').length === 1).toBeTruthy();
  });

  it('is showing all menu items except "Suggest a feature" item', () => {
    const wrapper = createWrapper({ canEditProfile: true, canSuggestFeature: false });

    expect(wrapper.findAll('.profile-menu-item').length).toBe(2);
    expect(wrapper.vm.visibleMenuItems).toBeDefined();
    expect(wrapper.vm.visibleMenuItems.filter((i) => i.name === 'Suggest a feature').length === 0).toBeTruthy();
    expect(wrapper.vm.visibleMenuItems.filter((i) => i.name === 'Contact support').length === 1).toBeTruthy();
    expect(wrapper.vm.visibleMenuItems.filter((i) => i.name === 'Edit profile').length === 1).toBeTruthy();
  });

  it('is showing all menu items except "Edit profile" item', () => {
    const wrapper = createWrapper({ canEditProfile: false, canSuggestFeature: true });

    expect(wrapper.findAll('.profile-menu-item').length).toBe(2);
    expect(wrapper.vm.visibleMenuItems).toBeDefined();
    expect(wrapper.vm.visibleMenuItems.filter((i) => i.name === 'Suggest a feature').length === 1).toBeTruthy();
    expect(wrapper.vm.visibleMenuItems.filter((i) => i.name === 'Contact support').length === 1).toBeTruthy();
    expect(wrapper.vm.visibleMenuItems.filter((i) => i.name === 'Edit profile').length === 0).toBeTruthy();
  });

  it('is showing only "Contact support" item', () => {
    const wrapper = createWrapper({ canEditProfile: false, canSuggestFeature: false });

    expect(wrapper.findAll('.profile-menu-item').length).toBe(1);
    expect(wrapper.vm.visibleMenuItems).toBeDefined();
    expect(wrapper.vm.visibleMenuItems.filter((i) => i.name === 'Suggest a feature').length === 0).toBeTruthy();
    expect(wrapper.vm.visibleMenuItems.filter((i) => i.name === 'Contact support').length === 1).toBeTruthy();
    expect(wrapper.vm.visibleMenuItems.filter((i) => i.name === 'Edit profile').length === 0).toBeTruthy();
  });

  test('that onSupport calls openSupportDialog and emits close-additional-mobile-menu', () => {
    const wrapper = createWrapper();

    wrapper.vm.onSupport();
    expect(wrapper.emitted('close-additional-mobile-menu')).toBeTruthy();
    expect(openSupportDialog).toHaveBeenCalledTimes(1);
  });
});
