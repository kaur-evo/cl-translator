import granularity from '@/stores/reportsConfig/constants/granularity';
import i18n from '@/services/i18n';
import { getLongDateTimeField } from '@/helpers/time/dateTimeFieldLabel';
import { getEntityLabelMap } from '@/stores/reportsConfig/configurations/labelsByChartTypeAndGrouping';
import shouldUseTotalMeasures from '@/stores/reportsConfig/configurations/shouldUseTotalMeasures';
import { firstUpper } from '@/helpers/string-formatting';
import { getIconAsset } from '@/helpers/file/getAsset';

const iconXAxis = getIconAsset('iconXAxis.svg');
const iconYAxis = getIconAsset('iconYAxis.svg');
const icon2ndYAxis = getIconAsset('icon2ndYAxis.svg');

export function isFirstIndex(index) {
  return index === 0;
}
export function isLink(item, index) {
  return isFirstIndex(index);
}
export function hasNotesCount(row) {
  return !!row.notesCount;
}

export default function getHelperFunctions(options) {
  const getXAxisKey = () => {
    if (options.granularity === granularity.TOTAL) {
      return options.groupBy[0];
    }
    return options.granularity;
  };
  const getPrependImg = (key) => {
    if (key === options.yAxis) {
      return iconYAxis;
    }
    if (key === options.yAxisRight) {
      return icon2ndYAxis;
    }
    if (key === getXAxisKey()) {
      return iconXAxis;
    }
    return null;
  };
  const getPlannedTimeAppendText = () => {
    if (options.granularity === granularity.STARTTIME) return '';
    let res = '';
    if (shouldUseTotalMeasures(options.granularity, options.groupBy[0])) {
      res = i18n.global.t('Total');
    } else if (options.granularity === granularity.TOTAL) {
      const labelMap = getEntityLabelMap();
      res = labelMap[options.configType][options.groupBy[0]]?.text;
    } else {
      res = firstUpper(getLongDateTimeField(options.granularity, options.language));
    }
    return `(${res})`;
  };
  return {
    getXAxisKey, getPrependImg, isFirstIndex, isLink, hasNotesCount, getPlannedTimeAppendText,
  };
}
