import i18n from '@/services/i18n';
import granularityType from '@/stores/reportsConfig/constants/granularity';
import { getLongDateTimeField, dtFieldType } from '@/helpers/time/dateTimeFieldLabel';
import { firstUpper } from '@/helpers/string-formatting';

export function getGranularityMenu(lang = 'en') {
  return [
    {
      text: firstUpper(getLongDateTimeField(dtFieldType.day, lang)),
      value: granularityType.DATE,
    },
    {
      text: firstUpper(getLongDateTimeField(dtFieldType.weekday, lang)),
      value: granularityType.DAYOFWEEK,
    },
    {
      text: firstUpper(getLongDateTimeField(dtFieldType.weekofyear, lang)),
      value: granularityType.WEEKOFYEAR,
    },
    {
      text: firstUpper(getLongDateTimeField(dtFieldType.month, lang)),
      value: granularityType.MONTH,
    },
    {
      text: firstUpper(getLongDateTimeField(dtFieldType.quarter, lang)),
      value: granularityType.QUARTER,
    },
    {
      text: firstUpper(getLongDateTimeField(dtFieldType.year, lang)),
      value: granularityType.YEAR,
    },
  ];
}
export function getExtendedGranularityMenu(lang = 'en') {
  return [
    ...getGranularityMenu(lang),
    { text: i18n.global.t('Total'), value: granularityType.TOTAL },
  ];
}
export function getExtraGranularityItem() {
  return {
    text: i18n.global.t('Timeline'), value: granularityType.STARTTIME,
  };
}
