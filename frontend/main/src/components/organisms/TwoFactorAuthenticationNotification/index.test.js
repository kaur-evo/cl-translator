import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import TwoFactorAuthenticationNotification from './index.vue';

import MFAType from '@/constants/multiFactorAuth';

const mockRouter = {
  push: vi.fn(),
};

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => mockRouter),
}));

const createPinia = (overrides = {}) => createTestingPinia({
  createSpy: vi.fn,
  stubActions: false,
  initialState: {
    profile: {
      currentUser: { twoFactorAuthenticationRequired: true },
      MFAPreference: null,
      ...overrides.profile,
    },
    billing: {
      hasOverdueInvoices: false,
      isLoading: false,
      ...overrides.billing,
    },
  },
});

describe('TwoFactorAuthenticationNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly when visible', async () => {
    const wrapper = shallowMount(TwoFactorAuthenticationNotification, {
      global: {
        plugins: [createPinia({ profile: { MFAPreference: MFAType.NOMFA } })],
      },
    });

    await flushPromises();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when not visible', async () => {
    const wrapper = shallowMount(TwoFactorAuthenticationNotification, {
      global: {
        plugins: [createPinia({ profile: { MFAPreference: MFAType.TOTP } })],
      },
    });

    await flushPromises();

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that navigateToProfile navigates to profile with openMFADialog query param', async () => {
    const wrapper = shallowMount(TwoFactorAuthenticationNotification, {
      global: {
        plugins: [createPinia()],
      },
    });

    await wrapper.vm.navigateToProfile();

    expect(mockRouter.push).toHaveBeenCalledWith({ name: 'profile', query: { openMFADialog: true } });
  });

  describe('isVisible', () => {
    it('returns true when twoFactorAuthenticationRequired is true, MFA is not enabled, and no overdue invoices', async () => {
      const wrapper = shallowMount(TwoFactorAuthenticationNotification, {
        global: {
          plugins: [createPinia({
            profile: {
              currentUser: { twoFactorAuthenticationRequired: true },
              MFAPreference: MFAType.NOMFA,
            },
            billing: { hasOverdueInvoices: false },
          })],
        },
      });

      await flushPromises();

      expect(wrapper.vm.isVisible).toBe(true);
    });

    it('returns false when twoFactorAuthenticationRequired is false', async () => {
      const wrapper = shallowMount(TwoFactorAuthenticationNotification, {
        global: {
          plugins: [createPinia({
            profile: {
              currentUser: { twoFactorAuthenticationRequired: false },
              MFAPreference: MFAType.NOMFA,
            },
          })],
        },
      });

      await flushPromises();

      expect(wrapper.vm.isVisible).toBe(false);
    });

    it('returns false when MFA is enabled', async () => {
      const wrapper = shallowMount(TwoFactorAuthenticationNotification, {
        global: {
          plugins: [createPinia({
            profile: {
              currentUser: { twoFactorAuthenticationRequired: true },
              MFAPreference: MFAType.TOTP,
            },
          })],
        },
      });

      await flushPromises();

      expect(wrapper.vm.isVisible).toBe(false);
    });

    it('returns false when hasOverdueInvoices is true', async () => {
      const wrapper = shallowMount(TwoFactorAuthenticationNotification, {
        global: {
          plugins: [createPinia({
            profile: {
              currentUser: { twoFactorAuthenticationRequired: true },
              MFAPreference: MFAType.NOMFA,
            },
            billing: { hasOverdueInvoices: true },
          })],
        },
      });

      await flushPromises();

      expect(wrapper.vm.isVisible).toBe(false);
    });

    it('returns false when isBillingLoading is true', async () => {
      const wrapper = shallowMount(TwoFactorAuthenticationNotification, {
        global: {
          plugins: [createPinia({
            profile: {
              currentUser: { twoFactorAuthenticationRequired: true },
              MFAPreference: MFAType.NOMFA,
            },
            billing: { loading: ['fetching'] },
          })],
        },
      });

      await flushPromises();

      expect(wrapper.vm.isVisible).toBe(false);
    });

    it('returns false when MFAPreference is null (status unknown)', async () => {
      const wrapper = shallowMount(TwoFactorAuthenticationNotification, {
        global: {
          plugins: [createPinia({
            profile: {
              currentUser: { twoFactorAuthenticationRequired: true },
              MFAPreference: null,
            },
            billing: { hasOverdueInvoices: false, isLoading: false },
          })],
        },
      });

      await flushPromises();

      expect(wrapper.vm.isVisible).toBe(false);
    });
  });
});
