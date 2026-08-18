<template>
  <div class="targets">
    <div
      v-for="(shiftHour, i) in shiftHours"
      :key="i"
      class="target"
      :class="{ 'py-0 px-2': isMobileView }"
      :style="{ 'font-size': `${getFontSize(shiftHour)}px`, 'flex-direction': getHourChars(shiftHour) > 13 ? 'column' : 'row' }"
    >
      <evocon-v-tooltip-wrap
        :text="`${getDisplayProducedQty(shiftHour, true)} / ${getDisplayTargetQty(shiftHour, true)}`"
      >
        <template #activator="{ props }">
          <span v-bind="props">
            <span
              class="quantity"
              :style="{ color: getStatsColor(shiftHour) }"
            >
              {{ getDisplayProducedQty(shiftHour, false) }}
            </span>
            <span
              class="hour-target"
              :class="{ 'd-none': isMobileView }"
            >
              {{ `/${getDisplayTargetQty(shiftHour, false)}` }}
            </span>
          </span>
        </template>
      </evocon-v-tooltip-wrap>
    </div>
  </div>
</template>
<script>
import { mapState } from 'pinia';

import { formatNumber } from '@/helpers/numbers/formatNumber';
import colorConstants from '@/constants/colorConstants';
import EvoconVTooltipWrap from '@/components/atoms/EvoconVTooltipWrap/index.vue';
import {
  useDeviceStore,
  useStationStore,
  useUserPreferencesStore,
} from '@/stores';

export default {
  name: 'ShiftTargets',
  components: { EvoconVTooltipWrap },
  props: {
    shiftHours: { type: Array, default: () => [] },
  },
  computed: {
    ...mapState(useDeviceStore, ['isMobileView', 'isXXLView']),
    ...mapState(useStationStore, ['lineviewStation']),
    ...mapState(useUserPreferencesStore, ['viewSettings']),
    mainFontSize() {
      /* eslint-disable no-magic-numbers */
      if (this.isMobileView) return 14;
      if (this.isXXLView) return 24;
      if (this.$vuetify.display.mdAndDown) return 16;
      if (this.$vuetify.display.lg) return 18;
      return 20;
      /* eslint-enable no-magic-numbers */
    },
    smallFontSize() {
      return this.mainFontSize - 2;
    },
    smallestFontSize() {
      return this.mainFontSize - 4;
    },
  },
  methods: {
    getDisplayTargetQty(stats, isTooltip = false) {
      if (!stats) return 0;
      let key = '';
      if (isTooltip) {
        key = this.viewSettings.usePrimaryUnit ? 'idealAltQty' : 'idealQty';
      } else {
        key = this.viewSettings.usePrimaryUnit ? 'idealQty' : 'idealAltQty';
      }
      return formatNumber(stats[key]);
    },
    getDisplayProducedQty(stats, isTooltip = false) {
      if (!stats) return 0;
      let totalKey = '';
      let scrapKey = '';
      if (isTooltip) {
        totalKey = this.viewSettings.usePrimaryUnit ? 'quantityAlt' : 'quantity';
        scrapKey = this.viewSettings.usePrimaryUnit ? 'scrapAltQty' : 'scrapQty';
      } else {
        totalKey = this.viewSettings.usePrimaryUnit ? 'quantity' : 'quantityAlt';
        scrapKey = this.viewSettings.usePrimaryUnit ? 'scrapQty' : 'scrapAltQty';
      }
      const qty = this.viewSettings.useShiftGoodQty ? stats[totalKey] - stats[scrapKey] : stats[totalKey];
      return formatNumber(qty);
    },
    getStatsColor(stats) {
      if (!stats) {
        return colorConstants.dark['lw-red'];
      }
      const oee = stats.oee * 100;
      if (!oee || oee <= this.lineviewStation.oeeGoalSad) {
        return colorConstants.dark['lw-red'];
      }
      if (oee >= this.lineviewStation.oeeGoalHappy) {
        return colorConstants.dark['lw-green'];
      }
      return colorConstants.dark['lw-yellow'];
    },
    getHourChars(stats) {
      return `${this.getDisplayProducedQty(stats)}/${this.getDisplayTargetQty(stats)}`.length;
    },
    getFontSize(shiftHour) {
      const smallFontThreshold = 8;
      const smallestFontThreshold = 13;
      const showSmallFont = this.getHourChars(shiftHour) >= smallFontThreshold;
      const showSmallestFont = this.getHourChars(shiftHour) >= smallestFontThreshold;
      if (showSmallestFont) return this.smallestFontSize;
      if (showSmallFont) return this.smallFontSize;
      return this.mainFontSize;
    },
  },
};
</script>
<style lang="less" scoped>
.targets {
  height:100%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  text-align: center;
  background-color: rgb(var(--v-theme-lw-background));

  .target {
    flex: 1;
    display:flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    flex-wrap: wrap;
    line-height: initial;
  }
  .target:nth-child(even) {
    background-color: var(--color-12-light);
  }
}
</style>
