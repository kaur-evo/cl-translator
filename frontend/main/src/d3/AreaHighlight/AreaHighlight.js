import * as d3 from 'd3';

import AreaChart from '@/d3/AreaChart/AreaChart';

const defaultOptions = {
  xScaleKey: 'xScale',
  curve: d3.curveStepAfter,
  padding: 0,
};
export default class AreaHighlightChart extends AreaChart {
  constructor(ctx, data, options) {
    super(ctx, data, options);
    this.options = { ...this.options, ...defaultOptions, ...options };
    this.xScale = ctx[this.options.xScaleKey];
  }

  get areaGenerator() {
    const yRange = this.yScale.range();
    const minVal = Math.min(...yRange);
    const maxVal = Math.max(...yRange);
    return d3.area()
      .x((d) => this.xScale(d[this.options.xKey]) + this.scaleBandOffset)
      .y0((d) => (d[this.options.yKey] ? maxVal : minVal))
      .y1(() => minVal)
      .curve(this.options.curve);
  }
}
