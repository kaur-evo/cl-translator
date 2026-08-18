import type { PreprocessorLabelConfig, PreprocessorValueConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';
import i18n from '@/services/i18n';
import {
  COLOR_PERFORMANCE,
  COLOR_QUALITY,
  COLOR_OEE,
  COLOR_AVAILABILITY,
  COLOR_TECHNICAL_AVAILABILITY,
} from '@/stores/reportsConfig/constants/colors';
import preprocessorGroupType from '@/stores/reportsConfig/constants/preprocessorGroupType';

/**
 * Returns label configuration for OEE tooltip rows.
 * @param type - Preprocessor group type (OEE, AVAILABILITY, PERFORMANCE, QUALITY, TECHNICAL_AVAILABILITY)
 * @returns Label configuration with text, icon, and color
 */
export function getOEELabelConfig(type: string): PreprocessorLabelConfig {
  const typeConfigMap: Record<string, PreprocessorLabelConfig> = {
    [preprocessorGroupType.OEE]: {
      text: i18n.global.t('oee'),
      icon: 'iconDot',
      color: COLOR_OEE,
    },
    [preprocessorGroupType.AVAILABILITY]: {
      text: i18n.global.t('availability'),
      icon: 'iconDot',
      color: COLOR_AVAILABILITY,
    },
    [preprocessorGroupType.PERFORMANCE]: {
      text: i18n.global.t('performance'),
      icon: 'iconDot',
      color: COLOR_PERFORMANCE,
    },
    [preprocessorGroupType.QUALITY]: {
      text: i18n.global.t('quality'),
      icon: 'iconDot',
      color: COLOR_QUALITY,
    },
    [preprocessorGroupType.TECHNICAL_AVAILABILITY]: {
      text: i18n.global.t('technicalavailability'),
      icon: 'iconDot',
      color: COLOR_TECHNICAL_AVAILABILITY,
    },
  };
  const config = typeConfigMap[type];
  if (!config) {
    throw new Error(`getOEELabelConfig unknown type: ${type}`);
  }
  return config;
}

/**
 * Returns value configuration for OEE tooltip rows.
 * @param type - Preprocessor group type
 * @returns Value configuration with tooltip value key
 */
export function getOEEValueConfig(type: string): PreprocessorValueConfig {
  const typeConfigMap: Record<string, PreprocessorValueConfig> = {
    [preprocessorGroupType.OEE]: {
      tooltipValueKey: 'oeeFormatted',
    },
    [preprocessorGroupType.AVAILABILITY]: {
      tooltipValueKey: 'availabilityFormatted',
    },
    [preprocessorGroupType.PERFORMANCE]: {
      tooltipValueKey: 'performanceFormatted',
    },
    [preprocessorGroupType.QUALITY]: {
      tooltipValueKey: 'qualityFormatted',
    },
    [preprocessorGroupType.TECHNICAL_AVAILABILITY]: {
      tooltipValueKey: 'technicalAvailabilityFormatted',
    },
  };
  const config = typeConfigMap[type];
  if (!config) {
    throw new Error(`getOEEValueConfig unknown type: ${type}`);
  }
  return config;
}
