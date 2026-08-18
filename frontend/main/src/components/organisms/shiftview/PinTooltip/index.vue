<template>
  <evocon-v-tooltip
    :type="type"
    :title="title"
    :icon-color="iconColor"
    :rows="rows"
  />
</template>

<script setup name="ShiftviewPinTooltip">
import { computed } from 'vue';

import EvoconVTooltip from '@/components/atoms/EvoconVTooltip/index.vue';
import { pinTypes } from '@/constants/shiftviewPinConstants';
import { checklistStatuses, checkTypes } from '@/constants/checklistsConstants';
import i18n from '@/services/i18n';
import { getCheckTasksFilledString } from '@/helpers/checklist/checkTasksFilledCalculations';
import { getBatchTitle, getBatchTooltipRows } from '@/helpers/batch/batchHelpers';
import { formatTimeInZone } from '@/helpers/time/formatTime';
import { getSubmissionTime } from '@/helpers/checklist/getSubmissionTime';
import { formatNumber } from '@/helpers/numbers/formatNumber';
import { altUnitConversion, getUnitId } from '@/helpers/timeline/altUnitConversion';
import colorConstants from '@/constants/colorConstants';
import {
  useShiftviewTimelineStore,
  useOperatorStore,
  useStationStore,
} from '@/stores';

const shiftviewTimelineStore = useShiftviewTimelineStore();
const operatorStore = useOperatorStore();
const stationStore = useStationStore();

const props = defineProps({
  item: {
    type: Object,
    default: () => {},
  },
});

const getChecklistTooltipType = (check) => {
  switch (check.status) {
    case checklistStatuses.SUCCESSFUL:
      return i18n.global.t('Successful');
    case checklistStatuses.UNSUCCESSFUL:
      return i18n.global.t('Unsuccessful');
    case checklistStatuses.MISSED:
      return i18n.global.t('Missed');
    case checklistStatuses.NEW:
      return i18n.global.t('New');
    default:
      return '';
  }
};

const getChangeoverTooltipTitle = (changeover) => {
  // in some cases the batch update doesn't appear soon enough and to prevent console errors empty object is used
  const batch = shiftviewTimelineStore.batches.get(changeover.batchId) || {};
  return getBatchTitle(batch);
};

const zoneId = computed(() => stationStore.lineviewStation.zoneId);

const type = computed(() => {
  switch (props?.item?.type) {
    case pinTypes.CHANGEOVER:
      return i18n.global.t('Changeover');
    case pinTypes.TEAM:
      return i18n.global.t('Team');
    case pinTypes.CHECK:
      return getChecklistTooltipType(props.item.check);
    case pinTypes.BATCH_TARGET_REACHED:
      return i18n.global.t('Target reached');
    default:
      return '';
  }
});
const title = computed(() => {
  switch (props?.item?.type) {
    case pinTypes.CHANGEOVER:
      return getChangeoverTooltipTitle(props.item.slice);
    case pinTypes.TEAM:
      return props.item.team.operatorIds.map((id) => {
        const operator = operatorStore.operatorsRealMap.get(id);
        return operator ? operator.name : '';
      }).join(', ');
    case pinTypes.CHECK:
      return props.item.check.name;
    case pinTypes.BATCH_TARGET_REACHED:
      return getBatchTitle(props.item.batchTarget.batch);
    default:
      return '';
  }
});

const iconColor = computed(() => {
  switch (props?.item?.type) {
    case pinTypes.CHANGEOVER:
    case pinTypes.BATCH_TARGET_REACHED:
      return colorConstants.dark['lw-blue'];
    case pinTypes.TEAM:
      return 'primary';
    case pinTypes.CHECK:
      if (props.item.check.status === checklistStatuses.SUCCESSFUL) return 'primary';
      if (props.item.check.status === checklistStatuses.UNSUCCESSFUL) return colorConstants.dark['lw-orange'];
      if (props.item.check.status === checklistStatuses.MISSED) return colorConstants.dark['lw-red'];
      if (props.item.check.status === checklistStatuses.NEW) return colorConstants.dark['lw-gray'];
      return '';
    default:
      return '';
  }
});

const getChangeoverTooltipRows = (changeover) => {
  const batch = shiftviewTimelineStore.batches.get(changeover.batchId);
  if (!batch) return [];
  return getBatchTooltipRows(batch);
};

const getTeamTooltipRows = (team) => [
  { key: i18n.global.t('Start'), value: formatTimeInZone(team.startTimeISO, zoneId.value) },
  { key: i18n.global.t('End'), value: formatTimeInZone(team.endTimeISO, zoneId.value) },
];

const shouldShowCheckValues = (check) => {
  if (check.elements.length > 2) return false;
  if ([checklistStatuses.MISSED, checklistStatuses.NEW].includes(check.status)) return false;
  if (check.status === checklistStatuses.SUCCESSFUL) return true;
  if (check.status === checklistStatuses.UNSUCCESSFUL) {
    return check.elements.every((el) => el.value !== null);
  }
};

const getCheckValueString = (element) => {
  if (element.type === checkTypes.MEASUREMENT) {
    return `${formatNumber(element.value)} ${element.unit}`;
  }
  return element.value ? i18n.global.t('Yes') : i18n.global.t('No');
};

const getChecklistTooltipRows = (check) => {
  const rows = [
    { key: i18n.global.t('Due'), value: formatTimeInZone(check.dateTimeISO, zoneId.value) },
  ];
  if (check.submissionTimeISO) {
    rows.push({ key: i18n.global.t('Done'), value: getSubmissionTime(check, zoneId.value) });
  }
  if (check.conditionAuthenticationRequired) {
    rows.push({ key: i18n.global.t('Done by'), value: check.doneBy });
  }
  rows.push({ key: i18n.global.t('Tasks filled'), value: getCheckTasksFilledString(check) });
  if (shouldShowCheckValues(check)) {
    check.elements.forEach((element) => {
      rows.push({ key: element.name, value: getCheckValueString(element), valueClass: element.successful ? '' : 'text-secondary' });
    });
  }
  rows.push({ key: i18n.global.t('Extra note'), value: check.elements.filter((el) => el.comment && el.comment.length).length });
  return rows;
};

const getBatchTargetTooltipRows = (batchTarget) => {
  const unitId = getUnitId(batchTarget.batch);
  const quantity = altUnitConversion(batchTarget.batch, batchTarget.quantity);
  const scrap = altUnitConversion(batchTarget.batch, batchTarget.scrap);
  return [
    { key: i18n.global.t('Time'), value: formatTimeInZone(batchTarget.eventTime, zoneId.value) },
    {
      key: i18n.global.t('Target'),
      value: formatNumber(quantity),
      valueClass: 'text-primary',
      secondaryValue: scrap > 0 ? ` (${formatNumber(scrap)})` : '',
      secondaryClass: 'text-lw-orange',
      tertiaryValue: ` ${unitId}`,
    },
  ];
};

const rows = computed(() => {
  switch (props?.item?.type) {
    case pinTypes.CHANGEOVER:
      return getChangeoverTooltipRows(props.item.slice);
    case pinTypes.TEAM:
      return getTeamTooltipRows(props.item.team);
    case pinTypes.CHECK:
      return getChecklistTooltipRows(props.item.check);
    case pinTypes.BATCH_TARGET_REACHED:
      return getBatchTargetTooltipRows(props.item.batchTarget);
    default:
      return [];
  }
});
</script>
