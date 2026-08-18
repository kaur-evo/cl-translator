import * as d3 from 'd3';

import mixin from '@/helpers/class/mixin';
import BaseContainer from '@/d3/BaseContainer';
import ZoomModule from '@/d3/Zoom';
import LineChartModule from '@/d3/LineChart';
import AreaChartModule from '@/d3/AreaChart';
import XAxisHoverLineModule from '@/d3/XAxisHoverLine';
import BottomAxisModule from '@/d3/BottomAxis';
import AreaHighlightModule from '@/d3/AreaHighlight';
import VerticalAxisModule from '@/d3/VerticalAxis';
import GridlinesModule from '@/d3/Gridlines';
import EventMarkerModule from '@/d3/EventMarker';
import { TRANSITION_DURATION } from '@/d3/constants';
import { eventBus } from '@/eventBus';
import {
  getTextWidth, showTooltip, hideTooltip,
} from '@/helpers/d3Helpers';

const TOP_SPACING_FACTOR = 1.1;
export default class ShiftviewWidgetChart
  extends mixin(BaseContainer).with(
    BottomAxisModule,
    VerticalAxisModule,
    AreaChartModule,
    LineChartModule,
    XAxisHoverLineModule,
    ZoomModule,
    AreaHighlightModule,
    GridlinesModule,
    EventMarkerModule,
  ) {
  constructor(opts) {
    super(opts);
    this.data = opts.data;
    this.dataType = opts.dataType;
    this.xDomainMinStart = opts.xDomainMinStart ? new Date(opts.xDomainMinStart) : null;
    this.fontSize = opts.fontSize;
    this.visibleMaxYVal = 1;
    this.yScaleFactor = 1;
    this.chartId = opts.id || 0;
    this.yAxisFormat = opts.yAxisFormat;
    this.timezone = opts.timezone;
    this.yDomainInverted = opts.yDomainInverted ?? false;
    this.favorHigherValues = opts.favorHigherValues ?? true;
    this.cornerLabel = opts.cornerLabel;
    this.transitionDuration = opts.transitionDuration ?? TRANSITION_DURATION;
    this.draw();
    this.onZoom = opts.onZoom;
  }

  get xAxisLabelPx() {
    return getTextWidth(this.xAxisLabel) + 10;
  }

  // override
  get xDomain() {
    if (this.data.length) {
      let xDomain0 = this.data[0].measure;
      if (this.xDomainMinStart && this.xDomainMinStart < this.data[0].measure) {
        xDomain0 = this.xDomainMinStart;
      }
      const xDomain1 = this.data[this.data.length - 1].endTime;
      return [xDomain0, xDomain1];
    }
    return [];
  }

  // override
  get yDomain() {
    const defaultMax = 0.1;
    if (this.yDomainInverted) {
      return [Math.max(this.visibleMaxYVal * TOP_SPACING_FACTOR, defaultMax), 0];
    }
    return [0, Math.max(this.visibleMaxYVal * TOP_SPACING_FACTOR, defaultMax)];
  }

  calculateVisibleMaxValue(event) {
    const vm = this;
    const reScale = event.transform.rescaleX(vm.xScale);
    const [min, max] = reScale.domain();
    const minEpoch = min.getTime();
    const maxEpoch = max.getTime();
    const visibleItems = this.data.reduce((list, item) => {
      if (item.type !== 'PRODUCT') return list;
      const measureEpoch = item.measure.getTime();
      const afterScaleMin = measureEpoch >= minEpoch;
      const beforeScaleMax = measureEpoch < maxEpoch;
      if (afterScaleMin && beforeScaleMax && item.value !== null) {
        list.push(item);
      }
      return list;
    }, []);
    if (visibleItems.length) {
      return Math.max(...visibleItems.map(({ value, target }) => Math.max(value, target || 0)));
    }
    return vm.visibleMaxYVal;
  }

  // override
  setXScale() {
    this.xScale = d3.scaleUtc();
    this.updateXScaleRange();
    this.updateXScaleDomain();
  }

  setXAxisLabel() {
    if (this.cornerLabel) {
      this.xAxisLabel = this.cornerLabel;
      return;
    }
    const label = [...this.data].reverse().find((d) => !!d.unitId)?.unitId;
    this.xAxisLabel = label ?? '';
  }

  updateVisibleMax() {
    if (this.zoomedEvent) {
      this.visibleMaxYVal = this.calculateVisibleMaxValue(this.zoomedEvent);
      this.yScaleFactor = Math.max(...this.yDomain) / (this.visibleMaxYVal * TOP_SPACING_FACTOR);
    }
  }

  update(options) {
    if (this.data) {
      this.updateVisibleMax();
      this.setXAxisLabel();
      this.updateScaleDomains();
      this.bottomAxis.precalculate();
      this.leftAxis.precalculate();
      this.updateScaleRanges();
      this.bottomAxis.update();
      this.leftAxis.update();
      this.updatePlot();
      this.gridlinesContainer.call((g) => this.updateGridlines(g));
      if (options?.isDataUpdate) {
        this.zoomModule.setDatasetRangeInMs();
        this.zoomModule.setScaleFactorLimitsByDuration();
      }
      this.targetLine.update(this.data);
      this.aboveTargetLine.update(this.data, { color: this.favorHigherValues ? this.colors.white : this.colors['lw-yellow'] });
      this.belowTargetLine.update(this.data, { color: this.favorHigherValues ? this.colors['lw-yellow'] : this.colors.white });
      this.belowTargetArea.update(this.data, { color: this.favorHigherValues ? this.colors['lw-yellow'] : this.colors.white });
      this.aboveTargetArea.update(this.data, { color: this.favorHigherValues ? this.colors.white : this.colors['lw-yellow'] });
      this.aboveTargetClippingArea.update(this.data);
      this.belowTargetLineClippingArea.update(this.data);
      this.belowTargetAreaClippingArea.update(this.data);
      this.areaHighlightStoppage.update(this.data);
      this.areaHighlightStandby.update(this.data);
      this.axisHoverLine.update([this.data]);
      this.changeoverMarker.update(this.data);
    }
  }

  onZoomed(event) {
    if (super.onZoomed) super.onZoomed(event);
    const vm = this;

    function applyScaling(el) {
      el.attr('transform', `translate(${event.transform.x},0) scale(${event.transform.k},${vm.yScaleFactor})`);
    }

    this.zoomedEvent = event;
    this.updateVisibleMax();

    vm.bottomAxis.update(event);
    applyScaling(vm.targetLine.elementRef);
    applyScaling(vm.aboveTargetLine.elementRef);
    applyScaling(vm.belowTargetLine.elementRef);
    applyScaling(vm.belowTargetArea.elementRef);
    applyScaling(vm.aboveTargetArea.elementRef);
    applyScaling(vm.areaHighlightStoppage.elementRef);
    applyScaling(vm.areaHighlightStandby.elementRef);
    const { k, x } = event.transform;
    vm.axisHoverLine.zoom({ kx: k, x }, event);
    applyScaling(vm.changeoverMarker.elementRef);
    vm.changeoverMarker.zoomUpdate(event, { transform: { k: vm.yScaleFactor } }, this);
    vm.update();
    if (this.onZoom && this.zoomModule) {
      this.onZoom(event.transform.k);
    }
  }

  draw() {
    this.colorScale = d3.scaleOrdinal(d3.schemeDark2);
    const { data } = this;
    this.margin = {
      top: 10,
      right: 0,
      bottom: 0,
      left: 0,
    };
    this.drawSVGContainer(this.margin);

    this.leftAxis = this.createVerticalAxis({
      ticksCount: 4,
      tickFormat: this.yAxisFormat,
      transitionDuration: this.transitionDuration,
    });
    this.bottomAxis = this.createBottomAxis({
      scaleType: 'scaleTime',
      fontSize: this.fontSize,
      useRegularFormat: true,
      timezone: this.timezone,
    });

    this.setScales();
    this.setXScale();

    this.max = d3.max(this.data, (d) => Math.max(d.value * TOP_SPACING_FACTOR, d.target * TOP_SPACING_FACTOR));
    this.bottomAxis.draw();
    this.leftAxis.precalculate({
      ticksCount: 4,
      tickFormat: this.yAxisFormat,
    });
    this.updateScaleRanges();
    this.bottomAxis.precalculate();

    this.leftAxis.draw();
    this.gridlines = this.drawGridlines(this.svg, {
      strokeDashArray: '0',
      ticksCount: 4,
      transitionDuration: this.transitionDuration,
    });

    this.aboveTargetClippingArea = this.drawAreaChart(
      data,
      {
        yKey1: 'valueExclDowntime',
        yKey2: 'zero',
        xKey2: 'endTime',
        id: `aboveClippingArea-${this.chartId}`,
        isClipPath: true,
        curve: d3.curveStepAfter,
        transitionDuration: this.transitionDuration,
      },
    );
    // cuts off the top above target of yellow area chart
    this.belowTargetAreaClippingArea = this.drawAreaChart(
      data,
      {
        yKey1: 'target',
        yKey2: 'yellowClipZero',
        xKey2: 'endTime',
        id: `belowTargetAreaClippingArea-${this.chartId}`,
        isClipPath: true,
        curve: d3.curveStepAfter,
        transitionDuration: this.transitionDuration,
      },
    );
    this.belowTargetLineClippingArea = this.drawAreaChart(
      data,
      {
        yKey1: 'target',
        yKey2: 'zero',
        xKey2: 'endTime',
        id: `belowTargetLineClippingArea-${this.chartId}`,
        y0Offset: 1,
        isClipPath: true,
        curve: d3.curveStepAfter,
        transitionDuration: this.transitionDuration,
      },
    );
    this.areaHighlightStoppage = this.drawAreaHighlight(data, {
      color: this.colors.error,
      opacity: 0.3,
      yKey: 'isStoppage',
      xKey2: 'endTime',
      curve: d3.curveStepAfter,
    });
    this.areaHighlightStandby = this.drawAreaHighlight(data, {
      color: this.colors.white,
      opacity: 0.12,
      yKey: 'isStandby',
      xKey2: 'endTime',
      curve: d3.curveStepAfter,
    });
    this.aboveTargetLine = this.drawLineChart(
      data,
      {
        color: this.favorHigherValues ? this.colors.white : this.colors['lw-yellow'],
        yKey: 'value',
        xKey2: 'endTime',
        curve: d3.curveStepAfter,
        useLineChunked: false,
        transitionDuration: this.transitionDuration,
      },
    );
    this.belowTargetLine = this.drawLineChart(
      data,
      {
        color: this.favorHigherValues ? this.colors['lw-yellow'] : this.colors.white,
        yKey: 'value',
        xKey2: 'endTime',
        clipPathId: `belowTargetLineClippingArea-${this.chartId}`,
        curve: d3.curveStepAfter,
        useLineChunked: false,
        transitionDuration: this.transitionDuration,
      },
    );

    this.targetLine = this.drawLineChart(
      data,
      {
        color: this.colors.white,
        yKey: 'target',
        xKey2: 'endTime',
        strokeDash: 10,
        strokeWidth: 1,
        curve: d3.curveStepAfter,
        useLineChunked: false,
        transitionDuration: this.transitionDuration,
      },
    );
    this.belowTargetArea = this.drawAreaChart(
      data,
      {
        color: this.favorHigherValues ? this.colors['lw-yellow'] : this.colors.white,
        opacity: 0.2,
        yKey1: 'valueExclDowntime',
        yKey2: 'target',
        xKey2: 'endTime',
        clipPathId: `belowTargetAreaClippingArea-${this.chartId}`,
        curve: d3.curveStepAfter,
        transitionDuration: this.transitionDuration,
      },
    );
    this.aboveTargetArea = this.drawAreaChart(
      data,
      {
        color: this.favorHigherValues ? this.colors.white : this.colors['lw-yellow'],
        opacity: 0.2,
        yKey1: 'valueExclDowntime',
        yKey2: 'target',
        xKey2: 'endTime',
        clipPathId: `aboveClippingArea-${this.chartId}`,
        curve: d3.curveStepAfter,
        transitionDuration: this.transitionDuration,
      },
    );
    this.changeoverMarker = this.drawEventMarker(data, {
      color: this.colors.white,
      strokeDash: 0,
      strokeWidth: 1,
      mirroredIcon: true,
      yKey: 'isProductChange',
      transitionDuration: this.transitionDuration,
    });

    this.axisHoverLine = this.drawXAxisHoverLine(
      [data],
      {
        circleColors: [(d) => d?.dotColor],
        circleFillColors: [(d) => (d?.isStoppage || d?.isStandby ? this.colors.white : this.colors.black)],
        color: this.colors.white,
        yKey: ['value'],
        strokeWidth: '1px',
        scaleType: 'scaleTime',
        xKey: 'endTime',
        xKey2: 'measure',
      },
    );
    this.axisHoverLine.onMouseMove = (ev, d) => {
      eventBus.$emit('widget-chart-hover', d[0].sliceEndTmISO);
      showTooltip({
        params: {
          ...d,
          tooltipHTMLFunc: this.tooltipHTMLFunc(),
        },
      });
    };
    this.axisHoverLine.onMouseOut = () => {
      eventBus.$emit('widget-chart-hover', null);
      hideTooltip();
    };

    const xFirstVal = this.data[0]?.measure || new Date();
    const xLastVal = this.data[this.data.length - 1]?.endTime || new Date();
    this.zoomModule = this.drawZoom({
      minZoomRangeValue: 10 * 60 * 1000, // what is the minimum period displayed when zooming in in milliseconds
      maxZoomrangeValue: null, // defaults to chart full size
      initialZoomRangeValue: xLastVal - xFirstVal, // initial duration is full shift length
      scaleType: 'timeScale',
      xDomainKey: 'xDomain',
      xFirstVal: () => xFirstVal,
      xLastVal: () => xLastVal,
      transitionDuration: this.transitionDuration,
    });
  }
}
