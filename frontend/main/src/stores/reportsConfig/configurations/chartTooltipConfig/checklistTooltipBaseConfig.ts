import type { PreprocessorLabelConfig, PreprocessorValueConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';
import i18n from '@/services/i18n';
import preprocessorGroupType from '@/stores/reportsConfig/constants/preprocessorGroupType';
import {
  COLOR_ERROR,
  COLOR_QUALITY,
  COLOR_GOOD,
} from '@/stores/reportsConfig/constants/colors';

/**
 * Returns label configuration for Checklist tooltip rows.
 * @param type - Preprocessor group type (CHECKLIST_MISSED, CHECKLIST_UNSUCCESSFUL, CHECKLIST_SUCCESSFUL)
 * @returns Label configuration with text, icon, and color
 */
export function getChecklistLabelConfig(type: string): PreprocessorLabelConfig {
  switch (type) {
    case preprocessorGroupType.CHECKLIST_MISSED:
      return {
        text: i18n.global.t('Missed'),
        icon: 'iconDot',
        color: COLOR_ERROR,
      };
    case preprocessorGroupType.CHECKLIST_UNSUCCESSFUL:
      return {
        text: i18n.global.t('Unsuccessful'),
        icon: 'iconDot',
        color: COLOR_QUALITY,
      };
    case preprocessorGroupType.CHECKLIST_SUCCESSFUL:
      return {
        text: i18n.global.t('Successful'),
        icon: 'iconDot',
        color: COLOR_GOOD,
      };
    default:
      throw new Error(`getChecklistLabelConfig unknown type: ${type}`);
  }
}

/**
 * Returns value configuration for Checklist tooltip rows.
 * @param type - Preprocessor group type
 * @returns Value configuration with tooltip value keys
 */
export function getChecklistValueConfig(type: string): PreprocessorValueConfig {
  switch (type) {
    case preprocessorGroupType.CHECKLIST_MISSED:
      return {
        tooltipValueKey: 'missedChecks',
        tooltipSecondaryValueKey: 'missedChecksPctFormatted',
      };
    case preprocessorGroupType.CHECKLIST_UNSUCCESSFUL:
      return {
        tooltipValueKey: 'unsuccessfulChecks',
        tooltipSecondaryValueKey: 'unsuccessfulChecksPctFormatted',
      };
    case preprocessorGroupType.CHECKLIST_SUCCESSFUL:
      return {
        tooltipValueKey: 'successfulChecks',
        tooltipSecondaryValueKey: 'successfulChecksPctFormatted',
      };
    default:
      throw new Error(`getChecklistValueConfig unknown type: ${type}`);
  }
}
