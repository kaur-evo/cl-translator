import { defineAsyncComponent, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { DateTime } from 'luxon';

import useConfirmDialogStore from '@/stores/confirmDialog';
import useGenericDialogStore from '@/stores/genericDialog';
import useGenericNotificationStore from '@/stores/genericNotification';
import useShiftTemplateStore, { UNSAVED_KEY } from '@/stores/shiftTemplate';

export default function useNoShiftDeviations(_shiftTemplateId, isShiftTemplateEdit) {
  const { t } = useI18n();
  const confirmDialogStore = useConfirmDialogStore();
  const genericDialogStore = useGenericDialogStore();
  const genericNotificationStore = useGenericNotificationStore();
  const shiftTemplateStore = useShiftTemplateStore();

  const shiftTemplateId = computed(() => (isShiftTemplateEdit.value ? _shiftTemplateId.value : UNSAVED_KEY));

  const noShiftDeviationsLoading = ref(false);

  const currentNoShiftDeviations = computed(() => shiftTemplateStore.currentNoShiftDeviations(shiftTemplateId.value));

  const loadNoShiftDeviations = async () => {
    if (!isShiftTemplateEdit) return;
    noShiftDeviationsLoading.value = true;
    await shiftTemplateStore.fetchShiftTemplateNoShiftDeviations(shiftTemplateId.value);
    noShiftDeviationsLoading.value = false;
  };

  async function openQuickApplyNoShiftDialog({ payload, callback, shiftName, zoneId }) {
    await confirmDialogStore.openConfirmDialog({
      title: t('Confirmation'),
      text: t('Are you sure you want to delete {value}?', { value: shiftName }),
      action: async () => {
        const deviation = {
          ...payload,
          startTime: DateTime.fromISO(payload.startTime).setZone(zoneId).startOf('day').toISO(),
          endTime: DateTime.fromISO(payload.startTime).setZone(zoneId).endOf('day').toISO(),
          hideNotifications: true,
        };
        const res = await shiftTemplateStore.saveShiftTemplateNoShiftDeviation(deviation);
        if (res?.name === 'AxiosError') return;
        genericNotificationStore.notifyDeleted(shiftName);
        if (callback) {
          callback();
        }
      },
      hasLoading: true,
      confirmText: t('Delete'),
      cancelText: t('Cancel'),
    });
  }

  async function openEditNoShiftDialog(inputDeviation, callback) {
    const dialogConfig = {
      component: defineAsyncComponent(() => import('@/components/organisms/settings/SettingsShiftsNoShiftEditDialog/index.vue')),
      data: {
        ...inputDeviation,
      },
      options: { maxWidth: '500px' },
      onPrimaryAction: async (deviation) => {
        if (isShiftTemplateEdit.value) {
          await shiftTemplateStore.saveShiftTemplateNoShiftDeviation({ ...deviation });
        } else {
          await shiftTemplateStore.storeShiftTemplateNoShiftDeviation({ ...deviation });
        }
        if (callback) {
          callback();
        }
      },
    };
    await genericDialogStore.openDialog(dialogConfig);
  }

  async function openDeleteNoShiftConfirmation(deviation) {
    const dialogConfig = {
      title: t('Confirmation'),
      text: t('Are you sure you want to delete {value}?', { value: deviation.description }),
      action: () => shiftTemplateStore.deleteShiftTemplateNoShiftDeviation(deviation),
      confirmText: t('Delete'),
      cancelText: t('Cancel'),
    };
    await confirmDialogStore.openConfirmDialog(dialogConfig);
  }

  return { currentNoShiftDeviations, loadNoShiftDeviations, openEditNoShiftDialog, openDeleteNoShiftConfirmation, openQuickApplyNoShiftDialog };
}
