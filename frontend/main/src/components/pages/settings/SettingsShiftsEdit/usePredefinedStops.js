import { ref, onMounted, defineAsyncComponent, nextTick, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { setHours, setMinutes } from 'date-fns';

import predefinedStopsApi from '@/api/predefinedStopsApi';
import { isTimeBetweenRange } from '@/helpers/time/timeComparison';
import { formatTime } from '@/helpers/time/formatTime';
import useCommentStore from '@/stores/comment';
import usePositionStore from '@/stores/position';
import useGenericDialogStore from '@/stores/genericDialog';
import useGenericNotificationStore from '@/stores/genericNotification';
import useConfirmDialogStore from '@/stores/confirmDialog';


export default function usePredefinedStops(shiftId, formData, isEdit) {
  const { t } = useI18n();
  const commentStore = useCommentStore();
  const positionStore = usePositionStore();
  const genericDialogStore = useGenericDialogStore();
  const genericNotificationStore = useGenericNotificationStore();
  const confirmDialogStore = useConfirmDialogStore();

  const commentsMap = computed(() => commentStore.commentsMap);
  const positionsMap = computed(() => positionStore.positionsMap);
  const openDialog = (...args) => genericDialogStore.openDialog(...args);
  const notifySuccess = (...args) => genericNotificationStore.notifySuccess(...args);
  const notifyError = (...args) => genericNotificationStore.notifyError(...args);
  const openConfirmDialog = (...args) => confirmDialogStore.openConfirmDialog(...args);

  const predefinedStops = ref([]);
  const autoStopsWithErrors = ref([]);
  const hasUnsavedPredefinedStops = ref(false);

  function getTimeRangeLabelValue(item) {
    const startAsDate = setHours(setMinutes(new Date(), item.startTime.split(':')[1]), item.startTime.split(':')[0]);
    const endAsDate = setHours(setMinutes(new Date(), item.endTime.split(':')[1]), item.endTime.split(':')[0]);
    return `${formatTime(startAsDate)} - ${formatTime(endAsDate)}`;
  }

  const filteredPredefinedStops = computed(() => predefinedStops.value?.filter((stop) => !stop.deleted)
    .map((stop, index) => ({
      ...stop,
      comment: commentsMap.value[stop.commentId]?.name || '',
      position: positionsMap.value[stop.positionId]?.name || '',
      range: getTimeRangeLabelValue(stop),
      hasError: autoStopsWithErrors.value.includes(index),
    })) || []);


  onMounted(async () => {
    if (shiftId.value) {
      await getPredefinedStops();
    }
  });

  async function getPredefinedStops() {
    predefinedStops.value = await predefinedStopsApi.getPredefinedStops(shiftId.value);
  }

  function validateAutoCommentTimes() {
    const withErrors = [];
    predefinedStops.value.forEach((stop, i) => {
      const stopStartWithinShift = isTimeBetweenRange(formData.startTime, formData.endTime, stop.startTime);
      const stopEndWithinShift = isTimeBetweenRange(formData.startTime, formData.endTime, stop.endTime);
      if (!stopStartWithinShift || !stopEndWithinShift) {
        withErrors.push(i);
      }
    });
    autoStopsWithErrors.value = withErrors;
    if (autoStopsWithErrors.value.length) {
      notifyError(t('Auto-commenting times must be within shift times'));
    }
  }

  async function savePredefinedStops(shiftTemplateId, newStops, notificationText) {
    if (!newStops?.length) return;
    try {
      const stops = await predefinedStopsApi.postPredefinedStops(shiftTemplateId, newStops.map((stop) => ({ ...stop, shiftTemplateId })));
      predefinedStops.value = stops;
      if (notificationText?.length) notifySuccess(notificationText);
    } catch {
      notifyError(t('We are sorry! There is a problem with your request'));
    }
  }

  function onEditPredefinedStop({ item, rowIndex } = {}) {
    const dialogConfig = {
      component: defineAsyncComponent(() => import('../../../organisms/settings/SettingsAddPredefinedStopsDialog/index.vue')),
      width: 732,
      allowFullscreen: true,
      data: {
        index: rowIndex,
        predefinedStops: predefinedStops.value,
        stationIds: formData.stationIds,
        shiftStart: formData.startTime,
        shiftEnd: formData.endTime,
        shiftId: shiftId.value,
        predefinedStop: item,
      },
      onPrimaryAction: async (selectedItem) => {
        const stopsCopy = [...predefinedStops.value];
        if (item) stopsCopy.splice(rowIndex, 1, selectedItem);
        else stopsCopy.push(selectedItem);
        if (isEdit.value) {
          savePredefinedStops(formData.id, stopsCopy, t('{value} saved', { value: commentsMap.value[selectedItem.commentId]?.name || '' }));
        } else {
          hasUnsavedPredefinedStops.value = true;
          predefinedStops.value = stopsCopy;
        }
        if (autoStopsWithErrors.value.includes(rowIndex)) {
          autoStopsWithErrors.value.splice(autoStopsWithErrors.value.indexOf(rowIndex), 1);
        }
      },
      onSecondaryAction: () => onDeletePredefinedStop({ item, rowIndex }),
    };
    openDialog(dialogConfig);
  }
  function onDeletePredefinedStop({ item, rowIndex }) {
    if (isEdit.value) {
      const commentName = commentsMap.value[item.commentId]?.name || '';
      openConfirmDialog({
        title: t('Confirmation'),
        text: t('Are you sure you want to delete {value}?', { value: commentName }),
        action: async () => {
          await predefinedStopsApi.deletePredefinedStop(item.id);
          predefinedStops.value.splice(rowIndex, 1);
          notifySuccess(t('{value} deleted', { value: commentName }));
        },
        confirmText: t('Delete'),
        cancelText: t('Cancel'),
      });
    } else {
      predefinedStops.value.splice(rowIndex, 1);
    }
  }
  async function onTogglePredefinedStop({ item, rowIndex }) {
    predefinedStops.value[rowIndex].enabled = !item.enabled;
    await nextTick();
    validateAutoCommentTimes();
    if (autoStopsWithErrors.value.includes(rowIndex)) {
      predefinedStops.value[rowIndex].enabled = false;
      return;
    }
    if (isEdit.value) savePredefinedStops(formData.id, predefinedStops.value, t('{value} saved', { value: commentsMap.value[item.commentId]?.name || '' }));

    else hasUnsavedPredefinedStops.value = true;
  }

  async function shiftSaveCallback(shift) {
    if (!isEdit.value) {
      await savePredefinedStops(shift.id, predefinedStops.value);
      hasUnsavedPredefinedStops.value = false;
    }
  }

  return {
    autoStopsWithErrors,
    hasUnsavedPredefinedStops,

    getTimeRangeLabelValue,
    filteredPredefinedStops,

    getPredefinedStops,
    validateAutoCommentTimes,
    savePredefinedStops,
    onEditPredefinedStop,
    onDeletePredefinedStop,
    onTogglePredefinedStop,
    shiftSaveCallback,
  };
}
