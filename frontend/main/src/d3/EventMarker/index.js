import EventMarker from './EventMarker';

export default function EventMarkerModule(superclass) {
  return class extends superclass {
    drawEventMarker(data, options) {
      const chart = new EventMarker(this, data, options);
      chart.draw(this.plot, this);
      return chart;
    }
  };
}
