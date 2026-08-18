import i18n from '@/services/i18n';
import listToKeyMap from '@/helpers/list/listToKeyMap';

export const getRunTimeTypes = (unit) => [
  { id: 'SECOND_PER_UNIT', name: i18n.global.t('SECOND_PER_{unit}', { unit }) },
  { id: 'UNIT_PER_SECOND', name: i18n.global.t('{unit}_PER_SECOND', { unit }) },
  { id: 'UNIT_PER_MINUTE', name: i18n.global.t('{unit}_PER_MINUTE', { unit }) },
  { id: 'UNIT_PER_HOUR', name: i18n.global.t('{unit}_PER_HOUR', { unit }) },
];

export function getRunTimeType(id, unit) {
  return listToKeyMap(getRunTimeTypes(unit), 'id')[id]?.name ?? '';
}

export const getUnitConversionTypes = (unit, alternativeUnit) => [
  { id: 'PRIMARY_TO_ALT', name: `${unit} = 1 ${alternativeUnit}` },
  { id: 'ALT_TO_PRIMARY', name: `${alternativeUnit} = 1 ${unit}` },
];

export function getUnitConversionType(id, unit, alternativeUnit) {
  return listToKeyMap(getUnitConversionTypes(unit, alternativeUnit), 'id')[id]?.name ?? '';
}
