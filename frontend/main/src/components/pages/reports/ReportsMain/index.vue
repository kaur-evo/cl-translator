<template>
  <main-app-toolbar>
    <template v-if="isMobileView" #toolbar-selection>
      <reports-bookmark-drawer v-model:mini="isSideMenuMiniVersion" />
    </template>
    <template v-if="isMobileView" #toolbar-action>
      <reports-header-actions @pdf-export="onPdfExport" />
    </template>
  </main-app-toolbar>
  <reports-layout-template :is-side-menu-mini="isSideMenuMiniVersion">
    <template v-if="!isMobileView" #left-nav-drawer>
      <reports-bookmark-drawer v-model:mini="isSideMenuMiniVersion" />
    </template>
    <template v-if="!isMobileView" #header>
      <reports-header-title id="report-title" ref="title" />
    </template>
    <template v-if="!isMobileView" #header-action>
      <reports-header-actions @pdf-export="onPdfExport" />
    </template>
    <template #filters>
      <reports-filter-bar id="report-filter-bar" ref="filterbar" />
    </template>
    <template #chart-back-btn>
      <reports-back-btn />
    </template>
    <template #chart-actions>
      <reports-chart-options-menu
        :label="''"
        :menu-items="getChartTypeSelectionMenuItems({ type: configType, required: true })"
        :disabled="chartSelectionDisaled"
        change-action-key="onChartTypeChange"
        value-key="chartTypeJoined"
      />
      <reports-chart-options-menu
        :label="$t('Y-axis')"
        change-action-key="onYAxisChange"
        :menu-items="yAxisSelectionMenuItems({ type: configType, isSecondYAxis: false })"
        value-key="yAxis"
        :disabled="filtersInErrorState"
        :img-src="getIconAsset('iconYAxis.svg')"
      />
      <reports-chart-options-menu
        :label="$t('2nd Y-axis')"
        change-action-key="onRightYAxisChange"
        :menu-items="yAxisSelectionMenuItems({ type: configType, isSecondYAxis: true })"
        value-key="yAxisRight"
        :img-src="getIconAsset('icon2ndYAxis.svg')"
      />
      <v-divider v-if="!isQuantitiesReport" vertical class="my-2 mx-2" />
      <reports-granularity-selection :disabled="filtersInErrorState" />
      <reports-chart-options-menu
        v-if="secondaryGroupingEnabled"
        :label="$t('Split by')"
        change-action-key="onGroupByChange"
        :menu-items="convertObjToMap({ ...groupByMenuItems, '': { text: '-' } })"
        value-key="groupBy"
        menu-text-key="text"
        array-value-key-index="1"
        :img-src="getIconAsset('iconXZAxis.svg')"
      />
      <reports-view-options />
    </template>
    <template #chart>
      <v-col
        class="fill-height pa-0"
      >
        <reports-chart
          v-if="isChartVisible"
          id="report-chart"
          ref="chart"
          :totals="totals"
          :is-side-menu-open="!isSideMenuMiniVersion"
        />
        <div
          v-else
          class="d-flex align-center fill-height justify-center"
        >
          <empty-view
            v-if="!isLoading"
            id="report-empty-view"
            :header="$t('No results')"
            :description="$t('Please try again with other settings.')"
            :img-url="'reports'"
          />
        </div>
        <div
          v-if="isLoading"
          class="chart-loading-wrapper"
        >
          <v-progress-circular
            color="primary"
            indeterminate
          />
        </div>
      </v-col>
    </template>
    <template #legend>
      <div class="d-flex" :class="getLabel(configType) ? 'flex-column' : 'flex-row-reverse flex-wrap'">
        <div class="d-flex">
          <div v-if="!!getLabel(configType)" class="flex-shrink-1 flex-grow-1 align-center d-flex overflow-hidden">
            <span class="text-body-small font-weight-medium text-uppercase mr-4 text-no-wrap overflow-hidden text-overflow-ellipsis">{{ getLabel(configType) }}</span>
          </div>
          <div class="flex-shrink-0 flex-grow-0 mr-0">
            <reports-pagination
              v-if="isChartVisible"
              id="reports-chart-pagination"
              :items="chartData"
            />
          </div>
        </div>
        <div class="d-flex flex-grow-1 flex-shrink-0 max-width-100">
          <reports-graph-legend id="reports-chart-legend" ref="legend" :totals="totals" />
        </div>
      </div>
    </template>
    <template
      v-if="tableData && tableData.length > 0"
      #table
    >
      <reports-table-header :table-totals="totals" />
      <reports-table
        id="report-table"
        ref="table"
        :loading="isLoading"
        :data="enrichedTableData"
        :height="'auto'"
        :width="tableWidth"
        :table-totals="totals"
      />
      <div class="d-flex justify-end">
        <reports-pagination
          :items="chartData"
          scroll-into-view
        />
      </div>
    </template>
  </reports-layout-template>
  <ai-insights-station-menu
    v-if="shouldEnrichWithAiInsights"
    @submit="onAiInsightsSubmit"
  />
  <ai-insights-email-confirmation
    v-if="shouldEnrichWithAiInsights"
  />
  <ai-insights-tutorial
    v-if="aiNotesInsightsEnabled && isDowntimeReport"
  />
</template>
<script>
import { mapState, mapActions } from 'pinia';
import { nextTick } from 'vue';

import { useFilterbarStore, useDeviceStore, useReportsConfigStore, useConfigurationStore, useAiInsightsStore } from '@/stores';
import MainAppToolbar from '@/components/organisms/MainAppToolbar/index.vue';
import ReportsLayoutTemplate from '@/components/templates/ReportsLayoutTemplate/index.vue';
import ReportsHeaderActions from '@/components/organisms/reports/ReportsHeaderActions/index.vue';
import ReportsBookmarkDrawer from '@/components/organisms/reports/ReportsBookmarkDrawer/index.vue';
import ReportsFilterBar from '@/components/organisms/reports/ReportsFilterBar/index.vue';
import ReportsHeaderTitle from '@/components/organisms/reports/ReportsHeaderTitle/index.vue';
import ReportsChart from '@/components/organisms/reports/ReportsChart/index.vue';
import ReportsTable from '@/components/organisms/reports/ReportsTable/index.vue';
import ReportsBackBtn from '@/components/organisms/reports/ReportsBackBtn/index.vue';
import ReportsGranularitySelection from '@/components/organisms/reports/ReportsGranularitySelection/index.vue';
import ReportsGraphLegend from '@/components/organisms/reports/ReportsGraphLegend/index.vue';
import ReportsViewOptions from '@/components/organisms/reports/ReportsViewOptions/index.vue';
import ReportsPagination from '@/components/organisms/reports/ReportsPagination/index.vue';
import ReportsChartOptionsMenu from '@/components/organisms/reports/ReportsChartOptionsMenu/index.vue';
import EmptyView from '@/components/atoms/EmptyView/index.vue';
import getChartTranslations from '@/stores/reportsConfig/configurations/chartTranslations';
import ReportsTableHeader from '@/components/organisms/reports/ReportsTableHeader/index.vue';
import AiInsightsStationMenu from '@/components/organisms/aiInsights/AiInsightsStationMenu/index.vue';
import AiInsightsEmailConfirmation from '@/components/organisms/aiInsights/AiInsightsEmailConfirmation/index.vue';
import AiInsightsTutorial from '@/components/organisms/aiInsights/AiInsightsTutorial/index.vue';
import yAxisSelectionMenuItems from '@/stores/reportsConfig/configurations/yAxisSelectionMenuItems';
import getChartTypeSelectionMenuItems from '@/stores/reportsConfig/configurations/chartTypeSelectionMenuItems';
import config from '@/stores/reportsConfig/constants/configType';
import { areRequiredFiltersValid } from '@/stores/reportsConfig/configurations/productionSpeedCommonFn';
import { getIconAsset } from '@/helpers/file/getAsset';
import convertObjToMap from '@/helpers/object/convertObjToMap';
import getObjectDiffKeys from '@/helpers/object/getObjectDiffKeys';
import xAxisKey from '@/stores/reportsConfig/constants/xAxisKey';
import { TOTAL } from '@/stores/reportsConfig/constants/granularity';
import { MIN_NOTES_FOR_ELIGIBILITY } from '@/constants/aiInsights';
import { getStopReasonId } from '@/helpers/aiInsights/getStopReasonId';

export default {
  name: 'ReportsMain',
  components: {
    MainAppToolbar,
    ReportsLayoutTemplate,
    ReportsBookmarkDrawer,
    ReportsFilterBar,
    ReportsHeaderActions,
    ReportsHeaderTitle,
    ReportsChart,
    ReportsBackBtn,
    ReportsGraphLegend,
    EmptyView,
    ReportsTable,
    ReportsGranularitySelection,
    ReportsViewOptions,
    ReportsPagination,
    ReportsChartOptionsMenu,
    ReportsTableHeader,
    AiInsightsStationMenu,
    AiInsightsEmailConfirmation,
    AiInsightsTutorial,
  },
  data() {
    return {
      isSideMenuMiniVersion: true,
      tableWidth: 100,
      timeoutRef: null,
    };
  },
  computed: {
    ...mapState(useFilterbarStore, ['requestFilterState']),
    ...mapState(useDeviceStore, ['screenWidth', 'isMobileView']),
    ...mapState(useReportsConfigStore, ['tableData', 'totals', 'chartData', 'rawData', 'isLoading', 'configType', 'chartLegendState', 'groupByMenuItems', 'groupBy', 'granularity', 'orderedDateRange']),
    ...mapState(useConfigurationStore, ['aiNotesInsightsEnabled']),
    ...mapState(useAiInsightsStore, ['hasEligibleStations']),
    chartSelectionDisaled() {
      return this.groupBy?.length > 1;
    },
    secondaryGroupingEnabled() {
      const enabledConfigTypes = new Set([config.DOWNTIME, config.SPEEDLOSS, config.SCRAPREASON, config.TIME_USAGE, config.QUANTITY, config.CHECKLIST, config.OEE]);
      return enabledConfigTypes.has(this.configType);
    },
    isLegendEmpty() {
      const enabledConfigTypes = new Set([config.OEE, config.TIME_USAGE, config.QUANTITY, config.CHECKLIST]);
      return this.chartLegendState.length === 0 && enabledConfigTypes.has(this.configType);
    },
    isChartVisible() {
      // tableData doesn't include fake elements and chart shouldn't be visible if there is no real data
      return this.tableData.length > 0 && !this.isLegendEmpty;
    },
    filtersInErrorState() {
      if (this.configType === config.PRODUCTION_SPEED) {
        return !areRequiredFiltersValid(this.requestFilterState);
      }
      return false;
    },
    isQuantitiesReport() {
      return this.configType === config.QUANTITY;
    },
    isDowntimeReport() {
      return this.configType === config.DOWNTIME;
    },
    isStopReasonsXAxis() {
      return this.groupBy?.[0] === xAxisKey.ENTITY_ID;
    },
    isGranularityTotal() {
      return this.granularity === TOTAL;
    },
    shouldEnrichWithAiInsights() {
      return this.aiNotesInsightsEnabled && this.isDowntimeReport && this.isStopReasonsXAxis && this.isGranularityTotal;
    },
    enrichedTableData() {
      if (!this.shouldEnrichWithAiInsights) return this.tableData;

      return this.tableData.map((row) => ({
        ...row,
        _hasAiInsights: this.hasEligibleStations(getStopReasonId(row)),
      }));
    },
  },
  watch: {
    async requestFilterState(newVal, prevVal) {
      await nextTick(); // wait that dateRange gets current value
      const changedQueryParams = getObjectDiffKeys(newVal, prevVal);
      const skipRecalculationParams = new Set(['orderBy', 'orderDir', 'chartType', 'itemsPerPage', 'page', 'visibleColumns']);
      const requiresRecalculation = changedQueryParams.length && changedQueryParams.some((k) => !skipRecalculationParams.has(k));
      if (requiresRecalculation) {
        this.clearEligibleStations();
        this.updateFilterValue({ page: 1 });
        this.triggerDataRequest();
        this.requestReportsData();
      } else {
        this.initMapperReorder();
      }
    },
    isSideMenuMiniVersion(val) {
      window.localStorage.setItem('isReportsSideMenuCollapsed', val);
      this.setTableWidth();
    },
    screenWidth() {
      this.setTableWidth();
    },
    shouldEnrichWithAiInsights(newVal) {
      if (!newVal) {
        this.clearEligibleStations();
        return;
      }
      this.fetchEligibleStationsFromTableData();
    },
    tableData: {
      handler() {
        if (!this.shouldEnrichWithAiInsights) return;
        this.fetchEligibleStationsFromTableData();
      },
      immediate: true,
    },
    async rawData() {
      this.initMapperCalculation({
        translationsObj: getChartTranslations(),
        isCompactFormatted: this.$vuetify.display.mdAndDown,
      });
      await nextTick();
      this.setTableWidth();
    },
  },
  mounted() {
    const storageValue = window.localStorage.getItem('isReportsSideMenuCollapsed');
    this.isSideMenuMiniVersion = storageValue === 'true';

    this.initDataMapper();

    window.evoconReports = { onPdfExport: this.onPdfExport };
  },
  async beforeUnmount() {
    await this.$router.push({ query: {} });
    this.resetRequestFilterState();
  },
  methods: {
    getIconAsset,
    yAxisSelectionMenuItems,
    getChartTypeSelectionMenuItems,
    convertObjToMap,
    ...mapActions(useFilterbarStore, ['updateFilterValue', 'triggerDataRequest', 'resetRequestFilterState']),
    ...mapActions(useReportsConfigStore, ['generateReportsPdf', 'requestReportsData', 'initDataMapper', 'initMapperReorder', 'initMapperCalculation', 'buildQueryArgs']),
    ...mapActions(useAiInsightsStore, ['submitAnalysis', 'fetchEligibleStations', 'clearEligibleStations']),
    async onAiInsightsSubmit() {
      const [startDate, endDate] = this.orderedDateRange;
      const queryArgs = await this.buildQueryArgs();

      await this.submitAnalysis({
        startDate,
        endDate,
        filters: queryArgs.filters,
        inverseFilter: queryArgs.query?.invertedFilters || [],
      });
    },
    async fetchEligibleStationsFromTableData() {
      if (!this.shouldEnrichWithAiInsights) return;
      if (!this.tableData || this.tableData.length === 0) return;

      const stopReasonIds = [...new Set(
        this.tableData
          .filter((item) => (item.notesCount || 0) >= MIN_NOTES_FOR_ELIGIBILITY)
          .map((item) => getStopReasonId(item))
          .filter(Boolean),
      )];

      const [startDate, endDate] = this.orderedDateRange;

      if (stopReasonIds.length > 0 && startDate && endDate) {
        const queryArgs = await this.buildQueryArgs();

        this.fetchEligibleStations({
          stopReasonIds,
          startDate,
          endDate,
          filters: queryArgs.filters,
          inverseFilter: queryArgs.query?.invertedFilters || [],
        });
      }
    },
    setTableWidth() {
      this.tableWidth = 0;
      if (this.timeoutRef !== null) {
        clearTimeout(this.timeoutRef);
        this.timeoutRef = null;
      }
      this.timeoutRef = setTimeout(() => {
        this.tableWidth = this.getTableWidth();
      }, 300);
    },

    onPdfExport() {
      const titleEl = this.$refs.title?.$el;
      const filterbarEl = this.$refs.filterbar?.$el;
      const chartEl = this.$refs.chart?.$el;
      const legendEl = this.$refs.legend?.$el;
      const tableEl = this.$refs.table?.$el;
      const elList = [titleEl, filterbarEl, chartEl, legendEl, tableEl].filter(Boolean);
      if (!elList.length) return;
      this.generateReportsPdf(elList);
    },

    getTableWidth() {
      const clientWidth = document.body.scrollWidth;
      const smallScreenMode = this.$vuetify.display.mdAndDown;
      const miniVersionWidth = 68;
      const largeVersionWidth = 256;
      let sideMenuWidth;
      if (smallScreenMode) {
        sideMenuWidth = 0;
      } else if (this.isSideMenuMiniVersion) {
        sideMenuWidth = miniVersionWidth;
      } else {
        sideMenuWidth = largeVersionWidth;
      }

      /* eslint-disable no-magic-numbers */
      const contentPadding = this.isMobileView ? 0 : 2 * 16;
      const mainDrawerWidth = this.$vuetify.display.mdAndUp ? 64 : 0;
      const tableMargin = 16 * 2;
      const tablePadding = 8 * 2;
      /* eslint-enable no-magic-numbers */

      const tableWidth = clientWidth
        - mainDrawerWidth
        - contentPadding
        - sideMenuWidth
        - tableMargin
        - tablePadding;
      return tableWidth;
    },
    getLabel(configType) {
      const typeLabelMap = {
        [config.DOWNTIME]: this.$t('Stop groups'),
        [config.SPEEDLOSS]: this.$t('Speed loss groups'),
        [config.SCRAPREASON]: this.$t('Scrap groups'),
      };
      return typeLabelMap[configType] || '';
    },
  },
};
</script>

<style lang="scss" scoped>
.chart-loading-wrapper {
  position: relative;
  top: -100%;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.6);
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
