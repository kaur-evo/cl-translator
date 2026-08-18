import { defineStore } from 'pinia';

import billingApi from '@/api/billingApi';

const useBillingStore = defineStore('billing', {
  state: () => ({
    hasOverdueInvoices: false,
    loading: [],
  }),
  actions: {
    async fetchBillingStatus() {
      this.loading.push('loading');
      try {
        const status = await billingApi.getBillingStatus();
        this.hasOverdueInvoices = status?.overdueInvoices?.length > 0;
      } catch {
        this.hasOverdueInvoices = false;
      } finally {
        this.loading.pop();
      }
    },
    setBillingStatus(data) {
      this.hasOverdueInvoices = data?.overdueInvoices?.length > 0;
    },
  },
  getters: {
    isLoading: (state) => !!state.loading.length,
  },
});

export default useBillingStore;
