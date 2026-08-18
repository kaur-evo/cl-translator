import { shallowMount } from '@vue/test-utils';
import { useRouter } from 'vue-router';
import { mdiPencil, mdiDelete } from '@mdi/js';
import { createTestingPinia } from '@pinia/testing';

import SettingsSecurityProfilesOverview from './index.vue';

import useSecurityProfileStore from '@/stores/securityProfile';
import useConfirmDialogStore from '@/stores/confirmDialog';
import useGenericDialogStore from '@/stores/genericDialog';

vi.mock('vue-router', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/api/securityProfilesApi', () => ({
  default: {
    getSecurityProfiles: vi.fn().mockResolvedValue([]),
    deleteSecurityProfile: vi.fn().mockResolvedValue(),
  },
}));

const defaultPiniaState = {
  securityProfile: {
    securityProfiles: [
      { id: 1, name: 'Default Profile', singleSignOnRequired: false, twoFactorAuthenticationRequired: false, absoluteTimeoutMinutes: null },
      { id: 2, name: 'Admin Profile', singleSignOnRequired: true, twoFactorAuthenticationRequired: false, absoluteTimeoutMinutes: 2880 },
    ],
    loading: [],
  },
  profile: { currentUser: { roles: { 0: 'COMPANY_ADMIN' } } },
};

const createWrapper = (stateOverrides = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
    initialState: { ...defaultPiniaState, ...stateOverrides },
  });
  return shallowMount(SettingsSecurityProfilesOverview, {
    global: { plugins: [pinia] },
  });
};

describe('SettingsSecurityProfilesOverview.vue', () => {
  it('renders', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: { ...defaultPiniaState },
    });
    const wrapper = shallowMount(SettingsSecurityProfilesOverview, {
      global: {
        plugins: [pinia],
        stubs: { 'settings-security-wrapper': false },
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if securityProfiles is empty', () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        ...defaultPiniaState,
        securityProfile: { securityProfiles: [], loading: [] },
      },
    });
    const wrapper = shallowMount(SettingsSecurityProfilesOverview, {
      global: {
        plugins: [pinia],
        stubs: { 'settings-security-wrapper': false },
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('that cardListButtons returns correct list', () => {
    const wrapper = createWrapper();
    expect(wrapper.vm.cardListButtons).toEqual([
      {
        icon: mdiPencil,
        text: 'Edit',
        tooltip: 'Edit',
        action: expect.any(Function),
      },
      {
        icon: mdiDelete,
        text: 'Delete',
        tooltip: 'Delete',
        action: expect.any(Function),
      },
    ]);
  });

  describe('getSubtitleKeyValuePairs', () => {
    it('returns correct key-value pairs for item without absoluteTimeoutMinutes', () => {
      const wrapper = createWrapper();
      const item = { id: 1, name: 'Default Profile', singleSignOnRequired: false, twoFactorAuthenticationRequired: true, absoluteTimeoutMinutes: null };
      const result = wrapper.vm.getSubtitleKeyValuePairs(item);
      expect(result).toEqual([{ key: '2FA', value: 'Yes' }, { key: 'SSO', value: 'No' }]);
    });

    it('returns correct key-value pairs for item with absoluteTimeoutMinutes', () => {
      const wrapper = createWrapper();
      const item = { id: 2, name: 'Admin Profile', singleSignOnRequired: true, twoFactorAuthenticationRequired: false, absoluteTimeoutMinutes: 2880 };
      const result = wrapper.vm.getSubtitleKeyValuePairs(item);
      expect(result).toEqual([{ key: '2FA', value: 'No' }, { key: 'SSO', value: 'Yes' }, { key: 'Log out', value: '2 daysGenitive' }]);
    });
  });

  describe('onEdit', () => {
    it('calls openDialog with correct item when item is provided', () => {
      const wrapper = createWrapper();
      const genericDialogStore = useGenericDialogStore();
      const spy = vi.spyOn(genericDialogStore, 'openDialog');
      const item = { id: 123 };
      wrapper.vm.onEdit({ item });

      expect(spy).toHaveBeenCalledWith(expect.objectContaining({
        allowFullscreen: true,
        width: 900,
        data: { item },
      }));
    });

    it('calls openDialog with empty object when no item is provided', () => {
      const wrapper = createWrapper();
      const genericDialogStore = useGenericDialogStore();
      const spy = vi.spyOn(genericDialogStore, 'openDialog');
      wrapper.vm.onEdit({});

      expect(spy).toHaveBeenCalledWith(expect.objectContaining({
        allowFullscreen: true,
        width: 900,
        data: { item: {} },
      }));
    });

    it('calls openDialog with empty object when no argument is provided', () => {
      const wrapper = createWrapper();
      const genericDialogStore = useGenericDialogStore();
      const spy = vi.spyOn(genericDialogStore, 'openDialog');
      wrapper.vm.onEdit();

      expect(spy).toHaveBeenCalledWith(expect.objectContaining({
        allowFullscreen: true,
        width: 900,
        data: { item: {} },
      }));
    });
  });

  test('that onDelete calls openConfirmDialog with correct dialog config', () => {
    const wrapper = createWrapper();
    const confirmDialogStore = useConfirmDialogStore();
    const spy = vi.spyOn(confirmDialogStore, 'openConfirmDialog');
    const item = { id: 456, name: 'Test Profile' };
    wrapper.vm.onDelete({ item });

    expect(spy).toHaveBeenCalledWith({
      title: 'Confirmation',
      text: 'Are you sure you want to delete {value}?',
      action: expect.any(Function),
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });
  });

  test('that deleteProfile calls deleteSecurityProfile', async () => {
    const wrapper = createWrapper();
    const securityProfileStore = useSecurityProfileStore();
    const spy = vi.spyOn(securityProfileStore, 'deleteSecurityProfile');
    const item = { id: 789, name: 'Another Profile' };
    await wrapper.vm.deleteProfile(item);

    expect(spy).toHaveBeenCalledWith(item);
  });

  test('that goBack calls router.push with securityOverview', () => {
    const router = { push: vi.fn() };
    useRouter.mockReturnValue(router);

    const wrapper = createWrapper();
    wrapper.vm.goBack();

    expect(router.push).toHaveBeenCalledWith({ name: 'securityOverview' });
  });

  test('that onInfoClick calls window.open with correct params', () => {
    const wrapper = createWrapper();
    window.open = vi.fn();

    wrapper.vm.onInfoClick();
    expect(window.open).toHaveBeenCalledWith('https://support.evocon.com/Managing-security-settings-2cbdae0ba80280ffb49ec903a7b0216d?pvs=73', '_blank');

    window.open.mockRestore();
  });

  test('that onMounted fetches security profiles', () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: true,
      initialState: { ...defaultPiniaState },
    });
    shallowMount(SettingsSecurityProfilesOverview, {
      global: { plugins: [pinia] },
    });
    const securityProfileStore = useSecurityProfileStore();
    expect(securityProfileStore.fetchSecurityProfiles).toHaveBeenCalled();
  });
});
