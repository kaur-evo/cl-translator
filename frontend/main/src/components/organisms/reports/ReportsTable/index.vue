<template>
  <v-row>
    <v-col cols="12">
      <evocon-v-table
        v-model:options="tableOptions"
        :headers="activeTableHeaders"
        :items="filteredData"
        :loading="loading"
        :height="height"
        :totals="hasTotalRow ? tableTotals : null"
        :width="width"
        :disable-pagination="false"
        :footer-options="footerOptions"
        :page="tableOptions.page"
        :hidden-row-keys="['isFake', 'noData']"
        hide-default-footer
        @link-click="onLinkClick"
      />
    </v-col>
  </v-row>
</template>

<script>
import { mapActions, mapState } from 'pinia';
import { isEqual } from 'lodash';

import { useProfileStore, useReportsConfigStore, useFilterbarStore, useGenericDialogStore } from '@/stores';
import getTableHeadersConfig from '@/stores/reportsConfig/configurations/tableHeadersConfig';
import EvoconVTable from '@/components/molecules/EvoconVTable/index.vue';
import dialogConfig from '@/stores/reportsConfig/configurations/dialogConfig';
import getPaginationConfig from '@/stores/reportsConfig/configurations/paginationConfig';
import dimension from '@/stores/reportsConfig/constants/dimension';
import measure from '@/stores/reportsConfig/constants/measure';
import xAxisKey from '@/stores/reportsConfig/constants/xAxisKey';
import granularity from '@/stores/reportsConfig/constants/granularity';
import configType from '@/stores/reportsConfig/constants/configType';

export default {
  name: 'ReportsTable',
  components: {
    EvoconVTable,
  },
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
    },
    height: {
      type: [Number, String],
      default: 600,
    },
    width: {
      type: Number,
      default: 600,
    },
    tableTotals: { type: Object, required: true },
  },
  computed: {
    ...mapState(useProfileStore, ['language', 'reportsDurationFormat']),
    ...mapState(useReportsConfigStore, [
      'granularity',
      'orderedDateRange',
      'configType',
      'activeHeaders',
      'yAxis',
      'yAxisRight',
      'groupBy',
    ]),
    ...mapState(useFilterbarStore, ['requestFilterState', 'currentFilterItemsMap']),
    filteredData() {
      if (this.configType === configType.PRODUCTION_SPEED) {
        // while this is ok in production speed report where infinite amount of rows are shown,
        // similar approach might cause issues with chart/table pagination elsewhere
        return this.data.filter((entry) => entry.productionCount);
      }
      return this.data;
    },
    hasTotalRow() {
      return !this.groupBy.includes(xAxisKey.SINGLE_OPERATOR);
    },
    tableOptions: {
      get() {
        return {
          sortBy: { key: this.requestFilterState.orderBy, order: this.requestFilterState.orderDir },
          itemsPerPage: this.requestFilterState.itemsPerPage,
          page: this.requestFilterState.page,
          mustSort: true,
        };
      },
      set(newValue) {
        const newOrderBy = newValue.sortBy.key;
        const newOrderDir = newValue.sortBy.order;
        const newItemsPerPage = newValue.itemsPerPage;
        const newPage = newValue.page;
        const isOrderByChanged = !isEqual(newOrderBy, this.requestFilterState.orderBy);
        const isOrderDirChanged = !isEqual(newOrderDir, this.requestFilterState.orderDir);
        const isItemsPerPageChanged = !isEqual(newItemsPerPage, Number(this.requestFilterState.itemsPerPage));
        const isPageChanged = !isEqual(newPage, Number(this.requestFilterState.page));
        if (isOrderByChanged || isOrderDirChanged || isItemsPerPageChanged || isPageChanged) {
          this.updateFilterValue({
            orderBy: newOrderBy,
            orderDir: newOrderDir,
            itemsPerPage: newItemsPerPage,
            page: newPage,
          });
          this.triggerDataRequest();
        }
      },
    },
    footerOptions() {
      return {
        itemsPerPageOptions: getPaginationConfig(this.configType).ITEMS_PER_PAGE_OPTIONS,
      };
    },
    activeTableHeaders() {
      const allHeaders = getTableHeadersConfig({
        yAxisRight: this.yAxisRight,
        yAxis: this.yAxis,
        granularity: this.granularity,
        groupBy: this.groupBy,
        configType: this.configType,
        language: this.language,
        durFormatType: this.reportsDurationFormat,
        tableTotals: this.tableTotals,
        requestFilterState: this.requestFilterState,
        currentFilterItemsMap: this.currentFilterItemsMap,
      });
      const activeHeaders = this.activeHeaders(allHeaders);
      return activeHeaders.filter((header, i) => i === 0 || this.requestFilterState.visibleColumns.includes(header.id));
    },
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['openDialog']),
    ...mapActions(useFilterbarStore, ['updateFilterValue', 'triggerDataRequest']),
    ...mapActions(useReportsConfigStore, ['onDrilldown']),
    openReportNotesDialog(item) {
      this.openDialog({
        ...dialogConfig.REPORTS_NOTES_DIALOG,
        data: {
          dateRange: this.orderedDateRange,
          item,
        },
      });
    },
    onLinkClick(item, header) {
      const isNotesLink = () => new Set([measure.NOTES_COUNT, measure.PERFORMANCE_LOSS_NOTES_COUNT]).has(header.id);
      const isDrilldownLink = () => new Set([
        dimension.COMMENT, dimension.COMMENT_GROUP, dimension.STOP_LOCATION,
        dimension.PERFORMANCE_COMMENT, dimension.PERFORMANCE_COMMENT_GROUP, dimension.PERFORMANCE_LOSS_LOCATION,
        dimension.SCRAP_REASON, dimension.SCRAP_REASON_GROUP,
        dimension.CHECKLIST, dimension.CHECKLIST_GROUP,
        dimension.SHIFT_TEMPLATE, dimension.STATION, dimension.PRODUCT, dimension.PRODUCT_GROUP, xAxisKey.SKU, dimension.SINGLE_OPERATOR,
        granularity.DATE, granularity.MONTH, granularity.WEEKOFYEAR, granularity.YEAR, dimension.STATION_GROUP, dimension.FACTORY,
      ]).has(header.id);

      if (isNotesLink()) {
        this.openReportNotesDialog(item);
      } else if (isDrilldownLink()) {
        this.onDrilldown([item]);
      }
    },
  },
};
</script>
