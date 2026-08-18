import runtimeType from '@/constants/runtimeType';
import i18n from '@/services/i18n';

export default function getUnitIdFormatted(type, unitId) {
  switch (type) {
    case runtimeType.SECOND_PER_UNIT:
      return i18n.global.t('SECOND_PER_{unit}', { unit: unitId });
    case runtimeType.UNIT_PER_SECOND:
      return i18n.global.t('{unit}_PER_SECOND', { unit: unitId });
    case runtimeType.UNIT_PER_MINUTE:
      return i18n.global.t('{unit}_PER_MINUTE', { unit: unitId });
    case runtimeType.UNIT_PER_HOUR:
      return i18n.global.t('{unit}_PER_HOUR', { unit: unitId });
    default:
      return unitId;
  }
}
