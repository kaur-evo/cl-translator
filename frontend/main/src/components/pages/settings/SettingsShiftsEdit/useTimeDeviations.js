import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

import useConfirmDialogStore from '@/stores/confirmDialog';
import useShiftTemplateStore from '@/stores/shiftTemplate';

export default function useTimeDeviations(shiftTemplateId) {
  const { t } = useI18n();
  const confirmDialogStore = useConfirmDialogStore();
  const shiftTemplateStore = useShiftTemplateStore();

  const timeDeviationsLoading = ref(false);

  const currentTimeDeviations = computed(() => shiftTemplateStore.currentTimeDeviations(shiftTemplateId.value));

  async function loadTimeDeviations() {
    timeDeviationsLoading.value = true;
    await shiftTemplateStore.fetchShiftTemplateTimeDeviations(shiftTemplateId.value);
    timeDeviationsLoading.value = false;
  }

  async function openDeleteTimeDeviationConfirmation(deviation) {
    const dialogConfig = {
      title: t('Confirmation'),
      text: t('Are you sure you want to delete this?'),
      action: () => shiftTemplateStore.deleteShiftTemplateTimeDeviation(deviation),
      confirmText: t('Delete'),
      cancelText: t('Cancel'),
    };
    await confirmDialogStore.openConfirmDialog(dialogConfig);
  }

  return { currentTimeDeviations, timeDeviationsLoading, loadTimeDeviations, openDeleteTimeDeviationConfirmation };
}
