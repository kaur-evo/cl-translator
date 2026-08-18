import LineChart from './LineChart';

export default function LineChartModule(superclass) {
  return class extends superclass {
    drawLineChart(data, options, element) {
      const lineChart = new LineChart(this, data, options);
      let targetEl;
      if (element) {
        targetEl = element;
      } else {
        targetEl = this.plot.append('g').attr('class', 'lines-wrapper');
      }
      lineChart.draw(targetEl);
      return lineChart;
    }
  };
}
