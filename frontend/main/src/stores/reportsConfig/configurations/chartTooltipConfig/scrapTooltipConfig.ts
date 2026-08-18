import type { ChartConfigParams, TooltipRowConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';
import TooltipConfigBuilder from '@/stores/reportsConfig/configurations/chartTooltipConfig/TooltipConfigBuilder';
import { createRowWithIcon } from '@/stores/reportsConfig/configurations/chartTooltipConfig/tooltipBuilderHelpers';
import i18n from '@/services/i18n';
import measure from '@/stores/reportsConfig/constants/measure';
import yAxisKey from '@/stores/reportsConfig/constants/yAxisKey';
import calcMeasure from '@/stores/reportsConfig/constants/calcMeasure';
import configType from '@/stores/reportsConfig/constants/configType';
import xAxisKey from '@/stores/reportsConfig/constants/xAxisKey';

/**
 * Generates tooltip configuration for Scrap Reason charts.
  * @param params - Chart configuration parameters including Scrap-specific data, grouping, and visible columns
 * @returns Array of tooltip row configurations
 */
export default function getScrapReasonConfig({
  data, groupBy, cfgType, granularity, yAxis, yAxisRight, visibleColumns = [],
}: ChartConfigParams<typeof configType.SCRAPREASON>): TooltipRowConfig[] {
  const builder = new TooltipConfigBuilder('SCRAPREASON');

  builder.addStandardGroupingRows({ data, groupBy, cfgType, granularity, yAxis });

  builder
    .addRow(createRowWithIcon({
      valueKey: measure.SCRAP_QTY,
      tooltipValueKey: yAxis === yAxisKey.ENTITY_ALT_COUNT ? 'scrapAltQtyFormatted' : 'scrapQtyFormatted',
      text: i18n.global.t('Scrap'),
      iconKey: yAxisKey.ENTITY_COUNT,
      axisConfig: { groupBy, yAxis, yAxisRight },
    }))
    .addRow(createRowWithIcon({
      valueKey: calcMeasure.SCRAP_QTY_PCT,
      tooltipValueKey: yAxis === yAxisKey.ENTITY_ALT_COUNT ? 'scrapAltQtyPctFormatted' : 'scrapQtyPctFormatted',
      text: i18n.global.t('% of produced'),
      iconKey: yAxisKey.SCRAP_QTY_PCT,
      axisConfig: { groupBy, yAxis, yAxisRight },
    }))
    .addRow({
      valueKey: measure.GOOD_PRODUCTION,
      tooltipValueKey: 'goodProductionFormatted',
      text: i18n.global.t('goodproduction'),
      isHidden: groupBy[0] === xAxisKey.ENTITY_ID || groupBy[0] === xAxisKey.ENTITY_GROUP_ID,
    })
    .addRow({
      valueKey: measure.SCRAP_DURATION,
      tooltipValueKey: 'scrapDurationFormatted',
      text: i18n.global.t('Time lost'),
    })
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
