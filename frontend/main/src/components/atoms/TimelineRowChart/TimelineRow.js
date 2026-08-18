/* eslint-disable no-unused-vars */
/* eslint-disable no-magic-numbers */
import * as d3 from 'd3';
import { DateTime } from 'luxon';
import { mdiCalendarClock } from '@mdi/js';

import {
  showTooltip, hideTooltip, getTextWidth, roundedRect,
} from '@/helpers/d3Helpers';
import truncateText from '@/helpers/text/truncateText';
import colorConstants from '@/constants/colorConstants';

function getColor(i) {
  return `${i % 256},${Math.floor(i / 256) % 256},${Math.floor(i / 65536) % 256}`;
}

function drawCanvasRect(ctx, x, y, w, h, color) {
  // eslint-disable-next-line no-param-reassign
  ctx.fillStyle = color || '#FF0000';
  ctx.fillRect(x, y, w, h);
}
function drawCanvasText(ctx, text, x, y, font, size, color) {
  // eslint-disable-next-line no-param-reassign
  ctx.font = `${size}px ${font}`;
  // eslint-disable-next-line no-param-reassign
  ctx.fillStyle = color;
  // eslint-disable-next-line no-param-reassign
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}
export default class TimelineRow {
  constructor(opts) {
    this.tooltipHTMLFunc = opts.tooltipHTMLFunc;
    this.element = opts.element;
    d3.select(this.element).selectAll('svg').remove();
    d3.select(this.element).selectAll('canvas').remove();
    this.xScale = opts.xScale;
    this.zoneId = opts.zoneId;
    this.data = { ...opts.data };
    this.colorsDataMap = {};
    this.dpi = window.devicePixelRatio;
    this.rowHeight = 40;
    this.marginTop = 8;
    this.data.timeline = this.data.timeline.map((slice) => {
      const sliceX = this.calcSliceX(slice.stTmISO);
      const sliceWidth = this.calcSliceWidth(slice, sliceX);
      return {
        ...slice,
        sliceWidth,
        sliceX,
      };
    });
    this.stationId = opts.stationId;
    this.isTouchDevice = 'ontouchstart' in window;
    hideTooltip();
    this.draw();
  }

  calcSliceWidth(d, sliceX) {
    const newEndTime = DateTime.fromISO(d.enTmISO, this.zoneId);
    const sliceX2 = Math.max(this.xScale(newEndTime), 0);
    return sliceX2 - sliceX;
  }

  calcSliceX(time) {
    const newTime = DateTime.fromISO(time, this.zoneId);
    return Math.max(this.xScale(newTime), 0);
  }

  calcSliceText(d) {
    const sliceLabelMarginY = 13;
    const sliceLabelFontSize = 14;
    const sliceLabelFontFamily = 'Open Sans, sans-serif';
    const { sliceWidth } = d;
    if (d.sliceLabel) {
      const labelWidth = getTextWidth(d.sliceLabel, sliceLabelFontSize, sliceLabelFontFamily);
      const sliceWidthWithSpacing = sliceWidth - (2 * sliceLabelMarginY);
      if (labelWidth < sliceWidthWithSpacing) {
        return d.sliceLabel;
      }
      const maxLettersFitting = Math.floor((sliceWidthWithSpacing / labelWidth) * d.sliceLabel.length);
      if (maxLettersFitting > 3) {
        return truncateText(d.sliceLabel, maxLettersFitting);
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

  drawCanvasSlices() {
    this.data.timeline.forEach((d, i) => {
      const sliceLabelMarginY = 13;

      // here we draw elements to hidden map canvas and in addition every different element/color is mapped to data
      // so we take mouse position from top layer, check it against the hidden one, get the color and by color we get data
      const color = getColor((i * 1000) + 1);
      this.colorsDataMap[color] = d;
      drawCanvasRect(this.hoverMap, d.sliceX, 0, d.sliceWidth, this.rowHeight, `rgb(${color})`);

      drawCanvasRect(this.slicesContext, d.sliceX, 0, d.sliceWidth, this.rowHeight, d.sliceColor);
      drawCanvasText(
        this.slicesContext,
        this.calcSliceText(d),
        d.sliceX + sliceLabelMarginY,
        (this.rowHeight / 2) + 1,
        'Open Sans',
        14,
        'white',
      );
    });
  }

  async addChangeoverIcons() {
    const iconPath = (await import('../../../assets/icons/productChange.svg')).default;
    this.data.changeovers.forEach((d) => {
      const x = this.calcSliceX(d.stTmISO);
      if (x === 0) return; // changeover is before the visible time

      const icon = this.svg.append('g').attr('class', 'changeover-icon');

      icon.append('line')
        .attr('x1', x)
        .attr('x2', x)
        .attr('y1', this.rowHeight / 2)
        .attr('y2', this.rowHeight + this.marginTop)
        .attr('stroke', 'white')
        .attr('stroke-width', 2);

      const iconSize = 28;

      icon.append('svg:image')
        .attr('x', x - (iconSize / 2))
        .attr('y', this.marginTop / 2)
        .attr('width', iconSize)
        .attr('height', iconSize)
        .attr('href', iconPath);

      icon.on('mousemove', () => {
        showTooltip({
          params: {
            ...d,
            icon: true,
            tooltipHTMLFunc: (slice) => this.tooltipHTMLFunc({ ...slice, zoneId: this.zoneId }),
          },
        });
      });

      this.svg.on('mouseout', () => {
        hideTooltip();
      });
    });
  }

  async addShiftIcons() {
    this.data.shifts.forEach((d) => {
      const x = this.calcSliceX(d.startTime);
      if (x === 0) return; // shift start is before the visible time

      const icon = this.svg.append('g').attr('class', 'shift-icon');

      const iconSize = 14;
      const rectSize = 20;

      icon.append('path')
        .attr('d', (i) => roundedRect({
          x: x - (rectSize / 2),
          y: this.rowHeight - ((rectSize - iconSize) / 2),
          width: rectSize,
          height: rectSize,
          radius: 4,
          topLeft: true,
          topRight: true,
          bottomLeft: true,
          bottomRight: true,
        }))
        .attr('fill', colorConstants.dark['lw-background'])
        .attr('class', 'shift-icon');

      icon.append('path')
        .attr('d', mdiCalendarClock)
        .attr('fill', 'white')
        .attr('transform', `translate(${x - (iconSize / 2)},${this.rowHeight}) scale(${iconSize / 24})`)
        .attr('class', 'shift-icon');

      icon.on('mouseleave', () => {
        hideTooltip();
      });

      icon.on('mousemove', (event) => {
        showTooltip({
          params: {
            primaryLabel: d.name,
          },
        });
      });
    });
  }

  getTargetSlice(event) {
    const xy = d3.pointer(event);
    // Get pixel from offscreen canvas
    const color = this.hoverMap.getImageData(xy[0], xy[1], 1, 1).data;
    return this.colorsDataMap[color.slice(0, 3).toString()];
  }

  onSliceHover(activeSlice) {
    showTooltip({
      params: {
        ...activeSlice,
        tooltipHTMLFunc: (slice) => this.tooltipHTMLFunc({ ...slice, zoneId: this.zoneId }),
      },
    });

    this.highlight
      .attr('fill', 'black')
      .attr('x', activeSlice.sliceX)
      .attr('width', activeSlice.sliceWidth)
      .attr('y', this.marginTop)
      .attr('height', this.rowHeight)
      .attr('opacity', 0.4);
  }

  onSliceHoverEnd() {
    hideTooltip();
    this.highlight.attr('opacity', 0);
  }

  addClickEventListener() {
    if (this.isTouchDevice) {
      this.svg.on('click', (event) => {
        const slice = this.getTargetSlice(event);
        if (!slice || !slice.sId) return;
        this.onSliceHover(slice);
      });

      this.svg.on('dblclick', (event) => {
        event.preventDefault();
        const slice = this.getTargetSlice(event);
        if (!slice || !slice.sId) return;
        window.open(`#/shiftview/${this.stationId}/${slice.sId}`, '_blank');
        this.onSliceHoverEnd();
      });
    } else {
      this.svg.on('click', (event) => {
        const slice = this.getTargetSlice(event);
        if (!slice || !slice.sId) return;
        window.open(`#/shiftview/${this.stationId}/${slice.sId}`, '_blank');
      });
    }
  }

  addMouseMoveEventListener() {
    this.svg.on('mousemove', (event) => {
      if (event.target.classList.contains('shift-icon')) return;
      const slice = this.getTargetSlice(event);
      if (slice) this.onSliceHover(slice);
      else this.highlight.attr('opacity', 0);
    });
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

    const startTime = DateTime.fromISO(this.data.startTime, { zone: this.zoneId });
    const endTime = DateTime.fromISO(this.data.endTime, { zone: this.zoneId });
    if (!startTime.hasSame(endTime, 'day')) {
      const midnight = startTime.endOf('day');
      const xPos = this.xScale(midnight);
      this.svg.append('line')
        .attr('x1', xPos)
        .attr('y1', 0)
        .attr('x2', xPos)
        .attr('y2', this.containerHeight)
        .style('stroke', 'white')
        .style('stroke-width', '1px')
        .style('stroke-dasharray', '5,5');
    }

    if (!this.isTouchDevice) {
      this.addMouseMoveEventListener();
    }

    this.addClickEventListener();

    this.svg.on('mouseleave', () => {
      this.onSliceHoverEnd();
    });

    this.addChangeoverIcons();
    this.addShiftIcons();
  }
}
