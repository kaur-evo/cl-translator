/* eslint-disable no-magic-numbers */
import * as d3 from 'd3';

import { showTooltip, hideTooltip, roundedRect } from '@/helpers/d3Helpers';

export default class OeeHorizontalGraph {
  constructor(opts) {
    this.data = [...opts.data].sort((a, b) => (a.order > b.order ? 1 : -1));
    this.tooltipHTMLFunc = opts.tooltipHTMLFunc;
    this.element = opts.element;
    this.draw();
  }

  async draw() {
    d3.select(this.element).selectAll('svg').remove();
    this.width = this.element.clientWidth;
    this.height = this.element.clientHeight;
    this.margin = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    };

    this.svg = d3.select(this.element).append('svg');
    this.svg.attr('width', this.width);
    this.svg.attr('height', this.height);
    this.plot = this.svg.append('g').attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    this.setScales();
    this.addGraphLines();
    this.addHoverAnimations();
  }

  setScales() {
    this.colorScale = d3.scaleOrdinal(d3.schemeDark2);
    this.yScale = d3.scaleBand()
      .range([this.height, 0])
      .padding(0.4)
      .domain(this.data.map((d) => d.label));
    this.xScale = d3.scaleLinear()
      .range([0, this.width])
      .domain([0, 1]);
  }

  addGraphLines() {
    this.lines = this.plot.selectAll('.line')
      .data(this.data)
      .enter()
      .append('g')
      .attr('class', 'line');

    // background bars
    this.lines.append('path')
      .attr('d', (d) => roundedRect({
        x: 0,
        y: this.yScale(d.label) || 0,
        width: this.width,
        height: this.yScale.bandwidth() || 0,
        radius: Math.min(this.yScale.bandwidth() * 0.2, this.xScale(d.value)) || 0,
        topLeft: false,
        topRight: false,
        bottomLeft: false,
        bottomRight: false,
      }))
      .style('opacity', 0.1)
      .attr('fill', (d, i) => d.color || this.color(i));

    this.lines.append('path')
      .attr('d', (d) => roundedRect({
        x: 0,
        y: this.yScale(d.label) || 0,
        width: this.xScale(d.value) || 0,
        height: this.yScale.bandwidth() || 0,
        radius: Math.min(this.yScale.bandwidth() * 0.1, this.xScale(d.value)) || 0,
        topLeft: false,
        topRight: true,
        bottomLeft: false,
        bottomRight: true,
      }))
      .attr('fill', (d, i) => d.color || this.color(i));
  }


  onLinesMouseEnter(vm) {
    // eslint-disable-next-line func-names
    return function (d, i) {
      d3.select(this)
        .classed('active', true);
      // eslint-disable-next-line func-names
      vm.plot.selectAll('.line').filter(function () {
        return !this.classList.contains('active');
      }).transition()
        .duration(100)
        .attr('opacity', '0.6');
      showTooltip({
        params: {
          ...i,
          tooltipHTMLFunc: vm.tooltipHTMLFunc,
        },
      });
    };
  }


  onLinesMouseLeave(vm) {
    // eslint-disable-next-line func-names
    return function () {
      vm.plot.selectAll('.line')
        .transition()
        .duration(100)
        .attr('opacity', '1');
      d3.select(this)
        .classed('active', false);
      hideTooltip();
    };
  }

  addHoverAnimations() {
    const vm = this;
    vm.lines
      .on('mousemove', vm.onLinesMouseEnter(vm))
      .on('mouseout', vm.onLinesMouseLeave(vm));
  }
}
