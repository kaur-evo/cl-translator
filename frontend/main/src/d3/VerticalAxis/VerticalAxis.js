import * as d3 from 'd3';
import isFunction from 'lodash/isFunction';

import { ZOOM_DURATION } from '@/d3/constants';

const AXIS_RIGHT = 'axisRight';
const AXIS_LEFT = 'axisLeft';

const axisSpacing = 4;

export default class LeftAxisModule {
  formatPercent = d3.format('0.0%');

  options = {
    yScaleKey: 'yScale',
    fontSize: 12,
    fontFamily: 'Open Sans, sans-serif',
    dataType: 'pct',
    ticksCount: 5,
    axisLabel: '',
    axisLabelColor: '#FFF',
    tickFormat: null,
    axisType: AXIS_LEFT,
    transitionDuration: ZOOM_DURATION,
  };

  constructor(element, ctx, options) {
    this.element = element;
    this.options = Object.assign(this.options, options);
    this.context = ctx;
    this.scaleBandOffset = this.options.xScaleBandOffset ? ctx.xScale.bandwidth() / 2 : 0;
  }

  appendContainer() {
    if (!this.leftAxisContainer) {
      this.leftAxisContainer = this.element
        .append('g');
      this.yAxis = this.leftAxisContainer.append('g');
      if (this.verticalAxisXPos) {
        this.leftAxisContainer.attr('transform', `translate(${this.verticalAxisXPos},${this.context.marginTop})`);
      }
    }
  }

  async draw() {
    this.appendContainer();
    this.setVerticalAxisWidth();
    await this.addVerticalAxis();
  }

  applyYAxisTickCount(yAxisGenerator) {
    if (this.options.tickValues) {
      yAxisGenerator.tickValues(this.options.tickValues);
    } else {
      yAxisGenerator.ticks(this.options.ticksCount);
    }
  }

  getYAxisGenerator(zoomEvent) {
    const ctx = this.context;
    const yScale = ctx[this.options.yScaleKey];
    const rescaledYScale = zoomEvent ? zoomEvent.transform.rescaleY(yScale) : yScale;
    return d3[this.options.axisType ?? AXIS_LEFT](rescaledYScale).tickSize(0);
  }

  applyYAxisTickFormat(yAxisGenerator) {
    const ctx = this.context;
    if (this.options && this.options.tickFormat && isFunction(this.options.tickFormat)) {
      yAxisGenerator.tickFormat(this.options.tickFormat);
    } else if (ctx.dataType === 'pct') {
      yAxisGenerator.tickFormat(this.formatPercent);
    }
  }

  createVerticalAxis(val, zoomEvent) {
    const yAxisGenerator = this.getYAxisGenerator(zoomEvent);
    this.applyYAxisTickCount(yAxisGenerator);
    this.applyYAxisTickFormat(yAxisGenerator);
    return yAxisGenerator(val);
  }

  get isRightAxis() {
    return this.options.axisType === AXIS_RIGHT;
  }

  // small axis label at the bottom
  addVerticalAxisAdditionalText(g) {
    const ctx = this.context;
    const xAxisTickHeight = 8;
    const target = g ?? this.yAxis;
    target
      .append('text')
      .attr('dy', ctx.height + ctx.extraBottomMargin - xAxisTickHeight)
      /* eslint-disable no-magic-numbers */
      .attr('dx', this.isRightAxis ? 4 : -4)
      .attr('text-anchor', 'right')
      .attr('font-size', this.options.fontSize)
      .attr('font-weight', '500')
      .attr('font-family', this.options.fontFamily)
      .attr('fill', this.options.axisLabelColor)
      .text(ctx.xAxisLabel || this.options.axisLabel);
  }

  calculateVerticalAxisWidth() {
    const tempG = this.leftAxisContainer.append('g').attr('class', 'temp');
    this.createVerticalAxis(tempG);
    const vm = this;
    // eslint-disable-next-line func-names
    tempG.selectAll('text').each(function () {
      const label = d3.select(this);
      label.attr('font-size', vm.options.fontSize);
      label.attr('font-family', vm.options.fontFamily);
    });
    this.addVerticalAxisAdditionalText(tempG);
    const { width } = tempG?.node?.()?.getBBox?.() || 0;
    tempG.remove();

    return width;
  }

  get verticalAxisXPos() {
    const ctx = this.context;
    if (this.isRightAxis) {
      return (ctx.width + ctx.marginLeft + axisSpacing) || 0;
    }
    return (ctx.leftAxisWidth - axisSpacing) || 0;
  }

  setVerticalAxisWidth() {
    const ctx = this.context;
    const yAxisWidth = this.calculateVerticalAxisWidth();
    if (this.isRightAxis) {
      ctx.rightAxisWidth = yAxisWidth + axisSpacing;
    } else {
      ctx.leftAxisWidth = yAxisWidth + axisSpacing;
    }
  }

  async addVerticalAxis() {
    this.addVerticalAxisAdditionalText();
    await this.update();
  }

  precalculate(options) {
    this.appendContainer();
    if (options) {
      this.options = { ...this.options, ...options };
    }

    this.setVerticalAxisWidth();
  }

  update(zoomEvent, options) {
    const ctx = this.context;
    this.options = { ...this.options, ...options };
    const vm = this;
    if (zoomEvent) {
      ctx.latestZoomEv = zoomEvent;
    }
    const updatedAxis = this.leftAxisContainer
      .attr('transform', `translate(${this.verticalAxisXPos},${ctx.marginTop})`);
    const axisTransition = updatedAxis.transition().duration(vm.options.transitionDuration);
    return new Promise((resolve) => {
      axisTransition.call((e) => this.createVerticalAxis(e, zoomEvent))
        // eslint-disable-next-line func-names
        .on('start', function () {
          const axisSelection = d3.select(this);
          // eslint-disable-next-line func-names
          axisSelection.selectAll('text').each(function () {
            const label = d3.select(this);
            label.attr('font-size', vm.options.fontSize);
            label.attr('font-family', vm.options.fontFamily);
            label.attr('fill', ctx.isDark ? ctx.colors.white : ctx.colors.black);
            label.text(ctx.xAxisLabel || vm.options.axisLabel);
          });
          axisSelection.select('.domain').remove();
        })
        .on('end', () => {
          resolve();
        });
    });
  }
}
