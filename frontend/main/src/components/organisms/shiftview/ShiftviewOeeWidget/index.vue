<template>
  <oee-chart
    :key="shiftId"
    :data="processedHourStatistics"
    :screen-width="screenWidth"
    :x-domain="xDomain"
    :timezone="lineviewStation.zoneId"
  />
</template>

<script>
import { mapState } from 'pinia';
import { DateTime } from 'luxon';

import OeeChart from '@/components/organisms/shiftview/ShiftviewOeeWidget/OeeWidget.vue';
import { formatTimeInZone } from '@/helpers/time/formatTime';
import colorConstants from '@/constants/colorConstants';
import {
  useShiftStore,
  useDeviceStore,
  useStationStore,
} from '@/stores';

export default {
  name: 'OeeGraphWidget',
  components: {
    OeeChart,
  },
  computed: {
    ...mapState(useShiftStore, ['shift', 'statistics']),
    ...mapState(useDeviceStore, ['screenWidth']),
    ...mapState(useStationStore, ['lineviewStation']),
    shiftId() {
      return this.shift.id;
    },
    sortedHourStatisticsKeys() {
      if (!this.statistics.hourStatistics) return [];
      return Object.keys(this.statistics.hourStatistics).sort((a, b) => new Date(a) - new Date(b));
    },
    xDomain() {
      return this.sortedHourStatisticsKeys;
    },
    processedHourStatistics() {
      const ret = this.sortedHourStatisticsKeys.reduce((acc, key) => {
        acc.push({
          ...this.statistics.hourStatistics[key],
          measure: key,
          color: this.statistics.hourStatistics[key].oee * 100 >= this.lineviewStation.oeeGoalHappy ? colorConstants.dark['quaternary-dark-2'] : colorConstants.dark['secondary-dark'],
          startTime: formatTimeInZone(key, this.lineviewStation.zoneId),
          endTime: formatTimeInZone(DateTime.fromISO(key, { zone: this.lineviewStation.zoneId }).plus({ hours: 1 }).toISO(), this.lineviewStation.zoneId),
          target: this.lineviewStation.oeeGoalHappy,
        });
        return acc;
      }, []);
      return ret;
    },
  },
};
</script>
