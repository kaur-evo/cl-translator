<template>
  <v-row class="timeline-row-chart">
    <v-progress-linear
      v-show="isLoading"
      class="mt-1"
      indeterminate
    />
    <v-col
      v-show="!isLoading"
      ref="timelineRowChart"
      class="fill-height"
    />
  </v-row>
</template>
<script setup>
import { ref, watch, onMounted, computed, nextTick, onUnmounted } from 'vue';

import { useSettingsSideMenuStore, useShiftTemplateStore } from '@/stores/index';
import TimelineRow from '@/components/organisms/settings/SettingsShiftTimelineBlock/TimelineRow';

const settingsSideMenuStore = useSettingsSideMenuStore();
const shiftTemplateStore = useShiftTemplateStore();
const props = defineProps({
  xScale: {
    type: Function,
    required: true,
  },
  zoneId: {
    type: String,
    required: true,
  },
  stationId: {
    type: Number,
    required: true,
  },
  tooltipHTMLFunc: {
    type: Function,
    required: true,
  },
  solidGridInterval: {
    type: Function,
    default: null,
  },
  dashGridInterval: {
    type: Function,
    default: null,
  },
});
const timelineRowChart = ref(null);
let chartRef = null;
const emit = defineEmits(['slice-click']);

const isLoading = computed(() => shiftTemplateStore.stationShiftTimelineLoading(props.stationId));
const shiftTimeline = computed(() => shiftTemplateStore.stationShiftTimeline(props.stationId));
const sideMenuCollapsed = computed(() => settingsSideMenuStore.isCollapsed);

async function fetchShiftTimeline() {
  await shiftTemplateStore.fetchShiftTemplateTimeline({
    dateRange: props.xScale.domain(),
    stationId: props.stationId,
  });
}

function drawGraph() {
  const chart = timelineRowChart.value;
  if (!chart) return;
  if (chartRef === null) {
    chartRef = new TimelineRow({
      data: { timeline: shiftTimeline.value },
      element: chart.$el,
      xScale: props.xScale,
      zoneId: props.zoneId,
      stationId: props.stationId,
      tooltipHTMLFunc: props.tooltipHTMLFunc,
      solidGridInterval: props.solidGridInterval,
      dashGridInterval: props.dashGridInterval,
    }).init();
  } else {
    chartRef.init({
      data: { timeline: shiftTimeline.value },
      xScale: props.xScale,
      zoneId: props.zoneId,
      solidGridInterval: props.solidGridInterval,
      dashGridInterval: props.dashGridInterval,
    });
  }

  chartRef.onClick = (event, slice) => {
    emit('slice-click', { event, slice });
  };
}
async function handleResize() {
  await nextTick();
  drawGraph();
}
onMounted(async () => {
  await fetchShiftTimeline();
  window.addEventListener('resize', handleResize);
  drawGraph();
});
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (chartRef) {
    chartRef.destroy();
    chartRef = null;
  }
});

watch(sideMenuCollapsed, () => {
  handleResize();
});

watch(() => props.xScale, () => {
  handleResize();
});

watch(shiftTimeline, () => {
  handleResize();
});


</script>
<style lang="scss" scoped>
.timeline-row-chart {
  height: 56px;
}
</style>
