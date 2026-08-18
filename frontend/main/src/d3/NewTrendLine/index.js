import NewTrendLine from './NewTrendLine';

export default function NewTrendLineModule(superclass) {
  return class extends superclass {
    drawNewTrendLine(data, options) {
      const chart = new NewTrendLine(this, data, options);
      chart.draw(this.plot);
      return chart;
    }
  };
}
