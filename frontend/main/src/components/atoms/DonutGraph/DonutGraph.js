/* eslint-disable no-magic-numbers */
import * as d3 from 'd3';
import { mdiMenuDown, mdiMenuUp } from '@mdi/js';

import vIconRawTemplate from '@/helpers/html/vIconRawTemplate';
import { formatPercentage } from '@/helpers/numbers/formatNumber';
import BrowserText from '@/helpers/render/BrowserText';
import { showTooltip, hideTooltip, smartPercentageChange } from '@/helpers/d3Helpers';
import colorConstants from '@/constants/colorConstants';
import useProfileStore from '@/stores/profile';

let browserText = null;

export default class DonutGraph {
  constructor(opts) {
    this.animationPromise = null;
    this.data = [...opts.data].sort((a, b) => (a.order > b.order ? 1 : -1));
    this.innerCircleData = opts.innerCircleData;
    this.tooltipHTMLFunc = opts.tooltipHTMLFunc;
    this.element = opts.element;
    // decimal places, % sign, decimal separator and 2 digits before the decimal separator (more is unlikely)
    this.pctPadCount = useProfileStore().numberFormattingOptions.pctDecimalPlaces + 4;

    this.draw();
  }

  destroy() {
    hideTooltip();
    if (browserText) {
      browserText = null;
    }
    if (this.animationPromise) {
      this.animationPromise = null;
    }
    d3.select(this.element).selectAll('svg').remove();
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
    this.radius = Math.min(this.width, this.height) / 5.5;
    this.donutWidth = this.radius * 0.4;
    this.donutSpacing = this.radius * 0.04;

    this.svg = d3.select(this.element).append('svg');
    this.svg.attr('width', this.width);
    this.svg.attr('height', this.height);

    this.plot = this.svg.append('g')
      .attr('transform', `translate(${this.width / 2},${this.height / 2})`);

    this.setScales();
    this.addInnercircle();
    this.addDonutArcs();
    await this.addArcAnimations();
    this.addHoverAnimations();
  }

  setScales() {
    this.colorScale = d3.scaleOrdinal(d3.schemeDark2);
    this.angleScale = d3.scaleLinear().domain([0, 1]).range([0, 2 * Math.PI]);
  }

  paddedFormatPercentage(pct) {
    // decimal places are kept and 3 digits are used for the check
    return formatPercentage(pct, { keepDecimalPlaces: true }).padStart(this.pctPadCount, '0');
  }

  addInnercircle() {
    const innerCircleGraphics = this.svg.append('g')
      .attr('transform', `translate(${this.width / 2},${this.height / 2})`);
    this.innerCircle = innerCircleGraphics.selectAll('.donut-hole')
      .data([this.innerCircleData])
      .enter()
      .append('g')
      .attr('class', 'donut-hole');

    const initialFontSize = 12;
    browserText = new BrowserText();
    const widthAtInitialFontSize = browserText.measureText(this.paddedFormatPercentage(this.innerCircleData.value * 100), initialFontSize, 'Open Sans, sans-serif').width;
    const innerCircleDiameter = (this.radius + this.donutWidth) * 2;
    const initialFontWidthPctOfDiameter = innerCircleDiameter / widthAtInitialFontSize;
    const mainFontSize = initialFontWidthPctOfDiameter * initialFontSize; // font size is multiplied to match the diameter
    const getTextColor = (d) => {
      const colors = this.isDark ? colorConstants.dark : colorConstants.light;
      if (d.value - d.previousValue > 0) {
        return colors.primary;
      }
      if (d.value - d.previousValue < 0) {
        return colors.error;
      }
      return 'rgba(204, 204, 204, 1)';
    };

    const getSecondaryLabelHTML = (d) => {
      const diff = d.value - d.previousValue;
      const signString = diff > 0 ? '+' : '';
      const pctString = formatPercentage(diff * 100);
      const percentageChange = smartPercentageChange(d.previousValue, d.value);
      const formattedPercentageChange = percentageChange ? formatPercentage(Math.abs(percentageChange)) : formatPercentage(0);
      const color = getTextColor(d);

      const secondaryAtInitialFontSize = browserText.measureText(
        `${signString}${this.paddedFormatPercentage(Math.abs(diff) * 100)}(_${this.paddedFormatPercentage(Math.abs(percentageChange))})`,
        initialFontSize,
        'Open Sans, sans-serif',
      ).width;
      const circleChordAtSecondaryLabelPosition = innerCircleDiameter * 0.75;
      const secondaryFontWidthPctOfDiameter = circleChordAtSecondaryLabelPosition / secondaryAtInitialFontSize;
      const secondaryFontSize = secondaryFontWidthPctOfDiameter * initialFontSize; // font size is multiplied to match the diameter
      const styleString = `font-size:${secondaryFontSize}px; color:${color}`;
      const mdiIcon = diff >= 0 ? mdiMenuUp : mdiMenuDown;
      const icon = diff === 0
        ? ''
        : vIconRawTemplate(
          mdiIcon,
          secondaryFontSize * 1.3,
          color,
          '',
          `-${secondaryFontSize * 1.3}px -${secondaryFontSize / 4}px -${secondaryFontSize / 4}px -${secondaryFontSize / 2}px`,
        );
      const changeString = percentageChange ? `(${icon}${formattedPercentageChange})` : '';
      return `<span style="${styleString}">${signString}${pctString}${changeString}</span`;
    };

    this.innerCircle
      .append('circle')
      .attr('r', this.radius + this.donutWidth)
      .attr('fill', 'transparent');
    // large text inside circle
    this.innerCircle
      .append('text')
      .attr('dy', 0 + (mainFontSize / 3))
      .attr('text-anchor', 'middle')
      .attr('font-size', `${mainFontSize * 0.9}px`)
      .attr('font-weight', '600')
      .style('font-family', 'Open Sans, sans-serif')
      .attr('fill', 'rgba(204, 204, 204, 1)')
      .text((d) => formatPercentage(d.value * 100));

    // small text inside circle
    if (this.innerCircleData.secondary || this.innerCircleData.secondary === 0) {
      this.innerCircle.append('foreignObject')
        .attr('y', mainFontSize / 2.3)
        .attr('x', -(this.width / 2))
        .attr('width', this.width)
        .attr('height', mainFontSize / 2)
        .append('xhtml:div')
        .attr('class', 'd-flex justify-center')
        .html((d) => getSecondaryLabelHTML(d));
    }
  }

  addDonutArcs() {
    const vm = this;
    this.arc = d3.arc()
      .cornerRadius(this.donutWidth / 7)
      .innerRadius((d, i) => ((i + 1) * this.donutWidth) + this.radius + this.donutSpacing)
      .outerRadius((d, i) => ((i + 1) * this.donutWidth) + this.radius + this.donutWidth)
      .startAngle(this.angleScale(0))
      .endAngle((d) => this.angleScale(d.value));

    this.donuts = vm.plot.selectAll('.donut-arc')
      .data(this.data)
      .enter()
      .append('g')
      .attr('class', 'donut-arc')
      .append('path')

      .attr('d', (d, i) => vm.arc(d, i))
      .attr('fill', (d, i) => d.color || this.color(i));
  }


  onDonutArcMouseEnter(vm) {
    // eslint-disable-next-line func-names
    return function (d, i) {
      d3.select(this)
        .classed('active', true);
      // eslint-disable-next-line func-names
      vm.plot.selectAll('path').filter(function () {
        return !this.classList.contains('active');
      }).transition()
        .duration(200)
        .attr('opacity', (a, j) => (j === i - 1 ? 1 : 0.6));
      showTooltip({
        params: {
          ...i,
          tooltipHTMLFunc: vm.tooltipHTMLFunc,
        },
      });
    };
  }


  onDonutArcMouseLeave(vm) {
    // eslint-disable-next-line func-names
    return function () {
      vm.plot.selectAll('path')
        .transition()
        .duration(200)
        .attr('opacity', '1');
      d3.select(this)
        .classed('active', false);
      hideTooltip();
    };
  }

  addHoverAnimations() {
    const vm = this;
    vm.donuts
      .on('mousemove', vm.onDonutArcMouseEnter(vm))
      .on('mouseout', vm.onDonutArcMouseLeave(vm));
  }

  async addArcAnimations() {
    const vm = this;
    this.animationPromise = await new Promise((resolve) => {
      vm.plot.selectAll('path').transition()
        .duration(1000)
        .attrTween('d', (d, i) => (t) => vm.arc({ ...d, value: t * d.value }, i))
        .on('end', () => resolve());
    });
  }
}
