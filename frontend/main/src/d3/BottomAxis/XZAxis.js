import BottomAxisBase from './BottomAxisBase';
import BottomAxisMultilineText from './BottomAxisMultilineText';

import { passContext } from '@/d3/helpers/contextUtils';

export default class XZAxis extends BottomAxisBase {
  constructor(element, options, context) {
    super(element, options, context);
    this.element = element;
    this.options = options;
    this.context = context;
    passContext(context, this, ['xScale', 'colors', 'isDark']);
  }

  everyNthTick = 1;

  applyTickLine(selection) {
    const tickHeight = 8;
    selection.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', tickHeight)
      .attr('stroke', this.colors['tertiary-dark']);
  }

  setEveryNthTick(scale) {
    this.everyNthTick = (Math.ceil(3 / (Math.max(...scale.range()) / (this.options.get('fontSize') * scale.domain().length / 2))));
  }

  onEnter(enter, xzScale, isDragEv) {
    const enterG = enter
      .append('g')
      .attr('transform', (d) => `translate(${xzScale(d) + (xzScale.bandwidth() / 2)}, 0)`)
      .attr('class', 'xz-tick');

    this.applyTickLine(enterG);

    if (this.options.get('multiLineLabelsEnabled') && !isDragEv) {
      this.secondaryAxisMultilineText = new BottomAxisMultilineText(enterG, this.options.clone().update({
        labelHeight: this.getLabelHeight(),
        diagonalLabels: this.options.get('xzAxisDiagonalLabels'),
        widthPerBar: xzScale.bandwidth(),
        dataMap: this.options.get('xzAxisDataMap'),
        textFn: this.options.get('xzAxisLabelFn'),
        isSecondRow: false,
        definedKey: this.options.get('definedKey'),
        diagonalLabelWidth: this.options.get('labelWidth'),
        everyNthTick: this.everyNthTick,
      }));
      this.secondaryAxisMultilineText.replaceTickTextWithMultiline();
    } else {
      enterG.append('text')
        .attr('x', 0)
        // eslint-disable-next-line no-magic-numbers
        .attr('y', 20)
        .attr('font-size', this.options.get('fontSize'))
        .attr('font-family', 'Open Sans, sans-serif')
        .attr('fill', this.isDark ? this.colors.white : this.colors.black)
        .text((d) => d);
    }

    this.setTickDisplay(enterG, null, true);

    this.applyTickLineStyles(enterG, null);
    this.applyTickTextAttr(enterG, null, true);

    return enterG;
  }

  apply(selection, isDragEv, scale) {
    selection.selectAll('.xz-axis').remove();
    if (!this.options.get('xzAxisEnabled')) return;

    this.setEveryNthTick(scale);

    selection.append('g')
      .attr('class', 'xz-axis')
      .attr('transform', `translate(${-this.xScale.bandwidth() / 2}, 0)`)
      .selectAll('.xz-tick')
      .data(scale.domain())
      .join(
        (enter) => {
          this.onEnter(enter, scale, isDragEv);
        },
      );
  }
}
