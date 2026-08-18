import * as d3 from 'd3';

import { ZOOM_DURATION } from '@/d3/constants';
import isMoveEvent from '@/d3/helpers/isMoveEvent';
import leaf from '@/helpers/object/leaf';

export default class DotPlotChart {
  options = {
    xKey: 'measure',
    yKey: 'value',
    xScaleKey: 'xScale',
    yScaleKey: 'yScale',
    visible: true,
    dotRadius: 6,
    definedKey: null,
    dimensionCount: 2,
    subGroupKey: 'stackList',
  };

  constructor(ctx, data, options = {}) {
    this.options = { ...this.options, ...options };
    this.data = data;
    this.xScale = ctx[this.options.xScaleKey];
    this.yScale = ctx[this.options.yScaleKey];
    this.xScaleFactor = 1;
    this.yScaleFactor = 1;
    this.height = ctx.height;
    this.width = ctx.width;
    this.colorScale = d3.scaleOrdinal(d3.schemeDark2);
    this.context = ctx;
    this.margin = ctx.margin;
  }

  async draw(targetEl) {
    this.elementRef = targetEl;
    this.update(this.data);
  }

  destroy() {
    this.elementRef.remove();
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

  update(inputData, options = {}) {
    if (this.isDestroyed) return;
    if (options) {
      this.options = { ...this.options, ...options };
    }
    if (inputData) this.data = inputData;
    let data = [];
    if (this.options.visible) data = this.data;
    this.xScale = this.context[this.options.xScaleKey];
    this.yScale = this.context[this.options.yScaleKey];
    this.onDotUpdate(this.elementRef, 1, data);
  }

  onDotUpdate(childElements, level = 1, _data = null) {
    let data = (d) => d?.data?.[this.options.subGroupKey] || d?.[this.options.subGroupKey] || [];
    if (level === 1) {
      data = _data;
    }
    childElements.selectAll(`.dot-group-lvl-${level}`)
      .data(data)
      .join(
        (enter) => {
          this.onCircleEnter(enter, level);
        },
        (update) => {
          this.onCircleMerge(update, level);
        },
        (exit) => exit.remove(),
      );
  }

  onCircleEnter(enter, level) {
    const enterG = enter.append('g').attr('class', `dot-group-lvl-${level}`);
    if (level >= this.options.dimensionCount) {
      const circle = enterG.append('circle');
      this.applyDotCircleAttr(circle);
    } else {
      this.onDotUpdate(enterG, level + 1);
    }
  }

  onCircleMerge(update, level) {
    if (level >= this.options.dimensionCount) {
      this.applyDotCircleAttr(update.select('circle'));
    } else {
      this.onDotUpdate(update, level + 1);
    }
  }

  getDefined = (d) => !this.options.definedKey || (leaf(d, this.options.definedKey) !== null && leaf(d, this.options.definedKey) !== undefined && leaf(d, this.options.definedKey) !== false);

  getDotCircleVisibility = (d) => (this.getDefined(d) ? 'visible' : 'hidden');

  getDotCircleXPos = (d) => (this.xScale(d.data[this.options.xKey]) + (this.xScale.bandwidth() / 2));

  getDotCircleYPos = (d) => {
    const [, end] = d;
    return this.yScale(end);
  };

  getDotCircleRadius = (d) => this.options.getDotCircleRadius?.(d) || this.options.dotRadius;

  getDotCircleFill = (d, i) => d.color || (d?.data?.color) || this.colorScale(i);

  getDotCircleTransform = () => `scale(${1 / this.xScaleFactor},${1 / this.yScaleFactor})`;

  applyDotCircleAttr(circle) {
    circle
      .attr('visibility', this.getDotCircleVisibility)
      .attr('cx', this.getDotCircleXPos)
      .attr('cy', this.getDotCircleYPos)
      .attr('r', this.getDotCircleRadius)
      .attr('fill', this.getDotCircleFill)
      .attr('transform', this.getDotCircleTransform);
  }
}
