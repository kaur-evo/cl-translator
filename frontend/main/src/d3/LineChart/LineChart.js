import * as d3Base from 'd3';
import { lineChunked } from 'd3-line-chunked';

import { ZOOM_DURATION, TRANSITION_DURATION } from '@/d3/constants';
import extendDatapointsByRangeEnd from '@/d3/helpers/extendDatapointsByRangeEnd';
import leaf from '@/helpers/object/leaf';
import isMoveEvent from '@/d3/helpers/isMoveEvent';

const d3 = { ...d3Base, lineChunked };
export default class LineChart {
  options = {
    color: '',
    colorScale: () => '',
    strokeWidth: '2px',
    strokeDash: '0',
    definedKey: null,
    xKey: 'measure',
    xKey2: '',
    yKey: 'value',
    xScaleKey: 'xScale',
    yScaleKey: 'yScale',
    xScaleBandOffset: false,
    curve: d3.curveMonotoneX,
    clipPathId: null,
    maskId: null,
    visible: true,
    selectorClass: 'chart-line',
    useLineChunked: true,
    transitionDuration: TRANSITION_DURATION,
  };

  data = [];

  constructor(ctx, data, options) {
    this.options = Object.assign(this.options, options);
    this.data = data;
    this.context = ctx;
    this.xScale = ctx[this.options.xScaleKey];
    this.yScale = ctx[this.options.yScaleKey];
    this.scaleBandOffset = this.options.xScaleBandOffset ? ctx.xScale.bandwidth() / 2 : 0;
    this.xScaleFactor = 1;
    this.yScaleFactor = 1;
    this.colorScale = d3.scaleOrdinal(d3.schemeDark2);
  }

  // defined dotline
  getDefined = (d) => !this.options.definedKey || (leaf(d, this.options.definedKey) !== null && leaf(d, this.options.definedKey) !== undefined && leaf(d, this.options.definedKey) !== false);

  getXpos = (d) => (this.xScale(leaf(d, this.options.xKey)) + this.scaleBandOffset) / this.xScaleFactor;

  getYPos = (d) => this.yScale(leaf(d, this.options.yKey) || 0) / this.yScaleFactor;

  get lineAttrs() {
    const lineAttrs = {
      stroke: (d, i) => this.options.colorScale(d, i) || this.options.color || this.colorScale(i),
      'stroke-dasharray': this.options.strokeDash,
      fill: 'none',
      'stroke-width': (d) => this.options.getStrokeWidth?.(d) || this.options.strokeWidth,
      'vector-effect': 'non-scaling-stroke',
    };
    if (this.options.clipPathId) {
      lineAttrs['clip-path'] = `url(#${this.options.clipPathId})`; // clip the rectangle
    }
    if (this.options.maskId) {
      lineAttrs.mask = `url(#${this.options.maskId})`; // clip the rectangle
    }
    return lineAttrs;
  }

  get lineGenerator() {
    if (this.options.useLineChunked) {
      return d3.lineChunked()
        .defined(this.getDefined)
        .x(this.getXpos)
        .y(this.getYPos)
        .curve(this.options.curve)
        .chunk((d) => (this.getDefined(d) ? `${this.selectorClass}-line-workaround` : `${this.selectorClass}-missing-line`))
        .chunkDefinitions({
          gap: {
            styles: {
              'stroke-dasharray': '0',
              'stroke-opacity': 0.1,
              stroke: 'black',
            },
          },
          // https://github.com/pbeshai/d3-line-chunked/issues/18
          // theres a bug with line-chunked library where gap line does not get a separate mask,
          // custom chunks are ordered on higher layers so this workaround fixes opaque gap styles leaking to line
          [`${this.selectorClass}-line-workaround`]: {
            styles: this.lineAttrs,
          },
          [`${this.selectorClass}-missing-line`]: {
            styles: {
              'stroke-opacity': 0,
            },
          },
        })
        .pointAttrs({
          visibility: 'hidden',
        });
    }
    return d3.line()
      .defined(this.getDefined)
      .x(this.getXpos)
      .y(this.getYPos)
      .curve(this.options.curve);
  }

  destroy() {
    this.elementRef.remove();
  }

  draw(targetEl) {
    this.elementRef = targetEl;
    this.update(this.data);
  }

  update(inputData, options = {}) {
    if (options) {
      this.options = { ...this.options, ...options };
    }
    if (inputData) this.data = inputData;
    let data = [];
    if (this.options.visible) data = this.data;
    let dataClone = [];

    if (data.length) {
      dataClone = extendDatapointsByRangeEnd(data, this.options.xKey, this.options.xKey2);
      if (this.options.transpose) {
        dataClone = d3.transpose(dataClone);
      }
      if (!this.options.multiLine) {
        dataClone = [dataClone];
      }
    }

    this.xScale = this.context[this.options.xScaleKey];
    this.yScale = this.context[this.options.yScaleKey];
    this.scaleBandOffset = this.options.xScaleBandOffset ? this.xScale.bandwidth() / 2 : 0;
    this.line = this.elementRef
      .selectAll(`.${this.options.selectorClass}`)
      .data(dataClone);

    let lineEnter;

    if (this.options.useLineChunked) {
      lineEnter = this.line.enter().append('g').attr('class', this.options.selectorClass);
    } else {
      lineEnter = this.line.enter().append('path').attr('class', this.options.selectorClass);
    }

    const lineMerge = this.line.merge(lineEnter);

    if (this.options.useLineChunked) {
      lineMerge.call(this.lineGenerator);
    } else {
      const lineAttrs = lineMerge
        .transition()
        .duration(this.options.transitionDuration)
        .attr('d', this.lineGenerator);
      Object.entries(this.lineAttrs).forEach(([key, value]) => {
        lineAttrs.attr(key, value);
      });
    }

    this.line.exit().remove();
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
