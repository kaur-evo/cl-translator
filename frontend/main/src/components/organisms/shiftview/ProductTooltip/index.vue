<template>
  <v-tooltip
    v-if="!!tooltipProps && !isSelectionActive"
    :model-value="true"
    location="top"
    offset-overflow
    content-class="bg-black"
    :target="[tooltipProps.x + 20, tooltipProps.y]"
  >
    <evocon-v-tooltip
      :type="tooltipComponentProps.type"
      :title="tooltipComponentProps.title"
      :icon-color="tooltipComponentProps.iconColor"
      :rows="tooltipComponentProps.rows"
    />
  </v-tooltip>
</template>

<script setup>
import { computed } from 'vue';

import EvoconVTooltip from '@/components/atoms/EvoconVTooltip/index.vue';
import { formatNumber } from '@/helpers/numbers/formatNumber';
import { formatTimeInZone } from '@/helpers/time/formatTime';
import { altUnitConversion, getUnitId } from '@/helpers/timeline/altUnitConversion';
import { getBatchTitle } from '@/helpers/batch/batchHelpers';
import i18n from '@/services/i18n';
import {
  useShiftviewTimelineStore,
  useScrapReasonStore,
  useShiftviewSelectionStore,
  useStationStore,
} from '@/stores';

const props = defineProps({ tooltipProps: { type: Object, required: true } });
const shiftviewTimelineStore = useShiftviewTimelineStore();
const scrapReasonStore = useScrapReasonStore();
const shiftviewSelectionStore = useShiftviewSelectionStore();
const stationStore = useStationStore();

const slice = computed(() => props.tooltipProps.productSlice);
const isScrap = computed(() => slice.value.scrapQty > 0);
const batch = computed(() => shiftviewTimelineStore.batches.get(slice.value.batchId) || {});
const scrapReason = computed(() => scrapReasonStore.scrapReasonsRealMap.get(slice.value.scrapReasonId));
const unitId = computed(() => getUnitId(batch.value));
const quantity = computed(() => altUnitConversion(batch.value, slice.value.quantity));
const quantityFromBatchStart = computed(() => altUnitConversion(batch.value, slice.value.quantityFromBatchStart));
const scrapQtyFromBatchStart = computed(() => altUnitConversion(batch.value, slice.value.scrapQtyFromBatchStart));
const scrapQty = computed(() => altUnitConversion(batch.value, slice.value.scrapQty));
const isSelectionActive = computed(() => shiftviewSelectionStore.isSelectionActive);

const tooltipComponentProps = computed(() => ({
  iconColor: isScrap.value ? 'lw-orange' : 'grey',
  type: isScrap.value ? i18n.global.t('Scrap') : i18n.global.t('Production signal'),
  title: isScrap.value ? scrapReason.value?.name : getBatchTitle(batch.value),
  rows: [
    {
      key: i18n.global.t('Group'),
      value: isScrap.value
        ? scrapReasonStore.scrapReasonGroupsRealMap.get(scrapReason.value?.groupId)?.name
        : '',
    },
    {
      key: i18n.global.t('Time'),
      value: formatTimeInZone(slice.value.sliceEndTmISO, stationStore.lineviewStation.zoneId),
    },
    { key: i18n.global.t('Product'), value: isScrap.value ? getBatchTitle(batch.value) : '' },
    { key: i18n.global.t('Order'), value: slice.value.productionOrder },
    {
      key: i18n.global.t('quantity'),
      value: isScrap.value ? '' : `${formatNumber(quantity.value)} ${unitId.value}`,
    },
    {
      key: i18n.global.t('Scrap quantity'),
      value: isScrap.value ? `${formatNumber(scrapQty.value)}` : '',
      valueClass: 'text-lw-orange',
      secondaryValue: isScrap.value ? `/${formatNumber(quantity.value)}` : '',
      tertiaryValue: isScrap.value ? ` ${unitId.value}` : '',
    },
    {
      key: i18n.global.t('Since changeover'),
      value: `${formatNumber(quantityFromBatchStart.value)}`,
      valueClass: 'text-primary',
      secondaryValue: scrapQtyFromBatchStart.value > 0 ? ` (${formatNumber(scrapQtyFromBatchStart.value)})` : '',
      secondaryClass: 'text-lw-orange',
      tertiaryValue: ` ${unitId.value}`,
    },
    {
      key: i18n.global.t('Extra note'),
      value: slice.value.scrapNotes,
      allowTextWrap: true,
    },
    { key: i18n.global.t('Extra note'), value: slice.value.signalNotes, allowTextWrap: true },
  ],
}));
</script>
