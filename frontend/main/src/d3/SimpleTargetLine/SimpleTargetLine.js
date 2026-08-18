export default class SimpleTargetLine {
  options = {
    color: '#fff',
    strokeWidth: '2px',
    strokeDash: '0',
    hoverStrokeWidth: '15px',
    xKey: 'measure',
    yKey: 'value',
    xScaleKey: 'xScale',
    yScaleKey: 'yScale',
  };

  data = [];

  constructor(ctx, element, data, options) {
    this.options = Object.assign(this.options, options);
    this.data = data;
    this.xScale = ctx[this.options.xScaleKey];
    this.yScale = ctx[this.options.yScaleKey];
    this.width = ctx.width;
    this.drawTargetLine(element, ctx);
  }

  drawTargetLine(targetEl, ctx) {
    this.addTargetLine(targetEl);
    this.addMouseOverAnimations(ctx);
  }

  addTargetLine(targetEl) {
    const yPosition = this.yScale(this.data.value) || 0;
    // one for pretty line and one for invisible fat hover area
    const targetdata = [this.data, this.data];
    this.simpleTargetLine = targetEl.append('g')
      .selectAll('.targetgoal')
      .data(targetdata)
      .enter()
      .append('line')
      .attr('class', 'targetgoal')
      .attr('x1', this.data.xStartVal || 0)
      .attr('x2', this.data.xEndVal || this.width)
      .attr('y1', yPosition)
      .attr('y2', yPosition)
      .attr('stroke-dasharray', this.data.strokeDash || this.options.strokeDash)
      .style('vector-effect', 'non-scaling-stroke')
      .style('stroke-width', (d, i) => {
        if (i === 1) return this.options.hoverStrokeWidth;
        return this.data.strokeWidth || this.options.strokeWidth;
      })
      .style('stroke', (d, i) => {
        if (i === 1) return 'transparent';
        return this.data.color || this.options.color;
      });
  }

  addMouseOverAnimations(ctx) {
    this.simpleTargetLine.on('mousemove', this.onTargetLineMouseMove(this, ctx));
    this.simpleTargetLine.on('mouseout', this.onTargetLineMouseLeave(this, ctx));
  }


  onTargetLineMouseMove(vm, ctx) {
    // eslint-disable-next-line func-names
    return function (mouseEv, item) {
      if (ctx.onTargetLineMouseMove) ctx.onTargetLineMouseMove(mouseEv, item, this);
    };
  }


  onTargetLineMouseLeave(vm, ctx) {
    // eslint-disable-next-line func-names
    return function () {
      if (ctx.onTargetLineMouseLeave) ctx.onTargetLineMouseLeave();
    };
  }
}
