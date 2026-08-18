import DotPlotChart from './DotPlot';

export default function DotPlotModule(superclass) {
  return class extends superclass {
    drawDotPlotChart(data, options, element) {
      const dotPlotChart = new DotPlotChart(this, data, options);
      let targetEl;
      if (element) {
        targetEl = element;
      } else {
        targetEl = this.plot.append('g').attr('class', 'dot-plot-wrapper');
      }
      dotPlotChart.draw(targetEl, this);
      return dotPlotChart;
    }
  };
}
