import BottomAxisOptions from './BottomAxisOptions';

import { passContext } from '@/d3/helpers/contextUtils';

const TWO_LINE_LABEL_HEIGHT = 32;
const SINGLE_LINE_LABEL_HEIGHT = 16;
export default class BottomAxisBase {
  constructor(element, options, context) {
    if (this.constructor === BottomAxisBase) {
      throw new Error('Abstract class cannot be instantiated directly.');
    }
    if (!(options instanceof BottomAxisOptions)) {
      throw new Error('BottomAxisBaseClass options can only be instance of BottomAxisOptions');
    }
    this.element = element;
    this.options = options;
    this.context = context;
    passContext(context, this, ['xScale', 'colors']);
  }

  everyNthTick = 1;

  latestZoomEv = null;

  getLabelHeight() {
    if (TWO_LINE_LABEL_HEIGHT < Math.round(this.xScale.bandwidth())) {
      return TWO_LINE_LABEL_HEIGHT;
    }
    return SINGLE_LINE_LABEL_HEIGHT;
  }

  setEveryNthTick() {
    const everyNthTick = (Math.ceil(3 / (Math.max(...this.xScale.range()) / (this.options.get('fontSize') * this.xScale.domain().length / 2))));
    if (this.latestZoomEv) {
      this.everyNthTick = Math.round(everyNthTick / (this.latestZoomEv.transform.k / 3));
    } else {
      this.everyNthTick = everyNthTick;
    }
  }

  setTickDisplay(selection, i = null) {
    if (!this.xScale.bandwidth || this.options.get('showAllTicks')) return;
    selection.style('display', 'initial');
    if (i === null) {
      selection.style('display', (d, i2) => {
        if (i2 % this.everyNthTick !== 0) {
          return 'none';
        }
        return 'initial';
      });
    } else if (i % this.everyNthTick !== 0) {
      selection.style('display', 'none');
    }
  }

  applyTickLineStyles(selection, i = null, offset = 0) {
    const lineSelection = selection.select('line');
    lineSelection.style('stroke', this.colors['tertiary-dark']);
    lineSelection.attr('transform', `translate(0, ${offset})`);

    this.setTickDisplay(lineSelection, i);
  }

  applyTickTextAttr(selection, i = null) {
    const tickTextSelection = selection.select('text:not(.secondary-label)');
    tickTextSelection
      .style('text-anchor', 'center')
    // eslint-disable-next-line no-magic-numbers
      .attr('y', this.options.get('fontSize') * 1.2)
      .attr('x', 0);
    this.setTickDisplay(tickTextSelection, i);
  }
}
