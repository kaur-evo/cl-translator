import ComparisonBars from './ComparisonBars';

export default function VerticalBarChartModule(superclass) {
  return class extends superclass {
    drawComparisonBars(data, options) {
      const chart = new ComparisonBars(this, this.plot, data, options);
      return chart.comparisonBars;
    }
  };
}
