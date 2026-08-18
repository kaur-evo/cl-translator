import XAxisHoverLine from './XAxisHoverLine';

export default function XAxisHoverLineModule(superclass) {
  return class extends superclass {
    drawXAxisHoverLine(data, options) {
      const chart = new XAxisHoverLine(this, this.plot, data, options);
      return chart;
    }
  };
}
