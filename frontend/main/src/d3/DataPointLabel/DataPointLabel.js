import * as d3 from 'd3';

import { ZOOM_DURATION, TRANSITION_DURATION } from '@/d3/constants';
import isMoveEvent from '@/d3/helpers/isMoveEvent';

export default class DataPointLabel {
  options = {
    xKey: 'measure',
    yKey: 'value',
    xScaleKey: 'xScale',
    yScaleKey: 'yScale',
    labelKey: '',
    transitionDuration: TRANSITION_DURATION,
    visible: true,
    diagonal: false,
    minDiagonalLength: 0,
    fontSize: 12,
    showAllTicks: false,
  };

  constructor(ctx, data, options = {}) {
    this.options = { ...this.options, ...options };
    this.data = data;
    this.xScale = ctx[this.options.xScaleKey];
    this.yScale = ctx[this.options.yScaleKey];
    this.height = ctx.height;
    this.width = ctx.width;
    this.labelKey = ctx.labelKey;
    this.colorScale = d3.scaleOrdinal(d3.schemeDark2);
    this.context = ctx;
  }

  draw(targetEl) {
    this.elementRef = targetEl;
    this.update(this.data);
  }

  destroy() {
    this.elementRef.remove();
  }

  getBarCenterPos(d) {
    if (this.xScale(d[this.options.xKey]) === undefined) return 0;
    return this.xScale(d[this.options.xKey]) + (this.xScale.bandwidth() / 2);
  }

  zoom(zoom, event) {
    const isDragEv = isMoveEvent(event);
    const transitionDur = isDragEv ? 0 : ZOOM_DURATION;
    const zoomUpdate = this.elementRef
      .selectAll('text')
      .transition()
      .duration(transitionDur);
    this.updateLabelAttrs(zoomUpdate);
  }

  setEveryNthDisplayed() {
    const vm = this;
    this.everyNthTick = (Math.ceil(3 / (vm.width / (vm.options.fontSize * vm.data.length / 2))));
  }

  isLabelDisplayed() {
    const vm = this;
    // eslint-disable-next-line func-names
    return function (d, i) {
      if (!vm.xScale.bandwidth || vm.options.showAllTicks) return 'initial';
      return i % vm.everyNthTick === 0 ? 'initial' : 'none';
    };
  }

  isDiagonal(d) {
    return this.options.diagonal && String(d[this.options.labelKey]).length >= this.options.minDiagonalLength;
  }

  getTextAnchor() {
    const vm = this;
    // eslint-disable-next-line func-names
    return function (d) {
      return vm.isDiagonal(d) ? 'start' : 'middle';
    };
  }

  updateLabelAttrs(target) {
    const bottomMargin = 5;
    target.attr('x', (d) => this.getBarCenterPos(d))
      .attr('y', (d) => this.yScale(d[this.options.yKey]) - bottomMargin)
      .attr('text-anchor', this.getTextAnchor)
      .attr('font-size', `${this.options.fontSize}px`)
      .attr('display', this.isLabelDisplayed())

      .text((d) => d[this.options.labelKey]);
    if (this.options.diagonal) {
      target.attr(
        'transform',
        (d) => (this.isDiagonal(d)
          ? `rotate(-45,${this.getBarCenterPos(d) + (this.options.fontSize / 2)},${this.yScale(d[this.options.yKey]) - bottomMargin})`
          : ''),
      );
    }
  }

  update(inputData, options) {
    if (options) {
      this.options = { ...this.options, ...options };
    }
    if (inputData) this.data = inputData;
    let data = [];
    if (this.options.visible) data = this.data;

    this.xScale = this.context[this.options.xScaleKey];
    this.yScale = this.context[this.options.yScaleKey];
    this.setEveryNthDisplayed();
    this.labels = this.elementRef
      .selectAll('.chart-label')
      .data(data);

    this.labelEnter = this.labels
      .enter()
      .append('text')
      .attr('class', 'chart-label');

    this.updateLabelAttrs(this.labelEnter);

    this.labelMerge = this.labelEnter.merge(this.labels)
      .transition()
      .duration(this.options.transitionDuration);

    this.updateLabelAttrs(this.labelMerge);

    this.labelExit = this.labels.exit().remove();
  }
}
