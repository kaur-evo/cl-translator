import { ZOOM_DURATION } from '@/d3/constants';
import isMoveEvent from '@/d3/helpers/isMoveEvent';

export default class NewTrendLine {
  constructor(ctx, data, opts) {
    this.slope = data?.slope || 0;
    this.intercept = data?.intercept || 0;
    this.context = ctx;
    this.data = [];
    this.isTimeScale = opts.isTimeScale;
  }

  getLineDataPoints({ xDomain, xScale, yScale }) {
    const points = [];
    for (let i = 0; i < xDomain.length; i += 1) {
      const xVal = xDomain[i];
      let yVal = (this.slope * (i + 1)) + this.intercept;
      if (this.context.yScaleType === 'scaleTime') yVal = new Date(yVal * 1000);
      const xPos = xScale(xVal);
      const yPos = yScale(yVal);
      if (!Number.isNaN(xPos) && !Number.isNaN(yPos)) {
        points.push({
          x: xPos,
          y: yPos,
        });
      }
    }
    return points;
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

  update({ isVisible, trendlineData } = {}) {
    this.elementRef.selectAll('.trendline').remove();

    const hoverAreaWidth = 15;
    this.intercept = trendlineData?.intercept;
    this.slope = trendlineData?.slope;
    this.data = this.getLineDataPoints(this.context);
    if (this.data.length < 2) return;

    const trendData = [this.data, this.data];
    this.trendLine = this.elementRef
      .selectAll('.trendline')
      .data(trendData);

    const bandWidth = this.context.xScale.bandwidth ? this.context.xScale.bandwidth() : 1;
    const halfBarWidth = bandWidth / 2;

    const x1Position = this.data[0].x + halfBarWidth;
    const x2Position = this.data[this.data.length - 1].x + halfBarWidth;
    const y1Position = this.data[0].y;
    const y2Position = this.data[this.data.length - 1].y;

    this.trendEnter = this.trendLine
      .enter()
      .append('line')
      .style('vector-effect', 'non-scaling-stroke')
      .attr('class', 'trendline')
      .attr('x1', x1Position)
      .attr('y1', y1Position)
      .attr('x2', x2Position)
      .attr('y2', y2Position)
      .style('stroke-dasharray', (d, i) => {
        if (i === 1) return '';
        return '5 5';
      })
      .style('stroke-width', (d, i) => {
        if (i === 1) return hoverAreaWidth;
        return 1;
      })
      .style('stroke', (d, i) => {
        if (i === 1) return 'transparent';
        return this.context.isDark ? this.context.colors.white : this.context.colors.black;
      })
      .style('opacity', isVisible ? 1 : 0);

    this.trendLine.exit().remove();
  }

  draw(targetEl) {
    if (this.elementRef) this.elementRef.remove();
    this.elementRef = targetEl.append('g').attr('class', 'trendline-wrapper');
  }
}
