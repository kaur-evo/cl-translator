<template>
  <div
    class="hours"
    :style="{ 'font-size': fontSize }"
  >
    <div
      v-for="(shiftHour, i) in shiftHours"
      :key="`shifthour-${i}`"
      class="hour"
    >
      {{ getHour(shiftHour.dateTime) }}
    </div>
  </div>
</template>
<script>
import { mapState } from 'pinia';
import { DateTime } from 'luxon';

import {
  useDeviceStore,
  useStationStore,
  useProfileStore,
} from '@/stores';

export default {
  name: 'ShiftHours',
  props: {
    shiftHours: { type: Array, default: () => [] },
  },
  computed: {
    ...mapState(useDeviceStore, ['isMobileView', 'isXXLView']),
    ...mapState(useStationStore, ['lineviewStation']),
    ...mapState(useProfileStore, ['timeFormat']),
    fontSize() {
      if (this.isMobileView) return '14px';
      if (this.isXXLView) return '24px';
      if (this.$vuetify.display.mdAndDown) return '16px';
      if (this.$vuetify.display.lg) return '18px';
      return '20px';
    },
  },
  methods: {
    getHour(time) {
      return DateTime.fromISO(time).setZone(this.lineviewStation.zoneId).toFormat(this.timeFormat.luxonHour);
    },
  },
};
</script>
<style lang="less" scoped>

.hours {
  height:100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: rgb(var(--v-theme-lw-background));
  text-align: center;
  .hour {
    flex: 1;
    display:flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    color: rgb(var(--v-theme-quaternary-dark-2));
  }
  .hour:nth-child(even) {
    background-color: var(--color-12-light);
  }
}
</style>
