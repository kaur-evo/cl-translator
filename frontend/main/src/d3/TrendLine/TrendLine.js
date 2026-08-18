import * as d3 from 'd3';

import { ZOOM_DURATION } from '@/d3/constants';
import { leastSquares } from '@/helpers/d3Helpers';
import isMoveEvent from '@/d3/helpers/isMoveEvent';

export default class TrendLine {
  options = {
    color: '#ffab00',
    strokeWidth: '2px',
    xKey: 'measure',
    xScaleKey: 'xScale',
    yScaleKey: 'yScale',
    xScaleBandOffset: false,
    calculate: false,
    valueKey: 'value',
    visible: true,
    hoverEnabled: true,
    ignoreFunc: '',
  };

  data = [];

  constructor(ctx, data, options) {
    this.options = Object.assign(this.options, options);
    this.data = data;
    this.xScale = ctx[this.options.xScaleKey];
    this.yScale = ctx[this.options.yScaleKey];
    this.context = ctx;
    this.scaleBandOffset = this.options.xScaleBandOffset ? ctx.xScale.bandwidth() / 2 : 0;
  }

  drawTrendline(element, ctx) {
    this.addTrendLine(element, ctx);
    this.addMouseOverAnimations(ctx);
  }

  calculateTrendLinePoints() {
    const data = [...this.data];
    let latestIndex = 0;
    const ySeries = data.reduce((arr, d, index) => {
      if (this.options?.ignoreFunc(d)) return arr;
      const arrClone = [...arr];
      arrClone.push(parseFloat(Number(d[this.options.valueKey])));
      latestIndex = index;
      return arrClone;
    }, []);
    const xSeries = d3.range(1, ySeries.length + 1);
    const leastSquaresCoeff = leastSquares(xSeries, ySeries);
    const y1val = leastSquaresCoeff[0] + leastSquaresCoeff[1];
    const y2val = (leastSquaresCoeff[0] * xSeries.length) + leastSquaresCoeff[1];
    const x1val = data && data.length ? data[0][this.options.xKey] : 0;
    let x2val;
    if (data && data.length) {
      let index = latestIndex;
      if (!this.options.ignoreFunc) index = data.length - 1;
      x2val = data[index][this.options.xKey];
    } else {
      x2val = 0;
    }

    return {
      y1val, x1val, y2val, x2val,
    };
  }

  zoom({
    kx, ky, x, y, k,
  }, event) {
    const xPosition = x || 0;
    const yPosition = y || 0;
    this.xScaleFactor = kx || k || 1;
    this.yScaleFactor = ky || k || 1;
    const isDragEv = isMoveEvent(event);
    const transitionDur = isDragEv ? 0 : ZOOM_DURATION;

    this.elementRef
      .transition()
      .duration(transitionDur)
      .attr('transform', `translate(${xPosition},${yPosition}) scale(${this.xScaleFactor},${this.yScaleFactor})`);
  }

  update(inputData, options) {
    if (options) {
      this.options = Object.assign(this.options, options);
    }
    if (inputData) {
      this.data = inputData;
    }
    const hoverAreaWidth = 15;
    let data = [];
    if (this.options.visible) {
      data = this.options.calculate ? this.calculateTrendLinePoints() : this.data;
    }
    this.xScale = this.context[this.options.xScaleKey];
    this.yScale = this.context[this.options.yScaleKey];
    const scaleFactor = this.xScaleFactor || 1;
    const x1Position = data.x1val ? this.xScale(data.x1val) / scaleFactor : 0;
    const x2Position = data.x2val ? (this.xScale(data.x2val) / scaleFactor) + (this.xScale.bandwidth() / scaleFactor) : 0;
    const y1Position = this.yScale(data.y1val) || 0;
    const y2Position = this.yScale(data.y2val) || 0;

    const trendData = [data, data];
    this.trendLine = this.elementRef
      .selectAll('.trendline')
      .data(trendData);

    this.trendEnter = this.trendLine
      .enter()
      .append('line')
      .style('vector-effect', 'non-scaling-stroke')
      .attr('class', 'trendline')
      .attr('x1', x1Position)
      .attr('y1', y1Position)
      .attr('x2', x2Position)
      .attr('y2', y2Position)
      .style('stroke-dasharray', (d, i) => {
        if (i === 1) return '';
        return '5 5';
      })
      .style('stroke-width', (d, i) => {
        if (i === 1) return hoverAreaWidth;
        return this.options.strokeWidth;
      })
      .style('stroke', (d, i) => {
        if (i === 1) return 'transparent';
        return this.context.isDark ? this.context.colors.white : this.context.colors.black;
      });
    this.trendEnter.merge(this.trendLine)
      .attr('x1', x1Position)
      .attr('y1', y1Position)
      .attr('x2', x2Position)
      .attr('y2', y2Position);
    this.trendLine.exit().remove();
  }

  draw(targetEl) {
    if (this.options.targetEl) {
      this.elementRef = this.options.targetEl;
    } else {
      this.elementRef = targetEl.append('g').attr('class', 'area-wrapper');
    }
    this.update();
    if (this.options.hoverEnabled) this.addMouseOverAnimations();
  }

  addMouseOverAnimations() {
    const ctx = this.context;
    this.trendEnter.on('mousemove', this.onTrendLineMouseMove(this, ctx));
    this.trendEnter.on('mouseout', this.onTrendLineMouseLeave(this, ctx));
  }


  onTrendLineMouseMove(vm, ctx) {
    // eslint-disable-next-line func-names
    return function (mouseEv, item) {
      ctx.onTrendLineMouseMove(mouseEv, item, this);
    };
  }


  onTrendLineMouseLeave(vm, ctx) {
    // eslint-disable-next-line func-names
    return function () {
      ctx.onTrendLineMouseLeave(this);
    };
  }
}
