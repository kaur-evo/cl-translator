import * as d3 from 'd3';

import {
  roundedRect,
} from '@/helpers/d3Helpers';

export default class ComparisonBars {
  options = {
    xKey: 'measure',
    yKey: 'value',
    xScaleKey: 'xScale',
    yScaleKey: 'yScale',
    barHeight: 5,
  };

  constructor(ctx, element, data, options) {
    this.options = Object.assign(this.options, options);
    this.data = data;
    this.xScale = ctx[this.options.xScaleKey];
    this.yScale = ctx[this.options.yScaleKey];
    this.margin = ctx.margin;
    this.svg = ctx.svg;
    this.colorScale = d3.scaleOrdinal(d3.schemeDark2);
    this.drawComparisonBars(element, ctx);
  }

  async drawComparisonBars(element) {
    this.addComparisonBars(element);
  }

  addComparisonBars(element) {
    const { barHeight } = this.options;
    this.comparisonBars = element.selectAll('.comparison-bar')
      .data(this.data)
      .enter()
      .append('g')
      .attr('class', 'comparison-bar');
    this.comparisonBars.append('path')
      .attr('d', (d) => roundedRect({
        x: this.xScale(d[this.options.xKey]),
        y: this.yScale(d[this.options.yKey]) - (barHeight / 2),
        width: this.xScale.bandwidth(),
        height: barHeight,
        // eslint-disable-next-line no-magic-numbers
        radius: Math.min(this.xScale.bandwidth() * 0.3, barHeight / 2),
        topLeft: true,
        topRight: true,
        bottomLeft: true,
        bottomRight: true,
      }))
      .attr('fill', (d, i) => d.color || this.colorScale(i))
      .attr('stroke', (d, i) => d.strokeColor || this.colorScale(i))
      .attr('class', 'comparison-bar')
      .style('filter', 'url(#md-shadow)');
  }
}
