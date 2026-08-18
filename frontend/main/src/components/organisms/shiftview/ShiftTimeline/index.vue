<template>
  <div class="frame">
    <div
      class="frame-row minutes-frame"
      :style="{ 'grid-template-columns': gridColumns }"
    >
      <div class="right-border" />
      <div
        class="minutes"
        :style="{ 'font-size': minuteFontSize }"
      >
        <div class="minute-15">
          :15
        </div>
        <div class="minute-30">
          :30
        </div>
        <div class="minute-45">
          :45
        </div>
      </div>
      <div
        class="left-border targets"
        @click="openTargetInfo()"
      >
        <evocon-v-tooltip-wrap :text="$t('Learn more')">
          <template #activator="{ props }">
            <v-icon
              :size="infoIconSize"
              theme="dark"
              v-bind="props"
            >
              {{ mdiInformationOutline }}
            </v-icon>
          </template>
        </evocon-v-tooltip-wrap>
      </div>
    </div>
    <div
      class="frame-row"
      :style="{ 'grid-template-columns': gridColumns }"
    >
      <div class="right-border">
        <shift-hours :shift-hours="shiftHours" />
      </div>
      <hour-chart
        v-if="shiftHours.length"
        :shift="shift"
        :shift-hours="shiftHours"
        :comments="commentsRealMap"
        :require-operator="requireOperator"
      />
      <div class="left-border">
        <hour-targets :shift-hours="shiftHours" />
      </div>
    </div>
  </div>
</template>
<script>

import {
  mdiInformationOutline,
} from '@mdi/js';
import { mapState } from 'pinia';
import { DateTime } from 'luxon';

import EvoconVTooltipWrap from '@/components/atoms/EvoconVTooltipWrap/index.vue';
import HourTargets from '@/components/organisms/shiftview/HourTargets/index.vue';
import ShiftHours from '@/components/organisms/shiftview/ShiftHours/index.vue';
import HourChart from '@/components/organisms/shiftview/HourChart/index.vue';
import {
  useStationStore,
  useShiftStore,
  useCommentStore,
  useDeviceStore,
} from '@/stores';

const vectorIcons = {
  mdiInformationOutline,
};

export default {
  name: 'ShiftTimeline',
  components: {
    EvoconVTooltipWrap,
    HourChart,
    HourTargets,
    ShiftHours,
  },
  props: {
    requireOperator: {
      type: Boolean,
    },
  },
  data() {
    return {
      ...vectorIcons,
    };
  },
  computed: {
    ...mapState(useStationStore, ['lineviewStation']),
    ...mapState(useShiftStore, ['shift', 'statistics']),
    ...mapState(useCommentStore, ['commentsRealMap']),
    ...mapState(useDeviceStore, ['isXXLView', 'isMobileView']),
    shiftHours() {
      if (!this.statistics.hourStatistics) {
        return [];
      }
      const result = Object.entries(this.statistics.hourStatistics).map(([key, value]) => ({
        ...value,
        dateTime: key,
      }));
      while (result.length < 5) {
        const lastDateTime = DateTime.fromISO(result[result.length - 1].dateTime, { zone: this.lineviewStation.zoneId });
        const newDate = lastDateTime.plus({ hours: 1 });
        result.push({
          quantity: 0,
          quantityAlt: 0,
          scrapQty: 0,
          scrapAltQty: 0,
          idealQty: 0,
          idealAltQty: 0,
          dateTime: newDate.startOf('hour').toISO(),
        });
      }
      return result;
    },
    infoIconSize() {
      /* eslint-disable no-magic-numbers */
      if (this.isXXLView) return 24;
      if (this.$vuetify.display.lg) return 20;
      return 16;
      /* eslint-enable no-magic-numbers */
    },
    gridColumns() {
      if (this.isXXLView) return '100px auto 200px';
      if (this.isMobileView) return '40px auto 80px';
      if (this.$vuetify.display.sm) return '50px auto 112px';
      if (this.$vuetify.display.md) return '50px auto 124px';
      if (this.$vuetify.display.lg) return '60px auto 140px';
      if (this.$vuetify.display.xl) return '80px auto 160px';
      return '';
    },
    minuteFontSize() {
      if (this.isMobileView) return '12px';
      if (this.$vuetify.display.lgAndUp) return '16px';
      return '14px';
    },
  },
  methods: {
    openTargetInfo() {
      window.open('https://support.evocon.com/Produced-quantity-colors-71afb36447e44561915568567e665ae7', '_blank');
    },
  },
};
</script>
<style lang="less" scoped>

.frame {
  overflow-y: auto;
  height: 100%;
  display: grid;
  grid-template-rows: 1.5rem auto;
  z-index: 1;
  border-top: 1px solid rgb(var(--v-theme-tertiary-dark));
  border-bottom: 1px solid rgb(var(--v-theme-tertiary-dark));
  &.no-header {
    grid-template-rows: auto;
    & > div:first-child {
      display: none;
    }
  }

  .frame-row {
    display: grid;
    grid-template-columns: 49px auto 158px;
    &.center {
      align-items: center;
    }
  .right-border {
    border-right: 1px solid rgb(var(--v-theme-quaternary-dark-2));
  }
   .left-border {
    border-left: 1px solid rgb(var(--v-theme-quaternary-dark-2));

    &.targets {
      text-align: center;

      .v-icon {
        font-size: 14px;
        cursor: pointer;
      }
    }
  }
    .minutes {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
      color: white;
      text-align: center;
      align-items: center;
      .minute-15 {
        grid-column: 3 / span 2;
      }
      .minute-30 {
        grid-column: 6 / span 2;
      }
      .minute-45 {
        grid-column: 9 / span 2;
      }
    }
  }
}

.minutes-frame {
  position: sticky;
  top: 0px;
  z-index: 5;
  background: rgb(var(--v-theme-lw-background));
}
</style>
