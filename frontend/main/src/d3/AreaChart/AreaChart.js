import * as d3 from 'd3';

import { ZOOM_DURATION, TRANSITION_DURATION } from '@/d3/constants';
import extendDatapointsByRangeEnd from '@/d3/helpers/extendDatapointsByRangeEnd';
import leaf from '@/helpers/object/leaf';
import isMoveEvent from '@/d3/helpers/isMoveEvent';

export default class AreaChart {
  options = {
    color: '',
    colorScale: () => '',
    opacity: '1',
    definedKey: null,
    xKey: 'measure',
    xKey2: '',
    yKey1: 'value',
    yKey2: 'value',
    xScaleKey: 'xScale',
    yScaleKey: 'yScale',
    xScaleBandOffset: false,
    curve: d3.curveMonotoneX,
    id: null,
    isClipPath: false,
    clipPathId: null,
    isMask: false,
    maskId: null,
    targetEl: null,
    pathClass: 'chart-area',
    cutByKey: null,
    y0Offset: 0,
    y1Offset: 0,
    visible: true,
    transitionDuration: TRANSITION_DURATION,
  };

  constructor(ctx, data, options = {}) {
    this.options = { ...this.options, ...options };
    this.data = data;
    this.context = ctx;
    this.xScale = ctx[this.options.xScaleKey];
    this.yScale = ctx[this.options.yScaleKey];
    this.scaleBandOffset = this.options.xScaleBandOffset ? ctx.xScale.bandwidth() / 2 : 0;
    this.colorScale = d3.scaleOrdinal(d3.schemeDark2);
    this.xScaleFactor = 1;
    this.yScaleFactor = 1;
  }

  getDefined = (d) => !this.options.definedKey || (leaf(d, this.options.definedKey) !== null && leaf(d, this.options.definedKey) !== undefined && leaf(d, this.options.definedKey) !== false);

  getXpos = (d) => (this.xScale(leaf(d, this.options.xKey)) + this.scaleBandOffset) / this.xScaleFactor;

  getY0Pos = (d) => (this.yScale(leaf(d, this.options.yKey1) || 0) + this.options.y0Offset) / this.yScaleFactor;

  getY1Pos = (d) => (this.yScale(leaf(d, this.options.yKey2) || 0) + this.options.y1Offset) / this.yScaleFactor;

  get areaGenerator() {
    return d3.area()
      .defined(this.getDefined)
      .x(this.getXpos)
      .y0(this.getY0Pos)
      .y1(this.getY1Pos)
      .curve(this.options.curve);
  }

  draw(targetEl) {
    if (this.options.targetEl) {
      this.elementRef = this.options.targetEl;
    } else {
      this.elementRef = targetEl.append('g').attr('class', 'area-wrapper');
    }

    if (this.options.isClipPath) {
      this.elementRef = this.elementRef.append('clipPath');
    } else if (this.options.isMask) {
      this.elementRef = this.elementRef.append('mask');
    }
    if (this.options.id) {
      this.elementRef.attr('id', this.options.id);
    }

    this.update(this.data);
    return this;
  }

  update(inputData, options) {
    if (options) {
      this.options = { ...this.options, ...options };
    }
    if (inputData) this.data = inputData;
    let data = [];
    if (this.options.visible) data = this.data;
    let dataClone = [...data];
    if (data.length) {
      dataClone = extendDatapointsByRangeEnd(data, this.options.xKey, this.options.xKey2);

      if (this.options.transpose) {
        dataClone = d3.transpose(dataClone);
      }
      if (!this.options.multiArea) {
        dataClone = [dataClone];
      }
    }

    this.xScale = this.context[this.options.xScaleKey];
    this.yScale = this.context[this.options.yScaleKey];
    this.scaleBandOffset = this.options.xScaleBandOffset ? this.xScale.bandwidth() / 2 : 0;

    this.area = this.elementRef
      .selectAll(`.${this.options.pathClass}`)

      .data(dataClone);

    const chartArea = this.area
      .enter()
      .append('path')
      .attr('class', this.options.pathClass)
      .merge(this.area)
      .transition()
      .duration(this.options.transitionDuration)
      .attr('d', this.areaGenerator)
      .attr('fill', (d, i) => this.options.colorScale(d, i) || this.options.color || this.colorScale(i))
      .attr('opacity', this.options.opacity);

    if (this.options.clipPathId) {
      chartArea.attr('clip-path', `url(#${this.options.clipPathId})`); // clip the rectangle
    }
    if (this.options.maskId) {
      chartArea.attr('mask', `url(#${this.options.maskId})`); // clip the rectangle
    }
    this.area.exit().remove();
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
}
