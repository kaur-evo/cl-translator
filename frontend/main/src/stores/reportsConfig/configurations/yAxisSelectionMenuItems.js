import configType from '@/stores/reportsConfig/constants/configType';
import i18n from '@/services/i18n';
import yAxisKey from '@/stores/reportsConfig/constants/yAxisKey';

export default function yAxisOptions({ type, isSecondYAxis }) {
  let ret;
  switch (type) {
    case configType.DOWNTIME:
      ret = new Map([
        [yAxisKey.VALUE, { label: i18n.global.t('Duration') }],
        [yAxisKey.ENTITY_COUNT, { label: i18n.global.t('stopcount') }],
        [yAxisKey.NOTES_COUNT, { label: i18n.global.t('notescount') }],
        [yAxisKey.AVG_DURATION_VAL, { label: i18n.global.t('Average duration') }],
      ]);
      if (!isSecondYAxis) ret.set(yAxisKey.ENTITY_PCT_PLANNED_TIME, { label: i18n.global.t('% of planned time') });
      break;
    case configType.SPEEDLOSS:
      ret = new Map([
        [yAxisKey.VALUE, { label: i18n.global.t('Duration') }],
        [yAxisKey.ENTITY_COUNT, { label: i18n.global.t('stopcount') }],
        [yAxisKey.NOTES_COUNT, { label: i18n.global.t('notescount') }],
        [yAxisKey.AVG_DURATION_VAL, { label: i18n.global.t('Average duration') }],
      ]);
      break;
    case configType.SCRAPREASON:
      if (isSecondYAxis) {
        ret = new Map([
          [yAxisKey.SCRAP_QTY_PCT, { label: `${i18n.global.t('% of produced')} (${i18n.global.t('Primary unit').toLowerCase()})` }],
          [yAxisKey.SCRAP_ALT_QTY_PCT, { label: `${i18n.global.t('% of produced')} (${i18n.global.t('Alternative unit').toLowerCase()})` }],
          [yAxisKey.ENTITY_PCT_PLANNED_TIME, { label: i18n.global.t('% of planned time') }],
        ]);
      } else {
        ret = new Map([
          [yAxisKey.ENTITY_COUNT, { label: `${i18n.global.t('quantity')} (${i18n.global.t('Primary unit').toLowerCase()})` }],
          [yAxisKey.ENTITY_ALT_COUNT, { label: `${i18n.global.t('quantity')} (${i18n.global.t('Alternative unit').toLowerCase()})` }],
        ]);
      }
      break;
    case configType.CHECKLIST:
      ret = isSecondYAxis
        ? new Map()
        : new Map([
          [yAxisKey.ENTITY_COUNT, { label: i18n.global.t('Count') }],
          [yAxisKey.ENTITY_COUNT_PCT, { label: i18n.global.t('Percent') }],
          [yAxisKey.AVG_TIME_VAL, { label: i18n.global.t('Average time') }],
        ]);
      break;
    case configType.TIME_USAGE: {
      ret = isSecondYAxis
        ? new Map()
        : new Map([
          [yAxisKey.VALUE, { label: `${i18n.global.t('Percent')} (${i18n.global.t('Shift time')})` }],
          [yAxisKey.PCT_OF_PLANNED_TIME, { label: `${i18n.global.t('Percent')} (${i18n.global.t('plannedTime')})` }],
          [yAxisKey.DURATION, { label: i18n.global.t('Duration') }],
        ]);
      break;
    }
    case configType.PRODUCTION_SPEED: {
      ret = isSecondYAxis
        ? new Map()
        : new Map([
          [yAxisKey.PRODUCTION_COUNT, { label: i18n.global.t('Count') }],
          [yAxisKey.PRODUCTION_TIME, { label: i18n.global.t('Production time') }],
        ]);
      break;
    }
    case configType.QUANTITY:
      ret = isSecondYAxis
        ? new Map()
        : new Map([
          [yAxisKey.VALUE, { label: `${i18n.global.t('quantity')} (${i18n.global.t('Primary unit').toLowerCase()})` }],
          [yAxisKey.ALT_VALUE, { label: `${i18n.global.t('quantity')} (${i18n.global.t('Alternative unit').toLowerCase()})` }],
        ]);
      break;
    default:
      ret = new Map([]);
      break;
  }
  if (isSecondYAxis) { // second axis is not required
    ret.set('', { label: '-' });
  }
  return ret;
}
