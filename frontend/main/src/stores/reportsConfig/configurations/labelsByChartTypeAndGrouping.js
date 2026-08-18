import configType from '../constants/configType';
import xAxisKey from '../constants/xAxisKey';

import { getGranularityMenu } from './granularityMenuItems';

import i18n from '@/services/i18n';
import colorConstants from '@/constants/colorConstants';
import graphColors from '@/constants/graphColors';


export function getGranularityLabelMap() {
  return getGranularityMenu(i18n.global.locale).reduce((acc, item) => {
    acc[item.value] = { text: item.text };
    return acc;
  }, {});
}
export function getEntityLabelMap() {
  const commonColumns = {
    stationId: { text: i18n.global.t('station') },
    stationGroupId: { text: i18n.global.t('Station group') },
    factoryId: { text: i18n.global.t('Factory') },
    shiftId: { text: i18n.global.t('Shift') },
    shiftTemplate: { text: i18n.global.t('Shift') },
    productGroupId: { text: i18n.global.t('Product group') },
    sku: { text: i18n.global.t('Product code') },
    productId: { text: i18n.global.t('Product') },
    singleOperator: { text: i18n.global.t('operator') },
    lotCode: { text: i18n.global.t('LOT/Batch') },
    productionOrder: { text: i18n.global.t('Orders') },
  };

  return {
    [configType.DOWNTIME]: {
      entityId: { text: i18n.global.t('Stop reason') },
      entityGroupId: { text: i18n.global.t('Stop group') },
      ...commonColumns,
      ...getGranularityLabelMap(),
    },
    [configType.SPEEDLOSS]: {
      entityId: { text: i18n.global.t('Speed loss reason') },
      entityGroupId: { text: i18n.global.t('Speed loss group') },
      ...commonColumns,
      ...getGranularityLabelMap(),
    },
    [configType.SCRAPREASON]: {
      entityId: { text: i18n.global.t('Scrap reason') },
      entityGroupId: { text: i18n.global.t('Scrap reason group') },
      ...commonColumns,
      ...getGranularityLabelMap(),
    },
    [configType.OEE]: {
      entityId: { text: i18n.global.t('OEE') },
      ...commonColumns,
      ...getGranularityLabelMap(),
    },
    [configType.QUANTITY]: {
      ...commonColumns,
      ...getGranularityLabelMap(),
    },
    [configType.TIME_USAGE]: {
      ...commonColumns,
      ...getGranularityLabelMap(),
    },
    [configType.CHECKLIST]: {
      entityId: { text: i18n.global.t('Checklist') },
      entityGroupId: { text: i18n.global.t('Checklist group') },
      ...commonColumns,
      ...getGranularityLabelMap(),
    },
    [configType.PRODUCTION_SPEED]: {
      entityGroupId: {
        text: (entry) => (entry.isFasterThanTarget ? i18n.global.t('Faster than target') : i18n.global.t('Slower than target')),
        icon: 'iconDot',
        iconColor: (entry) => (entry.isFasterThanTarget ? colorConstants.dark.primary : graphColors['graph-yellow']),
      },
      [xAxisKey.SECOND_PER_UNIT]: {
        text: (entry) => (entry.isFasterThanTarget ? i18n.global.t('Faster than target') : i18n.global.t('Slower than target')),
        icon: 'iconDot',
        iconColor: (entry) => (entry.isFasterThanTarget ? colorConstants.dark.primary : graphColors['graph-yellow']),
      },
      [xAxisKey.UNIT_PER_SECOND]: {
        text: (entry) => (entry.isFasterThanTarget ? i18n.global.t('Faster than target') : i18n.global.t('Slower than target')),
        icon: 'iconDot',
        iconColor: (entry) => (entry.isFasterThanTarget ? colorConstants.dark.primary : graphColors['graph-yellow']),
      },
      [xAxisKey.UNIT_PER_MINUTE]: {
        text: (entry) => (entry.isFasterThanTarget ? i18n.global.t('Faster than target') : i18n.global.t('Slower than target')),
        icon: 'iconDot',
        iconColor: (entry) => (entry.isFasterThanTarget ? colorConstants.dark.primary : graphColors['graph-yellow']),
      },
      [xAxisKey.UNIT_PER_HOUR]: {
        text: (entry) => (entry.isFasterThanTarget ? i18n.global.t('Faster than target') : i18n.global.t('Slower than target')),
        icon: 'iconDot',
        iconColor: (entry) => (entry.isFasterThanTarget ? colorConstants.dark.primary : graphColors['graph-yellow']),
      },
    },
    [configType.CUSTOM_REPORT]: {
      // not used, only for typing purposes to cover all config types
    },
  };
}
