import { mdiSquareRounded } from '@mdi/js';

import graphColors from '@/constants/graphColors';
import { isModeVisible, isTargetVisible } from '@/stores/reportsConfig/configurations/productionSpeedCommonFn';
import getUnitIdFormatted from '@/helpers/getUnitIdFormatted';
import colorConstants from '@/constants/colorConstants';

export default class EventMarkerConfig {
  constructor(chartLegendState) {
    this.chartLegendState = chartLegendState;
  }

  getColor = (d) => {
    if (isTargetVisible(d, this.chartLegendState)) return colorConstants.light.black;
    if (isModeVisible(d, this.chartLegendState)) return graphColors['graph-blue'];
    return '';
  };

  getYKey = (d) => {
    if (isModeVisible(d, this.chartLegendState)) return 'containsMode';
    if (isTargetVisible(d, this.chartLegendState)) return 'containsTarget';
    return '';
  };

  showIcon = (d) => isModeVisible(d, this.chartLegendState) && isTargetVisible(d, this.chartLegendState);

  showLabel = (d) => !this.showIcon(d);

  getLabel = (d) => {
    if (isModeVisible(d, this.chartLegendState)) return `${d.modeLabel} ${getUnitIdFormatted(d.groupBy[0], d.unitId)}`;
    if (isTargetVisible(d, this.chartLegendState)) return `${d.targetLabel} ${getUnitIdFormatted(d.groupBy[0], d.unitId)}`;
    return '';
  };

  get() {
    return {
      color: this.getColor,
      xKey: 'groupingKey',
      circleRadius: 9,
      strokeDash: 0,
      strokeWidth: 1,
      hoverEnabled: false,
      mirroredIcon: true,
      hasVerticalLine: true,
      yKey: this.getYKey,
      xScaleBandOffset: true,
      markerVerticalPosition: 'top',
      verticalOffset: 10,
      showIcon: this.showIcon,
      icon: [mdiSquareRounded, mdiSquareRounded],
      iconColor: [colorConstants.light.black, graphColors['graph-blue']],
      iconScaleVal: 0.75,
      showLabel: this.showLabel,
      label: this.getLabel,
    };
  }
}
