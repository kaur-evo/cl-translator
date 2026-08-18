import VerticalBarChart from './VerticalBarChart';

export default function VerticalBarChartModule(superclass) {
  return class extends superclass {
    drawVerticalBarChart(data, options, element) {
      const chart = new VerticalBarChart(this, data, options);
      let targetEl;
      if (element) {
        targetEl = element;
      } else {
        targetEl = this.plot.append('g').attr('class', 'bars-wrapper');
      }
      chart.draw(targetEl, this);
      return chart;
    }
  };
}
