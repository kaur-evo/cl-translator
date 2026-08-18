import i18n from '@/services/i18n';
import listToKeyMap from '@/helpers/list/listToKeyMap';

export const getMeasuresList = () => [
  { name: 'qty', display: i18n.global.t('Total quantity') },
  { name: 'goodqty', display: i18n.global.t('Good quantity') },
  { name: 'scrapqty', display: i18n.global.t('scrapqty') },
  { name: 'oee', display: i18n.global.t('OEE') },
  { name: 'quality', display: i18n.global.t('quality') },
  { name: 'availability', display: i18n.global.t('availability') },
  { name: 'performance', display: i18n.global.t('performance') },
  { name: 'technicalavailability', display: i18n.global.t('Technical availability') },
];
export const getMeasuresMap = () => listToKeyMap(getMeasuresList(), 'name');
export const getMeasure = (measure) => getMeasuresMap()[measure] ?? null;
