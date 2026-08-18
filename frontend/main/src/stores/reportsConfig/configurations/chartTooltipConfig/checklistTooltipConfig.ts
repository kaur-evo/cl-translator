import i18n from '@/services/i18n';
import measure from '@/stores/reportsConfig/constants/measure';
import yAxisKey from '@/stores/reportsConfig/constants/yAxisKey';
import calcMeasure from '@/stores/reportsConfig/constants/calcMeasure';
import preprocessorGroupType from '@/stores/reportsConfig/constants/preprocessorGroupType';
import configType from '@/stores/reportsConfig/constants/configType';
import {
  getChecklistLabelConfig,
  getChecklistValueConfig,
} from '@/stores/reportsConfig/configurations/chartTooltipConfig/checklistTooltipBaseConfig';
import { isHighestLevel } from '@/stores/reportsConfig/configurations/chartTooltipConfig/helpers/groupingHelpers';
import TooltipConfigBuilder from '@/stores/reportsConfig/configurations/chartTooltipConfig/TooltipConfigBuilder';
import { createRowWithIcon } from '@/stores/reportsConfig/configurations/chartTooltipConfig/tooltipBuilderHelpers';
import createPreprocessedChartConfig from '@/stores/reportsConfig/configurations/chartTooltipConfig/helpers/preprocessedChartFactory';
import type { ChartConfigParams, TooltipRowConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';

/**
 * Generates tooltip configuration for Checklist charts.
 * @param params - Chart configuration parameters including Checklist-specific data, grouping, and visible columns
 * @returns Array of tooltip row configurations
 */
export default function getChecklistConfig({
  data, groupBy, cfgType, granularity, yAxis, visibleColumns = [], chartLegendState = [],
}: ChartConfigParams<typeof configType.CHECKLIST>): TooltipRowConfig[] {
  const builder = new TooltipConfigBuilder('CHECKLIST');

  builder.addStandardGroupingRows({ data, groupBy, cfgType, granularity, yAxis });

  builder
    .addRow(createPreprocessedChartConfig({
      measure: measure.CHECKLIST_MISSED_COUNT,
      labelConfigFn: getChecklistLabelConfig,
      valueConfigFn: getChecklistValueConfig,
      preprocessorGroupType: preprocessorGroupType.CHECKLIST_MISSED,
      chartLegendKey: 'checklistMissed',
      data,
      additionalHideCondition: yAxis === yAxisKey.AVG_TIME_VAL || isHighestLevel(data),
      chartLegendState,
    }))
    .addRow(createPreprocessedChartConfig({
      measure: measure.CHECKLIST_UNSUCCESSFUL_COUNT,
      labelConfigFn: getChecklistLabelConfig,
      valueConfigFn: getChecklistValueConfig,
      preprocessorGroupType: preprocessorGroupType.CHECKLIST_UNSUCCESSFUL,
      chartLegendKey: 'checklistUnsuccessful',
      data,
      additionalHideCondition: yAxis === yAxisKey.AVG_TIME_VAL || isHighestLevel(data),
      chartLegendState,
    }))
    .addRow(createPreprocessedChartConfig({
      measure: measure.CHECKLIST_SUCCESSFUL_COUNT,
      labelConfigFn: getChecklistLabelConfig,
      valueConfigFn: getChecklistValueConfig,
      preprocessorGroupType: preprocessorGroupType.CHECKLIST_SUCCESSFUL,
      chartLegendKey: 'checklistSuccessful',
      data,
      additionalHideCondition: yAxis === yAxisKey.AVG_TIME_VAL || isHighestLevel(data),
      chartLegendState,
    }))
    .addRow(createRowWithIcon({
      valueKey: measure.CHECKLIST_TOTAL_COUNT,
      text: i18n.global.t('Count'),
      tooltipValueKey: 'entityCount',
      iconKey: yAxisKey.ENTITY_COUNT,
      axisConfig: { groupBy, yAxis },
    }))
    .addRow(createRowWithIcon({
      valueKey: calcMeasure.AVG_TIME,
      tooltipValueKey: 'avgTimeFormatted',
      text: i18n.global.t('Average time'),
      iconKey: yAxisKey.AVG_TIME_VAL,
      axisConfig: { groupBy, yAxis },
    }))
    .addRow({
      valueKey: measure.MEDIAN_CHECK_DURATION,
      tooltipValueKey: 'medianCheckTimeFormatted',
      text: i18n.global.t('Median time'),
    })
    .addRow(createRowWithIcon({
      valueKey: measure.NOTES_COUNT,
      tooltipValueKey: 'notesCount',
      text: i18n.global.t('notescount'),
      iconKey: yAxisKey.NOTES_COUNT,
      axisConfig: { groupBy, yAxis },
    }));

  return builder
    .filterByColumns(visibleColumns)
    .filterHidden()
    .build();
}
