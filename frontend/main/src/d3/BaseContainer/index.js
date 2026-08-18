import * as d3 from 'd3';

import { INNER_PADDING } from '../constants';

import colorConstants from '@/constants/colorConstants';
import { hideTooltip } from '@/helpers/d3Helpers';

d3.formatDefaultLocale({
  decimal: '.',
  thousands: ' ',
  grouping: [3],
  currency: ['$', ''],
});
export default class BaseContainer {
  constructor(opts) {
    Object.entries(opts).forEach(([k, v]) => {
      this[k] = v;
    });
    this.element = opts.element;
    this.isDark = opts.isDark || false;
    this.xScalePadding = opts.xScalePadding || INNER_PADDING;
  }

  isDark = false;

  xScale = d3.scaleBand();

  xzScale = d3.scaleBand();

  yScale = d3.scaleLinear();

  bottomAxisHeight = 0;

  xzScaleMap = null;

  xzMinBandwidth = null;

  get colors() {
    return this.isDark ? colorConstants.dark : colorConstants.light;
  }

  get containerWidth() {
    return this?.element?.clientWidth ?? 0;
  }

  get containerHeight() {
    return this?.element?.clientHeight ?? 0;
  }

  get extraLeftMargin() {
    return this.leftAxisWidth ?? 0;
  }

  get extraRightMargin() {
    return this.rightAxisWidth ?? 0;
  }

  get marginLeft() {
    return (this?.margin?.left ?? 0) + this.extraLeftMargin;
  }

  get marginRight() {
    return (this?.margin?.right ?? 0) + this.extraRightMargin;
  }

  get marginTop() {
    return this?.margin?.top ?? 0;
  }

  get extraBottomMargin() {
    return this.bottomAxisHeight;
  }

  get marginBottom() {
    return (this?.margin?.bottom ?? 0) + this.extraBottomMargin;
  }

  get width() {
    const width = this.containerWidth - this.marginLeft - this.marginRight;
    return width < 0 ? 0 : width;
  }

  get height() {
    const height = this.containerHeight - this.marginTop - this.marginBottom;
    return height < 0 ? 0 : height;
  }

  defaultXDomain = [0, 0];

  get xDomain() {
    return this.defaultXDomain;
  }

  defaultXZDomain = [0, 0];

  get xzDomain() {
    return this.defaultXZDomain;
  }

  defaultYDomain = [0, 0];

  get yDomain() {
    return this.defaultYDomain;
  }

  get xRange() {
    return [0, this.width];
  }

  get xzRange() {
    return [0, this.xScale?.bandwidth?.() || this.width];
  }

  get yRange() {
    return [this.height, 0];
  }

  updateXScaleRange() {
    this.xScale.range(this.xRange);
  }

  updateXZScaleRange() {
    this.xzScale.range(this.xzRange);
  }

  updateYScaleRange() {
    this.yScale.range(this.yRange);
  }

  updateXScaleDomain() {
    this.xScale.domain(this.xDomain);
  }

  updateXZScaleDomain() {
    this.xzScale.domain(this.xzDomain);
  }

  updateYScaleDomain() {
    this.yScale.domain(this.yDomain);
  }

  updateScaleRanges() {
    this.updateXScaleRange();
    this.updateXZScaleRange();
    this.updateYScaleRange();
  }

  updateScaleDomains() {
    this.updateXScaleDomain();
    this.updateXZScaleDomain();
    this.updateYScaleDomain();
  }

  setXScale() {
    this.xScale = d3.scaleBand()
      .padding(this.xScalePadding);
    this.updateXScaleRange();
    this.updateXScaleDomain();
  }

  setXZScale() {
    this.xzScale = d3.scaleBand()
      .padding(this.xScalePadding);
    this.updateXZScaleRange();
    this.updateXZScaleDomain();
  }

  setYScale() {
    this.yScale = d3.scaleLinear();
    this.updateYScaleRange();
    this.updateYScaleDomain();
  }

  setScales() {
    this.setXScale();
    this.setXZScale();
    this.setYScale();
  }

  drawSVGContainer() {
    d3.select(this.element).selectAll('svg').remove();

    // the default is 300×150px and if element is smaller, it makes it overflow with default size
    this.svg = d3.select(this.element).append('svg').attr('height', 0).attr('width', 0);

    this.updateWindow();
    this.verticalAxes = this.svg.append('g')
      .attr('class', 'vertical-axes');
    this.bottomAxis = this.svg.append('g')
      .attr('class', 'bottom-axis');

    this.drawPlot();
  }

  updateWindow() {
    this.svg.attr('width', this.containerWidth);
    this.svg.attr('height', this.containerHeight);
    this.svg.attr('viewBox', [0, 0, this.containerWidth, this.containerHeight]);
    this.svg.style('display', 'block');
  }

  drawPlot() {
    this.svg.selectAll('.graph-plot').remove();
    this.plot = this.svg.append('g')
      .attr('transform', `translate(${this.marginLeft},${this.marginTop})`)
      .attr('clip-path', `url(#clip${this.element?.id})`)
      .attr('class', 'graph-plot');

    this.plotDefs = this.plot.append('defs')
      .append('clipPath')
      .attr('id', `clip${this.element?.id}`)
      .append('rect')
      .attr('width', this.width)
      .attr('height', this.height);
  }

  updatePlot() {
    this.plot.attr('transform', `translate(${this.marginLeft},${this.marginTop})`);
    this.plotDefs
      .attr('width', this.width)
      .attr('height', this.height);
  }

  destroy() {
    hideTooltip();
  }
}
