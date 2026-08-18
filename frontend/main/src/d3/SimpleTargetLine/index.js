import SimpleTargetLine from './SimpleTargetLine';

export default function SimpleTargetLineModule(superclass) {
  return class extends superclass {
    drawSimpleTargetLine(data, options) {
      const chart = new SimpleTargetLine(this, this.plot, data, options);
      return chart.simpleTargetLine;
    }
  };
}
