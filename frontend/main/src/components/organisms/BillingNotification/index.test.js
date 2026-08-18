import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import BillingNotification from './index.vue';

import useBillingStore from '@/stores/billing';
import useProfileStore from '@/stores/profile';

const createPinia = ({
  hasOverdueInvoices = false,
  overdueInvoiceNotificationEnabled = true,
  highestRoleAllows = true,
} = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
    initialState: {
      billing: { hasOverdueInvoices },
      feature: { overdueInvoiceNotificationEnabled },
    },
  });
  const profileStore = useProfileStore(pinia);
  profileStore.highestRoleAllows = vi.fn(() => highestRoleAllows);
  return pinia;
};

describe('BillingNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('snapshots', () => {
    it('renders correctly when visible', () => {
      const wrapper = shallowMount(BillingNotification, {
        global: {
          plugins: [createPinia({ hasOverdueInvoices: true })],
        },
      });

      expect(wrapper.element).toMatchSnapshot();
    });

    it('renders correctly when not visible', () => {
      const wrapper = shallowMount(BillingNotification, {
        global: {
          plugins: [createPinia({ hasOverdueInvoices: false })],
        },
      });

      expect(wrapper.element).toMatchSnapshot();
    });
  });

  test('that setBillingStatus calls billingStore.setBillingStatus with data', () => {
    const pinia = createPinia();
    const billingStore = useBillingStore(pinia);
    const wrapper = shallowMount(BillingNotification, {
      global: {
        plugins: [pinia],
        mocks: { $t: (msg) => msg },
      },
    });

    const testData = { overdueInvoices: [{ id: 1 }] };
    wrapper.vm.setBillingStatus(testData);

    expect(billingStore.setBillingStatus).toHaveBeenCalledWith(testData);
  });

  describe('isVisible', () => {
    it('returns true when hasOverdueInvoices is true', () => {
      const wrapper = shallowMount(BillingNotification, {
        global: {
          plugins: [createPinia({ hasOverdueInvoices: true })],
        },
      });

      expect(wrapper.vm.isVisible).toBe(true);
    });

    it('returns false when hasOverdueInvoices is false', () => {
      const wrapper = shallowMount(BillingNotification, {
        global: {
          plugins: [createPinia({ hasOverdueInvoices: false })],
        },
      });

      expect(wrapper.vm.isVisible).toBe(false);
    });
  });

  describe('onMounted', () => {
    it('does not dispatch fetchBillingStatus when overdueInvoiceNotificationEnabled is false', async () => {
      const pinia = createPinia({ overdueInvoiceNotificationEnabled: false });
      const billingStore = useBillingStore(pinia);

      shallowMount(BillingNotification, {
        global: {
          plugins: [pinia],
        },
      });

      await flushPromises();

      expect(billingStore.fetchBillingStatus).not.toHaveBeenCalled();
    });

    it('does not fetch billing status when highestRoleAllows is false', async () => {
      const pinia = createPinia({ highestRoleAllows: false });
      const billingStore = useBillingStore(pinia);

      shallowMount(BillingNotification, {
        global: {
          plugins: [pinia],
        },
      });

      await flushPromises();

      expect(billingStore.fetchBillingStatus).not.toHaveBeenCalled();
    });

    it('dispatches fetchBillingStatus when overdueInvoiceNotificationEnabled and highestRoleAllows are true', async () => {
      const pinia = createPinia();
      const billingStore = useBillingStore(pinia);

      shallowMount(BillingNotification, {
        global: {
          plugins: [pinia],
        },
      });

      await flushPromises();

      expect(billingStore.fetchBillingStatus).toHaveBeenCalled();
    });
  });
});
