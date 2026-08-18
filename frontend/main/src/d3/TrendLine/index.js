import TrendLine from './TrendLine';

export default function TrendLineModule(superclass) {
  return class extends superclass {
    drawTrendLine(data, options) {
      const chart = new TrendLine(this, data, options);
      chart.draw(this.plot);
      return chart;
    }
  };
}
