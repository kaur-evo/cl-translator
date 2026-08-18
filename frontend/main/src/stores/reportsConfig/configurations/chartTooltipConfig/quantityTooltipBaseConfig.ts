import type { PreprocessorLabelConfig, PreprocessorValueConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';
import {
  COLOR_QUALITY,
  COLOR_GOOD_ALT,
  COLOR_POTENTIAL,
} from '@/stores/reportsConfig/constants/colors';
import preprocessorGroupType from '@/stores/reportsConfig/constants/preprocessorGroupType';
import i18n from '@/services/i18n';
import measure from '@/stores/reportsConfig/constants/measure';
import yAxisKey from '@/stores/reportsConfig/constants/yAxisKey';

/**
 * Returns label configuration for Quantity tooltip rows.
 * @param type - Preprocessor group type (POTENTIAL, GOOD, SCRAP, etc.)
 * @returns Label configuration with text, icon, and color
 */
export function getQuantityLabelConfig(type: string): PreprocessorLabelConfig {
  const typeConfigMap: Record<string, PreprocessorLabelConfig> = {
    [preprocessorGroupType.POTENTIAL]: {
      text: i18n.global.t('Potential') as string,
      icon: 'iconDot',
      color: COLOR_POTENTIAL,
    },
    [preprocessorGroupType.GOOD]: {
      text: i18n.global.t('Good quantity') as string,
      icon: 'iconDot',
      color: COLOR_GOOD_ALT,
    },
    [preprocessorGroupType.SCRAP]: {
      text: i18n.global.t('Scrap') as string,
      icon: 'iconDot',
      color: COLOR_QUALITY,
    },
    [measure.ROW_PRODUCED_QTY]: {
      text: i18n.global.t('Total quantity') as string,
      icon: 'iconDot',
      color: 'transparent',
    },
    [measure.IDEAL_QTY]: {
      text: i18n.global.t('idealqty') as string,
      icon: 'iconDot',
      color: 'transparent',
    },
  };
  const config = typeConfigMap[type];
  if (!config) {
    throw new Error(`getQuantityLabelConfig unknown type: ${type}`);
  }
  return config;
}

/**
 * Returns value configuration for Quantity tooltip rows.
 * @param type - Preprocessor group type
 * @param yAxis - Y-axis key to determine which value field to use
 * @returns Value configuration with tooltip value key
 */
export function getQuantityValueConfig(type: string, yAxis?: string): PreprocessorValueConfig {
  const typeConfigMap: Record<string, PreprocessorValueConfig> = {
    [preprocessorGroupType.POTENTIAL]: {
      tooltipValueKey: yAxis === yAxisKey.ALT_VALUE ? 'potentialAltQtyFormatted' : 'potentialQtyFormatted',
    },
    [preprocessorGroupType.GOOD]: {
      tooltipValueKey: yAxis === yAxisKey.ALT_VALUE ? 'goodAltQtyFormatted' : 'goodQtyFormatted',
    },
    [preprocessorGroupType.SCRAP]: {
      tooltipValueKey: yAxis === yAxisKey.ALT_VALUE ? 'scrapAltQtyFormatted' : 'scrapQtyFormatted',
    },
    [measure.ROW_PRODUCED_QTY]: {
      tooltipValueKey: yAxis === yAxisKey.ALT_VALUE ? 'rowProducedAltQtyFormatted' : 'rowProducedQtyFormatted',
    },
    [measure.IDEAL_QTY]: {
      tooltipValueKey: yAxis === yAxisKey.ALT_VALUE ? 'idealAltQtyFormatted' : 'idealQtyFormatted',
    },
  };
  const config = typeConfigMap[type];
  if (!config) {
    throw new Error(`getQuantityValueConfig unknown type: ${type}`);
  }
  return config;
}
