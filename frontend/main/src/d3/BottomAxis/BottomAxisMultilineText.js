import BottomAxisOptions from './BottomAxisOptions';

import leaf from '@/helpers/object/leaf';
import getObjVal from '@/d3/helpers/getObjVal';
import colorConstants from '@/constants/colorConstants';

export default class BottomAxisMultilineText {
  constructor(selection, options) {
    if (!(options instanceof BottomAxisOptions)) {
      throw new Error('BottomAxisBaseClass options can only be BottomAxisOptions.');
    }
    this.selection = selection;
    this.options = options;
  }

  replaceTickTextWithMultiline() {
    this.selection.selectAll('.foreignObj').remove();
    this.selection.selectAll('.foreign-obj').remove();
    this.selection.selectAll('text').remove();
    this.appendTickLabelText();
  }

  appendTickLabelText() {
    if (this.options.get('useLegacyLabels') && !this.options.get('diagonalLabels')) {
      this.appendLegacyText();
    } else {
      this.appendHTMLFormattedText();
    }
  }

  appendLegacyText() {
    this.selection.append('text')
      .attr('transform', `translate(0, ${this.options.get('labelVerticalOffset')})`)
      .attr('text-anchor', 'middle')
      .attr('fill', (d) => this.getLegacyLabelTextColor(d))
      .text((d) => `${this.options.get('textFn')(this.getDataObj(d) ?? '')}`);
  }

  getLabelYTransform = () => (this.options.get('isSecondRow') ? this.options.get('labelVerticalOffset') + this.options.get('secondaryLabelsHeight') : this.options.get('labelVerticalOffset'));

  getClassForHTMLFormattedText = (d) => `text-body-small ${this.getLabelTextColor(d)} ${this.getJustifyAlign()} d-flex`;

  getHTMLContentForHTMLFormattedText = (d) => `${this.options.get('textFn')(this.getDataObj(d) ?? '')}`;

  appendHTMLFormattedText() {
    this.selection.append('svg:foreignObject')
      .attr('transform', `translate(${this.getLabelXPosition()}, ${this.getLabelYTransform()}) rotate(${this.getLabelRotation()}, ${0}, ${0})`)
      .attr('class', 'foreign-obj')
      .attr('width', this.getLabelWidth())
      .attr('height', this.options.get('labelHeight'))
      .attr('x', 0)
      .attr('y', 0)
      .append('xhtml:div')
      .attr('class', this.getClassForHTMLFormattedText)
      .append('xhtml:span')
      .style('text-align', 'left')
      .attr('class', this.getEllipsisTypeClass)
      .html(this.getHTMLContentForHTMLFormattedText);
  }

  getLabelWidth = () => {
    if (this.options.get('diagonalLabels')) {
      return this.options.get('diagonalLabelWidth');
    }
    return this.options.get('widthPerBar') * this.options.get('everyNthTick');
  };

  getLabelRotation = () => {
    if (this.options.get('diagonalLabels')) {
      // eslint-disable-next-line no-magic-numbers
      return 45;
    }
    return 0;
  };

  getLabelXPosition = () => {
    if (this.options.get('diagonalLabels')) {
      return 2; // some offset for diagonal text to visually align better with tick
    }
    return -(this.options.get('widthPerBar') * this.options.get('everyNthTick')) / 2;
  };

  getJustifyAlign = () => {
    if (this.options.get('diagonalLabels')) {
      return 'justify-start';
    }
    return 'justify-center text-center';
  };

  getEllipsisTypeClass = () => {
    if (this.options.get('diagonalLabels') && this.options.get('widthPerBar') < this.options.get('labelHeight')) {
      return 'text-truncate';
    }
    return 'line-clamp-2 hyphenate';
  };

  getDefined = (d) => {
    if (!this.options.get('definedKey')) return true;
    const definedVal = leaf(this.getDataObj(d), this.options.get('definedKey'));
    return definedVal !== null && definedVal !== undefined && definedVal !== false;
  };

  getLabelTextColor(d) {
    return this.getDefined(d) ? 'text-primary-text' : 'text-secondary-dark';
  }

  getLegacyLabelTextColor(d) {
    return this.getDefined(d) ? colorConstants.light.black : '#b3b3b3';
  }

  getDataObj(d) {
    const map = this.options.get('dataMap');
    return getObjVal(d, map);
  }
}
