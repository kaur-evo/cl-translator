import * as d3 from 'd3';

import mixin from '@/helpers/class/mixin';
import BaseContainer from '@/d3/BaseContainer';
import ZoomModule from '@/d3/Zoom';
import LineChartModule from '@/d3/LineChart';
import XAxisHoverLineModule from '@/d3/XAxisHoverLine';
import BottomAxisModule from '@/d3/BottomAxis';
import VerticalAxisModule from '@/d3/VerticalAxis';
import GridlinesModule from '@/d3/Gridlines';
import filterAndMap from '@/helpers/list/filterAndMap';
import { hideTooltip, showTooltip } from '@/helpers/d3Helpers';
import { eventBus } from '@/eventBus';

export default class ShiftviewWidgetChart
  extends mixin(BaseContainer).with(
    LineChartModule,
    XAxisHoverLineModule,
    ZoomModule,
    BottomAxisModule,
    VerticalAxisModule,
    GridlinesModule,
  ) {
  constructor(opts) {
    super(opts);
    this.data = opts.data;
    this.fontSize = opts.fontSize;
    this.timezone = opts.timezone;
    this.colorScale = d3.scaleOrdinal(d3.schemeDark2);

    // config options
    this.yAxes = opts.widgetConfig.yAxes || ['axisLeft'];
    this.yAxisLeftLabel = opts.widgetConfig.yAxisUnit || '';
    this.yAxisRightLabel = opts.widgetConfig.yAxisUnitRight || '';

    this.dataPoints = opts.widgetConfig.dataPoints || [];
    this.dataPointObj = opts.widgetConfig.dataPoints.reduce((acc, key, idx) => {
      acc[key] = this.yAxes[idx] || 'axisLeft';
      return acc;
    }, {});

    this.yAxisMin = opts.widgetConfig.yAxisMin || 0;
    this.yAxisMax = opts.widgetConfig.yAxisMax;
    this.yAxisMinRight = opts.widgetConfig.yAxisMinRight || 0;
    this.yAxisMaxRight = opts.widgetConfig.yAxisMaxRight;

    this.hasRightAxis = this.yAxes.includes('axisRight');

    this.draw();
  }

  // override
  get xDomain() {
    return d3.extent(this.data, (d) => d.measure);
  }

  getDomain = (min, max, axisName) => {
    const offsetMultiplier = 1.1;
    if (max) return [min, max * offsetMultiplier];
    const dataMax = Math.max(
      d3.max(this.data, (d) => {
        const isSameAxis = (datapoint) => this.dataPointObj[datapoint] === axisName;
        const pointValues = filterAndMap(
          this.dataPoints,
          [isSameAxis],
          (dataPointKey) => d[dataPointKey] * offsetMultiplier,
        );
        return Math.max(...pointValues);
      }),
      1,
    );
    return [min, dataMax];
  };

  // override
  get yDomain() {
    return this.getDomain(this.yAxisMin, this.yAxisMax, 'axisLeft');
  }

  get yDomainRight() {
    return this.getDomain(this.yAxisMinRight, this.yAxisMaxRight, 'axisRight');
  }

  // override
  setXScale() {
    this.xScale = d3.scaleTime()
      .range([0, this.width])
      .domain(this.xDomain);
  }

  setYScaleRight() {
    this.yScaleRight = d3.scaleLinear()
      .range([this.height, 0])
      .domain(this.yDomainRight);
  }

  update() {
    if (this.data) {
      this.xScale.domain(this.xDomain);
      this.yScale.domain(this.yDomain);
      this.yScaleRight.domain(this.yDomainRight);
      this.leftAxis.precalculate();
      if (this.hasRightAxis) {
        this.rightAxis.precalculate();
      }
      this.setXScale();
      this.bottomAxis.update();
      this.setYScale();
      this.setYScaleRight();

      this.leftAxis.update();
      if (this.hasRightAxis) {
        this.rightAxis.update();
      }

      this.dataPoints.forEach((dataPointKey) => this[`${dataPointKey}Line`].update(this.data));
      this.axisHoverLine.update([this.data, this.data]);
    }
  }

  onZoomed(event) {
    if (super.onZoomed) super.onZoomed(event);
    const vm = this;

    function applyScaling(el) {
      el.attr('transform', `translate(${event.transform.x},0) scale(${event.transform.k},1)`);
    }
    vm.dataPoints.forEach((dataPointKey) => applyScaling(vm[`${dataPointKey}Line`].elementRef));
    applyScaling(vm.axisHoverLine.elementRef);
    vm.axisHoverLine.zoomUpdate(event);
    vm.bottomAxis.update(event);
  }

  draw() {
    const { data } = this;

    const margin = {
      top: 10,
      right: 0,
      bottom: 0,
      left: 0,
    };

    const vecticalAxisOptions = {
      ticksCount: 4,
      axisLabel: this.yAxisLeftLabel,
      axisType: 'axisLeft',
      yScaleKey: 'yScale',
    };

    this.drawSVGContainer(margin);
    this.leftAxis = this.createVerticalAxis(vecticalAxisOptions);

    const rightAxisOptions = {
      ticksCount: 4,
      axisLabel: this.yAxisRightLabel,
      axisType: 'axisRight',
      yScaleKey: 'yScaleRight',
    };

    if (this.hasRightAxis) {
      this.rightAxis = this.createVerticalAxis(rightAxisOptions);
    }
    this.bottomAxis = this.createBottomAxis({
      scaleType: 'scaleTime',
      fontSize: this.fontSize,
      useRegularFormat: true,
      timezone: this.timezone,
    });
    this.setScales();
    this.setYScaleRight();
    this.bottomAxis.precalculate({ scaleType: 'scaleTime', fontSize: this.fontSize });
    this.leftAxis.precalculate(vecticalAxisOptions);
    this.leftAxis.draw(vecticalAxisOptions);
    if (this.hasRightAxis) {
      this.rightAxis.precalculate(rightAxisOptions);
      this.rightAxis.draw(rightAxisOptions);
    }
    this.updateScaleRanges();

    this.bottomAxis.draw();

    this.gridlines = this.drawGridlines(this.svg, {
      strokeDashArray: '0',
      ticksCount: 4,
    });
    this.drawPlot(margin);

    this.dataPoints.forEach((dataPointKey, index) => {
      this[`${dataPointKey}Line`] = this.drawLineChart(
        data,
        {
          color: this.colorScale(index),
          yKey: dataPointKey,
          yScaleKey: this.dataPointObj[dataPointKey] === 'axisRight' ? 'yScaleRight' : 'yScale',
        },
      );
    });

    this.axisHoverLine = this.drawXAxisHoverLine(
      this.dataPoints.map(() => data),
      {
        circleColors: this.dataPoints.map((key, index) => this.colorScale(index)),
        circleFillColors: this.dataPoints.map(() => this.colors.black),
        color: this.colors.white,
        yKey: this.dataPoints,
        xKey: 'measure',
        strokeWidth: '1px',
        scaleType: 'scaleTime',
        bisect: 'center',
        yScaleKey: Object.entries(this.dataPointObj).map(([, axis]) => (axis === 'axisRight' ? 'yScaleRight' : 'yScale')),
      },
    );
    this.axisHoverLine.onMouseMove = (ev, d) => {
      eventBus.$emit('widget-chart-hover', d[0].time);
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

    this.drawZoom({
      minZoomRangeValue: 10 * 60 * 1000, // what is the minimum period displayed when zooming in in milliseconds
      maxZoomrangeValue: null, // defaults to chart full size
      initialZoomRangeValue: 60 * 60 * 1000, // initial duration shown in milliseconds
      scaleType: 'timeScale',
      xDomainKey: 'xDomain',
      xFirstVal: () => (this.data[0]?.measure) || new Date(),
      xLastVal: () => (this.data[this.data.length - 1]?.measure) || new Date(),
    });
  }


  getMeasureValue(key, d) {
    return d[0][`${key}Label`];
  }

  tooltipHTMLFunc() {
    const vm = this;
    return (d) => {
      if (d[0].measure) {
        const headerRow = `<div class="row align-center mb-1 text-body-large">${d[0].measureLabel}</div>`;
        const dataPointRows = [];
        this.dataPoints.forEach((dataPointKey, i) => {
          dataPointRows.push(`<div class="text-label-small font-weight-regular">
          <span class="text-tertiary-dark font-weight-medium">${dataPointKey}: </span>
          <span class="text-body-small font-weight-medium text-none" style="color:${vm.colorScale(i)}">${vm.getMeasureValue(dataPointKey, d)}</span>
          </div>`);
        });
        return `<div class="row align-center text-white"><v-col>
          ${headerRow}
          ${dataPointRows.join('')}
          </v-col></div>`;
      }
      return '';
    };
  }
}
