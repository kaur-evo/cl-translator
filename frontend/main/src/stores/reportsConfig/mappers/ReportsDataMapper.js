import orderByFunc from 'lodash/orderBy';
import { toRaw } from 'vue';
import { parseISO } from 'date-fns';

import { defaultLocalizationOptions } from '@/constants/formattingConstants';
import i18n from '@/services/i18n';

function paginate(inputData, {
  page, itemsPerPage,
}) {
  if (itemsPerPage < 0) return inputData;
  const pageCount = Math.ceil(inputData.length / itemsPerPage);
  const validPage = Math.min(page, pageCount);
  const startIndex = ((Number(validPage) - 1) * itemsPerPage);
  const endIndex = (validPage * itemsPerPage);
  const outputData = [...inputData].slice(startIndex, endIndex);
  return outputData;
}
export default class ReportsDataMapper {
  constructor(args) {
    this.onCalcDataChange = args?.onCalcDataChange;
    this.onLoadingChange = args?.onLoadingChange;
    this.isStacked = args?.isStacked || [true, true, true];
    this.usePagination = args?.usePagination || false;
    this.formattingOptions = args?.formattingOptions || defaultLocalizationOptions;
    this.chartLegendState = args?.chartLegendState || [];
  }

  groupBy = [''];

  loading = [];

  data = [];

  pctTotal = 0;

  stackLegend = new Map();

  tableData = [];

  totals = {};

  get dataPctTotal() {
    const dataPctModificationSeal = JSON.stringify(this.data);

    Object.assign(this, { dataPctModificationSeal });
    this.pctTotal = this.data.reduce((sum, item) => (item.stoppct || item.performancelosspct || 0) + sum, 0);

    return this.pctTotal;
  }

  get calculatedData() {
    return this.data;
  }

  setCalculatedData = (inputObj) => {
    Object.assign(this, inputObj);
    if (this.onCalcDataChange !== undefined) {
      this.onCalcDataChange(inputObj);
    }
  };

  setLoading(val) {
    if (val) this.loading.push('loading');
    else this.loading.pop();
    if (this.onLoadingChange !== undefined) {
      this.onLoadingChange(!!this.loading.length);
    }
  }

  getCalendarTimeSec() {
    const startDt = parseISO(`${this.startDate}T00:00:00.000Z`);
    const endDt = parseISO(`${this.endDate}T23:59:59.999Z`);
    return Math.round((endDt - startDt) / 1000);
  }

  calculateChartData() {
    const {
      granularity, dataPctTotal, startDate, endDate,
      translations, groupBy, isCompactFormatted, yAxis,
    } = this;
    this.setLoading(true);
    window.WorkerService
      .process('processReportsDataGranularity', {
        args: [
          toRaw(this.data),
          this.configType,
          {
            granularity,
            groupBy: toRaw(groupBy),
            dataPctTotal, // required by mapper
            startDate,
            endDate,
            translations: toRaw(translations),
            isCompactFormatted,
            yAxis,
            calendarTimeSec: this.getCalendarTimeSec(),
            locale: i18n.global.locale,
            configType: this.configType,
          },
          toRaw(this.isStacked),
          toRaw(this.formattingOptions),
          toRaw(this.hiddenGroupingValues),
          toRaw(this.chartLegendState),
        ],
      })
      .then((reductionResults) => {
        const {
          chartData, stackLegend, tableData, totals,
        } = reductionResults;
        let data = orderByFunc(chartData, this.orderBy, this.orderDir);
        const orderedTableData = orderByFunc(tableData, this.orderBy, this.orderDir);
        if (this.usePagination) {
          data = paginate(data, {
            page: this.page,
            itemsPerPage: this.itemsPerPage,
          });
        }
        this.setCalculatedData({
          chartData, data, totals, stackLegend, tableData: orderedTableData,
        });
        this.setLoading(false);
      })
      .catch(() => {
        this.setLoading(false);
      })
      .cancel(() => {
        this.setLoading(false);
      });
  }

  reOrderData({
    orderBy, orderDir, page, itemsPerPage,
  }) {
    let data = orderByFunc(this.chartData, orderBy, orderDir);
    if (this.usePagination) {
      data = paginate(data, {
        page,
        itemsPerPage,
      });
    }
    this.setCalculatedData({
      data,
      chartData: this.chartData,
      totals: this.totals,
      stackLegend: this.stackLegend,
      tableData: this.tableData,
    });
  }

  // data, granularity, startDate, endDate, chartLegendState
  // entityType, groupBy, translations, orderBy, orderDir, isStacked, page, itemsPerPage
  getChartData(inputObj) {
    Object.assign(this, inputObj);
    this.calculateChartData();
    return this.calculatedData;
  }
}
