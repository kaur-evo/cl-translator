import configType from '@/stores/reportsConfig/constants/configType';
import yAxisKey from '@/stores/reportsConfig/constants/yAxisKey';

export default function getChartLegendConfig({
  formattedEntry, groupId, cfgType, requirements,
}) {
  if (cfgType === configType.CHECKLIST && requirements.yAxis === yAxisKey.AVG_TIME_VAL) {
    return {
      color: formattedEntry.color,
      text: requirements.translations.AverageTime,
    };
  }
  return {
    color: formattedEntry.color,
    text: formattedEntry.entityGroupName ?? groupId,
  };
}
