import { mdiSyncCircle } from '@mdi/js';
import isFunction from 'lodash/isFunction';
import * as d3 from 'd3';

import isMoveEvent from '@/d3/helpers/isMoveEvent';
import getAnchoredOverlappingRangesRepositioned from '@/d3/helpers/getAnchoredOverlappingRangesRepositioned';
import { TRANSITION_DURATION } from '@/d3/constants';

const getOptionVal = (val, data) => (isFunction(val) ? val(data) : val);

const defaultOptions = {
  color: '#ffab00',
  colorKey: null,
  opacity: '1',
  xKey: 'measure',
  yKey: 'value',
  xScaleKey: 'xScale',
  yScaleKey: 'yScale',
  id: null,
  targetEl: null,
  pathClass: 'chart-marker',
  strokeWidth: 2,
  strokeDash: 0,
  icon: mdiSyncCircle,
  scaleFactor: 1,
  iconColor: '#0099FF',
  iconBackground: '#FFF',
  hasVerticalLine: true,
  hoverEnabled: true,
  mirroredIcon: false,
  markerVerticalPosition: 'center',
  circleRadius: 12,
  verticalOffset: 0,
  labelKey: 'label',
  label: null,
  showIcon: true,
  showLabel: false,
  visible: true,
  transitionDuration: TRANSITION_DURATION,
};
export default class EventMarker {
  constructor(ctx, data, options) {
    this.context = ctx;
    this.options = { ...defaultOptions, ...options };
    this.xScale = ctx[this.options.xScaleKey];
    this.data = data;
    this.yScale = ctx[this.options.yScaleKey];
    this.xScaleFactor = 1;
    this.yScaleFactor = 1;
    this.height = ctx.height;
    this.margin = ctx.margin;
    this.scaleBandOffset = this.options.xScaleBandOffset ? this.xScale.bandwidth() / 2 : 0;
    this.padding = 4;
  }

  eventLabelRanges = [];

  getIconTranslateValue(circleCount, index) {
    const circleDiameter = this.options.circleRadius * 2;
    const totalWidth = circleCount * circleDiameter;
    const startingPoint = -totalWidth / 2;
    const translateX = startingPoint + (index * circleDiameter);
    return `translate(${translateX}, ${-this.options.circleRadius + this.options.verticalOffset})`;
  }

  get mirrorIconFactor() {
    return this.mirroredIcon ? -1 : 1;
  }

  get iconScaleValue() {
    return `scale(${this.options.iconScaleVal || 1}, ${this.options.iconScaleVal || 1})`;
  }

  draw(targetEl) {
    if (this.options.targetEl) {
      this.elementRef = this.options.targetEl;
    } else {
      this.elementRef = targetEl.append('g').attr('class', 'marker-wrapper');
    }

    if (this.options.id) {
      this.elementRef.attr('id', this.options.id);
    }

    this.update(this.data);
    return this;
  }

  zoom({
    kx, ky, x, y, k,
  }, event) {
    const xPosition = x || 0;
    const yPosition = y || 0;
    this.xScaleFactor = kx || k || 1;
    this.yScaleFactor = ky || k || 1;
    const isDragEv = isMoveEvent(event);
    const ZOOM_TRANSITION_DURATION = 500;
    const transitionDur = isDragEv ? 0 : ZOOM_TRANSITION_DURATION;

    this.elementRef
      .transition()
      .duration(transitionDur)
      .attr('transform', `translate(${xPosition},${yPosition}) scale(${this.xScaleFactor},${this.yScaleFactor})`);
  }

  getColor = (d) => {
    if (isFunction(this.options.color)) return this.options.color(d);
    return d[this.options.colorKey] || this.options.color;
  };

  getChartHeight = () => this.yScale(Math.min(...this.yScale.domain()) / this.yScaleFactor);

  getTransform() {
    let yPosition;
    if (this.options.markerVerticalPosition === 'top') {
      yPosition = 0;
    } else {
      yPosition = this.getChartHeight() / 2;
    }
    const xScaleFactor = 1 / this.xScaleFactor;
    const yScaleFactor = (1 / this.yScaleFactor) * this.mirrorIconFactor;

    return `translate(0,${this.options.yPosition || yPosition}) scale(${xScaleFactor},${yScaleFactor})`;
  }

  zoomUpdate(xEvent, yEvent = null, ctx = null) {
    if (xEvent && xEvent.transform && xEvent.transform.k) {
      this.xScaleFactor = xEvent.transform.k;
    }
    if (yEvent && yEvent.transform && yEvent.transform.k) {
      this.yScaleFactor = yEvent.transform.k;
      this.yScale = ctx[this.options.yScaleKey];
    }
    this.elementRef.selectAll('.marker-icon')
      .attr('transform', () => this.getTransform());
  }

  addIcon(iconContainer) {
    let icons;
    if (Array.isArray(this.options.icon)) {
      icons = this.options.icon;
    } else {
      icons = [this.options.icon];
    }

    const applyCircleProperties = (selection) => {
      selection
        .attr('r', this.options.circleRadius)
        .attr('cx', this.options.circleRadius)
        .attr('cy', this.options.circleRadius)
        .style('fill', this.options.circleColor || '#FFF')
        .attr('transform', (d, i) => `${this.getIconTranslateValue(icons.length, i)} ${this.iconScaleValue}`);
    };
    const applyIconPathProperties = (selection) => {
      selection
        .attr('fill', (d, i) => (Array.isArray(this.options.iconColor) ? this.options.iconColor[i] : this.options.iconColor))
        .attr('d', (iconPath) => iconPath)
        .attr('transform', (d, i) => `${this.getIconTranslateValue(icons.length, i)} ${this.iconScaleValue}`);
    };

    const icon = iconContainer.selectAll('.marker-icon').data(icons);
    const iconEnter = icon.enter()
      .append('g')
      .attr('transform', () => this.getTransform())
      .attr('class', 'marker-icon');
    const circleEnter = iconEnter.append('circle');
    const iconPathEnter = iconEnter.append('path');
    applyCircleProperties(circleEnter);
    applyIconPathProperties(iconPathEnter);

    this.addIconMouseOverAnimations(iconEnter);

    const iconMerge = iconEnter.merge(icon);
    const circleMerge = iconMerge.select('circle');
    const iconPathMerge = iconMerge.select('path');
    applyCircleProperties(circleMerge);
    applyIconPathProperties(iconPathMerge);

    icon.exit().remove();
  }

  addIcons(_enter, _merge) {
    const enterIconContainer = _enter.append('g').attr('class', 'marker-icon-container')
      .attr('visibility', (d) => (getOptionVal(this.options.showIcon, d) ? 'visible' : 'hidden'));
    const mergeIconContainer = _merge.select('.marker-icon-container')
      .attr('visibility', (d) => (getOptionVal(this.options.showIcon, d) ? 'visible' : 'hidden'));
    this.addIcon(enterIconContainer);
    this.addIcon(mergeIconContainer);
  }

  drawLabel(el) {
    const label = el.append('g')
      .attr('transform', () => this.getTransform())
      .attr('class', 'marker-label');

    label.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('dx', 0)
      .attr('dy', '0.5em')
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#FFF')
      .text((d) => (this.options.label === null ? d[getOptionVal(this.options.labelKey, d)] : getOptionVal(this.options.label, d)))
      .call(this.getBB);

    label.insert('rect', 'text')
      .attr('width', (d) => d.bbox.width + (this.padding * 2))
      .attr('height', (d) => d.bbox.height + (this.padding * 2))
      .attr('x', (d) => d.bbox.x - this.padding)
      .attr('y', (d) => d.bbox.y - this.padding)
      .attr('rx', 2)
      .style('fill', (d) => this.getColor(d));
    this.addLabelMouseOverAnimations(label);
  }

  updateLabel(merge) {
    merge.select('text')
      .text((d) => (this.options.label === null ? d[getOptionVal(this.options.labelKey, d)] : getOptionVal(this.options.label, d)))
      .call(this.getBB);
    merge.select('rect')
      .attr('width', (d) => d.bbox.width + (this.padding * 2))
      .attr('height', (d) => d.bbox.height + (this.padding * 2))
      .attr('x', (d) => d.bbox.x - this.padding)
      .attr('y', (d) => d.bbox.y - this.padding)
      .attr('rx', 2)
      .style('fill', (d) => this.getColor(d));
  }


  getBB(selection) {
    // eslint-disable-next-line func-names
    selection.each(function (d) {
      // eslint-disable-next-line no-param-reassign
      d.bbox = this.getBBox();
    });
  }

  getIconXPosition(d) {
    if (this.options.xPositionSpecification) {
      return this.xScale(d[this.options.xKey]) + this.options.xPositionSpecification + this.scaleBandOffset;
    }
    return this.xScale(d[this.options.xKey]) + this.scaleBandOffset;
  }

  async update(inputData, options = {}) {
    if (options) {
      this.options = { ...this.options, ...options };
    }
    if (inputData) this.data = inputData;
    let data = [];
    if (this.options.visible) data = this.data;

    this.xScale = this.context[this.options.xScaleKey];
    this.yScale = this.context[this.options.yScaleKey];
    this.scaleBandOffset = this.options.xScaleBandOffset ? this.xScale.bandwidth() / 2 : 0;

    this.eventMarker = this.elementRef
      .selectAll(`.${this.options.pathClass}`)
      .data(data.filter((d) => (d[getOptionVal(this.options.yKey, d)])));

    const markerEnter = this.eventMarker
      .enter()
      .append('g')
      .attr('transform', (d) => `translate(${this.getIconXPosition(d)},0)`)
      .attr('class', `${this.options.pathClass}`);

    const markerMerge = markerEnter.merge(this.eventMarker);
    await markerMerge.transition()
      .duration(this.options.transitionDuration)
      .attr('transform', (d) => `translate(${this.getIconXPosition(d)},0)`);

    if (this.options.hasVerticalLine) {
      markerEnter.append('line')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', (d) => (d[getOptionVal(this.options.yKey, d)] ? 0 + this.options.circleRadius + this.options.verticalOffset : this.yScale(0)))
        .attr('y2', () => this.yScale(0))
        .transition()
        .duration(this.options.transitionDuration)
        .attr('stroke', (d) => this.getColor(d))
        .attr('stroke-dasharray', this.options.strokeDash)
        .attr('fill', 'none')
        .attr('stroke-width', this.options.strokeWidth)
        .attr('opacity', this.options.opacity)
        .style('vector-effect', 'non-scaling-stroke');

      markerMerge
        .select('line')
        .attr('stroke', (d) => this.getColor(d))
        .attr('y1', (d) => (d[getOptionVal(this.options.yKey, d)] ? 0 + this.options.circleRadius + this.options.verticalOffset : this.yScale(0)))
        .attr('y2', () => this.yScale(0));
    }

    this.addIcons(markerEnter, markerMerge);

    this.addLabel(markerEnter, markerMerge);

    this.eventMarker.exit().remove();
  }

  addLabel(_enter, _merge) {
    if (this.options.showLabel === false || !this.context.width || this.context.width <= 0) {
      return;
    }

    const enterIconContainer = _enter.append('g').attr('class', 'marker-label-container')
      .attr('visibility', (d) => (getOptionVal(this.options.showLabel, d) ? 'visible' : 'hidden'));
    const mergeIconContainer = _merge.select('.marker-label-container')
      .attr('visibility', (d) => (getOptionVal(this.options.showLabel, d) ? 'visible' : 'hidden'));

    this.drawLabel(enterIconContainer);
    this.updateLabel(mergeIconContainer);
    const mapLabelPositionRangeFn = this.getMapLabelPositionRangeFn();
    mergeIconContainer.each(mapLabelPositionRangeFn);
    this.eventLabelRanges = getAnchoredOverlappingRangesRepositioned({ inputRanges: this.eventLabelRanges, rightMaxLimit: this.context.width, horizontalSpacing: 1 });
    const updateLabelPositionFn = this.getUpdateLabelPositionFn();
    enterIconContainer.each(updateLabelPositionFn);
    mergeIconContainer.each(updateLabelPositionFn);
  }

  getMapLabelPositionRangeFn() {
    this.eventLabelRanges = [];
    const vm = this;
    // eslint-disable-next-line func-names
    return function (d, i) {
      const markerG = d3.select(this).select('.marker-label');
      const markerRect = markerG.select('rect');
      const markerRectWidth = markerRect.attr('width');
      const iconPosition = vm.getIconXPosition(d);
      const rangeStart = iconPosition - (markerRectWidth / 2);
      const rangeEnd = iconPosition + (markerRectWidth / 2);
      const obj = {
        rangeStart,
        rangeEnd,
        index: i,
      };
      vm.eventLabelRanges.push(obj);
    };
  }

  getUpdateLabelPositionFn() {
    const vm = this;
    // eslint-disable-next-line func-names
    return function (d, i) {
      const markerG = d3.select(this);
      const line = markerG.select('line');
      const markerRect = markerG.select('rect');
      const markerText = markerG.select('text');
      const { relativeY, relativeX } = vm.eventLabelRanges[i];

      line.attr('y1', relativeY + vm.options.verticalOffset);
      markerRect.attr('transform', `translate(${relativeX},${relativeY + vm.options.verticalOffset})`);
      markerText.attr('transform', `translate(${relativeX},${relativeY + vm.options.verticalOffset})`);
    };
  }

  addIconMouseOverAnimations(icon) {
    if (this.options.hoverEnabled) {
      icon.on('mousemove', this.onMarkerMouseMove(this, this.context));
      icon.on('mouseout', this.onMarkerMouseLeave(this, this.context));
    }
  }

  addLabelMouseOverAnimations(label) {
    if (this.options.hoverEnabled) {
      label.on('mousemove', this.onMarkerMouseMove(this, this.context));
      label.on('mouseout', this.onMarkerMouseLeave(this, this.context));
    }
  }


  onMarkerMouseMove(vm, ctx) {
    // eslint-disable-next-line func-names
    return function (mouseEv, item) {
      if (ctx.onMarkerMouseMove) ctx.onMarkerMouseMove(mouseEv, item, this);
    };
  }


  onMarkerMouseLeave(vm, ctx) {
    // eslint-disable-next-line func-names
    return function () {
      if (ctx.onMarkerMouseLeave) ctx.onMarkerMouseLeave();
    };
  }
}
