import { flushPromises, shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import SettingsProfileEdit from './index.vue';

import MFAType from '@/constants/multiFactorAuth';
import securityProfilesApi from '@/api/securityProfilesApi';

vi.mock('@/api/securityProfilesApi');

const router = {
  $router: {
    push: vi.fn(),
    go: vi.fn(),
  },
};

const route = {
  $route: {
    query: {},
  },
};

const currentUser = {
  avatar: '',
  fullName: 'John Doe',
  email: 'john@doe.net',
  username: 'john.doe@factory',
  language: 'et',
  defaultStationId: 2,
  startPage: 'settings',
  decimalPlaces: 1,
  pctDecimalPlaces: 0,
  groupSeparator: ',',
  decimalSeparator: '.',
  dateFormat: 'YYYY-MM-DD',
  firstDayOfWeek: '0',
  timeFormat: 12,
  roles: { 0: 'COMPANY_ADMIN' },
  securityProfileId: null,
  twoFactorAuthenticationRequired: false,
};

const defaultPiniaInitialState = {
  profile: { currentUser, highestUserRole: 'COMPANY_ADMIN' },
  securityProfile: {
    securityProfiles: [
      { id: 1, name: 'Default Profile', singleSignOnRequired: false, twoFactorAuthenticationRequired: false, absoluteTimeoutMinutes: null },
      { id: 2, name: 'Secure Profile', singleSignOnRequired: true, twoFactorAuthenticationRequired: false, absoluteTimeoutMinutes: 2880 },
    ],
  },
  feature: { securitySettings: true },
};

describe('SettingsProfileEdit', () => {
  let pinia;

  beforeEach(() => {
    // Return the same profiles so fetchSecurityProfiles (called in mounted) preserves initialState
    securityProfilesApi.getSecurityProfiles.mockResolvedValue(defaultPiniaInitialState.securityProfile.securityProfiles);
    pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaInitialState });
  });

  it('renders', () => {
    const wrapper = shallowMount(SettingsProfileEdit, {
      global: {
        plugins: [pinia],
        mocks: { ...router, ...route },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', async () => {
    const wrapper = shallowMount(SettingsProfileEdit, {
      global: {
        plugins: [pinia],
        mocks: { ...router, ...route },
        stubs: { 'form-page-template': false },
      },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly wiht sso providers', async () => {
    const wrapper = shallowMount(SettingsProfileEdit, {
      global: {
        plugins: [pinia],
        mocks: { ...router, ...route },
        stubs: { 'form-page-template': false },
      },
    });

    await wrapper.setData({
      providerLinks: [
        { providerName: 'Google', userId: 'google user id' },
        { providerName: 'Facebook', userId: 'fb user id' },
        { providerName: 'GitHub', userId: 'github user id' },
      ],
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with MFA reset button visible', async () => {
    const localPinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        ...defaultPiniaInitialState,
        profile: {
          ...defaultPiniaInitialState.profile,
          currentUser: { ...currentUser, twoFactorAuthenticationRequired: true },
          MFAPreference: MFAType.TOTP,
        },
      },
    });
    const wrapper = shallowMount(SettingsProfileEdit, {
      global: {
        plugins: [localPinia],
        mocks: { ...router, ...route },
        stubs: { 'form-page-template': false },
      },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if security settings are disabled', async () => {
    const localPinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        ...defaultPiniaInitialState,
        feature: { securitySettings: false },
      },
    });
    const wrapper = shallowMount(SettingsProfileEdit, {
      global: {
        plugins: [localPinia],
        mocks: { ...router, ...route },
        stubs: { 'form-page-template': false },
      },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('sets correct formData on mount', () => {
    const wrapper = shallowMount(SettingsProfileEdit, {
      global: {
        plugins: [pinia],
        mocks: { ...router, ...route },
      },
    });

    Object.keys(wrapper.vm.formData).forEach((key) => {
      expect(wrapper.vm.formData[key]).toEqual(currentUser[key]);
    });
  });

  describe('goBack', () => {
    it('navigates to settings if highestRoleAllows returns true', () => {
      const wrapper = shallowMount(SettingsProfileEdit, {
        global: {
          plugins: [pinia],
          mocks: { ...router, ...route },
        },
      });

      wrapper.vm.goBack();
      expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: 'settings' });
    });

    it('goes back one step if highestRoleAllows returns false', () => {
      const localPinia = createTestingPinia({
        createSpy: vi.fn,
        stubActions: false,
        initialState: {
          ...defaultPiniaInitialState,
          profile: { ...defaultPiniaInitialState.profile, highestUserRole: null },
        },
      });
      const wrapper = shallowMount(SettingsProfileEdit, {
        global: {
          plugins: [localPinia],
          mocks: { ...router, ...route },
        },
      });

      wrapper.vm.goBack();
      expect(wrapper.vm.$router.go).toHaveBeenCalledWith(-1);
    });
  });

  test('that current user does not have duplicated role names, when user has same roles for different factories', () => {
    const localPinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        ...defaultPiniaInitialState,
        profile: {
          ...defaultPiniaInitialState.profile,
          currentUser: { ...currentUser, roles: { 11: 'COMPANY_ADMIN', 13: 'COMPANY_ADMIN' } },
        },
      },
    });
    const wrapper = shallowMount(SettingsProfileEdit, {
      global: {
        plugins: [localPinia],
        mocks: { ...router, ...route },
      },
    });

    expect(wrapper.vm.currentUserRoles).toEqual(['COMPANY_ADMIN']);
  });

  test('that current user has multiple role names, when user has different roles for different factories', () => {
    const localPinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        ...defaultPiniaInitialState,
        profile: {
          ...defaultPiniaInitialState.profile,
          currentUser: { ...currentUser, roles: { 11: 'FACTORY_ADMIN', 13: 'OFFICE_USER' } },
        },
      },
    });
    const wrapper = shallowMount(SettingsProfileEdit, {
      global: {
        plugins: [localPinia],
        mocks: { ...router, ...route },
      },
    });

    expect(wrapper.vm.currentUserRoles).toEqual(['FACTORY_ADMIN', 'OFFICE_USER']);
  });
});
