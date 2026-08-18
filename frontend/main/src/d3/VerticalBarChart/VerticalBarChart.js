/* eslint-disable no-magic-numbers */

import * as d3 from 'd3';
import { isNumber } from 'lodash';

import { ZOOM_DURATION, TRANSITION_DURATION, INNER_PADDING } from '@/d3/constants';
import {
  roundedRect, getTextWidth,
} from '@/helpers/d3Helpers';
import isMoveEvent from '@/d3/helpers/isMoveEvent';
import getTextColorFromBrightness from '@/helpers/color/getTextColorFromBrightness';

export default class VerticalBarChart {
  options = {
    xKey: 'measure',
    yKey: 'value',
    xScaleKey: 'xScale',
    yScaleKey: 'yScale',
    hoverEnabled: true,
    clickEnabled: false,
    topLabelKey: '',
    transitionDuration: TRANSITION_DURATION,
    barMaxWidth: 0,
    visible: true,
    colorScale: () => '',
    isGrouped: false,
    isStacked: false,
    subGroupCount: 0,
    xzDomainKey: null,
    dimensionCount: 3,
    fontSize: 12,
    subGroupKey: 'stackList',
    maskBgColor: 'white',
    onMouseMove: null,
    onMouseOut: null,
    xzScaleKey: 'xzScale',
    secondaryXZDomain: null,
    isRounded: false,
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
    this.maskId = `verticalBarHoverMask-${ctx.element?.id || ''}`;
    this.maskOverlayId = `verticalBarMaskOverlay-${ctx.element?.id || ''}`;
    this.maskRectId = `verticalBarHoverMaskRect-${ctx.element?.id || ''}`;
  }

  async draw(targetEl) {
    this.elementRef = targetEl;
    this.createBarHoverMask();
    this.update(this.data);
    const isGroupedOrStacked = this.options.isGrouped || this.options.isStacked;
    if (this.options.hoverEnabled && !isGroupedOrStacked) {
      this.addLegacyMouseOverAnimations();
    }
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
    this.height = this.context.height;
    this.width = this.context.width;
    this.xScale = this.context[this.options.xScaleKey];
    this.yScale = this.context[this.options.yScaleKey];
    if (this.options.isGrouped || this.options.isStacked) {
      this.onBarUpdate(this.elementRef, 1, data);
    } else {
      this.onLegacyBarUpdate(data);
    }
    this.resetBarHoverMask();
  }

  createBarHoverMask() {
    this.barHoverMask = this.elementRef.append('mask')
      .attr('id', this.maskId);

    this.barHoverMask.append('rect')
      .attr('id', this.maskOverlayId);

    this.barHoverMask.append('rect')
      .attr('id', this.maskRectId);
  }

  resetBarHoverMask() {
    if (!this.barHoverMask) return;
    this.barHoverMask.select(`#${this.maskOverlayId}`)
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', this.width)
      .attr('height', this.height)
      .style('fill', this.options.maskBgColor)
      .style('opacity', 0.5);

    this.barHoverMask.select(`#${this.maskRectId}`)
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', this.width)
      .attr('height', this.height)
      .style('fill', this.options.maskBgColor)
      .style('opacity', 1);
  }

  enableBarHoverMask(targetElement, d) {
    if (!this.barHoverMask) return;

    let x;
    let y;
    let width;
    let height;

    if (d && (this.options.isStacked || this.options.isGrouped)) {
      const parentData = d.data || d;
      const { xKey } = this.options;
      x = this.xScale(parentData[xKey]);
      y = 0;
      width = this.xScale.bandwidth();
      height = this.height;
    } else {
      x = targetElement.attr('x');
      y = targetElement.attr('y');
      width = targetElement.attr('width');
      height = targetElement.attr('height');
    }

    this.barHoverMask.select(`#${this.maskRectId}`)
      .attr('x', x)
      .attr('y', y)
      .attr('width', width)
      .attr('height', height);
  }

  getRegularBarWidth = (level) => {
    if (this.options.barMaxWidth) {
      return Math.min(this.xScale.bandwidth(), this.getBarMaxWidth(level)) / this.xScaleFactor;
    }
    return this.xScale.bandwidth();
  };

  getRegularBarXPos = (d, level) => {
    const data = this.options.isStacked || this.options.isGrouped ? d.data : d;
    if (data === undefined) return 0;
    let ret;
    if (this.options.barMaxWidth && this.xScale.bandwidth() > this.getBarMaxWidth(level)) {
      ret = (this.xScale(data[this.options.xKey]) + ((this.xScale.bandwidth() - this.getBarMaxWidth(level)) / 2)) / this.xScaleFactor;
    } else {
      ret = this.xScale(data[this.options.xKey]) / this.xScaleFactor;
    }
    return ret;
  };

  getBarMaxWidth(level) {
    if (isNumber(this.options.barMaxWidth)) {
      return this.options.barMaxWidth;
    }
    if (this.options.barMaxWidth[level]) {
      return this.options.barMaxWidth[level];
    }
    throw new Error('could not resolve barMaxWidth on level', level);
  }

  getGroupedBarWidth = (d, level) => {
    let ret;
    const xzScaleBandwidth = this.context.xzScaleMap[d.data.groupingKey].bandwidth();
    if (this.options.barMaxWidth) {
      ret = Math.min(xzScaleBandwidth, this.getBarMaxWidth(level));
    } else {
      ret = xzScaleBandwidth;
    }
    if (this.options.secondaryXZDomain) {
      const xz2Scale = d3.scaleBand().domain(this.options.secondaryXZDomain).range([0, xzScaleBandwidth]).padding(INNER_PADDING);
      ret = xz2Scale.bandwidth();
    }

    return ret;
  };

  getGroupBy = (d) => {
    const xzScale = this.context.xzScaleMap[d.data.groupingKey];
    let groupBy = null;
    if (xzScale.domain()?.length) {
      groupBy = d.data[this.options.xzDomainKey];
      const isArray = Array.isArray(groupBy);
      if (isArray && groupBy.length === 1) {
        [groupBy] = groupBy;
      } else if (isArray && groupBy.length !== 1) {
        throw new Error('incorrect groupBy value', groupBy);
      }
    }
    return groupBy;
  };

  getGroupedBarXPos = (d, i, level) => {
    const xzScale = this.context.xzScaleMap[d.data.groupingKey];
    const groupBy = this.getGroupBy(d);
    let xzOffset = 0;
    if (groupBy !== null && groupBy !== '') { // if bar has no data, so no offset to calculate
      const offset = xzScale(groupBy) + ((xzScale.bandwidth() - this.getBarMaxWidth(level)) / 2);
      if (!Number.isNaN(offset)) {
        xzOffset = offset;
      }
    }

    let ret = this.getRegularBarXPos(d, level - 1) + xzOffset;
    if (this.options.secondaryXZDomain) {
      const xz2Scale = d3.scaleBand().domain(this.options.secondaryXZDomain).range([ret, ret + xzScale.bandwidth()]).padding(INNER_PADDING);
      const xz2ScaleRet = xz2Scale(d.data['%groupId']);
      if (xz2ScaleRet !== undefined) {
        ret = xz2ScaleRet;
      }
    }
    if (Number.isNaN(ret)) {
      throw new Error('getGroupedBarXPos returned NaN');
    }
    return ret;
  };

  getBarRectXPos = (level) => (d, i) => (this.options.isGrouped ? this.getGroupedBarXPos(d, i, level) : this.getRegularBarXPos(d, level));

  getBarRectYPos = ([, end]) => this.yScale(end);

  getBarRectWidth = (level) => (d) => (this.options.isGrouped ? this.getGroupedBarWidth(d, level) : this.getRegularBarWidth(level));

  getBarRectHeight = ([start, end]) => this.yScale(start) - this.yScale(end);

  getBarRectFill = (d, i) => d.color || (d?.data?.color) || this.colorScale(i);

  getBarCornerRadius = (d, i, nodes) => {
    if (!this.options.isRounded) return 0;

    let lastVisibleIndex = -1;
    for (let j = nodes.length - 1; j >= 0; j--) {
      const siblingData = nodes[j].__data__;
      if (this.getBarRectHeight(siblingData) > 0) {
        lastVisibleIndex = j;
        break;
      }
    }

    if (i === lastVisibleIndex) {
      return (this.xScale.bandwidth() / this.xScaleFactor) * 0.1;
    }

    return 0;
  };

  applyBarRectAttr = ({ rect, isEnter, level }) => {
    const ret = rect
      .attr('mask', `url(#${this.maskId})`);
    if (isEnter) {
      ret.attr('d', (d, i, nodes) => roundedRect({
        x: this.getBarRectXPos(level)(d, i),
        y: this.yScale(0),
        width: this.getBarRectWidth(level)(d),
        height: 0,
        radius: this.getBarCornerRadius(d, i, nodes),
        topLeft: true,
        topRight: true,
      }))
        .attr('fill', this.getBarRectFill);
    }

    ret.call((ent) => {
      ent.transition()
        .duration(this.options.transitionDuration)
        .attr('d', (d, i, nodes) => roundedRect({
          x: this.getBarRectXPos(level)(d, i),
          y: this.getBarRectYPos(d),
          width: this.getBarRectWidth(level)(d),
          height: this.getBarRectHeight(d),
          radius: this.getBarCornerRadius(d, i, nodes),
          topLeft: true,
          topRight: true,
        }))
        .attr('fill', this.getBarRectFill);
    });
  };

  getBarLabelFontSize = () => this.options.fontSize / (this.xScaleFactor ** 0.3);

  getBarLabelXPos = (level) => (d, i) => {
    const ret = (this.getBarRectXPos(level)(d, i) + (this.getBarRectWidth(level)(d) / 2)) * this.xScaleFactor;
    return ret;
  };

  getBarLabelYPos = ([start, end]) => (this.yScale(end) + ((this.yScale(start) - this.yScale(end)) / 2) + (this.getBarLabelFontSize() / 3));

  getBarLabelFill = (d, i) => getTextColorFromBrightness(d.color || (d?.data?.color) || this.colorScale(i));

  getBarLabelText = (level) => (d, i) => {
    const [start, end] = d;
    let text = '';
    if (this.options.labelKey && Array.isArray(this.options.labelKey)) {
      text = d.data[this.options.labelKey[i]];
    } else if (this.options.labelKey !== undefined) {
      text = d.data[this.options.labelKey];
    }
    const textWidth = getTextWidth(text, this.getBarLabelFontSize(), 'Open Sans');
    const textHeight = this.getBarLabelFontSize() * 1.5;
    const barWidth = this.getBarRectWidth(level)(d);
    if (textWidth > barWidth) return '';
    const rectHeight = this.yScale(start) - this.yScale(end);
    if (textHeight > rectHeight) return '';
    return text;
  };

  applyBarLabelAttr = (text, level) => text
    .attr('font-size', this.getBarLabelFontSize)
    .attr('text-anchor', 'middle')
    .attr('x', this.getBarLabelXPos(level))
    .attr('fill', this.getBarLabelFill)
    .text(this.getBarLabelText(level))
    .attr('y', this.yScale(0))
    .call((ent) => {
      ent.transition()
        .duration(this.options.transitionDuration)
        .attr('y', (d, i) => this.getBarLabelYPos(d, i));
    });

  onBarEnter(enter, level) {
    const wrapperG = enter.append('g'); // for some reason extra g wrapper is needed for animations to behave correctly
    const enterG = wrapperG.append('g').attr('class', `bar-group-lvl-${level}`);
    if (level >= this.options.dimensionCount) {
      const rect = enterG.append('path');
      this.applyBarLabelAttr(enterG.append('text'), level);
      this.applyBarRectAttr({ rect, isEnter: true, level });
      rect.on('mousemove', this.onBarMouseMove(this, this.context));
      rect.on('mouseout', this.onBarMouseOut(this, this.context));
    } else {
      enterG.append('path');
      this.onBarUpdate(enterG, level + 1);
    }
  }

  onBarMerge(update, level) {
    if (level >= this.options.dimensionCount) {
      if (Array.from(update.select('text')).length === 0) {
        this.applyBarLabelAttr(update.append('text'), level);
      } else {
        this.applyBarLabelAttr(update.select('text'), level);
      }
      const rect = update.select('path');
      this.applyBarRectAttr({ rect, isEnter: false, level });
    } else {
      this.onBarUpdate(update, level + 1);
    }
  }

  onBarUpdate(childRects, level = 1, _data = null) {
    let data = (d) => d?.data?.[this.options.subGroupKey] || d?.[this.options.subGroupKey] || [];
    if (level === 1) {
      data = _data;
    }

    childRects.selectAll(`.bar-group-lvl-${level}`)
      .data(data)
      .join(
        (enter) => {
          this.onBarEnter(enter, level);
        },
        (update) => {
          this.onBarMerge(update, level);
        },
        (exit) => exit.remove(),
      );
  }

  onBarMouseMove() {
    const vm = this;
    // eslint-disable-next-line func-names
    return function (ev, d) {
      const element = d3.select(this);
      vm.enableBarHoverMask(element, d);
      if (vm.options.onMouseMove) {
        const parentDatapoint = d3.select(this.parentNode?.parentNode?.parentNode)?.datum();
        vm.options.onMouseMove(ev, d, parentDatapoint);
      }
    };
  }

  onBarMouseOut() {
    const vm = this;
    // eslint-disable-next-line func-names
    return function (ev, d) {
      vm.resetBarHoverMask();
      if (vm.options.onMouseOut) {
        vm.options.onMouseOut(ev, d);
      }
    };
  }

  onLegacyBarUpdate(data) {
    this.bars = this.elementRef
      .selectAll('.primary-bar-group')
      .data(data)
      .join(
        (enter) => {
          this.barEnter = enter.append('g')
            .attr('class', 'primary-wrapper');
          this.barEnter.append('g')
            .attr('class', 'primary-bar-group');
          this.onLegacyBarEnter(this.barEnter.select('.primary-bar-group'));
          return this.barEnter;
        },
        (update) => {
          this.onLegacyBarMerge(update);
          return update;
        },
        (exit) => exit.remove(),
      );
  }

  onLegacyBarEnter(updateRef) {
    updateRef.append('path')
      .attr('d', (d) => roundedRect({
        x: this.getRegularBarXPos(d, 0),
        y: this.yScale(this.options.yVal && !d[this.options.yKey] ? this.options.yVal : d[this.options.yKey]),
        width: this.getRegularBarWidth(0),
        height: this.calcBarHeight(d),
        radius: this.calcBarCornerRadius(d),
        topLeft: true,
        topRight: true,
      }))
      .attr('fill', (d, i) => d.color || this.colorScale(i))
      .attr('transform', `translate(0, ${this.height}) scale(1, 0)`)
      .call((ent) => {
        ent.transition()
          .duration(this.options.transitionDuration).attr('transform', 'scale(1, 1)');
      });
  }

  onLegacyBarMerge(updateRef) {
    updateRef.select('path')
      .transition()
      .duration(this.options.transitionDuration)
      .attr('d', (d) => roundedRect({
        x: this.xScale(d[this.options.xKey]) / this.xScaleFactor,
        y: this.yScale(this.options.yVal && !d[this.options.yKey] ? this.options.yVal : d[this.options.yKey]),
        width: this.xScale.bandwidth() / this.xScaleFactor,
        height: this.calcBarHeight(d),
        radius: this.calcBarCornerRadius(d),
        topLeft: true,
        topRight: true,
      }))
      .attr('fill', (d, i) => d.color || this.colorScale(i))
      .attr('transform', 'scale(1, 1)');
  }

  get extraVerticalSpacing() {
    return (this.options?.additionalMargins?.top || 0) + (this.options?.additionalMargins?.bottom || 0);
  }

  calcBarCornerRadius(d) {
    if (this.options.barCornerRadius && !d.isDot) {
      return this.options.barCornerRadius;
    }
    const radius = (this.xScale.bandwidth() / this.xScaleFactor) * 0.1;
    return Math.min(radius, this.calcBarHeight(d)); // avoid radius being larger than bar height
  }

  calcBarHeight(d) {
    if (d[this.options.yKey]) {
      return this.height - this.yScale(d[this.options.yKey]) - this.extraVerticalSpacing;
    }
    if (this.options.yVal && !d[this.options.extraConditionKey]) {
      return this.height - this.yScale(this.options.yVal) - this.extraVerticalSpacing;
    }
    return 0;
  }


  onLegacyBarMouseMove(vm, ctx) {
    // eslint-disable-next-line func-names
    return function (mouseEv, item) {
      if (!vm.options.barWithoutActions || (vm.options.barWithoutActions && item.type !== vm.options.barWithoutActions)) {
        d3.select(this)
          .classed('active', true)
          .attr('fill', item.activeColor || item.color);
        // eslint-disable-next-line func-names
        vm.barEnter.filter(function () {
          return !this.classList.contains('active');
        }).transition()
          .duration(100)
          .attr('opacity', (a, j) => (j === item - 1 ? 1 : 0.4));
        ctx.onBarMouseMove(mouseEv, item, this);
      }
    };
  }


  onLegacyBarMouseLeave(vm, ctx) {
    // eslint-disable-next-line func-names
    return function () {
      vm.barEnter
        .transition()
        .duration(100)
        .attr('opacity', '1')
        .attr('fill', (d, i) => d.color || this.colorScale(i));
      d3.select(this)
        .classed('active', false);
      ctx.onBarMouseLeave();
    };
  }


  onBarClick(vm, ctx) {
    // eslint-disable-next-line func-names
    return function () {
      const [barData] = d3.select(this).data();
      ctx.onBarClick(barData);
    };
  }

  addLegacyMouseOverAnimations() {
    const ctx = this.context;
    this.barEnter.on('mousemove', this.onLegacyBarMouseMove(this, ctx));
    this.barEnter.on('mouseout', this.onLegacyBarMouseLeave(this, ctx));
  }

  addMouseClickEvent() {
    const ctx = this.context;
    this.barEnter.on('click', this.onBarClick(this, ctx));
  }
}
