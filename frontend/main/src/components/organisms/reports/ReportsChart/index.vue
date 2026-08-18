<template>
  <div class="chart-wrapper">
    <reports-internal-chart
      :screen-px-total="screenPxTotal"
      :date-range="orderedDateRange"
      :is-side-menu-open="isSideMenuOpen"
      :totals="totals"
      @drilldown="onDrilldown"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';

import { useDeviceStore, useReportsConfigStore } from '@/stores';
import ReportsInternalChart from '@/components/organisms/reports/ReportsChart/ReportsInternalChart.vue';

export default {
  name: 'ReportsChartWrapper',
  components: {
    ReportsInternalChart,
  },
  props: {
    isSideMenuOpen: { type: Boolean, required: true },
    totals: { type: Object, required: true },
  },
  computed: {
    ...mapState(useDeviceStore, ['screenPxTotal']),
    ...mapState(useReportsConfigStore, ['orderedDateRange']),
  },
  methods: {
    ...mapActions(useReportsConfigStore, ['onDrilldown']),
  },
};
</script>
<style lang="scss" scoped>
.chart-wrapper {
  margin-top: 4px;
  height: calc(100% - 2px);
  width: 100%;
}
</style>
