<template>
  <component
    :is="widgetComponent"
    :config="widget.config"
    :widget-key="widgetKey"
    :widget-sub-type="widgetSubType"
    :large="large"
    :value-class="valueClass"
  />
</template>
<script setup name="WidgetRenderer">
import { computed } from 'vue';

import { useShiftViewWidgetsStore } from '@/stores/index';
import PerformanceWidget from '@/components/organisms/shiftview/ShiftviewPerformanceWidget/index.vue';
import OEEWidget from '@/components/organisms/shiftview/ShiftviewOeeWidget/index.vue';
import ShiftviewCustomChartWidget from '@/components/organisms/shiftview/ShiftviewCustomChartWidget/index.vue';
import MeasuresWidget from '@/components/organisms/shiftview/ShiftviewMeasuresWidget/index.vue';

const shiftViewWidgetsStore = useShiftViewWidgetsStore();

const props = defineProps({
  widget: {
    type: Object,
    required: true,
  },
  widgetKey: {
    type: Number,
    default: 0,
  },
  large: Boolean,
  valueClass: {
    type: String,
    default: '',
  },
});

const components = {
  'performance-widget': PerformanceWidget,
  'OEE-widget': OEEWidget,
  'measure-widget': MeasuresWidget,
  'shiftview-custom-chart-widget': ShiftviewCustomChartWidget,
};

const widgetComponent = computed(() => components[props.widget.component]);
const perfWidgetType = computed(() => shiftViewWidgetsStore.perfWidgetType);

const widgetSubType = computed(() => {
  if (props.widget.component === 'performance-widget') return perfWidgetType.value;
  return null;
});
</script>
