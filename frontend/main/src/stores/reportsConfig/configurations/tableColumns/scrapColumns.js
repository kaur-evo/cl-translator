import i18n from '@/services/i18n';
import { useDeviceStore } from '@/stores';
import measure from '@/stores/reportsConfig/constants/measure';
import dimension from '@/stores/reportsConfig/constants/dimension';
import queryParam from '@/stores/reportsConfig/constants/queryParam';
import calcMeasure from '@/stores/reportsConfig/constants/calcMeasure';
import getHelperFunctions from '@/stores/reportsConfig/configurations/tableColumns/columnHelperFunctions';
import formatDuration from '@/helpers/time/formatDuration';
import xAxisKey from '@/stores/reportsConfig/constants/xAxisKey';

export default function getScrapColumns(options) {
  const {
    isLink, isFirstIndex, getPrependImg, getXAxisKey,
  } = getHelperFunctions(options);
  return {
    SCRAP_REASON: {
      text: i18n.global.t('Scrap reasons'),
      id: dimension.SCRAP_REASON,
      secondaryId: xAxisKey.ENTITY_ID,
      textKey: 'entityName',
      isFixed: isFirstIndex,
      isBold: isFirstIndex,
      isLink,
      defaultDirection: 'asc',
      relatedParam: queryParam.SCRAP_ID,
      prependImage: getPrependImg(xAxisKey.ENTITY_ID),
      style: useDeviceStore().isMobileView ? { maxWidth: '170px' } : { width: '200px' },
    },
    SCRAP_REASON_GROUP: {
      textKey: 'entityGroupName',
      id: dimension.SCRAP_REASON_GROUP,
      secondaryId: xAxisKey.ENTITY_GROUP_ID,
      groupById: 'entityid',
      text: i18n.global.t('Scrap groups'),
      type: 'text',
      defaultDirection: 'asc',
      isFixed: isFirstIndex,
      isBold: isFirstIndex,
      isLink,
      relatedParam: queryParam.SCRAP_GROUP_ID,
      prependImage: getPrependImg(xAxisKey.ENTITY_GROUP_ID),
      width: '200px',
    },
    SCRAP_QTY: {
      textKey: 'scrapQtyFormatted',
      valueKey: 'scrapQty',
      id: measure.SCRAP_QTY,
      text: `${i18n.global.t('Scrap')} (${i18n.global.t('Primary unit').toLowerCase()})`,
      type: 'number',
      defaultDirection: 'desc',
      hasTotal: true,
      width: '75px',
    },
    SCRAP_ALT_QTY: {
      textKey: 'scrapAltQtyFormatted',
      valueKey: 'scrapAltQty',
      id: measure.SCRAP_ALT_QTY,
      text: `${i18n.global.t('Scrap')} (${i18n.global.t('Alternative unit').toLowerCase()})`,
      type: 'number',
      defaultDirection: 'desc',
      hasTotal: true,
      width: '75px',
    },
    SCRAP_QTY_PCT: {
      textKey: 'scrapQtyPctFormatted',
      secondaryTextKey: 'totalQtyFormatted',
      valueKey: 'scrapQtyPct',
      id: calcMeasure.SCRAP_QTY_PCT,
      text: `${i18n.global.t('% of produced')} (${i18n.global.t('Primary unit').toLowerCase()})`,
      type: 'number',
      defaultDirection: 'desc',
      hasTotal: true,
      width: '120px',
    },
    SCRAP_ALT_QTY_PCT: {
      textKey: 'scrapAltQtyPctFormatted',
      secondaryTextKey: 'totalAltQtyFormatted',
      valueKey: 'scrapAltQtyPct',
      id: calcMeasure.SCRAP_ALT_QTY_PCT,
      text: `${i18n.global.t('% of produced')} (${i18n.global.t('Alternative unit').toLowerCase()})`,
      type: 'number',
      defaultDirection: 'desc',
      hasTotal: true,
      width: '120px',
    },
    SCRAP_DURATION: {
      textKey: 'scrapDuration',
      valueKey: 'scrapDuration',
      id: measure.SCRAP_DURATION,
      text: i18n.global.t('Time lost'),
      hasTotal: true,
      type: 'number',
      defaultDirection: 'desc',
      isDurationValue: true,
      formatFn: (val) => formatDuration(val, options.durFormatType, { keepDecimalPlaces: true }),
      width: '120px',
    },
    GOOD_PRODUCTION: {
      textKey: 'goodProduction',
      secondaryTextKey: 'goodDurPctFormatted',
      valueKey: 'goodProduction',
      id: measure.GOOD_PRODUCTION,
      text: i18n.global.t('goodproduction'),
      type: 'number',
      defaultDirection: 'desc',
      hasTotal: true,
      isDurationValue: true,
      isHidden: getXAxisKey() === xAxisKey.ENTITY_ID || getXAxisKey() === xAxisKey.ENTITY_GROUP_ID,
      formatFn: (val) => formatDuration(val, options.durFormatType, { keepDecimalPlaces: true }),
      width: '120px',
    },
  };
}
