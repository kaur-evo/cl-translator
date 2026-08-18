import AreaChart from './AreaChart';

export default function AreaChartModule(superclass) {
  return class extends superclass {
    drawAreaChart(data, options) {
      const chart = new AreaChart(this, data, options);
      chart.draw(this.plot);
      return chart;
    }
  };
}
