import {
  mdiFlag,
  mdiFlagCheckered,
  mdiCheckboxMarkedCircle,
  mdiOrderBoolAscendingVariant,
} from '@mdi/js';
import * as d3 from 'd3';

import mixin from '@/helpers/class/mixin';
import { formatDate } from '@/helpers/date/formatDate';
import formatSecondsFriendly from '@/helpers/time/formatSecondsFriendly';
import BaseContainer from '@/d3/BaseContainer';
import BottomAxisModule from '@/d3/BottomAxis';
import DotChartModule from '@/d3/DotChart';
import EventMarkerModule from '@/d3/EventMarker';
import VerticalAxisModule from '@/d3/VerticalAxis';
import GridlinesModule from '@/d3/Gridlines';
import SimpleTargetLineModule from '@/d3/SimpleTargetLine';
import VerticalBarChartModule from '@/d3/VerticalBarChart';
import ZoomModule from '@/d3/Zoom';
import colorConstants from '@/constants/colorConstants';
import {
  hideTooltip, showTooltip,
} from '@/helpers/d3Helpers';
import { formatNumber } from '@/helpers/numbers/formatNumber';
import { MARGIN_PTC } from '@/d3/constants';

export default class ImprovementsBarChart
  extends mixin(BaseContainer).with(
    BottomAxisModule,
    DotChartModule,
    EventMarkerModule,
    VerticalAxisModule,
    GridlinesModule,
    SimpleTargetLineModule,
    VerticalBarChartModule,
    ZoomModule,
  ) {
  constructor(opts) {
    super(opts);
    this.data = opts.data;
    this.stats = opts.stats;
    this.targetVal = opts.targetVal;
    this.baselineAverage = opts.baselineAverage;
    this.completedActions = opts.completedActions;
    this.chartColors = opts.chartColors;
    this.isPerStopChart = opts.isPerStopChart;
    this.isProjectDataMeasuredByTime = opts.isProjectDataMeasuredByTime;
    this.allDates = opts.allDates;
    this.solutions = opts.solutions;
    this.chartYKey = opts.chartYKey;
    this.chartMaxVal = opts.chartMaxVal;
    this.tickInterval = opts.tickInterval;
    this.barTooltipHTMLFunc = opts.barTooltipHTMLFunc;
    this.averageTooltipHTMLFunc = opts.averageTooltipHTMLFunc;
    this.measureTooltipHTMLFunc = opts.measureTooltipHTMLFunc;
    const hasSecondaryLabels = this.data.filter((d) => d.secondaryLabel.length).length > 0;
    // eslint-disable-next-line no-magic-numbers
    this.secondaryLabelsHeight = hasSecondaryLabels ? 25 : 0;
    this.draw();
  }

  get currentData() {
    return this.isPerStopChart ? this.data : this.allDates;
  }

  get firstCurrentDataElem() {
    return this.currentData.find((elem) => elem.type === 'current');
  }

  get lastCurrentDataElem() {
    return this.currentData[this.currentData.length - 1];
  }

  // override
  get xDomain() {
    return this.currentData.map((d) => new Date(d.date));
  }

  // override
  get yDomain() {
    const spacingFactor10Pct = 1.1;
    return [0, this.chartMaxVal * spacingFactor10Pct];
  }

  // override
  get yRange() {
    return [this.height - (this.secondaryLabelsHeight), 0];
  }

  get maxScaleFactor() {
    // eslint-disable-next-line no-magic-numbers
    return this.currentData.length * 0.1;
  }

  setMaxVal() {
    if (this.chartMaxVal % this.tickInterval) this.chartMaxVal += this.tickInterval;
  }

  onZoomed(event) {
    if (super.onZoomed) super.onZoomed(event);
    this.scaleTransform = event.transform;
    const vm = this;
    function applyScaling(el) {
      el.attr('transform', `translate(${event.transform.x},0) scale(${event.transform.k},1)`);
    }
    this.xScale.range(this.xRange.map((d) => event.transform.applyX(d)));
    this.bottomAxis.update();
    applyScaling(vm.targetLineForBaselineData);
    applyScaling(vm.targetLineForCurrentData);
    applyScaling(vm.verticalBarChart.elementRef);
    if (!this.isPerStopChart) {
      vm.zeroDurationDots.zoomUpdate(event);
    }
    applyScaling(vm.currentDataStartIcon.elementRef);
    vm.currentDataStartIcon.zoomUpdate(event);
    if (this.project.finished) {
      applyScaling(vm.currentDataEndIcon.elementRef);
      vm.currentDataEndIcon.zoomUpdate(event);
    }
    applyScaling(vm.actionIcons.elementRef);
    vm.actionIcons.zoomUpdate(event);
    applyScaling(vm.solutionIcons.elementRef);
    vm.solutionIcons.zoomUpdate(event);
    if (this.scrollBar) {
      this.scrollBar.style('width', `${this.plot.node().getBoundingClientRect().width}px`);
      this.scrollContainer.node().scrollLeft = Math.abs(event.transform.x);
    }
  }

  draw() {
    this.colorScale = d3.scaleOrdinal(d3.schemeDark2);
    if (this.stats.currentData.length === 0) {
      return;
    }
    d3.select(this.element).selectAll('.scroll-container').remove();
    d3.select(this.element).selectAll('#custom-styled-scrollbar').remove();
    this.fontSize = 12;
    this.setMaxVal();
    const tickValues = d3.range(...this.yDomain, this.tickInterval);

    this.margin = {
      top: 10,
      right: this.element.clientWidth * MARGIN_PTC,
      bottom: 0,
      left: 0,
    };

    this.drawSVGContainer(this.margin);
    this.leftAxis = this.createVerticalAxis({
      tickValues,
      tickFormat: (tick) => (this.isProjectDataMeasuredByTime ? formatSecondsFriendly(tick, false) : formatNumber(tick)),
    });
    this.bottomAxis = this.createBottomAxis({
      data: this.isPerStopChart ? [] : this.allDates,
      labelKey: 'xAxisLabel',
      axisValueKey: 'date',
      secondaryLabelsHeight: this.secondaryLabelsHeight,
    });
    this.setXScale();
    this.setYScale();
    this.bottomAxis.draw();

    this.leftAxis.precalculate({
      tickValues,
      tickFormat: (tick) => (this.isProjectDataMeasuredByTime ? formatSecondsFriendly(tick, false) : formatNumber(tick)),
    });
    this.bottomAxis.precalculate({
      data: this.isPerStopChart ? [] : this.allDates,
      labelKey: 'xAxisLabel',
      axisValueKey: 'date',
      secondaryLabelsHeight: this.secondaryLabelsHeight,
    });

    this.updateScaleRanges();
    this.leftAxis.draw();
    this.updateScaleRanges();

    this.gridlines = this.drawGridlines(
      this.svg,
      {
        strokeDashArray: '0',
        tickValues,
        color: colorConstants.dark['quaternary-dark'],
      },
    );

    this.drawPlot(this.margin);
    this.verticalBarChart = this.drawVerticalBarChart(
      this.currentData,
      {
        xKey: 'date',
        yKey: this.chartYKey,
        yVal: this.isPerStopChart ? undefined : this.chartMaxVal,
        extraConditionKey: this.isPerStopChart ? undefined : 'isDot',
        barWithoutActions: 'no-production',
        barCornerRadius: 2,
        additionalMargins: { bottom: this.secondaryLabelsHeight },
      },
    );

    if (!this.isPerStopChart) {
      const datesWithZeroDuration = this.allDates.filter((elem) => elem.isDot);
      this.zeroDurationDots = this.drawDotChart(
        datesWithZeroDuration,
        {
          xKey: 'date',
          yVal: this.height - this.secondaryLabelsHeight - 10, // Bottom padding
          colorKey: 'color',
          radius: 4,
          xScaleBandOffset: true,
        },
      );
    }
    this.targetLineForBaselineData = this.drawSimpleTargetLine(
      {
        xEndVal: this.xScale(this.firstCurrentDataElem.date),
        color: this.chartColors['primary-dark'],
        value: this.baselineAverage,
        averageLineData: this.baselineAverage,
        strokeWidth: 1,
        type: 'baseline',
      },
    );
    this.targetLineForCurrentData = this.drawSimpleTargetLine(
      {
        xStartVal: this.xScale(this.firstCurrentDataElem.date),
        color: this.chartColors['secondary-dark'],
        value: this.targetVal,
        strokeDash: 10,
        strokeWidth: 1,
        averageLineData: this.targetVal,
        type: 'target',
      },
    );

    this.currentDataStartIcon = this.drawEventMarker(
      [this.firstCurrentDataElem],
      {
        xKey: 'date',
        yKey: 'date',
        mirroredIcon: false,
        yPosition: 10, // Half of icon height
        color: this.chartColors['tertiary-dark'],
        icon: mdiFlag,
        iconColor: this.chartColors.white,
        circleColor: this.chartColors.primary,
        iconScaleVal: 0.8,
        hoverEnabled: false,
      },
    );

    if (this.project.finished) {
      this.currentDataEndIcon = this.drawEventMarker(
        [this.lastCurrentDataElem],
        {
          xKey: 'date',
          yKey: 'date',
          xPositionSpecification: this.xScale.bandwidth(),
          mirroredIcon: false,
          yPosition: 10, // Half of icon height
          color: this.chartColors['tertiary-dark'],
          icon: mdiFlagCheckered,
          iconColor: this.chartColors.white,
          circleColor: this.chartColors.error,
          iconScaleVal: 0.8,
          hoverEnabled: false,
        },
      );
    }

    this.actionIcons = this.drawEventMarker(
      this.completedActions,
      {
        xKey: 'date',
        yKey: 'date',
        xPositionSpecification: this.xScale.bandwidth() / 2,
        mirroredIcon: false,
        hasVerticalLine: false,
        yPosition: 10,
        icon: mdiOrderBoolAscendingVariant,
        iconColor: this.chartColors['secondary-dark'],
        iconScaleVal: 0.8,
      },
    );

    this.solutionIcons = this.drawEventMarker(
      this.solutions,
      {
        xKey: 'date',
        yKey: 'date',
        xPositionSpecification: this.xScale.bandwidth() / 2,
        mirroredIcon: false,
        hasVerticalLine: false,
        yPosition: 10,
        icon: mdiCheckboxMarkedCircle,
        iconColor: this.chartColors.primary,
        iconScaleVal: 0.8,
      },
    );

    this.drawZoom({
      minScaleFactor: 0.98,
      maxScaleFactor: Math.ceil(this.maxScaleFactor),
      defaultScaleFactor: 0.98,
      backgroundColor: this.chartColors.white,
      scaleType: '',
      xDomainKey: 'xDomain',
    });

    const minX = this.xScale(this.currentData[0].date);
    const maxX = this.xScale(this.currentData[this.currentData.length - 1].date);
    const overwidth = maxX - minX + this.margin.left + this.margin.right;

    this.scrollContainer = d3.select(this.element).append('div')
      .classed('scroll-container', true)
      .style('width', this.width)
      .style('height', '20px')
      .style('overflow', 'auto');
    const currentZoom = this.svg.call(this.zoom);
    this.scrollContainer.on('scroll.scroller', (val) => {
      currentZoom.call(this.zoom.transform, d3.zoomIdentity
        .scale(this.scaleTransform.k)
        .translate(-val.target.scrollLeft / this.scaleTransform.k, 0));
    });
    this.scrollBar = this.scrollContainer
      .attr('id', 'custom-styled-scrollbar')
      .append('div')
      .style('width', `${overwidth}px`)
      .style('height', '1px');
  }

  onBarMouseMove(mouseEv, i) {
    showTooltip({
      isTextLight: true,
      params: {
        ...i,
        dotColor: i.color,
        dotLabel: formatDate(i.date, 'short'),
        tooltipHTMLFunc: this.barTooltipHTMLFunc,
      },
    });
  }


  onBarMouseLeave() {
    hideTooltip();
  }


  onDotMouseMove(mouseEv, i) {
    showTooltip({
      isTextLight: true,
      params: {
        ...i,
        dotColor: i.color,
        dotLabel: formatDate(i.date, 'short'),
        primaryLabel: formatSecondsFriendly(i.duration),
      },
    });
  }


  onDotMouseLeave() {
    hideTooltip();
  }

  onTargetLineMouseMove(mouseEv, i) {
    showTooltip({
      isTextLight: true,
      params: {
        ...i,
        tooltipHTMLFunc: this.averageTooltipHTMLFunc,
      },
    });
  }


  onTargetLineMouseLeave() {
    hideTooltip();
  }

  onMarkerMouseMove(mouseEv, i) {
    showTooltip({
      params: {
        ...i,
        tooltipHTMLFunc: this.measureTooltipHTMLFunc,
      },
    });
  }


  onMarkerMouseLeave() {
    hideTooltip();
  }
}
