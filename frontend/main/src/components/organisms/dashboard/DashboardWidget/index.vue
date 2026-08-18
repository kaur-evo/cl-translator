<template>
  <div
    v-if="!String(widget.i).startsWith('new') && stationsAllowedAndLoaded"
    class="d-flex bg-lw-background fill-height flex-column flex-nowrap rounded elevation-2"
  >
    <widget-header
      :items="items"
      :widget-title="widgetTitle"
      :widget-subtitle="widgetStationNames"
      :widget-period="widgetPeriod"
      @menu-action="onMenuAction"
    />
    <div class="flex-grow-1 flex-shrink-0 pb-6 px-6 pt-2">
      <oee-donut-widget
        v-if="widget.type === OEE_DONUT"
        :key="`donut-widget-${widget.i}`"
        :widget-data="widget.config"
        :i="widget.i"
        :update-trigger="updateTrigger"
        :fetch-trigger="widgetFetchDataTrigger"
      />
      <oee-bar-widget
        v-else-if="widget.type === OEE_CHART"
        :key="`bar-widget-${widget.i}`"
        :widget-data="widget.config"
        :i="widget.i"
        :type="widget.type"
        :update-trigger="updateTrigger"
        :fetch-trigger="widgetFetchDataTrigger"
        :measure="widget.config.measure"
      />
      <checklist-widget
        v-else-if="widget.type === CHECKLIST_WIDGET"
        :key="`checklist-timeline-widget-${widget.i}`"
        :config="widget.config"
        :i="widget.i"
        :update-trigger="updateTrigger"
        :fetch-trigger="widgetFetchDataTrigger"
      />
      <horizontal-bar-widget
        v-else-if="[DELAYS_CHART, SPEEDLOSS_CHART, SCRAP_CHART].includes(widget.type)"
        :key="`horizontal-bar-widget-${widget.i}`"
        :widget-data="widget.config"
        :i="widget.i"
        :type="widget.type"
        :update-trigger="updateTrigger"
        :fetch-trigger="widgetFetchDataTrigger"
      />
    </div>
  </div>
</template>
<script>
import { mapState, mapActions } from 'pinia';
import { mdiChevronRight } from '@mdi/js';
import { defineAsyncComponent } from 'vue';

import {
  CHECKLIST_WIDGET,
  DELAYS_CHART,
  OEE_CHART,
  OEE_DONUT,
  SCRAP_CHART,
  SPEEDLOSS_CHART,
} from '@/constants/dashboardWidgetTypes';
import { CUSTOM } from '@/constants/predefinedTimePeriodNames';
import { formatDate } from '@/helpers/date/formatDate';
import CustomInterval from '@/helpers/interval/CustomInterval';
import WidgetHeader from '@/components/organisms/dashboard/WidgetHeader/index.vue';
import { getPeriod } from '@/constants/getPeriods';
import { getMeasure } from '@/constants/getMeasures';
import OeeDonutWidget from '@/components/organisms/dashboard/DashboardOeeDonutWidget/index.vue';
import OeeBarWidget from '@/components/organisms/dashboard/DashboardOeeBarWidget/index.vue';
import HorizontalBarWidget from '@/components/organisms/dashboard/DashboardHorizontalBarWidget/index.vue';
import ChecklistWidget from '@/components/organisms/dashboard/ChecklistWidget/index.vue';
import { useStationStore, useDeviceStore, useDashboardConfigStore, useGenericDialogStore } from '@/stores/index';

const widgetTypeNames = {
  OEE_CHART,
  DELAYS_CHART,
  OEE_DONUT,
  SPEEDLOSS_CHART,
  SCRAP_CHART,
  CHECKLIST_WIDGET,
};
const vectorIcons = { mdiChevronRight };
export default {
  name: 'DashboardWidget',
  components: {
    OeeDonutWidget,
    OeeBarWidget,
    HorizontalBarWidget,
    WidgetHeader,
    ChecklistWidget,
  },
  props: {
    widget: {
      type: Object,
      required: true,
    },
    updateTrigger: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      ...vectorIcons,
      ...widgetTypeNames,
      widgetFetchDataInterval: null,
      widgetFetchDataTrigger: 0,
    };
  },
  computed: {
    ...mapState(useStationStore, ['stationsMap', 'stations']),
    ...mapState(useDeviceStore, ['isBrowserTabActive']),
    stationsAllowedAndLoaded() {
      return this.stations && !!this.stations.length;
    },
    items() {
      return [
        {
          title: this.$t('Edit'),
          id: 0,
          class: '',
          value: 'edit',
        },
        {
          title: this.$t('Duplicate'),
          class: '',
          value: 'duplicate',
        },
        {
          title: this.$t('Delete'),
          id: 3,
          class: 'text-error',
          value: 'delete',
        },
      ];
    },
    widgetStations() {
      const widgetConf = this.widget.config || {};
      if (widgetConf.stationId?.length > 0) {
        return widgetConf.stationId.reduce((acc, stationId) => {
          const station = this.stationsMap[stationId];
          if (station) acc.push(station);
          return acc;
        }, []);
      }
      if (widgetConf.factoryId?.length > 0) return this.stations.filter((station) => widgetConf.factoryId.includes(station.factoryId));
      return this.stations;
    },
    widgetStationNames() {
      return this.widgetStations.map((station) => station.name).join(', ');
    },
    oeeChartTitle() {
      return getMeasure(this.widget.config.measure)?.display ?? '';
    },
    widgetTitle() {
      const widgetName = this.widget.config && this.widget.config.widgetName;
      if (widgetName) return widgetName;
      const widgetTitleMap = {
        [OEE_DONUT]: this.$t('OEE'),
        [DELAYS_CHART]: this.$t('Stop reasons'),
        [SPEEDLOSS_CHART]: this.$t('Speed loss'),
        [SCRAP_CHART]: this.$t('Scrap reasons'),
        [DELAYS_CHART]: this.$t('Downtime'),
        [OEE_CHART]: this.oeeChartTitle,
      };
      return widgetTitleMap[this.widget.type];
    },
    widgetPeriod() {
      const widgetConfig = this.widget.config;
      if (widgetConfig.periodName === CUSTOM) return `${formatDate(widgetConfig.range.start, 'long')} - ${formatDate(widgetConfig.range.end, 'long')}`;
      return getPeriod(widgetConfig.periodName).display;
    },
  },
  watch: {
    isBrowserTabActive(val, prevVal) {
      if (val && val !== prevVal) {
        this.updateWidgetFetchDataTrigger();
        this.setDataFetchInterval();
      } else if (this.widgetFetchDataInterval) {
        this.widgetFetchDataInterval = this.widgetFetchDataInterval.clear();
      }
    },
  },
  mounted() {
    this.setDataFetchInterval();
  },
  unmounted() {
    if (this.widgetFetchDataInterval) this.widgetFetchDataInterval = this.widgetFetchDataInterval.clear();
  },
  methods: {
    ...mapActions(useDashboardConfigStore, [
      'initDeleteWidgetFlow',
      'duplicateWidget',
    ]),
    ...mapActions(useGenericDialogStore, ['openDialog']),
    onMenuAction(action) {
      switch (action) {
        case 'edit':
          this.openWidgetEditForDesktop(this.widget);
          break;
        case 'delete':
          this.initDeleteWidgetFlow(this.widget.i);
          break;
        case 'move':
          break;
        case 'update':
          break;
        case 'duplicate':
          this.duplicateWidget(this.widget);
          break;
        default:
          break;
      }
    },
    updateWidgetFetchDataTrigger() {
      this.widgetFetchDataTrigger = new Date().getTime();
    },
    setDataFetchInterval() {
      this.widgetFetchDataInterval = new CustomInterval(this.updateWidgetFetchDataTrigger, 5 * 60 * 1000).set();
    },
    openWidgetEditForDesktop(widget) {
      const dialogConfig = {
        width: 716,
        data: { widget },
        component: defineAsyncComponent(() => import('../DashboardWidgetEdit/index.vue')),
      };
      this.openDialog(dialogConfig);
    },
  },
};
</script>
