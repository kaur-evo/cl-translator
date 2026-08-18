import BottomAxis from './BottomAxis';
import BottomAxisOptions from './BottomAxisOptions';

export default function bottomAxisModule(superclass) {
  return class extends superclass {
    createBottomAxis(_options) {
      const options = new BottomAxisOptions(_options);
      const chart = new BottomAxis(this.bottomAxis, options, this);
      return chart;
    }
  };
}
