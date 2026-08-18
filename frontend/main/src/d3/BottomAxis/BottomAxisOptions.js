import Options from '@/d3/helpers/Options';

const defaults = {
  labelKey: 'measureLabel',
  labelFunc: null,
  dataKey: 'data',
  xScaleKey: 'xScale',
  xzScaleKey: 'xzScale',
  fontSize: 12,
  scaleType: 'scaleBand',
  axisValueKey: null,
  gradientColor: null,
  showAllTicks: false,
  data: [],
  hideTickLabels: false,
  multiLineLabelsEnabled: false,
  diagonalLabels: false,
  useLegacyLabels: false,
  definedKey: null,
  xzAxisLabelFn: (d) => d,
  xzAxisDiagonalLabels: false,
  tickSizeInner: 8,
  labelWidth: 110,
  labelVerticalOffset: 10,
  secondaryLabelsHeight: 0,
  xAxisDataMap: null,
  xzAxisDataMap: null,
  xzAxisEnabled: false,
  widthPerBar: 0,
  labelHeight: 0,
  dataMap: null,
  textFn: null,
  isSecondRow: false,
  diagonalLabelWidth: 0,
  everyNthTick: 1,
  tickFormat: null,
  useRegularFormat: false,
  timezone: null,
  offsetPrimaryTicks: false,
};

export default class BottomAxisOptions extends Options {
  constructor(options) {
    super(options, defaults);
  }

  clone() {
    return new BottomAxisOptions(this.options);
  }
}
