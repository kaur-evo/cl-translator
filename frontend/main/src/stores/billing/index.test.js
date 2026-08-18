import { setActivePinia, createPinia } from 'pinia';

import useBillingStore from './index';

import billingApi from '@/api/billingApi';


vi.mock('@/api/billingApi', () => ({
  default: {
    getBillingStatus: vi.fn(),
  },
  __esModule: true,
}));

describe('useBillingStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useBillingStore();
    vi.clearAllMocks();
  });

  test('initial state', () => {
    expect(store.hasOverdueInvoices).toBe(false);
    expect(store.loading).toEqual([]);
  });

  describe('fetchBillingStatus', () => {
    test('sets hasOverdueInvoices to true when there are overdue invoices', async () => {
      billingApi.getBillingStatus.mockResolvedValueOnce({ overdueInvoices: [{ id: 1 }, { id: 2 }] });
      await store.fetchBillingStatus();
      expect(store.hasOverdueInvoices).toBe(true);
      expect(store.loading).toEqual([]);
    });

    test('sets hasOverdueInvoices to false when there are no overdue invoices', async () => {
      billingApi.getBillingStatus.mockResolvedValueOnce({ overdueInvoices: [] });
      await store.fetchBillingStatus();
      expect(store.hasOverdueInvoices).toBe(false);
    });

    test('sets hasOverdueInvoices to false on null status', async () => {
      billingApi.getBillingStatus.mockResolvedValueOnce(null);
      await store.fetchBillingStatus();
      expect(store.hasOverdueInvoices).toBe(false);
    });

    test('sets hasOverdueInvoices to false on API error', async () => {
      billingApi.getBillingStatus.mockRejectedValueOnce(new Error('API Error'));
      await store.fetchBillingStatus();
      expect(store.hasOverdueInvoices).toBe(false);
      expect(store.loading).toEqual([]);
    });
  });

  describe('setBillingStatus', () => {
    test('sets hasOverdueInvoices to true with overdue invoices', () => {
      store.setBillingStatus({ overdueInvoices: [{ id: 1 }] });
      expect(store.hasOverdueInvoices).toBe(true);
    });

    test('sets hasOverdueInvoices to false with empty invoices', () => {
      store.setBillingStatus({ overdueInvoices: [] });
      expect(store.hasOverdueInvoices).toBe(false);
    });

    test('sets hasOverdueInvoices to false with null data', () => {
      store.setBillingStatus(null);
      expect(store.hasOverdueInvoices).toBe(false);
    });
  });

  describe('isLoading getter', () => {
    test('returns false when loading is empty', () => {
      expect(store.isLoading).toBe(false);
    });

    test('returns true when loading has entries', () => {
      store.loading.push('loading');
      expect(store.isLoading).toBe(true);
    });
  });
});
