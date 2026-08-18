<template>
  <reminder-banner
    v-if="isVisible"
    :icon="mdiAlert"
    icon-color="secondary"
    banner-color="snackbar-yellow"
    :text="$t('Invoice overdue. Once paid, please notify your Evocon account holder.')"
  />
</template>

<script setup name="BillingNotification">
import { computed, onMounted, onUnmounted } from 'vue';
import { mdiAlert } from '@mdi/js';

import ReminderBanner from '@/components/organisms/ReminderBanner/index.vue';
import { useBillingStore, useFeatureStore, useProfileStore } from '@/stores';

const billingStore = useBillingStore();
const featureStore = useFeatureStore();
const profileStore = useProfileStore();

const overdueInvoiceNotificationEnabled = computed(() => featureStore.overdueInvoiceNotificationEnabled);
const isBillingNotificationAllowed = computed(() => profileStore.highestRoleAllows('billingNotification'));
const isVisible = computed(() => billingStore.hasOverdueInvoices);

const setBillingStatus = (data) => {
  billingStore.setBillingStatus(data);
};

onMounted(async () => {
  if (!overdueInvoiceNotificationEnabled.value || !isBillingNotificationAllowed.value) return;
  await billingStore.fetchBillingStatus();
  window.centrifugeService?.subscribe('billing', '', setBillingStatus);
});

onUnmounted(() => {
  window.centrifugeService?.unsubscribe('billing');
});
</script>
