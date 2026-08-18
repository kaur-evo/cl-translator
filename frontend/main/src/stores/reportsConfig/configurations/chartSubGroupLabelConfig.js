import configType from '@/stores/reportsConfig/constants/configType';
import yAxisKey from '@/stores/reportsConfig/constants/yAxisKey';

const getDecimalsShown = (barWidth) => {
  const twoDecimalThreshold = 65; // px
  const oneDecimalThreshold = 55; // px
  if (barWidth > twoDecimalThreshold) return 2;
  if (barWidth > oneDecimalThreshold) return 1;
  return 0;
};

export default function getChartSubGroupLabelConfig({
  cfgType, yAxis, isCompact, barWidth,
}) {
  if (isCompact) return null;
  switch (cfgType) {
    case configType.CHECKLIST:
      if (yAxis === yAxisKey.ENTITY_COUNT_PCT) {
        return `entityCountPctFormatted-${getDecimalsShown(barWidth)}`;
      }
      if (yAxis === yAxisKey.ENTITY_COUNT) {
        return 'entityCount';
      }
      return null;
    case configType.TIME_USAGE:
      if (yAxis === yAxisKey.VALUE) {
        return `valueFormatted-${getDecimalsShown(barWidth)}`;
      }
      if (yAxis === yAxisKey.PCT_OF_PLANNED_TIME) {
        return `pctOfPlannedTimeFormatted-${getDecimalsShown(barWidth)}`;
      }
      if (yAxis === yAxisKey.DURATION) {
        return 'durationFormatted';
      }
      return null;
    default:
      return null;
  }
}
