import type { PreprocessorLabelConfig, PreprocessorValueConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';
import {
  COLOR_UNCOMMENTED,
  COLOR_COMMENTED,
  COLOR_PLANNED_INCLUDED_IN_OEE,
  COLOR_PLANNED_NOT_INCLUDED_IN_OEE,
  COLOR_PERFORMANCE,
  COLOR_GOOD,
} from '@/stores/reportsConfig/constants/colors';
import i18n from '@/services/i18n';
import measure from '@/stores/reportsConfig/constants/measure';
import calcMeasure from '@/stores/reportsConfig/constants/calcMeasure';
import preprocessorGroupType from '@/stores/reportsConfig/constants/preprocessorGroupType';

/**
 * Returns label configuration for Time Usage tooltip rows.
 * @param type - Preprocessor group type or measure
 * @returns Label configuration with text, icon, and color
 */
export function getTimeUsageLabelConfig(type: string): PreprocessorLabelConfig {
  const typeConfigMap: Record<string, PreprocessorLabelConfig> = {
    [preprocessorGroupType.UNCOMMENTED_STOP]: {
      text: i18n.global.t('Uncommented') as string,
      icon: 'iconDot',
      color: COLOR_UNCOMMENTED,
    },
    [preprocessorGroupType.UNPLANNED_STOP]: {
      text: i18n.global.t('Unplanned stops') as string,
      icon: 'iconDot',
      color: COLOR_COMMENTED,
    },
    [preprocessorGroupType.PLANNED_STOP_INCLUDED_IN_OEE]: {
      text: `${i18n.global.t('Planned stops')} (${i18n.global.t('incl. in OEE')})` as string,
      icon: 'iconDot',
      color: COLOR_PLANNED_INCLUDED_IN_OEE,
    },
    [preprocessorGroupType.PLANNED_STOP_NOT_INCLUDED_IN_OEE]: {
      text: `${i18n.global.t('Planned stops')} (${i18n.global.t('excl. from OEE')})` as string,
      icon: 'iconDot',
      color: COLOR_PLANNED_NOT_INCLUDED_IN_OEE,
    },
    [preprocessorGroupType.SLOW]: {
      text: i18n.global.t('Speed loss') as string,
      icon: 'iconDot',
      color: COLOR_PERFORMANCE,
    },
    [preprocessorGroupType.GOOD]: {
      text: i18n.global.t('goodproduction') as string,
      icon: 'iconDot',
      color: COLOR_GOOD,
    },
    [measure.PLANNED_TIME]: {
      text: i18n.global.t('plannedTime') as string,
      icon: 'iconDot',
      color: 'transparent',
    },
    [calcMeasure.SHIFT_TIME]: {
      text: i18n.global.t('Shift time') as string,
      icon: 'iconDot',
      color: 'transparent',
    },
    [calcMeasure.OPERATING_TIME]: {
      text: i18n.global.t('Operating time') as string,
      icon: 'iconDot',
      color: 'transparent',
    },
  };
  const config = typeConfigMap[type];
  if (!config) {
    throw new Error(`getTimeUsageLabelConfig unknown type: ${type}`);
  }
  return config;
}

/**
 * Returns value configuration for Time Usage tooltip rows.
 * @param type - Preprocessor group type or measure
 * @returns Value configuration with tooltip value key
 */
export function getTimeUsageValueConfig(type: string): PreprocessorValueConfig {
  const typeConfigMap: Record<string, PreprocessorValueConfig> = {
    [preprocessorGroupType.UNCOMMENTED_STOP]: {
      tooltipValueKey: 'uncommentedTooltipValue',
    },
    [preprocessorGroupType.UNPLANNED_STOP]: {
      tooltipValueKey: 'unplannedTooltipValue',
    },
    [preprocessorGroupType.PLANNED_STOP_INCLUDED_IN_OEE]: {
      tooltipValueKey: 'plannedIncludedInOEETooltipValue',
    },
    [preprocessorGroupType.PLANNED_STOP_NOT_INCLUDED_IN_OEE]: {
      tooltipValueKey: 'plannedNotIncludedInOEETooltipValue',
    },
    [preprocessorGroupType.SLOW]: {
      tooltipValueKey: 'slowTooltipValue',
    },
    [preprocessorGroupType.GOOD]: {
      tooltipValueKey: 'goodProductionTooltipValue',
    },
    [measure.PLANNED_TIME]: {
      tooltipValueKey: 'plannedTimeFormatted',
    },
    [calcMeasure.SHIFT_TIME]: {
      tooltipValueKey: 'shiftTimeFormatted',
    },
    [calcMeasure.OPERATING_TIME]: {
      tooltipValueKey: 'operatingTimeFormatted',
    },
  };
  const config = typeConfigMap[type];
  if (!config) {
    throw new Error(`getTimeUsageValueConfig unknown type: ${type}`);
  }
  return config;
}
