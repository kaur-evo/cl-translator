<template>
  <reminder-banner
    v-if="isVisible"
    :icon="mdiSecurity"
    icon-color="error"
    banner-color="snackbar-red"
    banner-hover-color="var(--color-12-error)"
    :text="$t('Two-factor authentication required, setup from profile.')"
    clickable
    @click="navigateToProfile"
  />
</template>
<script setup name="TwoFactorAuthenticationNotification">
import { computed } from 'vue';
import { mdiSecurity } from '@mdi/js';
import { useRouter } from 'vue-router';

import MFAType from '@/constants/multiFactorAuth';
import ReminderBanner from '@/components/organisms/ReminderBanner/index.vue';
import useBillingStore from '@/stores/billing';
import useProfileStore from '@/stores/profile';

const billingStore = useBillingStore();
const profileStore = useProfileStore();
const router = useRouter();

const isTwoFactorAuthenticationRequired = computed(() => profileStore.currentUser.twoFactorAuthenticationRequired);
const hasOverdueInvoices = computed(() => billingStore.hasOverdueInvoices);
const isBillingLoading = computed(() => billingStore.isLoading);
const MFAPreference = computed(() => profileStore.MFAPreference);
const isMFAEnabled = computed(() => !!MFAPreference.value && MFAPreference.value !== MFAType.NOMFA);
const isVisible = computed(() => {
  if (isBillingLoading.value || hasOverdueInvoices.value) return false;
  if (MFAPreference.value === null) return false;
  return isTwoFactorAuthenticationRequired.value && !isMFAEnabled.value;
});

const navigateToProfile = async () => {
  await router.push({ name: 'profile', query: { openMFADialog: true } });
};
</script>
