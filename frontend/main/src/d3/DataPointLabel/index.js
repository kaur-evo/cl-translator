import DataPointLabel from './DataPointLabel';

export default function dataPointLabelModule(superclass) {
  return class extends superclass {
    drawDataPointLabel(data, options, element) {
      const chart = new DataPointLabel(this, data, options);
      let targetEl;
      if (element) {
        targetEl = element;
      } else {
        targetEl = this.plot.append('g').attr('class', 'labels-wrapper');
      }
      chart.draw(targetEl, this);
      return chart;
    }
  };
}
