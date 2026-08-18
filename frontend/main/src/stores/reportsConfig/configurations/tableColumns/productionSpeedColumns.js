import { mdiSquareRounded } from '@mdi/js';

import i18n from '@/services/i18n';
import dimension from '@/stores/reportsConfig/constants/dimension';
import measure from '@/stores/reportsConfig/constants/measure';
import getHelperFunctions from '@/stores/reportsConfig/configurations/tableColumns/columnHelperFunctions';
import xAxisKey from '@/stores/reportsConfig/constants/xAxisKey';
import { formatNumber, formatPercentage } from '@/helpers/numbers/formatNumber';
import formatDuration from '@/helpers/time/formatDuration';
import { getProductionSpeedTextMethod, getCurrentProductUnitId } from '@/stores/reportsConfig/configurations/groupByMenuItemsByConfigType';
import { firstUpper } from '@/helpers/string-formatting';
import runtimeType from '@/constants/runtimeType';

export function getProductionSpeedText({ currentFilterItemsMap, requestFilterState, groupBy }) {
  const map = {
    [xAxisKey.SECOND_PER_UNIT]: getProductionSpeedTextMethod(runtimeType.SECOND_PER_UNIT),
    [xAxisKey.UNIT_PER_SECOND]: getProductionSpeedTextMethod(runtimeType.UNIT_PER_SECOND),
    [xAxisKey.UNIT_PER_MINUTE]: getProductionSpeedTextMethod(runtimeType.UNIT_PER_MINUTE),
    [xAxisKey.UNIT_PER_HOUR]: getProductionSpeedTextMethod(runtimeType.UNIT_PER_HOUR),
  };
  if (!groupBy || !groupBy.length || !map[groupBy[0]]) return '';
  return map[groupBy[0]](null, { currentFilterItemsMap, requestFilterState });
}

export default function getProductionSpeedColumns(options) {
  const { isFirstIndex, getPrependImg } = getHelperFunctions(options);
  return {
    RANGE: {
      text: `${i18n.global.t('Range')} (${firstUpper(getProductionSpeedText(options))})`,
      id: dimension.PRODUCTION_SPEED_RANGE,
      prependIcon: mdiSquareRounded,
      prependIconColor: (item) => item.color,
      prependIconSize: '17px',
      textKey: 'rangeKey',
      formatFn: (value, entry) => `${formatNumber(entry.rangeStart)} - ${formatNumber(entry.rangeEnd)}`,
      valueKey: 'binOrder',
      isFixed: isFirstIndex,
      isBold: isFirstIndex,
      defaultDirection: 'asc',
      prependImage: getPrependImg(xAxisKey.SECOND_PER_UNIT) || getPrependImg(xAxisKey.UNIT_PER_SECOND) || getPrependImg(xAxisKey.UNIT_PER_MINUTE) || getPrependImg(xAxisKey.UNIT_PER_HOUR),
      width: '200px',
    },
    PRODUCTION_COUNT: {
      text: `${i18n.global.t('Count')} (${firstUpper(getCurrentProductUnitId(options.currentFilterItemsMap, options.requestFilterState))})`,
      id: measure.PRODUCTION_SPEED_COUNT,
      textKey: 'productionCount',
      secondaryTextKey: 'productionCount',
      hasTotal: true,
      type: 'number',
      defaultDirection: 'desc',
      formatFn: formatNumber,
      secondaryFormatFn: (val, entry) => formatPercentage((entry.productionCount / options.tableTotals.productionCount) * 100),
      width: '75px',
    },
    PRODUCTION_TIME: {
      text: i18n.global.t('Production time'),
      id: measure.PRODCUTION_TIME,
      textKey: 'productionTime',
      secondaryTextKey: 'productionTime',
      secondaryFormatFn: (val, entry) => formatPercentage((entry.productionTime / options.tableTotals.productionTime) * 100),
      hasTotal: true,
      type: 'number',
      defaultDirection: 'desc',
      formatFn: (val) => formatDuration(val, options.durFormatType),
      width: '75px',
    },
  };
}
