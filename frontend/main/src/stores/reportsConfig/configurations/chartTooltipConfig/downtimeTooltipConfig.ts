import type { ChartConfigParams, TooltipRowConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';
import measure from '@/stores/reportsConfig/constants/measure';
import yAxisKey from '@/stores/reportsConfig/constants/yAxisKey';
import calcMeasure from '@/stores/reportsConfig/constants/calcMeasure';
import configType from '@/stores/reportsConfig/constants/configType';
import i18n from '@/services/i18n';
import TooltipConfigBuilder from '@/stores/reportsConfig/configurations/chartTooltipConfig/TooltipConfigBuilder';
import { createRowWithIcon } from '@/stores/reportsConfig/configurations/chartTooltipConfig/tooltipBuilderHelpers';

/**
 * Generates tooltip configuration for Downtime charts.
 * @param params - Chart configuration parameters including Downtime-specific data, grouping, and visible columns
 * @returns Array of tooltip row configurations
 */
export default function getDowntimeConfig({
  data, groupBy, cfgType, granularity, yAxis, yAxisRight, visibleColumns = [],
}: ChartConfigParams<typeof configType.DOWNTIME>): TooltipRowConfig[] {
  const builder = new TooltipConfigBuilder('DOWNTIME');

  builder.addStandardGroupingRows({ data, groupBy, cfgType, granularity, yAxis });

  builder
    .addRow(createRowWithIcon({
      valueKey: measure.STOP_DURATION,
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
      valueKey: measure.STOP_COUNT,
      tooltipValueKey: 'entityCountLabel',
      text: i18n.global.t('stopcount'),
      iconKey: yAxisKey.ENTITY_COUNT,
      axisConfig: { groupBy, yAxis, yAxisRight },
    }))
    .addRow(createRowWithIcon({
      valueKey: measure.NOTES_COUNT,
      tooltipValueKey: 'notesCount',
      text: i18n.global.t('notescount'),
      iconKey: yAxisKey.NOTES_COUNT,
      axisConfig: { groupBy, yAxis, yAxisRight },
    }))
    .addRow(createRowWithIcon({
      valueKey: calcMeasure.ENTITY_PCT_PLANNED_TIME,
      tooltipValueKey: 'entityPctPlannedTimeLabel',
      text: i18n.global.t('% of planned time'),
      iconKey: yAxisKey.ENTITY_PCT_PLANNED_TIME,
      axisConfig: { groupBy, yAxis, yAxisRight },
    }));

  return builder
    .filterByColumns(visibleColumns)
    .filterHidden()
    .build();
}
