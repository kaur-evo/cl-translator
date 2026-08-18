export default class DotChart {
  options = {
    xKey: 0,
    yVal: 0,
    radius: 0,
    colorKey: 'color',
    xScaleKey: 'xScale',
    yScaleKey: 'yScale',
    xScaleBandOffset: false,
    hoverEnabled: true,
  };

  constructor(ctx, data, options) {
    this.options = Object.assign(this.options, options);
    this.data = data;
    this.xScale = ctx[this.options.xScaleKey];
    this.yScale = ctx[this.options.yScaleKey];
    this.scaleFactor = 1;
    this.scaleBandOffset = this.options.xScaleBandOffset ? ctx.xScale.bandwidth() / 2 : 0;
  }

  draw(targetEl, ctx) {
    if (this.options.targetEl) {
      this.elementRef = this.options.targetEl;
    } else {
      this.elementRef = targetEl.append('g').attr('class', 'zero-dots');
    }
    this.update(this.data);
    if (this.options.hoverEnabled) {
      this.addMouseOverAnimations(ctx);
    }
  }

  zoomUpdate(event) {
    if (event && event.transform && event.transform.k) {
      this.scaleFactor = event.transform.k;
      this.elementRef.selectAll('.dot')
        .attr('transform', (d) => `translate(${this.xScale(d[this.options.xKey]) + (this.scaleBandOffset * this.scaleFactor)},${this.options.yVal})`);
    }
  }

  update(data) {
    this.dots = this.elementRef
      .selectAll('.dot')
      .data(data);

    this.dotEnter = this.dots
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('transform', (d) => `translate(${this.xScale(d[this.options.xKey]) + (this.scaleBandOffset * this.scaleFactor)},${this.options.yVal})`)
      .attr('r', this.options.radius)
      .attr('fill', (d) => d[this.options.colorKey]);
  }

  addMouseOverAnimations(ctx) {
    this.dotEnter.on('mousemove', this.onDotMouseMove(this, ctx));
    this.dotEnter.on('mouseout', this.onDotMouseLeave(this, ctx));
  }


  onDotMouseMove(vm, ctx) {
    // eslint-disable-next-line func-names
    return function (mouseEv, item) {
      if (ctx.onDotMouseMove) ctx.onDotMouseMove(mouseEv, item, this);
    };
  }


  onDotMouseLeave(vm, ctx) {
    // eslint-disable-next-line func-names
    return function () {
      if (ctx.onDotMouseLeave) ctx.onDotMouseLeave();
    };
  }
}
