/* eslint-disable no-magic-numbers */
import * as d3 from 'd3';

import { formatNumber } from './numbers/formatNumber';

import i18n from '@/services/i18n';
import colorConstants from '@/constants/colorConstants';

export function drawComparisonArrow(element, size, val1Key, val2Key, xFunc, yFunc, dark = false, vertical = false, consideredZeroMargin = 0.1, invertColors = false) {
  const colors = dark ? colorConstants.dark : colorConstants.light;
  const changeVal = (d) => {
    const change = Number(d[val1Key]) - Number(d[val2Key]);
    if (Math.abs(change) <= consideredZeroMargin) return 0;
    return change;
  };
  const isLargerThanZero = (d) => (changeVal(d) > 0);
  const isSmallerThanZero = (d) => (changeVal(d) < 0);
  const isEqualToZero = (d) => (changeVal(d) === 0);

  const triangle = d3.symbol()
    .type(d3.symbolTriangle)
    .size(size);
  const square = d3.symbol()
    .type(d3.symbolSquare)
    .size(size);

  const shape = (d) => {
    if (isEqualToZero(d)) return square();
    return triangle();
  };

  const rotationDegree = (d) => {
    const isVerticalMultiplier = vertical ? 2 : 1;

    if (isSmallerThanZero(d)) return -90 * isVerticalMultiplier;
    if (isLargerThanZero(d)) return 90 * (isVerticalMultiplier ** isVerticalMultiplier);
    return 0;
  };
  const shapeColor = (d) => {
    if (isSmallerThanZero(d)) return invertColors ? colors.error : colors.primary;
    if (isLargerThanZero(d)) return invertColors ? colors.primary : colors.error;
    return 'grey';
  };

  const scaleX = (d) => {
    if (isEqualToZero(d)) return 1.4;
    if (vertical) return 1;
    return 0.6;
  };
  const scaleY = (d) => {
    if (isEqualToZero(d)) return 0.4;
    if (vertical) return 0.6;
    return 1;
  };

  element.append('path')
    .attr('d', (d) => shape(d))
    .attr('transform', (d, i) => `translate(${xFunc(d, i)}, ${yFunc(d)}), scale(${scaleX(d)}, ${scaleY(d)}), rotate(${rotationDegree(d)})`)
    .attr('stroke', (d) => shapeColor(d))
    .attr('fill', (d) => shapeColor(d))
    .attr('class', 'comparison');
}

export function smartPercentageChange(comparison, value) {
  const change = ((value - comparison) / comparison) * 100;
  if (
    !Number.isNaN(Number(change))
    && Math.abs(change) < 0.1
  ) {
    return 0;
  }
  if (change === Infinity || Number.isNaN(Number(change))) {
    return '';
  }
  return change;
}

export function roundedRect({
  x, y, width, height, radius, topLeft, topRight, bottomLeft, bottomRight,
}) {
  if (x === null || x === undefined || Number.isNaN(x) || y === null || y === undefined || Number.isNaN(y)) return '';
  let retval;
  retval = `M${x + radius},${y}`; // moving to start coordinates
  retval += `h${width - (2 * radius)}`; // drawing horizontal line w/o corner radius
  if (topRight) {
    retval += `a${radius},${radius} 0 0 1 ${radius},${radius}`; // creating top right rounded
  } else {
    retval += `h${radius}`;
    retval += `v${radius}`;
  }
  retval += `v${height - (2 * radius)}`;
  if (bottomRight) {
    retval += `a${radius},${radius} 0 0 1 ${-radius},${radius}`;
  } else {
    retval += `v${radius}`;
    retval += `h${-radius}`;
  }
  retval += `h${(2 * radius) - width}`;
  if (bottomLeft) {
    retval += `a${radius},${radius} 0 0 1 ${-radius},${-radius}`;
  } else {
    retval += `h${-radius}`;
    retval += `v${-radius}`;
  }
  retval += `v${((2 * radius) - height)}`;
  if (topLeft) {
    retval += `a${radius},${radius} 0 0 1 ${radius},${-radius}`;
  } else {
    retval += `v${-radius}`;
    retval += `h${radius}`;
  }
  retval += 'z';
  return retval;
}

export function comparisonBarRect(x, y, w, h, r) {
  let retval;
  retval = `M${x + r},${y}`;
  retval += `h${w - (2 * r)}`;
  retval += `a${r},${r} 0 0 1 ${r},${r}`;
  retval += `v${h - r}`;
  retval += `a${r},${r} 1 0 0 ${-r},${-r}`;
  retval += `h${(2 * r) - w}`;
  retval += `a${r},${r} 1 0 0 ${-r},${r}`;
  retval += `v${r - h}`;
  retval += `a${r},${r} 0 0 1 ${r},${-r}`;
  retval += 'z';
  return retval;
}
let prevJSONParams = '';

// eslint-disable-next-line sonarjs/cognitive-complexity
export async function showTooltip({
  params, dark = true, isTextLight = false,
} = { fixed: false, dark: true, isTextLight: false }) {
  const {
    dotColor,
    dotLabel,
    primaryLabel,
    primaryValue,
    secondaryAppend,
    secondaryValue,
    secondaryPrepend,
    primaryChangeLabel,
    primaryChange,
    secondaryChangePrepend,
    secondaryChangeLabel,
    secondaryChange,
    changeConsideredZero,
    // everything above this and related should be refactored and removed eventually
    tooltipHTMLFunc,
  } = params;

  const colors = dark ? colorConstants.dark : colorConstants.light;
  d3.select('#app').selectAll('.tooltip')
    .data([params])
    .enter()
    .append('div')
    .classed('tooltip', true);

  const tooltip = d3.select('#app').selectAll('.tooltip')
    .style('position', 'fixed')
    .style('z-index', '999')
    .style('background', '#000000')
    .style('border-radius', '4px')
    .style('box-shadow', '0px 3px 6px rgba(0, 0, 0, 0.161)')
    .style('pointer-events', 'none')
    .style('width', 'fit-content')
    .style('max-width', params.maxWidth || '340px')
    .attr('class', 'px-4 py-2 d-flex flex-column justify-space-around tooltip');

  const { width, height } = tooltip.node().getBoundingClientRect();
  const { clientX, clientY } = window.event;
  const scollOffset = 20;
  const mouseXPadding = 12;
  const mouseYPadding = 18;
  const dotSize = 8;
  const comparisonArrowSize = 40;
  let xPosition = clientX;
  let yPosition = clientY;
  if (xPosition > window.innerWidth - width - scollOffset - mouseXPadding) {
    xPosition = window.innerWidth - width - scollOffset - mouseXPadding;
  }
  if (yPosition > window.innerHeight - height - scollOffset - mouseYPadding) {
    yPosition = window.innerHeight - height - scollOffset - mouseYPadding;
  }
  tooltip.style('left', `${xPosition + mouseXPadding}px`)
    .style('top', `${yPosition + mouseYPadding}px`);
  const JSONParams = JSON.stringify(params);
  if (prevJSONParams === JSONParams) {
    return; // don't re-render if the params are the same, only update position
  }
  prevJSONParams = JSONParams;

  tooltip.selectAll('*').remove();

  // FIRST ROW WITH A DOT
  if (dotLabel || typeof dotLabel === 'number') {
    const row1 = tooltip.append('div');
    row1.append('svg')
      .attr('width', dotSize)
      .attr('height', dotSize)
      .attr('class', 'mr-2')
      .append('circle')
      .attr('cx', dotSize / 2)
      .attr('cy', dotSize / 2)
      .attr('r', dotSize / 2)
      .attr('fill', dotColor);

    const measureLabel = row1
      .append('span')
      .attr('class', 'text-label-small');
    if (isTextLight) measureLabel.style('color', colors.white);
    measureLabel.text(dotLabel);
  }
  // SECOND ROW
  const row2 = tooltip.append('div').attr('class', 'body-2 align-center d-flex');
  if (primaryLabel || typeof primaryLabel === 'number') {
    const valueLabel = row2
      .append('span')
      .attr('class', 'mr-1');
    if (isTextLight) valueLabel.style('color', colors.white);
    if (typeof primaryLabel === 'number') {
      valueLabel.text(formatNumber(primaryValue));
    } else {
      valueLabel.text(primaryLabel);
    }
  }
  if (primaryValue || typeof primaryValue === 'number') {
    const value = row2.append('span').attr('class', 'font-weight-bold');
    if (typeof primaryValue === 'number') {
      value.text(formatNumber(primaryValue));
    } else {
      value.text(primaryValue);
    }
  }
  if (primaryChange || typeof primaryChange === 'number') {
    const comparisonArrow = row2.append('svg').attr('width', 10).attr('height', 10).attr('class', 'ml-2 mr-1');
    drawComparisonArrow(comparisonArrow, comparisonArrowSize, 'comparisonVal1', 'comparisonVal2', () => 5, () => 5, false, true, changeConsideredZero);
  }
  if (primaryChange && (primaryChangeLabel || typeof primaryChangeLabel === 'number')) {
    let textColorClass = 'text-tertiary-dark';
    const isNumericValue = !Number.isNaN(Number(primaryChangeLabel));
    if (!isNumericValue) textColorClass = 'text-error'; // infinity
    if (primaryChangeLabel < 0) textColorClass = 'text-primary';
    if (primaryChangeLabel > 0) textColorClass = 'text-error';
    const value = row2.append('span').attr('class', `mr-2 ${textColorClass}`);
    if (isNumericValue) {
      value.text(`${Math.abs(primaryChangeLabel)}%`);
    } else {
      value.text(`${primaryChangeLabel}`);
    }
  }
  // THIRD ROW
  const row3 = tooltip.append('div').attr('class', 'body-2');
  if (secondaryPrepend || typeof secondaryPrepend === 'number') {
    const valueLabel = row3.append('span').attr('class', 'mr-1');
    valueLabel.text(secondaryPrepend);
  }
  if (secondaryValue || typeof secondaryValue === 'number') {
    const value = row3.append('span').attr('class', 'font-weight-bold ');
    value.text(secondaryValue);
  }
  if (secondaryAppend || typeof secondaryAppend === 'number') {
    const valueLabel = row3.append('span').attr('class', 'ml-1');
    valueLabel.text(secondaryAppend);
  }
  if (secondaryChange && (secondaryChangePrepend || typeof secondaryChangePrepend === 'number')) {
    let textColorClass = 'text-tertiary-dark';
    const isNumericValue = !Number.isNaN(Number(secondaryChangePrepend));
    if (!isNumericValue) textColorClass = 'text-error'; // infinity
    if (secondaryChangeLabel < 0) textColorClass = 'text-primary';
    if (secondaryChangeLabel > 0) textColorClass = 'text-error';
    const value = row3.append('span').attr('class', `mr-2 ${textColorClass}`);
    value.text(`${secondaryChangePrepend}`);
    if (isNumericValue) {
      value.text(`${Math.abs(secondaryChangePrepend)}%`);
    } else {
      value.text(`${secondaryChangePrepend}`);
    }
  }
  if (secondaryChange || typeof secondaryChange === 'number') {
    const comparisonArrow = row3.append('svg').attr('width', 10).attr('height', 10).attr('class', 'ml-2 mr-1');
    drawComparisonArrow(comparisonArrow, comparisonArrowSize, 'comparisonVal1', 'comparisonVal2', () => 5, () => 5, false, true, changeConsideredZero);
  }
  if (secondaryChange && (secondaryChangeLabel || typeof secondaryChangeLabel === 'number')) {
    let textColorClass = 'text-tertiary-dark';
    const isNumericValue = !Number.isNaN(Number(secondaryChangeLabel));
    if (!isNumericValue) textColorClass = 'text-error'; // infinity
    if (secondaryChangeLabel < 0) textColorClass = 'text-primary';
    if (secondaryChangeLabel > 0) textColorClass = 'text-error';
    const value = row3.append('span').attr('class', `mr-2 ${textColorClass}`);
    if (isNumericValue) {
      value.text(`${Math.abs(secondaryChangeLabel)}%`);
    } else {
      value.text(`${secondaryChangeLabel}`);
    }
  }

  // should be refactored into something like this
  if (tooltipHTMLFunc) {
    tooltip.append('div').call(async (selection) => {
      selection.html(`<span>${i18n.global.t('Loading... Please wait')}</span>`);
      const d = await tooltipHTMLFunc(selection.datum());
      selection.html(d);
    });
  }
}

export function hideTooltip() {
  const tooltip = d3.select('#app').selectAll('.tooltip');
  tooltip.classed('d-none', true);
  tooltip.classed('d-flex', false);
}

export function getTextWidth(text, fontSize, fontFace) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = `${fontSize}px ${fontFace}`;
  return context.measureText(text).width;
}

export function leastSquares(xSeries, ySeries) {
  const reduceSumFunc = (prev, cur) => prev + cur;

  const xBar = (xSeries.reduce(reduceSumFunc, 0) * 1.0) / xSeries.length;
  const yBar = (ySeries.reduce(reduceSumFunc, 0) * 1.0) / ySeries.length;

  const ssXX = xSeries.map((d) => (d - xBar) ** 2)
    .reduce(reduceSumFunc, 0);

  const ssYY = ySeries.map((d) => (d - yBar) ** 2)
    .reduce(reduceSumFunc, 0);

  const ssXY = xSeries.map((d, i) => (d - xBar) * (ySeries[i] - yBar))
    .reduce(reduceSumFunc, 0);

  const slope = ssXY / ssXX;
  const intercept = yBar - (xBar * slope);
  const rSquare = (ssXY ** 2) / (ssXX * ssYY);

  return [slope, intercept, rSquare];
}
