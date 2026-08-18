<template>
  <div class="d-flex fill-height align-center justify-center">
    <v-progress-circular
      v-if="loading"
      indeterminate
      color="primary"
      size="50"
    />
    <div v-else class="fill-height full-width">
      <div
        v-show="chartData.length > 0"
        :id="`checklist-chart-${props.i}`"
        ref="chartEl"
        class="fill-height full-width"
      />
      <small-placeholder-text
        v-show="chartData.length === 0"
        :primary-text="$t('No data available')"
        :secondary-text="$t('Please check back later or edit settings')"
      />
    </div>
  </div>
</template>

<script setup name="DashboardChecklistInstanceWidget">
import { ref, watch, onMounted } from 'vue';
import { mdiCircle } from '@mdi/js';
import { useI18n } from 'vue-i18n';

import { useProfileStore } from '@/stores/index';
import { getDateLabelFormats } from '@/helpers/date/dashboardDateFormat';
import { formatDate } from '@/helpers/date/formatDate';
import { isWeekendDay } from '@/helpers/date/isWeekendDay';
import statisticsApi from '@/api/statisticsApi';
import SmallPlaceholderText from '@/components/atoms/SmallPlaceholderText/index.vue';
import { requestWidgetViewTypes } from '@/constants/widgetViewTypes';
import colorConstants from '@/constants/colorConstants';
import { formatPercentage } from '@/helpers/numbers/formatNumber';
import { getIconAsset } from '@/helpers/file/getAsset';
import vIconRawTemplate from '@/helpers/html/vIconRawTemplate';
import BarChartHorizontal from '@/components/atoms/BarChartHorizontal/BarChartHorizontal.js';
import BarChartVertical from '@/components/atoms/BarChartVertical/BarChartVertical.js';
import displayModes from '@/constants/checklistWidgetDisplayModes';

const { t } = useI18n();

const profileStore = useProfileStore();

const { dateFormat } = profileStore;

const loading = ref(false);
const chartData = ref([]);
const chart = ref(null);
const chartEl = ref(null);

const props = defineProps({
  config: {
    type: Object,
    required: true,
  },
  updateTrigger: {
    type: Number,
    required: true,
  },
  i: {
    type: Number,
    required: true,
  },
  fetchTrigger: {
    type: Number,
    required: true,
  },
});

const fetchChecklistData = async () => {
  loading.value = true;
  try {
    const params = {
      factoryIds: props.config.factoryId,
      stationIds: props.config.stationId,
      entityIds: props.config.entityIds,
      measure: 'totalcheckcount',
      periodName: props.config.periodName,
      top: props.config.top,
      range: props.config.range,
      displayType: props.config.displayType,
      viewBy: requestWidgetViewTypes[props.config.viewBy],
    };
    const rawData = await statisticsApi.getOeeWidgetData(params);
    chartData.value = props.config.displayType === displayModes.CHECKLIST ? formatChecklistData(rawData) : formatTimelineData(rawData);
  } catch (error) {
    console.error('Error fetching checklist data:', error);
    chartData.value = [];
  } finally {
    loading.value = false;
  }
};

const getGranularityLabel = (granularity) => {
  const granularityLabelMap = {
    checklists: t('Checklist'),
    groups: t('Checklist group'),
    date: t('Day'),
    shift: t('Shift'),
    month: t('Month'),
    weekofyear: t('Week'),
    year: t('year'),
  };
  return granularityLabelMap[granularity] || granularity;
};

const stacks = [
  { valueKey: 'successfulcheckcount', color: colorConstants.dark['lw-green'], label: t('Successful') },
  { valueKey: 'unsuccessfulcheckcount', color: colorConstants.dark['lw-orange'], label: t('Unsuccessful') },
  { valueKey: 'missedcheckcount', color: colorConstants.dark['lw-red'], label: t('Missed') },
  { valueKey: 'newcheckcount', color: colorConstants.dark['secondary-dark'], label: t('New') },
];

const formatChecklistData = (data) => {
  const formattedData = data.results.map((item) => ({
    measureLabel: item.valueLabel,
    tooltipMeasureLabel: item.valueLabel,
    granularityLabel: getGranularityLabel(props.config.viewBy),
    value: item.totalcheckcount,
    measure: item.totalcheckcount,
    stackList: stacks.map((stack) => ({
      measure: item[stack.valueKey],
      value: item[stack.valueKey],
      color: stack.color,
      label: stack.label,
    })),
  }));
  return formattedData;
};

const formatTimelineData = (data) => {
  const { granularity, results } = data;
  const format = getDateLabelFormats(dateFormat, granularity, { week: t('Week') });
  const formattedResults = results.map((item, i) => {
    let cumulativeValue = 0;

    return {
      measure: granularity === 'shift' ? item.valueLabel + i : item.valueLabel,
      measureLabel: granularity === 'shift' ? item.valueLabel : formatDate(item.date, format.shortFormat),
      tooltipMeasureLabel: granularity === 'shift' ? item.valueLabel : t(formatDate(item.date, format.labelFormat)),
      granularityLabel: getGranularityLabel(granularity),
      value: item.totalcheckcount,
      isAreaHighlighted: granularity === 'date' && isWeekendDay(item.date),
      stackList: stacks.map((stack) => {
        const res = [cumulativeValue, cumulativeValue + item[stack.valueKey]];
        cumulativeValue += item[stack.valueKey];
        res.data = {
          ...stack,
          value: item[stack.valueKey],
          measure: granularity === 'shift' ? item.valueLabel + i : item.valueLabel,
        };
        return res;
      }),
    };
  });
  return formattedResults;
};

const tooltipHTMLFunc = (data) => {
  const total = data.value;

  const iconYAxis = getIconAsset('iconYAxis.svg');
  const icon = `<img style="width: 10px" class="ml-n1 mr-2" src="${iconYAxis}" />`;
  const granularityRow = `<div class="text-label-small">${data.granularityLabel}</div>`;
  const titleRow = `<div class="font-weight-medium">${data.tooltipMeasureLabel}</div>`;
  let html = granularityRow + titleRow;
  data.stackList.forEach((item) => {
    const itemData = item.data || item;
    const percentage = formatPercentage(itemData.value / total * 100);
    html += `<div class="d-flex flex-row text-label-small text-quaternary-dark-2"><span class="pr-1">${vIconRawTemplate(mdiCircle, 10, itemData.color, '')}</span>${itemData.label}:&nbsp;<span class="text-primary-text">${itemData.value}</span>&nbsp;(${percentage})</div>`;
  });
  const totalRow = `<div class="d-flex flex-row text-label-small text-quaternary-dark-2"><span class="pl-1 mr-n1">${icon}</span> ${t('Count')}:&nbsp;<span class="text-primary-text">${total}</span></div>`;
  html += totalRow;
  return html;
};

const drawChart = () => {
  if (chartEl.value && chartData.value.length > 0) {
    if (props.config.displayType === displayModes.CHECKLIST) {
      chart.value = new BarChartHorizontal({
        data: chartData.value,
        element: chartEl.value,
        tooltipHTMLFunc,
        isStacked: true,
        isDark: true,
      });
    } else {
      chart.value = new BarChartVertical({
        element: chartEl.value,
        data: chartData.value,
        tooltipHTMLFunc,
        gradientColor: colorConstants.dark['lw-background'],
        isStacked: true,
        isDark: true,
        isRounded: true,
        areaHighlightsEnabled: true,
      });
    }
  }
};

onMounted(async () => {
  await fetchChecklistData();
  drawChart();
});

watch(
  () => [props.updateTrigger, props.fetchTrigger],
  async () => {
    await fetchChecklistData();
    drawChart();
  },
  { deep: true },
);
</script>
