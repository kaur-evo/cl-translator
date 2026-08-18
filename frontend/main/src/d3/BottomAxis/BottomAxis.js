import * as d3 from 'd3';
import isFunction from 'lodash/isFunction';


import BottomAxisMultilineText from './BottomAxisMultilineText';
import BottomAxisBaseClass from './BottomAxisBase';
import XZAxis from './XZAxis';

import { INNER_PADDING, ZOOM_DURATION } from '@/d3/constants';
import listToKeyMap from '@/helpers/list/listToKeyMap';
import isMoveEvent from '@/d3/helpers/isMoveEvent';
import { zonedMultiFormat, regularMultiFormat, utcMultiFormat } from '@/d3/helpers/axisTimeFormats';
import randStr from '@/helpers/text/randStr';
import { getTextWidth } from '@/helpers/d3Helpers';
import truncateText from '@/helpers/text/truncateText';
import { passContext, setContextKey } from '@/d3/helpers/contextUtils';
import getObjVal from '@/d3/helpers/getObjVal';

const BOTTOM_AXIS_DEFAULT_HEIGHT = 30;

const sideOfSquare = (diagonal) => Math.sqrt(2) * (diagonal / 2);

const LEFT_FADE_OFFSET = 7;
const RIGHT_FADE_OFFSET = 7;

const CONTEXT_KEYS = [
  'xScale',
  'colors',
  'isDark',
  'xzScale',
  'marginTop',
  'marginLeft',
  'width',
  'height',
  'bottomAxisHeight',
  'xzScaleMap',
];
export default class BottomAxis extends BottomAxisBaseClass {
  everyNthTick = 1;


  constructor(element, options, ctx) {
    super(element, options, ctx);
    this.element = element;
    this.options = options;
    this.context = ctx;
    passContext(ctx, this, CONTEXT_KEYS);
  }

  get diagonalLabelContainerSide() {
    return sideOfSquare(this.getLabelHeight()) + sideOfSquare(this.options.get('labelWidth'));
  }

  appendContainer() {
    if (!this.bottomAxisContainer) {
      this.bottomAxisClipPathId = randStr('bottomAxisClipPath');
      this.bottomAxisContainer = this.element.append('g')
        .attr('transform', `translate(${this.marginLeft},${this.marginTop})`)
        .attr('clip-path', `url(#${this.bottomAxisClipPathId})`)
        .attr('class', 'bottom-axis-container');
      this.bottomAxisDefs = this.bottomAxisContainer.append('defs');
    }
  }

  draw() {
    this.appendContainer();
    this.addBottomAxis();
  }

  getBottomAxisHeight() {
    if (this.options.get('diagonalLabels')) {
      return this.diagonalLabelContainerSide + this.options.get('labelVerticalOffset');
    }
    if (!this.options.get('diagonalLabels') && this.options.get('xzAxisDiagonalLabels')) {
      return BOTTOM_AXIS_DEFAULT_HEIGHT;
    }
    return BOTTOM_AXIS_DEFAULT_HEIGHT + this.options.get('secondaryLabelsHeight');
  }

  getXAxisData() {
    const dataKey = this.options.get('dataKey');
    if (dataKey) return this.context[dataKey];
    const data = this.options.get('data');
    if (data?.length) return data;
    return null;
  }

  getLabelString(d) {
    if (typeof d === 'string' || typeof d === 'number') {
      return d;
    }
    const labeFunc = this.options.get('labelFunc');
    if (labeFunc !== null && isFunction(labeFunc)) {
      return labeFunc(d);
    }
    const labelKey = this.options.get('labelKey');
    if (d?.[labelKey] !== undefined) return d[labelKey];
    return '';
  }

  truncateBottomAxisLabelText(d) {
    const labelString = this.getLabelString(d);
    const xScale = this[this.options.get('xScaleKey')];
    if (labelString && labelString.length < 4) return labelString;
    const textLength = getTextWidth(labelString, this.options.get('fontSize')) / this.everyNthTick;
    let widthPerBar;
    if (xScale.bandwidth) {
      const spacing = xScale.bandwidth() * INNER_PADDING;
      widthPerBar = xScale.bandwidth() - spacing;
    } else {
      return labelString;
    }

    if (textLength > widthPerBar && labelString) {
      const characters = labelString.length;
      const pxPerCharacter = textLength / characters;
      const characterLimit = Math.floor(widthPerBar / pxPerCharacter) - 1; // -1 is space for ellipsis
      return truncateText(labelString, characterLimit);
    }
    return labelString;
  }

  getRightClipOffset() {
    return this.options.get('diagonalLabels') || this.options.get('xzAxisDiagonalLabels') ? this.diagonalLabelContainerSide / 2 : 0;
  }

  addBottomAxisMask() {
    this.bottomAxisDefs.selectAll('.bottomAxisClipPath').remove();
    const rightClipOffset = this.getRightClipOffset();
    const clipPath = this.bottomAxisDefs
      .append('clipPath')
      .attr('class', 'bottomAxisClipPath')
      .attr('id', this.bottomAxisClipPathId);
    clipPath.append('rect')
      .attr('x', 0)
      .attr('width', this.width)
      .attr('height', this.height);
    // fade clip
    clipPath.append('rect')
      .attr('x', -LEFT_FADE_OFFSET)
      .attr('y', this.height)
      .attr('width', this.width + rightClipOffset + RIGHT_FADE_OFFSET)
      .attr('height', this.bottomAxisHeight);
  }

  addBottomAxisGradient() {
    const fadeWidth = 14;
    const rightClipOffset = this.getRightClipOffset();

    const vm = this;
    function createOverflowGradient({ id, x, direction = 'left' }) {
      vm.bottomAxisDefs.selectAll(`.${id}`).remove();
      vm.bottomAxisContainer.selectAll(`.${id}`).remove();
      const isLeft = direction === 'left';
      const gradient = vm.bottomAxisDefs.append('linearGradient')
        .attr('id', id)
        .attr('class', id);
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', vm.options.get('gradientColor') || (vm.isDark ? vm.colors.black : vm.colors.white))
        .attr('stop-opacity', isLeft ? 1 : 0);
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', vm.options.get('gradientColor') || (vm.isDark ? vm.colors.black : vm.colors.white))
        .attr('stop-opacity', isLeft ? 0 : 1);
      vm.bottomAxisContainer
        .append('rect')
        .attr('class', id)
        .attr('x', x)
        .attr('y', vm.height - vm.options.get('secondaryLabelsHeight'))
        .attr('width', fadeWidth)
        .attr('height', vm.bottomAxisHeight)
        .style('fill', `url(#${id})`);
    }
    createOverflowGradient({
      id: 'leftFadient',
      direction: 'left',
      x: -LEFT_FADE_OFFSET,
    });
    createOverflowGradient({
      id: 'rightFadient',
      direction: 'right',
      x: vm.width + rightClipOffset - RIGHT_FADE_OFFSET,
    });
  }

  addBottomAxis() {
    // if (ticks amount * (font size + spacing) gets larger than graph width, display only every second tick;
    // if using words or large numbers on bottom axis, should probably calculate longest label width or smth

    // add the x Axis
    this.xAxis = this.bottomAxisContainer.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${this.height})`)
      .style('font-size', this.options.get('fontSize'))
      .style('font-family', 'Open Sans, sans-serif')
      .attr('line-height', '50px')
      .style('color', this.isDark ? this.colors.white : this.colors.black);

    this.update();
  }

  formatTicks(d, zoomEvent) {
    const dataObj = getObjVal(d, this.xAxisDataMap);
    if (zoomEvent) {
      if (dataObj) {
        return this.truncateBottomAxisLabelText(dataObj);
      }
      return d;
    }
    return this.truncateBottomAxisLabelText(dataObj || d);
  }

  getScale(zoomEvent) {
    let scale;
    if (zoomEvent) {
      if (this.options.get('scaleType') === 'scaleTime') {
        scale = zoomEvent.transform.rescaleX(this.xScale);
      } else if (this.options.get('scaleType') === 'scaleBand') {
        scale = this.xScale.range([0, this.width].map((d) => zoomEvent.transform.applyX(d)));
      } else {
        scale = this.xScale;
      }
    } else {
      scale = this.xScale;
    }
    return scale;
  }

  applyTickFormat(axis, zoomEvent) {
    axis.tickSizeInner(this.options.get('tickSizeInner'))
      .tickSizeOuter(0);
    if (this.options.get('hideTickLabels')) {
      axis.tickFormat(() => '');
    } else if (this.options.get('tickFormat') && isFunction(this.options.get('tickFormat'))) {
      axis.tickFormat(this.options.get('tickFormat'));
    } else if (this.options.get('scaleType') === 'scaleTime') {
      const tickCountByChartWidth = Math.round(this.width / 100);
      axis.ticks(tickCountByChartWidth);
      axis.tickFormat((d) => {
        if (this.options.get('useRegularFormat')) {
          if (this.options.get('timezone')) {
            return zonedMultiFormat(d, this.options.get('timezone'));
          }
          return regularMultiFormat(d);
        }
        return utcMultiFormat(d);
      });
    } else {
      axis.tickFormat((d) => this.formatTicks(d, zoomEvent));
    }
  }

  bottomAxisGenerator(scale, zoomEvent) {
    const vm = this;
    // eslint-disable-next-line func-names
    return function (v) {
      const axis = d3.axisBottom(scale);
      vm.applyTickFormat(axis, zoomEvent);
      return axis(v);
    };
  }

  updateZoom(transform, zoomEvent) {
    if (!transform) throw new Error('no zoom event in zoom update');
    const vm = this;
    const isDragEv = isMoveEvent(zoomEvent);
    const transitionDur = isDragEv ? 0 : ZOOM_DURATION;
    const x = transform?.x || 0;
    const y = vm.height - vm.options.get('secondaryLabelsHeight');
    this.xAxis
      .transition()
      .duration(transitionDur)
      .attr('transform', `translate(${x}, ${y}) `);
    setContextKey(this.context, 'bottomAxisHeight', vm.getBottomAxisHeight());

    this.addBottomAxisMask();
    this.addBottomAxisGradient();
  }

  precalculate(options = {}) {
    this.options.update(options);
    passContext(this.context, this, CONTEXT_KEYS);
    setContextKey(this.context, 'bottomAxisHeight', this.getBottomAxisHeight());
  }

  applySecondarylabels(selection, d) {
    const secondaryLabelSelection = selection.select('.secondary-label');
    const dataObj = getObjVal(d, this.xAxisDataMap);
    if (dataObj?.secondaryLabel && !secondaryLabelSelection.size()) {
      selection.append('text')
        .text(dataObj.secondaryLabel)
        .attr('class', 'secondary-label')
        // eslint-disable-next-line no-magic-numbers
        .attr('y', 40)
        .attr('x', 0)
        .attr('font-size', this.options.get('fontSize'))
        .attr('font-family', 'Open Sans, sans-serif')
        .attr('fill', this.isDark ? this.colors.white : this.colors.black);
    }
  }

  onEachTick(isDragEv, widthPerBar) {
    const vm = this;
    const getLabelString = this.getLabelString.bind(this);
    // eslint-disable-next-line func-names
    return function (d, i) {
      const selection = d3.select(this);
      if (vm.options.get('multiLineLabelsEnabled') && !isDragEv) {
        vm.axisMultilineText = new BottomAxisMultilineText(selection, vm.options.clone().update({
          labelHeight: vm.getLabelHeight(),
          widthPerBar,
          dataMap: vm.xAxisDataMap,
          textFn: getLabelString,
          isSecondRow: true,
          diagonalLabelWidth: vm.options.get('labelWidth'),
          everyNthTick: vm.everyNthTick,
        }));
        vm.axisMultilineText.replaceTickTextWithMultiline();
      }
      vm.setTickDisplay(selection, i);

      vm.applyTickLineStyles(selection, i, vm.options.get('xzAxisEnabled') ? vm.options.get('secondaryLabelsHeight') : 0);
      vm.applyTickTextAttr(selection, i);

      vm.applySecondarylabels(selection, d);
      if (vm.xzScaleMap) {
        const scale = vm.xzScaleMap[d];
        new XZAxis(selection, vm.options, vm.context).apply(selection, isDragEv, scale);
      }
    };
  }

  renderBottomAxis(zoomEvent) {
    const isDragEv = isMoveEvent(zoomEvent);

    const updatedAxis = this.xAxis
      .attr('transform', `translate(0, ${this.height - this.options.get('secondaryLabelsHeight')})`)
      .call(this.bottomAxisGenerator(this.getScale(this.latestZoomEv), this.latestZoomEv));
    let widthPerBar = 0;
    if (this.options.get('scaleType') === 'scaleBand') {
      widthPerBar = Math.round(this.xScale.bandwidth());
    }

    updatedAxis.selectAll('g.tick').each(this.onEachTick(isDragEv, widthPerBar));
  }

  update(zoomEvent, options) {
    this.options.update(options);
    passContext(this.context, this, CONTEXT_KEYS);
    setContextKey(this.context, 'bottomAxisHeight', this.getBottomAxisHeight());
    this.addBottomAxisMask();
    this.addBottomAxisGradient();
    this.bottomAxisContainer.attr('transform', `translate(${this.marginLeft},${this.marginTop})`);
    const vm = this;
    if (zoomEvent) {
      vm.latestZoomEv = zoomEvent;
    }

    this.xAxisData = this.getXAxisData();
    this.setEveryNthTick();
    if (this.options.get('xzAxisDataMap')) {
      this.xzAxisDataMap = this.options.get('xzAxisDataMap');
    }
    if (this.options.get('xAxisDataMap')) {
      // where possible prefer calculating xAxisDataMap on data change and outside of this class
      this.xAxisDataMap = this.options.get('xAxisDataMap');
    } else if (this.xAxisData.length && this.options.get('axisValueKey') && !zoomEvent) {
      const [firstItem] = this.xAxisData;
      if (typeof firstItem === 'object') {
        this.xAxisDataMap = listToKeyMap(this.xAxisData, this.options.get('axisValueKey'));
      }
    }

    return this.renderBottomAxis(this.element, zoomEvent);
  }
}
