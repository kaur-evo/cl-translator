import { DateTime } from 'luxon';
import * as d3 from 'd3';

import colorConstants from '@/constants/colorConstants';

export default class TimelineTimeIndicator {
  svgGroup = null;
  constructor(element, { xScale, dateRange, zoneId } = {}) {
    this.element = element;
    this.xScale = xScale;
    this.dateRange = dateRange;
    this.zoneId = zoneId;
  }
  draw() {
    if (this.element === null) return;
    const d3Element = d3.select(this.element);
    d3Element.selectAll('svg').remove('*');
    this.svgGroup = d3Element
      .append('svg')
      .attr('height', '100%')
      .attr('width', '100%')
      .append('g');
    this.update();
  }
  update({ dateRange, xScale, zoneId } = {}) {
    if (!this.svgGroup) return;
    if (dateRange) this.dateRange = dateRange;
    if (xScale) this.xScale = xScale;
    if (zoneId) this.zoneId = zoneId;
    this.svgGroup.selectAll('*').remove('*');
    const now = DateTime.now().setZone(this.zoneId).setZone('local', { keepLocalTime: true });
    const xPos = this.xScale(now.toJSDate());
    this.svgGroup
      .append('line')
      .attr('x1', xPos)
      .attr('y1', 0)
      .attr('x2', xPos)
      .attr('y2', '100%')
      .attr('stroke', colorConstants.dark['lw-orange'])
      .attr('stroke-width', 3)
      .attr('pointer-events', 'none');
  }
}
