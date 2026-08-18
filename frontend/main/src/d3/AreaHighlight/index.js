import AreaHighlight from './AreaHighlight';

export default function AreaHighlightModule(superclass) {
  return class extends superclass {
    drawAreaHighlight(data, options) {
      const chart = new AreaHighlight(this, data, options);
      chart.draw(this.plot);
      return chart;
    }
  };
}
