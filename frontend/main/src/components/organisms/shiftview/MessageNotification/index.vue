<template>
  <evocon-v-snackbar
    :model-value="isNotificationVisible"
    :min-width="$vuetify.display.smAndUp ? 573 : '90%'"
    :timeout="-1"
    location="bottom center"
    max-width="1100"
    :min-height="isMobileView ? undefined : 68"
    :icon="mdiEmail"
    :description="description"
    @close="emit('hide-notification')"
  >
    <template #actions>
      <evocon-v-button
        class="my-4"
        color="primary"
        :text="$t('Open')"
        @click="onOpenDialog"
      />
    </template>
  </evocon-v-snackbar>
</template>
<script setup name="MessageNotification">
import { mdiEmail } from '@mdi/js';
import { ref, computed, watch } from 'vue';

import { useDeviceStore, useGenericDialogStore, useStationStore } from '@/stores/index';
import shiftviewDialogs from '@/constants/dialogConfigs';
import EvoconVSnackbar from '@/components/atoms/EvoconVSnackbar/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';

const deviceStore = useDeviceStore();
const genericDialogStore = useGenericDialogStore();
const stationStore = useStationStore();

const props = defineProps({
  newMessagesCount: {
    type: Number,
    default: 0,
  },
  description: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['hide-notification']);

const notificationTimer = ref(null);

const isMobileView = computed(() => deviceStore.isMobileView);
const isDialogOpened = computed(() => genericDialogStore.isDialogOpened);
const lineviewStation = computed(() => stationStore.lineviewStation);
const isNotificationVisible = computed(() => props.newMessagesCount > 0 && props.description.length > 0);

const onOpenDialog = () => {
  if (isDialogOpened.value) genericDialogStore.closeDialog();
  const conf = { ...shiftviewDialogs.MESSAGES };
  if (!lineviewStation.value.notificationEmails) conf.width = 700;
  genericDialogStore.openDialog(conf);
  emit('hide-notification');
};

const resetNotificationTimer = () => {
  if (notificationTimer.value) clearTimeout(notificationTimer.value);
  notificationTimer.value = setTimeout(() => {
    emit('hide-notification');
  }, 5 * 60 * 1000); // 5min
};

watch(() => props.newMessagesCount, (newVal, oldVal) => {
  if (newVal > oldVal) resetNotificationTimer();
});
</script>
