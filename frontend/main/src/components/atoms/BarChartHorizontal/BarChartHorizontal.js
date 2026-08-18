/* eslint-disable no-magic-numbers */

import * as d3 from 'd3';

import {
  roundedRect, showTooltip, hideTooltip, getTextWidth, drawComparisonArrow,
} from '@/helpers/d3Helpers';
import colorConstants from '@/constants/colorConstants';
import longestStrInList from '@/helpers/longestStrInList';
import truncateText from '@/helpers/text/truncateText';
import { OUTER_PADDING } from '@/d3/constants';

d3.formatDefaultLocale({
  decimal: '.',
  thousands: ' ',
  grouping: [3],
  currency: ['$', ''],
});

export default class BarChartHorizontal {
  constructor(opts) {
    this.animationPromise = null;
    this.consideredZeroMargin = 0.1;
    this.isDark = opts.isDark || false;
    this.colors = this.isDark ? colorConstants.dark : colorConstants.light;
    this.tooltipHTMLFunc = opts.tooltipHTMLFunc;
    this.isStacked = opts.isStacked || false;
    this.isGrouped = opts.isGrouped || false;
    this.subGroupKey = opts.subGroupKey || 'stackList';
    this.data = [...opts.data].sort((a, b) => (a.measure > b.measure ? 1 : -1));

    this.element = opts.element;

    this.mouseEnterFunc = opts.mouseEnterFunc;
    this.mouseLeaveFunc = opts.mouseLeaveFunc;

    this.comparisonArrowsEnabled = opts.comparisonArrowsEnabled;
    this.comparisonArrowsData = opts.comparisonArrowsData;
    this.draw();
  }

  destroy() {
    if (this.animationPromise) {
      this.animationPromise = null;
    }
    d3.select(this.element).selectAll('svg').remove();
    hideTooltip();
  }

  async draw() {
    d3.select(this.element).selectAll('svg').remove();

    this.fontSize = Math.max(Math.min((this.element.clientWidth * (12 / this.data.length)), this.element.clientHeight) * 0.020, 10);
    const longestAxisLabel = longestStrInList(this.data.map((d) => d.value));
    const longestAxisLabelPx = getTextWidth(longestAxisLabel, this.fontSize, 'Open Sans') + 15;

    this.margin = {
      top: 0,
      right: this.comparisonArrowsEnabled ? 18 : 0,
      bottom: 0,
      left: longestAxisLabelPx,
    };
    this.containerWidth = this.element.clientWidth;
    this.containerHeight = this.element.clientHeight;
    this.width = this.containerWidth - this.margin.left - this.margin.right;
    this.height = this.containerHeight - this.margin.top - this.margin.bottom;

    const svg = d3.select(this.element).append('svg');
    svg.attr('width', this.containerWidth);
    svg.attr('height', this.containerHeight);

    this.plot = svg.append('g').attr('transform', `translate(${this.margin.left},${this.margin.top})`);
    this.setScales();
    this.addAxes();
    this.addBars();
    await this.addBarsGrowAnimation();
    this.addBarsLabels();

    if (this.comparisonArrowsEnabled) this.addComparisonArrows();

    this.addBarsHoverAnimation();
  }

  setScales() {
    this.colorScale = d3.scaleOrdinal(d3.schemeDark2);

    if (this.isStacked || this.isGrouped) {
      const categories = this.data.map((d) => d.measureLabel);
      this.yScale = d3.scaleBand()
        .range([this.height - (this.margin.top + this.margin.bottom), 0])
        .padding(OUTER_PADDING)
        .domain(categories);

      const maxValue = d3.max(this.data, (d) => {
        if (d[this.subGroupKey] && d[this.subGroupKey].length > 0) {
          if (this.isStacked) {
            return d3.sum(d[this.subGroupKey], (s) => s.measure || 0);
          }
          return d3.max(d[this.subGroupKey], (s) => s.measure || 0);
        }
        return d.measure || 0;
      });

      this.xScale = d3.scaleLinear()
        .range([0, this.width - this.margin.right])
        .domain([0, maxValue]);
    } else {
      this.yScale = d3.scaleBand()
        .range([this.height - (this.margin.top + this.margin.bottom), 0])
        .padding(OUTER_PADDING)
        .domain(this.data.map((d) => d.measureLabel));
      this.xScale = d3.scaleLinear()
        .range([0, this.width - this.margin.right])
        .domain([0, d3.max(this.data, (d) => d.measure)]);
    }
  }

  addBars() {
    if (this.isStacked || this.isGrouped) {
      this.bars = this.plot.selectAll('.bar-group')
        .data(this.data)
        .enter()
        .append('g')
        .attr('class', 'bar-group');
      this.addStackedBars();
    } else {
      this.bars = this.plot.selectAll('.bar')
        .data(this.data)
        .enter()
        .append('g')
        .attr('class', 'bar');

      this.bars.append('path')
        .attr('d', (d) => roundedRect({
          x: 0,
          y: this.yScale(d.measureLabel) || 0,
          width: this.xScale(d.measure) || 0,
          height: this.yScale.bandwidth() || 0,
          radius: Math.min(this.yScale.bandwidth() * 0.2, this.xScale(d.measure)) || 0,
          topLeft: false,
          topRight: true,
          bottomLeft: false,
          bottomRight: true,
        }))
        .attr('fill', (d, i) => d.color || this.colorScale(i));
    }
  }

  addStackedBars() {
    const vm = this;
    // eslint-disable-next-line func-names
    this.bars.each(function (d) {
      const parentGroup = d3.select(this);
      const subGroups = d[vm.subGroupKey] || [];
      let cumulativeX = 0;

      // Find the index of the last visible stack (measure > 0)
      let lastVisibleIndex = -1;
      for (let i = subGroups.length - 1; i >= 0; i--) {
        if (subGroups[i].measure > 0) {
          lastVisibleIndex = i;
          break;
        }
      }

      subGroups.forEach((subData, subIndex) => {
        const barWidth = vm.xScale(subData.measure || 0);
        const barGroup = parentGroup.append('g')
          .attr('class', `stacked-bar-${subIndex}`);

        const barHeight = vm.isGrouped
          ? vm.yScale.bandwidth() / subGroups.length
          : vm.yScale.bandwidth();

        const barY = vm.isGrouped
          ? vm.yScale(d.measureLabel) + (subIndex * barHeight)
          : vm.yScale(d.measureLabel);

        const barX = vm.isStacked ? cumulativeX : 0;

        barGroup.append('path')
          .attr('d', roundedRect({
            x: barX,
            y: barY,
            width: barWidth,
            height: barHeight,
            radius: Math.min(barHeight * 0.2, barWidth) || 0,
            topLeft: false,
            topRight: vm.isStacked ? (subIndex === lastVisibleIndex) : true,
            bottomLeft: false,
            bottomRight: vm.isStacked ? (subIndex === lastVisibleIndex) : true,
          }))
          .attr('fill', subData.color || vm.colorScale(subIndex))
          .datum({ parent: d, sub: subData, subIndex });

        if (vm.isStacked) {
          cumulativeX += barWidth;
        }
      });
    });
  }

  addComparisonArrows() {
    const maxOffset = 25;
    const triangleOffset = Math.min(this.yScale.bandwidth() * 0.4, maxOffset);
    const calcX = (d, i) => {
      const textWidth = getTextWidth(d.measureLabel, this.fontSize, 'Open Sans') * 1.4;
      const barWidth = this.xScale(d.measure);
      if (textWidth > barWidth) {
        const textElem = this.element.querySelectorAll('.value').item(i)?.getBoundingClientRect();
        return (textElem?.width || 0) + this.fontSize + triangleOffset;
      }
      return barWidth + triangleOffset;
    };
    const calcY = (d) => (this.yScale(d.measureLabel) + (this.yScale.bandwidth() / 2));
    const shapeSize = this.yScale.bandwidth() * 2;
    drawComparisonArrow(this.bars, shapeSize, 'measure', 'comparison', calcX, calcY, this.isDark, false, this.consideredZeroMargin);
  }

  addBarsLabels() {
    const formatLabelText = (d) => {
      const textLength = getTextWidth(d.measureLabel, this.fontSize, 'Open Sans') * 1.4;
      if (textLength > this.width) {
        const oneCharWidth = textLength / d.measureLabel.length;
        const characterLimit = Math.floor((this.width - this.fontSize) / oneCharWidth) - 4;
        return truncateText(d.measureLabel, characterLimit);
      }
      return d.measureLabel;
    };
    this.bars.append('text')
      .attr('class', 'value')
      .attr('x', 0)
      .attr('y', (d) => this.yScale(d.measureLabel) + (this.yScale.bandwidth() / 2))
      .attr('dx', this.fontSize) // margin right
      .attr('dy', '.35em') // vertical align middle
      .attr('text-anchor', 'start')
      .text((d) => formatLabelText(d))
      .style('fill', (d) => {
        if (d.textColor) return d.textColor;
        return this.isDark ? this.colors.white : this.colors.black;
      })
      .style('font-size', `${this.fontSize}px`)
      .style('font-family', 'Open Sans, sans-serif')
      .style('text-transform', 'uppercase')
      .style('letter-spacing', '0.1em')
      .style('font-weight', 600)
      .style('text-shadow', '0px 0px 12px rgba(0, 0, 0, 0.90)');
  }

  async addBarsGrowAnimation() {
    this.animationPromise = await new Promise((resolve) => {
      const targetSelection = this.isStacked || this.isGrouped
        ? this.bars.selectAll('path')
        : this.bars;

      targetSelection
        .attr('transform', 'scale(0, 1)')
        .transition()
        .duration(750)
        .attr('transform', 'scale(1, 1)')
        .on('end', () => resolve());
    });
  }

  addBarsHoverAnimation() {
    const vm = this;
    vm.bars.on('mousemove', vm.onBarMouseEnter(vm));
    vm.bars.on('mouseout', vm.onBarMouseLeave(vm));
  }


  onBarMouseEnter(vm) {
    // eslint-disable-next-line func-names
    return function (d, i) {
      const currentElement = d3.select(this);
      currentElement.classed('active', true);

      if (vm.isStacked || vm.isGrouped) {
        // For stacked/grouped bars, highlight all stacks in the same bar group
        const parentGroup = currentElement.node().closest('.bar-group');
        const allBarGroups = vm.plot.selectAll('.bar-group');

        // Apply opacity to all bar groups
        // eslint-disable-next-line func-names
        allBarGroups.each(function () {
          const barGroup = d3.select(this);
          const isCurrentGroup = this === parentGroup;

          // Apply opacity to all paths within each bar group
          barGroup.selectAll('path')
            .transition()
            .duration(100)
            .attr('opacity', isCurrentGroup ? 1 : 0.6);
        });
      } else {
        // Original behavior for non-stacked bars
        // eslint-disable-next-line func-names
        vm.plot.selectAll('.bar').filter(function () {
          return !this.classList.contains('active');
        }).transition()
          .duration(100)
          .attr('opacity', (a, j) => (j === i - 1 ? 1 : 0.6));
      }

      showTooltip({
        params: {
          ...i,
          tooltipHTMLFunc: vm.tooltipHTMLFunc,
        },
      });
    };
  }

  onBarMouseLeave(vm) {
    // eslint-disable-next-line func-names
    return function () {
      if (vm.isStacked || vm.isGrouped) {
        // Reset opacity for all stacks in all bar groups
        vm.plot.selectAll('.bar-group path')
          .transition()
          .duration(100)
          .attr('opacity', 1);
      } else {
        // Original behavior for non-stacked bars
        vm.plot.selectAll('.bar')
          .transition()
          .duration(100)
          .attr('opacity', '1');
      }

      d3.select(this)
        .classed('active', false);
      hideTooltip();
    };
  }

  addAxes() {
    // add the y Axis
    this.plot.append('g')
      .style('font-size', this.fontSize)
      .style('font-family', 'Open Sans, sans-serif')
      .style('color', this.isDark ? this.colors.white : this.colors.black)
      .call(
        d3.axisLeft(this.yScale)
          .tickSize(0)
          .tickFormat((d, i) => this.data[i].value),
      )
      .call((g) => g.select('.domain').remove())
      .selectAll('.tick text')
      .style('text-anchor', 'center')
      .attr('x', -this.fontSize * 0.75);
  }
}
