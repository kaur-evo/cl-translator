import VerticalAxis from './VerticalAxis';

export default function VerticalAxisModule(superclass) {
  return class extends superclass {
    createVerticalAxis(options) {
      const chart = new VerticalAxis(this.verticalAxes, this, options);
      return chart;
    }
  };
}
