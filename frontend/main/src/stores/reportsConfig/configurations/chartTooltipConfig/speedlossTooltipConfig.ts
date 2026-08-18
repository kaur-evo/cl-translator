import type { ChartConfigParams, TooltipRowConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';
import TooltipConfigBuilder from '@/stores/reportsConfig/configurations/chartTooltipConfig/TooltipConfigBuilder';
import { createRowWithIcon } from '@/stores/reportsConfig/configurations/chartTooltipConfig/tooltipBuilderHelpers';
import measure from '@/stores/reportsConfig/constants/measure';
import yAxisKey from '@/stores/reportsConfig/constants/yAxisKey';
import calcMeasure from '@/stores/reportsConfig/constants/calcMeasure';
import configType from '@/stores/reportsConfig/constants/configType';
import i18n from '@/services/i18n';

/**
 * Generates tooltip configuration for Speedloss charts.
 * @param params - Chart configuration parameters including Speedloss-specific data, grouping, and visible columns
 * @returns Array of tooltip row configurations
 */
export default function getSpeedlossConfig({
  data, groupBy, cfgType, granularity, yAxis, yAxisRight, visibleColumns = [],
}: ChartConfigParams<typeof configType.SPEEDLOSS>): TooltipRowConfig[] {
  const builder = new TooltipConfigBuilder('SPEEDLOSS');

  builder.addStandardGroupingRows({ data, groupBy, cfgType, granularity, yAxis });

  builder
    .addRow(createRowWithIcon({
      valueKey: measure.PERFORMANCE_LOSS_DURATION,
      tooltipValueKey: 'valueLabel',
      text: i18n.global.t('Duration'),
      iconKey: yAxisKey.VALUE,
      axisConfig: { groupBy, yAxis, yAxisRight },
    }))
    .addRow(createRowWithIcon({
      valueKey: calcMeasure.AVG_DURATION,
      tooltipValueKey: 'avgDurationFormatted',
      text: i18n.global.t('Average duration'),
      iconKey: yAxisKey.AVG_DURATION_VAL,
      axisConfig: { groupBy, yAxis, yAxisRight },
    }))
    .addRow(createRowWithIcon({
      valueKey: measure.PERFORMANCE_LOSS_COUNT,
      tooltipValueKey: 'entityCountLabel',
      text: i18n.global.t('stopcount'),
      iconKey: yAxisKey.ENTITY_COUNT,
      axisConfig: { groupBy, yAxis, yAxisRight },
    }))
    .addRow(createRowWithIcon({
      valueKey: measure.NOTES_COUNT,
      tooltipValueKey: yAxisKey.NOTES_COUNT,
      text: i18n.global.t('notescount'),
      iconKey: yAxisKey.NOTES_COUNT,
      axisConfig: { groupBy, yAxis, yAxisRight },
    }));

  return builder
    .filterByColumns(visibleColumns)
    .filterHidden()
    .build();
}
