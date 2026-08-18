import DotChart from './DotChart';

export default function DotChartModule(superclass) {
  return class extends superclass {
    drawDotChart(data, options) {
      const dotChart = new DotChart(this, data, options);
      dotChart.draw(this.plot, this);
      return dotChart;
    }
  };
}
