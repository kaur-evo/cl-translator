import * as d3 from 'd3';
import { DateTime } from 'luxon';
import tinycolor from 'tinycolor2';
import { mdiPencil, mdiPlus } from '@mdi/js';

import rgbaToHexOverWhite from '@/helpers/color/rgbaToHexOverWhite';
import vIconRawTemplate from '@/helpers/html/vIconRawTemplate';
import colorConstants from '@/constants/colorConstants';
import {
  showTooltip, hideTooltip, getTextWidth,
} from '@/helpers/d3Helpers';
import truncateText from '@/helpers/text/truncateText';
function getRGBColor(i) {
  const SIXTEEN_BIT_COLORS = 65536;
  const CHANNEL_DEPTH = 256;
  const RED = i % CHANNEL_DEPTH;
  const GREEN = Math.floor(i / CHANNEL_DEPTH) % CHANNEL_DEPTH;
  const BLUE = Math.floor(i / SIXTEEN_BIT_COLORS) % CHANNEL_DEPTH;
  return `${RED},${GREEN},${BLUE}`;
}

function drawCanvasRect(ctx, x, y, w, h, color) {
  // eslint-disable-next-line no-param-reassign
  ctx.fillStyle = color || colorConstants.dark.error;
  ctx.fillRect(x, y, w, h);
}

export default class TimelineRow {
  constructor(opts) {
    this.tooltipHTMLFunc = opts.tooltipHTMLFunc;
    this.element = opts.element;

    this.xScale = opts.xScale;
    this.zoneId = opts.zoneId;
    this.solidGridInterval = opts.solidGridInterval;
    this.dashGridInterval = opts.dashGridInterval;
    this.data = { ...opts.data };
    this.colorsDataMap = {};
    this.dpi = window.devicePixelRatio;
    this.rowHeight = 40;
    this.marginTop = 8;
    this.sliceLabelMarginY = 13;
    this.fontSize = 14;

    this.stationId = opts.stationId;
    this.isTouchDevice = 'ontouchstart' in window;
    this.highlightClickListener = null;
  }
  init({ data, xScale, zoneId, solidGridInterval, dashGridInterval } = {}) {
    if (data) this.data = { ...data };
    if (xScale) this.xScale = xScale;
    if (zoneId) this.zoneId = zoneId;
    if (solidGridInterval) this.solidGridInterval = solidGridInterval;
    if (dashGridInterval) this.dashGridInterval = dashGridInterval;
    d3.select(this.element).selectAll('svg').remove();
    d3.select(this.element).selectAll('canvas').remove();
    this.data.timeline = this.data.timeline.map((slice) => {
      const sliceX = this.calcSliceX(slice.startTimeISO);
      const sliceWidth = this.calcSliceWidth(slice, sliceX);
      return {
        ...slice,
        sliceWidth,
        sliceX,
      };
    });
    hideTooltip();
    this.draw();
    return this;
  }

  calcSliceWidth(d, sliceX) {
    const newEndTime = DateTime.fromISO(d.endTimeISO).setZone(this.zoneId).setZone('local', { keepLocalTime: true });
    const sliceX2 = Math.max(this.xScale(newEndTime), 0);
    return sliceX2 - sliceX;
  }

  calcSliceX(time) {
    const newTime = DateTime.fromISO(time).setZone(this.zoneId).setZone('local', { keepLocalTime: true });
    return Math.max(this.xScale(newTime), 0);
  }

  calcSliceText(d) {
    const sliceLabelFontFamily = 'Open Sans, sans-serif';
    const { sliceWidth } = d;
    if (d.shiftName) {
      const labelWidth = getTextWidth(d.shiftName, this.fontSize, sliceLabelFontFamily);
      const sliceWidthWithSpacing = (sliceWidth - (2 * this.sliceLabelMarginY));
      if (labelWidth < sliceWidthWithSpacing) {
        return d.shiftName;
      }
      const maxLettersFitting = Math.floor((sliceWidthWithSpacing / labelWidth) * d.shiftName.length);
      if (maxLettersFitting > 3) {
        return truncateText(d.shiftName, maxLettersFitting);
      }
    }

    return '';
  }

  addCanvas() {
    // this "trick" here fixes canvas blurryness for various high and low dpi screens and resolution scaling
    this.slicesCanvas = d3.select(this.element).append('canvas');
    this.slicesCanvas.attr('width', this.containerWidth * this.dpi);
    this.slicesCanvas.attr('height', this.containerHeight * this.dpi);
    this.slicesCanvas.style('width', `${this.containerWidth}px`);
    this.slicesCanvas.style('height', `${this.containerHeight}px`);
    this.slicesCanvas.style('position', 'absolute');
  }

  addOffScreenColorDataMap() {
    // this "trick" here draws hidden duplicate of slices canvas with every element drawn in different color
    // canvas is much more performant when rendering high number of elements than svg
    this.offscreen = d3.select(document.createElement('canvas'));
    this.offscreen.attr('width', this.containerWidth);
    this.offscreen.attr('height', this.containerHeight);
  }

  getDisabledColor(color) {
    const opacity = 0.6;
    const tinyColorBlackResult = '#000000';
    let ret = tinycolor(color).setAlpha(opacity).toString();
    if (ret === tinyColorBlackResult) {
      const fallbackLighteningAmount = 50;
      ret = tinycolor(color).lighten(fallbackLighteningAmount).setAlpha(opacity).toString();
    }
    return rgbaToHexOverWhite(ret); // rgba and other transparent colors create anomalies with canvas
  }
  drawCanvasSlices() {
    this.data.timeline.forEach((d, i) => {
      // here we draw elements to hidden map canvas and in addition every different element/color is mapped to data
      // so we take mouse position from top layer, check it against the hidden one, get the color and by color we get data
      const color = getRGBColor((i * 1000) + 1);
      this.colorsDataMap[color] = d;
      drawCanvasRect(this.hoverMap, d.sliceX, 0, d.sliceWidth, this.rowHeight, `rgb(${color})`);
      drawCanvasRect(this.slicesContext, d.sliceX, 0, d.sliceWidth, this.rowHeight, d.disabled ? this.getDisabledColor(d.color) : d.color);
    });
  }

  getTargetSlice(event) {
    const xy = d3.pointer(event);
    // Get pixel from offscreen canvas
    const color = this.hoverMap.getImageData(xy[0], xy[1], 1, 1).data;
    const colorStr = color.slice(0, 3).toString();
    return this.colorsDataMap[colorStr];
  }

  onSliceHover(activeSlice) {
    if (!activeSlice) return;
    showTooltip({
      params: {
        ...activeSlice,
        tooltipHTMLFunc: (slice) => this.tooltipHTMLFunc({ ...slice, zoneId: this.zoneId }),
      },
    });
    const twentyPercentOpacity = 0.2;
    this.highlight
      .attr('fill', 'black')
      .attr('x', activeSlice.sliceX)
      .attr('width', activeSlice.sliceWidth)
      .attr('y', this.marginTop)
      .attr('height', this.rowHeight)
      .attr('opacity', twentyPercentOpacity);

    const iconContainerSize = 20;
    if (activeSlice.sliceWidth > iconContainerSize) {
      this.hoverHtml.attr('x', activeSlice.sliceX + ((activeSlice.sliceWidth - iconContainerSize) / 2))
        .attr('width', iconContainerSize)
        .attr('y', (this.rowHeight / 2) - (iconContainerSize / 2) + this.marginTop)
        .attr('height', iconContainerSize);

      const plusIconSize = 15;
      const pencilIconSize = 13;
      const iconSize = activeSlice.isEmpty ? plusIconSize : pencilIconSize;
      const icon = activeSlice.isEmpty ? mdiPlus : mdiPencil;
      const dot = `
      <div style="width:${iconContainerSize}px; height:${iconContainerSize}px; border-radius:${iconContainerSize / 2}px; background:white; display:flex; align-items:center; justify-content:center;">
        <span class="d-flex">${vIconRawTemplate(icon, iconSize, 'grey', 'shift-icon')}</span>
      </div>
    `;
      this.hoverHtml.html(dot);
      this.hoverHtml.attr('opacity', activeSlice.disabled ? 0 : 1);
    } else {
      this.hoverHtml.attr('width', 0);
      this.hoverHtml.attr('opacity', 0);
    }
  }

  onSliceHoverEnd() {
    hideTooltip();
    this.highlight.attr('opacity', 0);
    this.hoverHtml.attr('opacity', 0);
  }

  addClickEventListener() {
    if (this.isTouchDevice) {
      this.svg.on('click', (event) => {
        const slice = this.getTargetSlice(event);
        this.onSliceHover(slice);
      });
    } else {
      this.svg.on('click', (event) => {
        const slice = this.getTargetSlice(event);
        this.onClick(event, slice);
      });
    }
  }

  addMouseMoveEventListener() {
    this.svg.on('mousemove', (event) => {
      if (event.target.classList.contains('shift-icon')) return;
      const slice = this.getTargetSlice(event);
      if (slice) this.onSliceHover(slice);
      else {
        this.onSliceHoverEnd();
      }
    });
  }

  // eslint-disable-next-line no-unused-vars
  onClick(event, slice) {
    // to be overridden
  }

  onHoverClick(event) {
    const slice = this.getTargetSlice(event);
    this.onClick(event, slice);
    this.onSliceHoverEnd();
  }

  async draw() {
    this.containerWidth = this.element.clientWidth;
    this.containerHeight = this.element.clientHeight;
    this.svg = d3.select(this.element).append('svg');
    this.svg.attr('width', this.containerWidth);
    this.svg.attr('height', this.containerHeight);
    this.svg.style('position', 'absolute');
    this.svg.style('z-index', 1);
    this.highlight = this.svg.append('rect')
      .attr('x', 0)
      .attr('width', 0)
      .attr('y', 0)
      .attr('height', this.rowHeight);

    if (this.isTouchDevice) this.highlightClickListener = this.highlight.on('click', this.onHoverClick.bind(this));

    this.hoverHtml = this.svg.append('foreignObject')
      .attr('x', 0)
      .attr('width', 0)
      .attr('y', 0)
      .attr('height', this.rowHeight)
      .attr('pointer-events', 'none');

    this.addCanvas();
    this.addOffScreenColorDataMap();

    this.slicesContext = this.slicesCanvas.node().getContext('2d');
    this.slicesContext.translate(0, this.marginTop * this.dpi);
    this.slicesContext.clearRect(0, 0, this.containerWidth * this.dpi, this.containerHeight * this.dpi);
    this.slicesContext.scale(this.dpi, this.dpi);

    this.hoverMap = this.offscreen.node().getContext('2d');
    this.hoverMap.translate(0, this.marginTop * this.dpi);
    this.hoverMap.clearRect(0, 0, this.containerWidth * this.dpi, this.containerHeight * this.dpi);

    this.drawCanvasSlices();


    if (!this.isTouchDevice) {
      this.addMouseMoveEventListener();
    }

    this.addClickEventListener();

    this.svg.on('mouseleave', () => {
      this.onSliceHoverEnd();
    });

    const SIX_HOURS_INTERVAL = 6;
    const OPACITY_FIFTY_PERCENT = 0.5;
    this.svg.selectAll('line.verticalGrid')
      .data(this.xScale.ticks(this.dashGridInterval ?? d3.timeHour.every(SIX_HOURS_INTERVAL)))
      .enter()
      .append('line')
      .attr('pointer-events', 'none')
      .attr('class', 'verticalGrid')
      .attr('x1', (d) => this.xScale(d))
      .attr('x2', (d) => this.xScale(d))
      .attr('y1', 0)
      .attr('y2', 1000)
      .attr('fill', 'none')
      .attr('opacity', OPACITY_FIFTY_PERCENT)
      .attr('stroke', colorConstants.dark['secondary-dark'])
      .attr('stroke-dasharray', '2,2')
      .attr('stroke-width', '1px');

    this.svg.selectAll('line.verticalGrid2')
      .data(this.xScale.ticks(this.solidGridInterval ?? d3.timeDay.every(1)))
      .enter()
      .append('line')
      .attr('pointer-events', 'none')
      .attr('class', 'verticalGrid2')
      .attr('x1', (d) => this.xScale(d))
      .attr('x2', (d) => this.xScale(d))
      .attr('y1', 0)
      .attr('y2', 1000)
      .attr('fill', 'none')
      .attr('stroke', colorConstants.dark['secondary-dark'])
      .attr('opacity', OPACITY_FIFTY_PERCENT)
      .attr('stroke-width', '1px');
  }

  destroy() {
    if (this.isTouchDevice && this.highlightClickListener) {
      this.highlight.on('click', null);
      this.highlightClickListener = null;
    }
    d3.select(this.element).selectAll('svg').remove();
    d3.select(this.element).selectAll('canvas').remove();
  }
}
