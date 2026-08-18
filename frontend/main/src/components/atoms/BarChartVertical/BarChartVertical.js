/* eslint-disable no-magic-numbers */

import * as d3 from 'd3';

import mixin from '@/helpers/class/mixin';
import BaseContainer from '@/d3/BaseContainer';
import VerticalBarChartModule from '@/d3/VerticalBarChart';
import ComparisonBarsModule from '@/d3/ComparisonBars';
import TrendLineModule from '@/d3/TrendLine';
import SimpleTargetLineModule from '@/d3/SimpleTargetLine';
import BottomAxisModule from '@/d3/BottomAxis';
import VerticalAxisModule from '@/d3/VerticalAxis';
import GridlinesModule from '@/d3/Gridlines';
import colorConstants from '@/constants/colorConstants';
import { MARGIN_PTC } from '@/d3/constants';
import {
  showTooltip, hideTooltip, getTextWidth,
} from '@/helpers/d3Helpers';

export default class BarChartVertical
  extends mixin(BaseContainer).with(
    VerticalBarChartModule,
    TrendLineModule,
    SimpleTargetLineModule,
    BottomAxisModule,
    VerticalAxisModule,
    GridlinesModule,
    ComparisonBarsModule,
  ) {
  constructor(opts) {
    super(opts);
    this.data = [...opts.data];
    this.dataType = opts.dataType;

    this.targetLineEnabled = opts.targetLineEnabled;
    this.targetLineDataObj = opts.targetLineDataObj;

    this.xAxisLabel = opts.xAxisLabel;

    this.trendLineEnabled = opts.trendLineEnabled;
    this.trendLineDataObj = opts.trendLineDataObj;

    this.comparisonBarsEnabled = opts.comparisonBarsEnabled;
    this.comparisonBarsData = opts.comparisonBarsData;

    this.areaHighlightsEnabled = opts.areaHighlightsEnabled;

    this.tooltipHTMLFunc = opts.tooltipHTMLFunc;
    this.yAxisOptions = opts.yAxisOptions;
    this.isStacked = opts.isStacked || false;
    this.isRounded = opts.isRounded || false;
    this.draw();
  }

  get targetLineMax() {
    return this.targetLineDataObj ? this.targetLineDataObj.value : 0;
  }

  get xAxisLabelPx() {
    return getTextWidth(this.xAxisLabel, this.fontSize, 'Open Sans');
  }

  get xDomain() {
    const xDomain = [
      ...this.data.map((d) => d.measure),
    ];
    if (this.comparisonBarsData && Array.isArray(this.comparisonBarsData) && this.comparisonBarsEnabled) {
      xDomain.push(...this.comparisonBarsData.map((d) => d.measure));
    }
    return xDomain;
  }

  get yDomain() {
    const trendLineModifierEnabled = this.trendLineEnabled && this.trendLineDataObj.y1val && this.trendLineDataObj.y2val;
    const trendLineModifier = trendLineModifierEnabled ? Math.max(this.trendLineDataObj.y1val, this.trendLineDataObj.y2val) : 0;
    return [0, Math.max(
      d3.max(this.data, (d) => d.value),
      this.comparisonBarsEnabled && this.comparisonBarsData.length ? d3.max(this.comparisonBarsData, (d) => (d?.value || 0) * 1.05) : 0,
      this.targetLineEnabled ? this.targetLineMax : 0,
      trendLineModifier,
      1,
      (this.max ? this.max : 0),
    )];
  }

  draw() {
    const { comparisonBarsData, data } = this;
    this.fontSize = 12;

    this.margin = {
      top: 10,
      right: this.element.clientWidth * MARGIN_PTC,
      bottom: 0,
      left: 0,
    };

    this.drawSVGContainer(this.margin);
    this.colorScale = d3.scaleOrdinal(d3.schemeDark2);
    this.leftAxis = this.createVerticalAxis(this.yAxisOptions);
    this.bottomAxis = this.createBottomAxis({
      gradientColor: this.gradientColor,
      axisValueKey: 'measure',
    });

    this.setScales();
    this.bottomAxis.precalculate();
    this.leftAxis.precalculate(this.yAxisOptions);

    this.updateScaleRanges();
    this.bottomAxis.draw();
    this.leftAxis.draw();
    this.drawPlot();
    this.gridlines = this.drawGridlines(this.svg, {
      strokeDashArray: '5 5',
      ticksCount: 4,
    });

    if (this.areaHighlightsEnabled) {
      // areaHighligtsModule has issue with last datapoint with this setup, so this solution is used
      const areaHighlightsData = this.data.filter((d) => d.isAreaHighlighted);
      const highlightsGroup = this.svg.append('g').attr('class', 'area-highlights');
      highlightsGroup.selectAll('rect')
        .data(areaHighlightsData)
        .enter()
        .append('rect')
        .attr('x', (d) => this.xScale(d.measure) + this.marginLeft - (this.xScale.bandwidth() * (this.xScalePadding / 2)))
        .attr('y', 0 + this.marginTop)
        .attr('width', this.xScale.bandwidth() * (1 + this.xScalePadding + 0.05))
        .attr('height', this.height)
        .attr('fill', colorConstants.dark.white)
        .attr('opacity', 0.12)
        .attr('pointer-events', 'none');
    }

    this.verticalBarChart = this.drawVerticalBarChart(data, {
      isStacked: this.isStacked,
      dimensionCount: this.isStacked ? 2 : 3,
      isRounded: this.isRounded,
      onMouseMove: this.isStacked ? (ev, d, parentDatapoint) => this.onBarMouseMove(ev, parentDatapoint || d?.data || d) : null,
      onMouseOut: this.isStacked ? () => this.onBarMouseLeave() : null,
    });
    if (this.comparisonBarsEnabled) {
      this.comparisonBars = this.drawComparisonBars(comparisonBarsData);
    }
    if (this.targetLineEnabled) {
      this.targetLine = this.drawSimpleTargetLine(this.targetLineDataObj);
    }
    if (this.trendLineEnabled) {
      this.trendLine = this.drawTrendLine(this.trendLineDataObj);
    }
  }

  onBarMouseMove(mouseEv, i, el) {
    if (this.comparisonBarsEnabled) {
      d3.select(el).classed('active', true).attr('fill', i.activeColor);
      // eslint-disable-next-line func-names
      this.comparisonBars.filter(function () {
        return !this.classList.contains('active');
      }).transition()
        .duration(100)
        .attr('opacity', (a, j) => (j === i - 1 ? 1 : 0.4));
    }
    showTooltip({
      params: {
        ...i,
        dotColor: i.color,
        dotLabel: i.measureTooltipLabel,
        primaryLabel: i.valueLabel,
        primaryValue: i.tooltipPrimaryValue,
        tooltipHTMLFunc: this.tooltipHTMLFunc,
      },
    });
  }

  onBarMouseLeave() {
    if (this.comparisonBarsEnabled) {
      this.comparisonBars
        .transition()
        .duration(100)
        .attr('opacity', '1')
        .attr('fill', (d, i) => d.color || this.colorScale(i));
    }
    hideTooltip();
  }

  onTrendLineMouseMove(mouseEv, i) {
    showTooltip({
      params: {
        ...i,
        dotColor: i.color,
        dotLabel: i.measureTooltipLabel,
        primaryLabel: i.valueLabel,
        primaryValue: i.tooltipPrimaryValue,
        tooltipHTMLFunc: this.tooltipHTMLFunc,
      },
    });
  }

  onTrendLineMouseLeave() {
    hideTooltip();
  }

  // eslint-disable-next-line sonarjs/no-identical-functions
  onTargetLineMouseMove(mouseEv, i) {
    showTooltip({
      params: {
        ...i,
        dotColor: i.color,
        dotLabel: i.measureTooltipLabel,
        primaryLabel: i.valueLabel,
        primaryValue: i.tooltipPrimaryValue,
        tooltipHTMLFunc: this.tooltipHTMLFunc,
      },
    });
  }

  onTargetLineMouseLeave() {
    hideTooltip();
  }
}
