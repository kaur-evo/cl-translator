import * as d3 from 'd3';
import isFunction from 'lodash/isFunction';

import { ZOOM_DURATION } from '@/d3/constants';
import isMoveEvent from '@/d3/helpers/isMoveEvent';

function addCircle(el, size, strokeWidth, color, strokeColor, className = '', x = 0, y = 0) {
  return el.append('circle')
    .attr('class', className)
    .attr('r', size)
    .attr('fill', color)
    .attr('stroke', strokeColor)
    .attr('stroke-width', strokeWidth)
    .attr('fill', color)
    .attr('cx', x)
    .attr('cy', y);
}

export default class XAxisHoverLine {
  options = {
    color: '#ffab00',
    circleColors: ['#F28A0D', '#FDF502', '#2ECC71'],
    circleFillColors: ['#FFF', '#FFF', '#FFF'],
    strokeWidth: '2px',
    opacity: '1',
    xKey: '',
    xKey2: '',
    yKey: ['value', 'value', 'value'],
    xScaleKey: 'xScale',
    yScaleKey: ['yScale'],
    xScaleBandOffset: false,
    scaleType: 'scaleBand',
    circleSize: 3,
    circleStroke: 2,
    bisect: 'right',
    strokeDash: '5',
    showHighlight: false,
    showLine: true,
    showDataPoints: true,
    highlightColor: '',
    clickEnabled: false,
  };

  constructor(ctx, element, data, options) {
    this.options = Object.assign(this.options, options);
    this.data = data;
    this.xScale = ctx[this.options.xScaleKey];
    this.setYScales(ctx);
    this.colorScale = d3.scaleOrdinal(d3.schemeDark2);
    this.xScaleFactor = 1;
    this.yScaleFactor = 1;
    this.context = ctx;
    this.options.highlightColor = options.highlightColor || 'var(--color-12-primary)';
    this.drawAxisHoverLine(element);
  }

  setYScales(ctx) {
    this.yScales = this.options.yScaleKey.map((key) => (ctx ? ctx[key] : this.context[key]));
  }

  getYScale(idx) {
    let ret;
    if (this.yScales[idx] === undefined) {
      ret = this.yScales[this.yScales.length - 1];
    } else {
      ret = this.yScales[idx];
    }
    return ret;
  }

  get mouseOffset() {
    if (this.options.xScaleBandOffset) {
      return ((this.xScale.step() * this.xScale.padding()) + (this.xScale.bandwidth() / 2)) / this.xScaleFactor;
    }
    return 0;
  }

  addMouseLine(g) {
    if (this.options.showHighlight) {
      this.highlightRect = g.append('rect')
        .style('opacity', this.options.opacity)
        .attr('fill', this.options.highlightColor)
        .lower();
    }
    if (this.options.showLine) {
      this.verticalMouseLine = g.append('path') // create vertical line to follow mouse
        .attr('class', 'mouse-line')
        .style('stroke', this.options.color)
        .style('stroke-width', this.options.strokeWidth)
        .style('opacity', this.options.opacity)
        .style('stroke-dasharray', this.options.strokeDash)
        .style('vector-effect', 'non-scaling-stroke');

      if (this.options.xKey2) {
        this.verticalMouseLine2 = g.append('path') // create vertical line to follow mouse
          .attr('class', 'mouse-line')
          .style('stroke', this.options.color)
          .style('stroke-width', this.options.strokeWidth)
          .style('opacity', this.options.opacity)
          .style('stroke-dasharray', this.options.strokeDash)
          .style('vector-effect', 'non-scaling-stroke');
      }
    }
  }

  showHighlight() {
    if (this.options.showHighlight) {
      this.highlightRect.style('opacity', 1);
    }
  }

  hideHighlight() {
    if (this.options.showHighlight) {
      this.highlightRect.style('opacity', 0);
    }
  }

  hideMouseLine() {
    if (this.options.showLine) {
      this.verticalMouseLine.style('opacity', 0);
      if (this.options.xKey2) {
        this.verticalMouseLine2.style('opacity', 0);
      }
    }
  }

  showMouseLine() {
    if (this.options.showLine) {
      this.verticalMouseLine.style('opacity', 1);
      if (this.options.xKey2) {
        this.verticalMouseLine2.style('opacity', 1);
      }
    }
  }

  innerCircleColor(d, i) {
    if (this.options.circleFillColors[i]) {
      if (isFunction(this.options.circleFillColors[i])) {
        return this.options.circleFillColors[i](d);
      }
      return this.options.circleFillColors[i];
    }
    return '#FFF';
  }

  outerCircleColor(d, i) {
    if (this.options.circleColors[i]) {
      if (isFunction(this.options.circleColors[i])) {
        return this.options.circleColors[i](d);
      }
      return this.options.circleColors[i];
    }
    return this.colorScale(i);
  }

  update(data) {
    const vm = this;
    this.data = data;
    this.xScale = this.context[this.options.xScaleKey];
    this.setYScales(this.context);
    this.mousePerLine = this.elementRef
      .selectAll('.mouse-per-line')
      .data(data);

    const perLineEnter = this.mousePerLine.enter()
      .append('g')
      .attr('class', 'mouse-per-line')
      .style('opacity', 0);
    if (this.options.showDataPoints) {
      // .merge(this.mousePerLine)
      // eslint-disable-next-line func-names
      perLineEnter.each(function (d, i) {
        vm.perLineCircles = addCircle(
          d3.select(this),
          vm.options.circleSize,
          vm.options.circleStroke,
          vm.innerCircleColor(d, i),
          vm.outerCircleColor(d, i),
          'per-line-circle',
        );
      });
    }
    this.mousePerLine.exit().remove();
    this.updateMouseHoverArea(vm.context);
  }

  hidePerLineCircles() {
    if (this.options.showDataPoints) {
      this.mousePerLine.style('opacity', 0);
    }
  }

  showPerLineCircles() {
    if (this.options.showDataPoints) {
      this.mousePerLine.style('opacity', 1);
    }
  }

  getClosestBandIndex(dataset, x) {
    const eachBand = this.xScale.step() / this.xScaleFactor;
    const index = Math.round((x / eachBand));
    if (index < 0) return 0;
    if (index > dataset.length - 1) {
      return dataset.length - 1;
    }
    return index;
  }

  updatePosition(ctx, mouse) {
    const vm = this;
    const [mouseXPos] = mouse;
    this.mousePerLine
      .attr('transform', (currDataSet, dataSetIndex) => {
        vm.xScale = ctx[vm.options.xScaleKey];
        vm.setYScales(ctx);
        const scaleBandOffset = vm.options.xScaleBandOffset ? vm.xScale.bandwidth() / 2 : 0;
        let closestXVal;
        let idx;
        if (vm.options.scaleType === 'scaleBand') {
          idx = vm.getClosestBandIndex(currDataSet, mouseXPos - vm.mouseOffset);
        } else {
          closestXVal = vm.xScale.invert(mouseXPos);
          const bisect = d3.bisector((d) => d[vm.options.xKey])[vm.options.bisect]; // retrieve row index of date on parsed csv
          idx = bisect(currDataSet, closestXVal);
        }

        const currentItem = currDataSet[idx];
        if (!currentItem) {
          return 'translate(-999,-999)';
        }
        const xPosition = (vm.xScale(currentItem[vm.options.xKey]) + scaleBandOffset);

        const yVal = currentItem[vm.options.yKey[dataSetIndex]];
        const yPosition = vm.getYScale(dataSetIndex)(yVal / this.yScaleFactor || 0);
        if (this.options.showLine) {
          vm.verticalMouseLine
            .attr('d', () => {
              let shape = `M${xPosition},${ctx.height}`;
              shape += ` ${xPosition},${0}`;
              return shape;
            });
          if (vm.options.xKey2) {
            const xPosition2 = vm.xScale(currentItem[vm.options.xKey2]) + scaleBandOffset;
            vm.verticalMouseLine2
              .attr('d', () => {
                let shape = `M${xPosition2},${ctx.height}`;
                shape += ` ${xPosition2},${0}`;
                return shape;
              });
            return `translate(${mouseXPos},${yPosition}) scale( ${1 / this.xScaleFactor},${1 / this.yScaleFactor})`;
          }
        }

        if (vm.options.showHighlight) {
          vm.highlightRect
            .attr('x', (xPosition - this.xPosition - (vm.xScale.step() / 2)) / this.xScaleFactor)
            .attr('y', 0)
            .attr('height', vm.getYScale(0)(0))
            .attr('width', vm.xScale.step() / this.xScaleFactor);
        }

        return `translate(${xPosition},${yPosition}) scale( ${1 / this.xScaleFactor},${1 / this.yScaleFactor})`;
      });
  }

  zoom({
    kx, ky, x, y, k,
  }, event) {
    this.xPosition = x || 0;
    this.yPosition = y || 0;
    this.xScaleFactor = kx || k || 1;
    this.yScaleFactor = ky || k || 1;
    this.setYScales();
    const isDragEv = isMoveEvent(event);
    const transitionDur = isDragEv ? 0 : ZOOM_DURATION;
    this.elementRef
      .transition()
      .duration(transitionDur)
      .attr('transform', () => `translate(${this.xPosition},${this.yPosition}) scale( ${this.xScaleFactor},${this.yScaleFactor})`);
    this.mousePerLine
      .attr('transform', () => `translate(${0},${this.getYScale(0)(0) / 2}) scale( ${1 / this.xScaleFactor},${1 / this.yScaleFactor})`);
  }

  zoomUpdate(xEvent, yEvent = null, ctx = null) {
    if (xEvent && xEvent.transform && xEvent.transform.k) {
      this.xScaleFactor = xEvent.transform.k;
    }
    if (yEvent && yEvent.transform && yEvent.transform.k) {
      this.yScaleFactor = yEvent.transform.k;
      this.setYScales(ctx);
    }
    this.elementRef
      .attr('transform', () => `translate(${this.xPosition || xEvent.transform.x},${this.yPosition || 0}) scale( ${this.xScaleFactor},${this.yScaleFactor})`);
    this.mousePerLine
      .attr('transform', () => `translate(${0},${this.getYScale(0)(0) / 2}) scale( ${1 / this.xScaleFactor},${1 / this.yScaleFactor})`);
  }

  onMouseMove(ctx) {
    const vm = this;
    // eslint-disable-next-line func-names
    return function (event) {
      if (vm.options.clickEnabled) {
        d3.select(this).style('cursor', 'pointer');
      }
      vm.showMouseLine();
      vm.showHighlight();
      vm.showPerLineCircles();
      const mouse = d3.pointer(event, this);
      vm.updatePosition(ctx, mouse);
      if (vm.onMouseMove) {
        let closestXVal;
        let idx;
        if (vm.options.scaleType === 'scaleTime') {
          closestXVal = vm.xScale.invert(mouse[0]);
          const bisect = d3.bisector((d) => d[vm.options.xKey])[vm.options.bisect];
          idx = bisect(vm.data[0], closestXVal);
        } else {
          idx = vm.getClosestBandIndex(vm.data[0], mouse[0] - vm.mouseOffset); // use 'invert' to get date corresponding to distance from mouse position relative to svg
        }

        vm.currentItems = vm.data.map((dataSet) => dataSet[idx]);
        // eslint-disable-next-line func-names
        vm.mousePerLine.each(function (d, i) {
          const line = d3.select(this);
          line.selectAll('.per-line-circle')
            .attr('stroke', () => vm.outerCircleColor(vm.currentItems[i], i))
            .attr('fill', () => vm.innerCircleColor(vm.currentItems[i], i));
        });
        vm.onMouseMove(event, vm.currentItems);
      }
    };
  }

  calculateLeftPad() {
    if (this.options.xScaleBandOffset) {
      return (this.xScale.step() * this.xScale.paddingOuter() * this.xScale.align()) / this.xScaleFactor;
    }
    return 0;
  }

  drawMouseHoverArea() {
    const vm = this;
    this.leftPad = this.calculateLeftPad();
    this.mouseArea = this.elementRef.append('rect') // append a rect to catch mouse movements on canvas
      .attr('width', vm.context.width - (2 * this.leftPad))
      .attr('x', `${this.leftPad}px`)
      .attr('height', Math.max(...this.getYScale(0).range()))
      .attr('class', 'hover-area')
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      // eslint-disable-next-line func-names
      .on('mouseout', function () {
        d3.select(this).style('cursor', 'default');
        vm.hideMouseLine();
        vm.hideHighlight();
        vm.hidePerLineCircles();
        if (vm.onMouseOut) vm.onMouseOut();
      })
      .on('mouseover', () => {
        vm.showMouseLine();
        vm.showHighlight();
        vm.showPerLineCircles();
      })
      .on('mousedown', () => {
        vm.hideMouseLine();
        vm.hideHighlight();
        vm.hidePerLineCircles();
      })
      .on('mouseup', () => {
        vm.showMouseLine();
        vm.showHighlight();
        vm.showPerLineCircles();
      })

      .on('mousemove', this.onMouseMove(vm.context))
      .on('wheel', this.onMouseMove(vm.context));
  }

  updateMouseHoverArea() {
    this.leftPad = this.calculateLeftPad();
    this.mouseArea
      .attr('width', this.context.width - (2 * this.leftPad))
      .attr('x', `${this.leftPad}px`)
      .attr('height', Math.max(...this.getYScale(0).range()));
  }

  drawAxisHoverLine(element) {
    this.elementRef = element.append('g')
      .attr('class', 'mouse-over-effects');

    this.addMouseLine(this.elementRef);
    this.drawMouseHoverArea();
    this.update(this.data);

    if (this.options.clickEnabled) {
      this.addMouseClickEvent();
    }
  }

  onHoverHighlightClick(ctx) {
    const vm = this;
    // eslint-disable-next-line func-names
    return function () {
      const data = vm.currentItems;
      ctx.onHoverHighlightClick(data);
    };
  }

  addMouseClickEvent() {
    this.mouseArea.on('click', this.onHoverHighlightClick(this.context));
  }
}
