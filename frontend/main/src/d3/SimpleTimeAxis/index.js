
import * as d3 from 'd3';
import * as fc from 'd3fc';

import colorConstants from '@/constants/colorConstants';
const CONTAINER_SPACING_PX = 2;
export default class SimpleTimeAxis {
  element = null;
  svg = null;
  container = null;
  axis = null;
  options = {
    ticks: 10,
    tickFormat: d3.timeFormat('%H:%M'),
    fontSize: 10,
    scale: null,
    axisType: 'axisTop',
    tickCenterLabel: false,
  };
  constructor(element, options = {}) {
    this.element = element;
    this.options = { ...this.options, ...options };
  }
  get containerHeight() {
    return this.options.fontSize + CONTAINER_SPACING_PX;
  }

  get containerWidth() {
    if (this.element === null) return 0;
    return this.element.clientWidth;
  }

  createSVG() {
    const d3Element = d3.select(this.element);
    d3Element.selectAll('svg').remove('*');

    this.svg = d3Element
      .append('svg')
      .attr('height', `${this.containerHeight}px`)
      .attr('width', '100%');
  }

  createContainer() {
    this.container = this.svg
      .append('g')
      .attr('transform', `translate(0, ${this.options.fontSize})`)
      .attr('class', 'x axis')
      .style('font-size', () => `${this.options.fontSize}px`)
      .style('line-height', () => `${this.containerHeight}px`);
    this.defs = this.container.append('defs');
  }

  draw() {
    if (this.element === null) return;
    this.createSVG();
    this.createContainer();
    this.axis = fc[this.options.axisType](this.options.scale);
    this.update(this.options);
  }

  update(options) {
    this.options = { ...this.options, ...options };
    this.axis.scale(this.options.scale);
    this.axis.ticks(this.options.ticks);
    this.axis.tickFormat(this.options.tickFormat);
    this.axis.tickCenterLabel(this.options.tickCenterLabel);
    const tickText = this.container.call(this.axis)
      .call((g) => g.select('.domain').remove())
      .call((g) => g.selectAll('.tick path').remove())
      .selectAll('.tick text')
      .attr('y', 0);
    if (this.options.tickCenterLabel === false) {
      tickText.attr('transform', 'translate(0, 0)');
    }
    const everyNthTick = this.getEveryNthTick();
    tickText.attr('visibility', (d, i) => (i % everyNthTick === 0 ? 'visible' : 'hidden'));

    this.addGradient();
  }
  getEveryNthTick() {
    const labelWidth = this.getNeededLabelWidthToFit();
    const everyNthTickRaw = 1 / (this.containerWidth / labelWidth);
    return Math.ceil(everyNthTickRaw);
  }

  getNeededLabelWidthToFit() {
    let maxWidth = 0;
    let index = 0;
    const extraSpacing = 4;
    // eslint-disable-next-line func-names
    this.container.selectAll('.tick text').each(function (d, i) {
      const bbox = this.getBBox();
      maxWidth = Math.max(maxWidth, bbox.width);
      index = i;
    });
    return (maxWidth + extraSpacing) * (index + 1);
  }

  addGradient() {
    const fadeWidth = 14;

    const vm = this;
    function createOverflowGradient({ id, x, direction = 'left' }) {
      vm.defs.selectAll(`.${id}`).remove();
      vm.container.selectAll(`.${id}`).remove();
      const isLeft = direction === 'left';
      const gradient = vm.defs.append('linearGradient')
        .attr('id', id)
        .attr('class', id);
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', colorConstants.light.white)
        .attr('stop-opacity', isLeft ? 1 : 0);
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', colorConstants.light.white)
        .attr('stop-opacity', isLeft ? 0 : 1);
      vm.container
        .append('rect')
        .attr('class', id)
        .attr('x', x)
        .attr('y', -vm.containerHeight)
        .attr('width', fadeWidth)
        .attr('height', vm.containerHeight)
        .style('fill', `url(#${id})`);
    }
    createOverflowGradient({
      id: 'leftFadient',
      direction: 'left',
      x: 0,
    });
    createOverflowGradient({
      id: 'rightFadient',
      direction: 'right',
      x: this.containerWidth - fadeWidth,
    });
  }
}
