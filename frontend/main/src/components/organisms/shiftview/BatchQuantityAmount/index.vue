<template>
  <div class="text-truncate max-width-100" :class="textClass">
    <v-progress-circular
      v-if="showProgress && batch.plannedQty"
      :size="12"
      :width="2"
      :color="progressColor"
      :model-value="progress"
      class="mr-1 d-inline-block align-middle"
    />
    <span v-if="showGoodQty">
      <span class="text-primary">
        {{ formatNumber(goodQty) }}
      </span>
      <span
        v-if="scrapQty"
        class="text-lw-orange"
      >
        ({{ formatNumber(scrapQty) }})
      </span>
      <template v-if="plannedQty">/</template>
    </span>
    <span class="text-no-wrap">
      <span v-if="plannedQty">{{ formatNumber(plannedQty, {decimalPlaces: null}) }}</span>
      <span>{{ ` ${unitId}` }}</span>
    </span>
  </div>
</template>
<script>
import { mapState } from 'pinia';

import { formatNumber } from '@/helpers/numbers/formatNumber';
import { getBatchMainToAltUnitConversion } from '@/helpers/batch/getBatchMainToAltUnitConversion';
import { useUserPreferencesStore } from '@/stores';

export default {
  name: 'BatchQuantityAmount',
  props: {
    showGoodQty: { type: Boolean, default: true },
    batch: { type: Object, default: () => {} },
    textClass: { type: String, default: '' },
    showProgress: { type: Boolean, default: false },
  },
  computed: {
    ...mapState(useUserPreferencesStore, ['viewSettings']),
    unitConversionValue() {
      const useConversion = this.batch.alternativeUnitId && !this.viewSettings.usePrimaryUnit;
      return useConversion ? getBatchMainToAltUnitConversion(this.batch) : 1;
    },
    goodQty() {
      return (this.batch.producedQty - this.batch.scrapQty) * this.unitConversionValue;
    },
    scrapQty() {
      return this.batch.scrapQty * this.unitConversionValue;
    },
    plannedQty() {
      if (this.batch.plannedQty) return this.batch.plannedQty * this.unitConversionValue;
      return 0;
    },
    unitId() {
      return this.batch.alternativeUnitId && !this.viewSettings.usePrimaryUnit ? this.batch.alternativeUnitId : this.batch.unitId;
    },
    progress() {
      if (this.batch.plannedQty && this.batch.plannedQty > 0) {
        return (this.batch.producedQty / this.batch.plannedQty) * 100;
      }
      return 100;
    },
    progressColor() {
      return this.progress >= 100 ? 'lw-yellow' : 'primary';
    },
  },
  methods: {
    formatNumber,
  },
};
</script>
