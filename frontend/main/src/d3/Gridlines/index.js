import * as d3 from 'd3';

import graphColors from '@/constants/graphColors';

export default function GridlinesModule(superclass) {
  return class extends superclass {
    drawGridlines(element, options) {
      if (!this.gridlinesOptions) {
        this.gridlinesOptions = {
          yScaleKey: 'yScale',
          strokeDashArray: '5 5',
          ticksCount: 5,
        };
      }
      if (options) {
        this.gridlinesOptions = Object.assign(this.gridlinesOptions, options);
      }
      this.gridlinesContainer = element.append('g')
        .attr('transform', `translate(${this.marginLeft},${this.marginTop})`);
      this.addGridlines();
    }

    get lineColor() {
      if (this.gridlinesOptions.color) return this.gridlinesOptions.color;
      return this.isDark ? graphColors['dark-theme-grid-lines'] : this.colors['tertiary-dark'];
    }

    addGridlines() {
      this.gridlinesContainer
        .append('g')
        .attr('class', 'grid');
      this.gridlinesContainer.call((g) => this.updateGridlines(g));
    }

    gridlinesGenerator(val, zoomEvent) {
      const yScale = this[this.gridlinesOptions.yScaleKey];
      const gridlinesConfig = d3.axisLeft(zoomEvent ? zoomEvent.transform.rescaleY(yScale) : yScale)
        .tickSize(-this.width)
        .tickFormat('');
      if (this.gridlinesOptions.tickValues) {
        gridlinesConfig.tickValues(this.gridlinesOptions.tickValues);
      } else {
        gridlinesConfig.ticks(this.gridlinesOptions.ticksCount);
      }
      return gridlinesConfig(val);
    }

    updateGridlines(g, zoomEvent) {
      const vm = this;
      if (zoomEvent) {
        vm.latestZoomEv = zoomEvent;
      }
      const defaultUpdateDuration = 500;
      const updateDuration = this.gridlinesOptions.transitionDuration ?? defaultUpdateDuration;
      const updatedGridlines = g.style('stroke-dasharray', this.gridlinesOptions.strokeDashArray)
        .style('color', this.lineColor)
        .attr('transform', `translate(${this.marginLeft},${this.marginTop})`)
        .transition()
        .duration(updateDuration)
        .call((gg) => this.gridlinesGenerator(gg, zoomEvent))
        .call((gg) => gg.select('.domain').remove());
      return updatedGridlines;
    }
  };
}
