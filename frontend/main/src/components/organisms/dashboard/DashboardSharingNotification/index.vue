<template>
  <evocon-v-snackbar
    v-for="[key, tab] in Object.entries(tabsMappedBySharedAtISO)"
    :key="`sharing-notification-${key}`"
    :model-value="keysOfVisibleNotifications.includes(key)"
    :timeout="-1"
    location="bottom center"
    max-width="1100"
    :icon="mdiCheckCircle"
    :label="$t('{username} shared tabs with you', { username: tab.sharedBy })"
    :description="$t('Tabs added to your dashboard ({variable})', { variable: tab.count })"
    type="success"
    :style="{ 'margin-bottom': getNotificationBottomMargin(key) }"
    @close="closeNotification(key)"
  />
</template>
<script setup name="DashboardSharingNotification">
import {
  ref, computed, onMounted, watch,
} from 'vue';
import { mdiCheckCircle } from '@mdi/js';
import { storeToRefs } from 'pinia';

import { useDashboardConfigStore } from '@/stores/index';
import { getTabNewIndicatorShownUntil } from '@/helpers/dashboardNewIndicator';
import addItemToLocalStorageArray from '@/helpers/localStorage/addItem';
import getItemsFromLocalStorageArray from '@/helpers/localStorage/getItemsFromLocalStorageArray';
import EvoconVSnackbar from '@/components/atoms/EvoconVSnackbar/index.vue';

const dashboardConfigStore = useDashboardConfigStore();
const { pages: tabs } = storeToRefs(dashboardConfigStore);

const keysOfVisibleNotifications = ref([]);

const tabsMappedBySharedAtISO = computed(() => tabs.value.reduce((acc, tab) => {
  const { sharedAtISO } = tab;
  const newIndicatorShownUntil = getTabNewIndicatorShownUntil(tab);
  const closedNotificationKeys = getItemsFromLocalStorageArray('closedDashboardTabNotifications');
  if (sharedAtISO && newIndicatorShownUntil && !closedNotificationKeys.includes(sharedAtISO)) {
    if (acc[sharedAtISO]) {
      acc[sharedAtISO].count += 1;
    } else {
      acc[sharedAtISO] = { sharedBy: tab.sharedBy, count: 1 };
    }
  }
  return acc;
}, {}));

const getNotificationBottomMargin = (key) => {
  const index = keysOfVisibleNotifications.value.indexOf(key);
  // 84 - notification height + bottom margin
  const notificationHeight = 84;
  const bottomMargin = 16;
  return index > -1 ? `${(index * notificationHeight) + bottomMargin}px` : 0;
};

const closeNotification = (key) => {
  const index = keysOfVisibleNotifications.value.indexOf(key);
  if (index > -1) {
    keysOfVisibleNotifications.value.splice(index, 1);
    addItemToLocalStorageArray(key, 'closedDashboardTabNotifications');
  }
};

const setKeysOfVisibleNotifications = () => {
  keysOfVisibleNotifications.value = [...new Set(Object.keys(tabsMappedBySharedAtISO.value))];
};

watch(tabsMappedBySharedAtISO, () => {
  setKeysOfVisibleNotifications();
});

onMounted(() => {
  setKeysOfVisibleNotifications();
});
</script>
