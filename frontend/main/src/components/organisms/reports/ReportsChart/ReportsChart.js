import * as d3 from 'd3';
import { isString, isFunction } from 'lodash';

import mixin from '@/helpers/class/mixin';
import BaseContainer from '@/d3/BaseContainer';
import VerticalBarChartModule from '@/d3/VerticalBarChart';
import BottomAxisModule from '@/d3/BottomAxis';
import VerticalAxisModule from '@/d3/VerticalAxis';
import GridlinesModule from '@/d3/Gridlines';
import ZoomModule from '@/d3/Zoom';
import DataPointLabel from '@/d3/DataPointLabel';
import NewTrendLineModule from '@/d3/NewTrendLine';
import LineChartModule from '@/d3/LineChart';
import AreaChartModule from '@/d3/AreaChart';
import DotPlotModule from '@/d3/DotPlot';
import EventMarkerModule from '@/d3/EventMarker';
import {
  getTextWidth,
  showTooltip, hideTooltip,
} from '@/helpers/d3Helpers';
import XAxisHoverLineModule from '@/d3/XAxisHoverLine';
import chartTooltipTemplate from '@/helpers/html/tooltipTemplate';
import { isIOS } from '@/helpers/ios/DetectIOSTouch';
import chartType from '@/stores/reportsConfig/constants/chartType';
import curveType from '@/stores/reportsConfig/constants/curveType';
import granularityType from '@/stores/reportsConfig/constants/granularity';
import isMoveEvent from '@/d3/helpers/isMoveEvent';
import chartTooltipConfig from '@/stores/reportsConfig/configurations/chartTooltipConfig';
import configType from '@/stores/reportsConfig/constants/configType';
import i18n from '@/services/i18n';
import getChartSubGroupLabelConfig from '@/stores/reportsConfig/configurations/chartSubGroupLabelConfig';
import yAxisKey from '@/stores/reportsConfig/constants/yAxisKey';
import colorConstants from '@/constants/colorConstants';
import EventMarkerConfig from '@/components/organisms/reports/ReportsChart/EventMarkerConfig';
import getPreCalcConfigs from '@/stores/reportsConfig/configurations/preProcessingConfig';
import { INNER_PADDING, OFFSET_MULTIPLIER } from '@/d3/constants';
import TooltipRenderer from '@/helpers/tooltips/TooltipRenderer';
import { useFilterbarStore } from '@/stores';

const BAR_COMPACT_WIDTH_BREAKPOINT = 15;
const TIME_USAGE_BAR_COMPACT_WIDTH_BREAKPOINT = 40;

const BAR_MIN_WIDTH = 5;
const BAR_PADDING = 1;
const GROUPED_BAR_MAX_WIDTH = 10000;
const UNGROUPED_BAR_MAX_WIDTH = 200;

const SECONDARY_LABELS_HEIGHT = 100;

export function getLegendStateOrdered(cfgType, legendState) {
  const preProcessingConfig = getPreCalcConfigs({ formattingOptions: {}, requirements: {} });
  const config = preProcessingConfig.get(cfgType);
  const legendStateSet = new Set(legendState);
  if (config) {
    return Array.from(config.groupingConfig.keys()).filter((key) => legendStateSet.has(key)).reverse();
  }
  throw new Error(`Config not found for configType: ${cfgType}`);
}
export default class ReportsChart

  extends mixin(BaseContainer).with(
    VerticalBarChartModule,
    BottomAxisModule,
    VerticalAxisModule,
    GridlinesModule,
    ZoomModule,
    DataPointLabel,
    NewTrendLineModule,
    XAxisHoverLineModule,
    LineChartModule,
    AreaChartModule,
    DotPlotModule,
    EventMarkerModule,
  ) {
  constructor(opts) {
    super(opts);
    this.translations = opts.translations || {};
    this.granularity = opts.granularity || granularityType.TOTAL;
    this.yScaleType = opts.yScaleType || 'scaleTime';
    this.yScaleTypeRight = opts.yScaleTypeRight || 'scaleTime';
    this.isDark = false;
    this.isDrawn = false;
    this.scaleTransform = { k: 1, x: 0 };
    this.curveType = curveType.MONOTONE_X;
    this.scrollLeftPct = 0;
    this.yAxisKey = opts.yAxisKey || yAxisKey.VALUE;
    this.yAxisKeyRight = opts.yAxisKeyRight || null;
    this.stackDomain = opts.stackDomain || [];
    this.dateRange = opts.dateRange || [];
    this.firstDayOfWeek = opts.firstDayOfWeek ?? 1;
    this.chartLegendState = opts.chartLegendState || {};
    this.totals = opts.totals || {};
    this.isUpdating = false;
    this.updateZoomEvent = null;
    this.disableTrendline = opts.disableTrendline || false;
    this.trendlineData = opts.trendlineData || null;
    this.secondaryLabelsHeight = 0;
  }

  chartRegistry = new Map();

  rightAxisChartRegistry = new Map();

  get yRange() {
    return [this.height - (this.secondaryLabelsHeight), 0];
  }

  get isCompactMode() {
    return BAR_COMPACT_WIDTH_BREAKPOINT > this.width / this.recalculatedBars.length;
  }

  get isTimeUsageCompactMode() {
    return TIME_USAGE_BAR_COMPACT_WIDTH_BREAKPOINT > this.width / this.recalculatedBars.length;
  }

  get recalculatedBars() {
    return this.calculatedData.filter((d) => !d.hidden) || [];
  }

  get hasSingleDataPoint() {
    return this.recalculatedBars.length === 1;
  }

  get currentZoomLevelBase() {
    const zoomFactor = this.recalculatedBars.length / this.barsCountLimit;
    if (zoomFactor > 1) return zoomFactor;
    return 1;
  }

  get barMaxWidth() {
    return this.groupBy?.length > 1 || this.isSingleGroupedOEE ? GROUPED_BAR_MAX_WIDTH : UNGROUPED_BAR_MAX_WIDTH;
  }

  get scaledChartWidth() {
    return this.width * this.scaleTransform.k;
  }

  get barsCountLimit() {
    return this.width / (BAR_MIN_WIDTH + (2 * BAR_PADDING));
  }

  get xAxisLabelPx() {
    // eslint-disable-next-line no-magic-numbers
    return getTextWidth(this.xAxisLabel) * 1.7;
  }

  // override
  get xDomain() {
    const data = this.recalculatedBars;
    return data.map((d) => d.groupingKey);
  }

  get xzDomain() {
    const xzDomain = this.recalculatedBars.reduce((acc, d) => {
      d.groups.forEach((val, key) => {
        if (this.isSingleGroupedOEE) {
          val.groups.forEach((v, k) => {
            acc.add(Number(k));
          });
        } else {
          acc.add(Number(key));
        }
      });
      return acc;
    }, new Set());
    return Array.from(xzDomain);
  }

  get hasRightAxis() {
    const allowedTypes = new Set([configType.DOWNTIME, configType.SPEEDLOSS, configType.SCRAPREASON]);
    return !!this.yAxisKeyRight && allowedTypes.has(this.configType);
  }

  get yDomainSpacingMultiplier() {
    if (this.configType === configType.TIME_USAGE) {
      return 1;
    }
    if (this.configType === configType.CHECKLIST && this.yAxisKey === yAxisKey.ENTITY_COUNT_PCT) {
      return 1;
    }
    return OFFSET_MULTIPLIER;
  }

  getDomainMax() {
    return this.recalculatedBars.reduce((max, d) => {
      let highestStackMax = max;
      if (d.stackMax > highestStackMax) highestStackMax = d.stackMax;
      d.groups.forEach((d2) => {
        if (d2.stackMax > highestStackMax) highestStackMax = d2.stackMax;
      });
      return highestStackMax;
    }, 0);
  }

  // override
  get yDomain() {
    const minMax = 1;
    const max = this.getDomainMax();
    if (this.yScaleType === 'scaleTime') {
      if (!max) return [new Date(0), new Date(minMax)];
      const maximum = new Date((max?.getTime?.() ?? minMax) * this.yDomainSpacingMultiplier);
      return [new Date(0), maximum];
    }
    if (this.yScaleType === 'scaleLinear') {
      if (!max) return [0, minMax];
      return [0, max * this.yDomainSpacingMultiplier];
    }
    return [0, minMax];
  }

  // override
  get yDomainRight() {
    if (!this.hasRightAxis) return [];
    const topSpacingPct = 1.1;
    const minMax = 1;
    const [, max] = d3.extent(this.recalculatedBars, (d) => d[this.yAxisKeyRight]);
    if (this.yScaleTypeRight === 'scaleTime') {
      if (!max) return [new Date(0), new Date(minMax)];
      const maximum = new Date((max?.getTime?.() ?? minMax) * topSpacingPct);
      return [new Date(0), maximum];
    }
    if (this.yScaleTypeRight === 'scaleLinear') {
      if (!max) return [0, minMax];
      return [0, max * topSpacingPct];
    }
    return [0, minMax];
  }

  get maxScrollLeft() {
    return this.scaledChartWidth - this.width;
  }

  get isSingleGroupedOEE() {
    return this.configType === configType.OEE && this.groupBy.length === 1;
  }

  setScrollLeftPct() {
    this.scrollLeftPct = this.scrollContainer.node().scrollLeft / this.maxScrollLeft;
    if (this.onScrollLeftChange) {
      this.onScrollLeftChange(this.scrollLeftPct);
    }
  }

  // override
  get xRange() {
    return [0, this.scaledChartWidth];
  }

  // override
  setXScale() {
    this.xScale = d3.scaleBand()
      .padding(BAR_PADDING / BAR_MIN_WIDTH);
    this.updateXScaleRange();
    this.updateXScaleDomain();
  }

  // override
  setYScale() {
    this.yScale = d3[this.yScaleType]();
    this.updateYScaleRange();
    this.updateYScaleDomain();
  }

  setXZScale() {
    super.setXZScale();
    const { scaleMap, minBandwidth } = this.recalculatedBars.reduce((acc, d) => {
      const domain = this.isSingleGroupedOEE
        ? getLegendStateOrdered(this.configType, this.chartLegendState)
        : [...d.groups.keys()];
      const map = {
        ...acc.scaleMap,
        [d.groupingKey]: d3.scaleBand().padding(INNER_PADDING).domain(domain).range(this.xzRange),
      };
      return { scaleMap: map, minBandwidth: Math.min(acc.minBandwidth, map[d.groupingKey].bandwidth()) };
    }, { scaleMap: {}, minBandwidth: this.barMaxWidth });

    this.xzScaleMap = scaleMap;
    const hasSecondaryGroupBy = this.groupBy.length > 1;

    this.xzMinBandwidth = (hasSecondaryGroupBy || this.isSingleGroupedOEE) ? minBandwidth : this.barMaxWidth;
  }

  updateYScaleRightRange() {
    this.yScaleRight.range(this.yRange);
  }

  updateYScaleRightDomain() {
    this.yScaleRight.domain(this.yDomainRight);
  }

  setYScaleRight() {
    this.yScaleRight = d3[this.yScaleTypeRight]();
    this.updateYScaleRightRange();
    this.updateYScaleRightDomain();
  }

  getYAxisTickFormat() {
    if (this.yScaleFormat) return this.yScaleFormat;
    return (val) => val;
  }

  getRightYAxisTickFormat() {
    if (this.yScaleFormatRight) return this.yScaleFormatRight;
    return (val) => val;
  }

  isTrendlineVisible() {
    if (!this.trendlineData) return false;
    return (this.trendlineData.intercept !== null && this.trendlineData.slope !== null);
  }

  areChartLabelsDiagonal() {
    const diagonalLabelGranularities = new Set([
      granularityType.TOTAL,
      granularityType.STARTTIME,
      granularityType.DUE_TIME,
    ]);
    return diagonalLabelGranularities.has(this.granularity);
  }

  get xzAxisEnabled() {
    const isTimeGranularity = this.granularity !== granularityType.TOTAL;
    const hasMultipleGroupBy = this.groupBy.length > 1;
    return hasMultipleGroupBy && (isTimeGranularity || (this.groupBy[0] !== this.groupBy[1]));
  }

  updateBottomAxis() {
    if (!this.bottomAxis) return;
    this.bottomAxis.update(null, {
      diagonalLabels: this.areChartLabelsDiagonal(),
      xzAxisDiagonalLabels: true,
      useLegacyLabels: !!this.isGeneratingPdf,
      definedKey: 'defined',
      labelFunc: this.getBottomAxisLabel,
      xAxisDataMap: this.totals.groups,
      xzAxisEnabled: this.xzAxisEnabled,
      xzAxisDataMap: this.groupBy.length > 1 ? this.recalculatedBars.reduce((acc, d) => new Map([...acc, ...d.groups]), new Map()) : null,
      secondaryLabelsHeight: this.secondaryLabelsHeight,
    });
  }

  updateTrendline() {
    if (this.trendLine) {
      this.trendLine.update({
        isVisible: this.isTrendlineVisible(),
        trendlineData: this.trendlineData,
      });
    }
  }

  update() {
    this.secondaryLabelsHeight = this.xzAxisEnabled ? SECONDARY_LABELS_HEIGHT : 0;
    this.isUpdating = true;
    const { recalculatedBars } = this;

    if (!this.isDrawn) {
      this.draw();
    }

    if (recalculatedBars) {
      this.setScales(); // update scales data and type
      this.setYScaleRight();
      const zoomLevel = this.currentZoomLevelBase;
      this.zoomModule.updateZoom({
        minScaleFactor: zoomLevel,
        maxScaleFactor: zoomLevel,
        defaultScaleFactor: zoomLevel,
      });
      this.leftAxis.precalculate({
        tickFormat: this.getYAxisTickFormat(),
      });
      this.rightAxis.precalculate({
        tickFormat: this.getRightYAxisTickFormat(),
      });
      this.bottomAxis.precalculate({
        diagonalLabels: this.areChartLabelsDiagonal(),
        secondaryLabelsHeight: this.secondaryLabelsHeight,

      });
      this.updateScaleRanges(); // update scales height/width in px
      this.updateYScaleRightRange();
      this.updateBottomAxis();
      this.leftAxis.update(null, { tickFormat: this.getYAxisTickFormat() });
      this.rightAxis.update(null, { tickFormat: this.getRightYAxisTickFormat() });
      this.updatePlot(); // update chart container based on scales
      this.gridlinesContainer.call((g) => this.updateGridlines(g));
      this.updateTrendline();

      this.updateGraphs();
      this.axisHoverLine.update([recalculatedBars]);
      this.scrollBar.style('width', `${this.scaledChartWidth}px`);
      this.bindScrollerCB();
      this.scrollContainer.node().scrollLeft = this.scrollLeftPct * this.maxScrollLeft;
      this.scrollContainer.style('width', `${this.width}px`);
      this.scrollContainer.style('margin-left', `${this.marginLeft}px`);
    }
    this.isUpdating = false;
    if (this.updateZoomEvent) this.onZoomed(this.updateZoomEvent);
  }

  getColumnChartArgs() {
    return [
      this.recalculatedBars,
      {
        yKey: this.yAxisKey,
        xKey: 'groupingKey',
        barMaxWidth: {
          1: this.barMaxWidth, 2: this.barMaxWidth, 3: this.xzMinBandwidth,
        },
        visible: [chartType.STACKED_COLUMN, chartType.GROUPED_COLUMN].some((cType) => this.chartType.includes(cType)),
        isGrouped: this.chartType.includes(chartType.GROUPED_COLUMN),
        isStacked: true,
        xzDomainKey: this.isSingleGroupedOEE ? '%groupId' : this.groupBy[this.groupBy.length - 1],
        secondaryXZDomain: this.configType === configType.OEE && this.groupBy.length > 1 ? getLegendStateOrdered(this.configType, this.chartLegendState) : null,
        dimensionCount: 3,
        labelKey: getChartSubGroupLabelConfig({
          cfgType: this.configType,
          yAxis: this.yAxisKey,
          isCompact: this.isTimeUsageCompactMode,
          barWidth: this.width / this.recalculatedBars.length,
        }),
        onMouseMove: this.showTooltipFn,
        onMouseOut: hideTooltip,
      },
    ];
  }

  updateColumnChart() {
    if (this.chartRegistry.has(chartType.COLUMN)) {
      this.chartRegistry.get(chartType.COLUMN).update(...this.getColumnChartArgs());
    } else {
      this.chartRegistry.set(chartType.COLUMN, this.drawVerticalBarChart(...this.getColumnChartArgs()));
    }
  }

  updateLineChart() {
    const options = {
      yKey: '1',
      xKey: 'data.groupingKey',
      xScaleBandOffset: true,
      getStrokeWidth: (d) => {
        if (d.length && d[0].length) {
          if (this.chartLegendState.length && !this.chartLegendState.includes(d[0].data['%groupId'])) {
            return '0px';
          }
        }
        return '2px';
      },
      transpose: true,
      multiLine: true,
      visible: this.chartType.includes(chartType.LINE),
      curve: d3[this.curveType],
      colorScale: (d) => {
        if (d.length && d[0].length) {
          return d[0].data.color;
        }
        return 'black';
      },
      definedKey: 'data.defined',
      xScaleKey: 'xScale',
      yScaleKey: 'yScale',
      selectorClass: 'line-chart',
    };
    if (this.chartRegistry.has(chartType.LINE)) {
      this.chartRegistry.get(chartType.LINE).update(
        this.recalculatedBars.map((d) => d.groups.get(d.groupingKey)?.stackList),
        options,
      );
    } else {
      this.chartRegistry.set(chartType.LINE, this.drawLineChart(
        this.recalculatedBars.map((d) => d.groups.get(d.groupingKey)?.stackList),
        options,
      ));
    }
  }

  updateRightAxisLineChart() {
    const options = {
      yKey: this.yAxisKeyRight,
      xKey: 'groupingKey',
      xScaleBandOffset: true,
      getStrokeWidth: () => '2px',
      transpose: false,
      multiLine: false,
      visible: true,
      curve: d3[this.curveType],
      colorScale: () => 'black',
      definedKey: null,
      xScaleKey: 'xScale',
      yScaleKey: 'yScaleRight',
      selectorClass: 'right-axis-line-chart',
    };
    if (this.rightAxisChartRegistry.has(chartType.LINE)) {
      this.rightAxisChartRegistry.get(chartType.LINE).update(
        this.hasRightAxis ? this.recalculatedBars : [],
        options,
      );
    } else {
      this.rightAxisChartRegistry.set(chartType.LINE, this.drawLineChart(
        this.hasRightAxis ? this.recalculatedBars : [],
        options,
        this.plot.append('g').attr('class', 'right-axis-lines-wrapper'),
      ));
    }
  }

  updateAreaChart() {
    const { recalculatedBars } = this;
    const stackedDataList = recalculatedBars.map((d) => d.stackList);
    const colorScale = (d) => {
      if (d.length && d[0].length) {
        return d[0].data.color;
      }
      return 'black';
    };
    if (this.chartRegistry.has(chartType.AREA)) {
      this.chartRegistry.get(chartType.AREA).update(
        stackedDataList,
        {
          visible: this.chartType.includes(chartType.AREA),
          curve: d3[this.curveType],
          colorScale,
        },
      );
    } else {
      this.chartRegistry.set(chartType.AREA, this.drawAreaChart(
        stackedDataList,
        {
          yKey1: '0',
          yKey2: '1',
          xKey: 'data.groupingKey',
          xScaleBandOffset: true,
          strokeWidth: '2px',
          transpose: true,
          multiArea: true,
          visible: this.chartType.includes(chartType.LINE),
          curve: d3[this.curveType],
          colorScale,
        },
      ));
    }
  }

  updateDatapointLabels() {
    const { recalculatedBars } = this;
    if (this.chartRegistry.has(chartType.DATAPOINT_LABELS)) {
      this.chartRegistry.get(chartType.DATAPOINT_LABELS).update(recalculatedBars, {
        yKey: 'stackMax',
        visible: this.chartType.includes(chartType.DATAPOINT_LABELS),
        diagonal: true,
      });
    } else {
      this.chartRegistry.set(chartType.DATAPOINT_LABELS, this.drawDataPointLabel(
        recalculatedBars,
        {
          yKey: 'stackMax',
          xKey: 'groupingKey',
          labelKey: 'entityCountLabel',
          dataKey: 'recalculatedBars',
          visible: this.chartType.includes(chartType.DATAPOINT_LABELS),
          diagonal: true,
          minDiagonalLength: 2,
        },
      ));
    }
  }

  getDotCircleRadius = (d) => {
    if (d?.length && this.chartLegendState?.length && !this.chartLegendState.includes(d.data?.['%groupId'])) {
      return '0px';
    }
    return '4px';
  };

  getDotPlotChartArgs() {
    return [
      this.recalculatedBars,
      {
        yKey: this.yAxisKey,
        xKey: 'groupingKey',
        visible: this.chartType.includes(chartType.DOT_PLOT) && !this.isCompactMode,
        getDotCircleRadius: this.getDotCircleRadius,
        definedKey: 'data.defined',
        dimensionCount: 3,
      },
    ];
  }

  updateDotPlotChart() {
    if (this.chartRegistry.has(chartType.DOT_PLOT)) {
      this.chartRegistry.get(chartType.DOT_PLOT).update(...this.getDotPlotChartArgs());
    } else {
      this.chartRegistry.set(chartType.DOT_PLOT, this.drawDotPlotChart(...this.getDotPlotChartArgs()));
    }
  }

  updateEventMarker() {
    const { recalculatedBars } = this;
    if (this.chartRegistry.has(chartType.EVENT_MARKER)) {
      this.chartRegistry.get(chartType.EVENT_MARKER).update(recalculatedBars, new EventMarkerConfig(this.chartLegendState).get());
    } else {
      this.chartRegistry.set(chartType.EVENT_MARKER, this.drawEventMarker(recalculatedBars, new EventMarkerConfig(this.chartLegendState).get()));
    }
  }

  updateGraphs() {
    this.updateColumnChart();
    this.updateLineChart();
    this.updateRightAxisLineChart();
    this.updateAreaChart();
    this.updateDotPlotChart();
    this.updateDatapointLabels();
    this.updateEventMarker();
  }

  onZoomed(event) {
    if (this.isUpdating) {
      this.updateZoomEvent = event;
      return;
    }
    this.updateZoomEvent = null;
    if (super.onZoomed) super.onZoomed(event);
    const vm = this;

    const { k, x } = event.transform;
    this.scaleTransform = event.transform;
    vm.bottomAxis.updateZoom({ kx: k, x }, event);
    vm.trendLine.zoom({ kx: k, x }, event);

    vm.axisHoverLine.zoom({ kx: k, x }, event);
    if (this.chartRegistry.has(chartType.AREA)) {
      this.chartRegistry.get(chartType.AREA).zoom({ kx: k, x }, event);
    }
    if (this.chartRegistry.has(chartType.LINE)) {
      this.chartRegistry.get(chartType.LINE).zoom({ kx: k, x }, event);
    }
    if (this.rightAxisChartRegistry.has(chartType.LINE)) {
      this.rightAxisChartRegistry.get(chartType.LINE).zoom({ kx: k, x }, event);
    }
    if (this.chartRegistry.has(chartType.COLUMN)) {
      this.chartRegistry.get(chartType.COLUMN).zoom({ kx: k, x }, event);
    }
    if (this.chartRegistry.has(chartType.DATAPOINT_LABELS)) {
      this.chartRegistry.get(chartType.DATAPOINT_LABELS).zoom({ kx: k, x }, event);
    }
    if (this.chartRegistry.has(chartType.DOT_PLOT)) {
      this.chartRegistry.get(chartType.DOT_PLOT).zoom({ kx: k, x }, event);
    }
    if (this.chartRegistry.has(chartType.EVENT_MARKER)) {
      this.chartRegistry.get(chartType.EVENT_MARKER).zoom({ kx: k, x }, event);
    }
    if (this.scrollBar && isMoveEvent(event)) {
      this.unBindScrollerCB();
      this.scrollBar.style('width', `${this.scaledChartWidth}px`);
      this.scrollContainer.node().scrollLeft = Math.abs(this.scaleTransform.x);
      this.setScrollLeftPct();
      setTimeout(() => this.bindScrollerCB(), 1000);
    }
  }

  getBottomAxisLabel = (d) => {
    if (d === undefined) return '';
    if (this.granularity === granularityType.MONTH) return i18n.global.t(d.measureLabel);
    return d.measureLabel;
  };

  showTooltipFn = (ev, d) => {
    if (ev?.type !== 'wheel' || !isIOS) {
      showTooltip({
        params: {
          ...d,
          tooltipHTMLFunc: this.tooltipHTMLFunc(),
          maxWidth: 'auto',
        },
      });
    } else {
      hideTooltip();
    }
  };

  draw() {
    this.colorScale = d3.scaleOrdinal(d3.schemeDark2);
    d3.select(this.element).selectAll('.scroll-container').remove();
    d3.select(this.element).selectAll('.custom-scrollbar').remove();
    const { recalculatedBars } = this;
    this.fontSize = 12;
    this.margin = {
      top: 10,
      right: 0,
      bottom: 0,
      left: 0,
    };
    this.drawSVGContainer(this.margin);

    this.setYScale();
    this.setYScaleRight();

    this.leftAxis = this.createVerticalAxis({
      ticksCount: 10,
      tickFormat: this.getYAxisTickFormat(),
      axisType: 'axisLeft',
    });
    this.rightAxis = this.createVerticalAxis({
      ticksCount: 10,
      tickFormat: this.getRightYAxisTickFormat(),
      axisType: 'axisRight',
      yScaleKey: 'yScaleRight',
    });
    this.bottomAxis = this.createBottomAxis({
      dataKey: 'recalculatedBars',
      scaleType: 'scaleBand',
      labelFunc: this.getBottomAxisLabel,
      showAllTicks: false,
      hideTickLabels: true,
      multiLineLabelsEnabled: true,
      axisValueKey: 'groupingKey',
      diagonalLabels: this.areChartLabelsDiagonal(),
      xzAxisDiagonalLabels: true,
      definedKey: 'defined',
      xAxisDataMap: this.totals.groups,
      xzAxisEnabled: this.xzAxisEnabled,
      xzAxisDataMap: this.groupBy.length > 1 ? recalculatedBars.reduce((acc, d) => new Map([...acc, ...d.groups]), new Map()) : null,
      secondaryLabelsHeight: this.secondaryLabelsHeight,
      xzAxisLabelFn: this.getBottomAxisLabel,
    });
    this.leftAxis.draw();
    this.rightAxis.draw();

    this.setXScale();
    this.setXZScale();
    this.bottomAxis.draw();
    this.gridlines = this.drawGridlines(this.svg, {
      strokeDashArray: '0',
      ticksCount: 10,
      color: colorConstants.dark['quaternary-dark'],
      xKey: 'groupingKey',
    });
    this.drawPlot(this.margin);
    this.axisHoverLine = this.drawXAxisHoverLine(
      [recalculatedBars],
      {
        circleColors: [],
        circleFillColors: [],
        color: this.colors.black,
        yKey: [this.yAxisKey],
        xKey: 'groupingKey',
        strokeWidth: '1px',
        scaleType: 'scaleBand',
        bisect: 'center',
        xScaleBandOffset: true,
        strokeDash: 0,
        showHighlight: true,
        showLine: false,
        showDataPoints: false,
        highlightColor: 'var(--color-12-primary)',
        clickEnabled: true,
      },
    );

    this.axisHoverLine.onMouseMove = this.showTooltipFn;
    this.axisHoverLine.onMouseOut = hideTooltip;

    this.updateGraphs();

    if (!this.disableTrendline) {
      this.trendLine = this.drawNewTrendLine(this.trendlineData, {
        isVisible: this.isTrendlineVisible(),
      });
    }

    const zoomLevel = this.currentZoomLevelBase;
    this.zoomModule = this.drawZoom({
      minScaleFactor: zoomLevel,
      maxScaleFactor: zoomLevel,
      defaultScaleFactor: zoomLevel,
      scaleType: 'scaleBand',
      xDomainKey: 'xDomain',
    });

    this.scrollContainer = d3.select(this.element)
      .append('div')
      .attr('class', 'custom-scrollbar')
      .append('div')
      .attr('class', 'scroll-container')
      .style('width', `${this.width}px`)
      .style('margin-left', `${this.marginLeft}px`)
      .style('height', '20px')
      .style('position', 'absolute')
      .style('bottom', 0)
      .style('overflow', 'auto');

    this.scrollBar = this.scrollContainer
      .append('div')
      .style('width', `${this.scaledChartWidth}px`)
      .style('height', '1px');

    this.isDrawn = true;
  }

  bindScrollerCB() {
    const { currentZoom } = this.zoomModule;
    const chartSizeScrollPerformanceFactor = 0.00;
    const scrollDelayMs = this.scaledChartWidth * chartSizeScrollPerformanceFactor;
    this.scrollContainer.on('scroll.scroller', (val) => {
      currentZoom.call(this.zoom.transform, d3.zoomIdentity
        .scale(this.scaleTransform.k)
        .translate(-val.target.scrollLeft / this.scaleTransform.k, 0));
      this.setScrollLeftPct();
    }, scrollDelayMs, { leading: true, trailing: true });
  }

  unBindScrollerCB() {
    this.scrollContainer.on('scroll.scroller', () => null);
  }


  getTooltipData = (d) => {
    if (d?.data) {
      return d.data;
    }
    if (d?.[0]) {
      return d[0];
    }
    return null;
  };

  getTooltipValue = (data, tooltipValue, tooltipValueKey) => {
    if (tooltipValue) {
      if (isFunction(tooltipValue)) return tooltipValue(data);
      if (isString(tooltipValue)) return tooltipValue;
    }
    return data[tooltipValueKey];
  };

  getTooltipParamRows = (tooltipConfig, data) => {
    const paramRows = tooltipConfig.map(({
      tooltipValueKey, text, color, icon, tooltipSecondaryValueKey, isPrimary, tooltipValue,
    }) => ({
      key: this.getTooltipValue(data, text, 'text'),
      value: this.getTooltipValue(data, tooltipValue, tooltipValueKey),
      secondaryValue: data[tooltipSecondaryValueKey],
      color: this.getTooltipValue(data, color, 'color'),
      icon: this.getTooltipValue(data, icon, 'icon'),

      isPrimary,
    }));
    return paramRows;
  };

  tooltipHTMLFunc() {
    return (d) => {
      const visibleColumns = useFilterbarStore().requestFilterState.visibleColumns || [];
      return TooltipRenderer.generateTooltipHTML(
        chartTooltipConfig,
        chartTooltipTemplate,
        {
          cfgType: this.configType,
          groupBy: this.groupBy,
          yAxis: this.yAxisKey,
          yAxisRight: this.yAxisKeyRight,
          granularity: this.granularity,
          isCompact: this.isTimeUsageCompactMode,
          chartLegendState: this.chartLegendState,
          totals: this.totals,
          visibleColumns,
          useAxisIcons: true,
        },
        d,
      );
    };
  }

  onMarkerMouseMove(mouseEv, i) {
    showTooltip({
      params: {
        ...i,
        tooltipHTMLFunc: this.tooltipHTMLFunc(),
      },
    });
  }


  onMarkerMouseLeave() {
    hideTooltip();
  }
}
