import i18n from '@/services/i18n';
import { useAiInsightsStore, useDeviceStore } from '@/stores';
import measure from '@/stores/reportsConfig/constants/measure';
import dimension from '@/stores/reportsConfig/constants/dimension';
import queryParam from '@/stores/reportsConfig/constants/queryParam';
import { formatNumber } from '@/helpers/numbers/formatNumber';
import getHelperFunctions from '@/stores/reportsConfig/configurations/tableColumns/columnHelperFunctions';
import { getIconAsset } from '@/helpers/file/getAsset';
import { getAiInsightsIconId } from '@/constants/aiInsights';
import { getStopReasonId } from '@/helpers/aiInsights/getStopReasonId';
import formatDuration from '@/helpers/time/formatDuration';
import xAxisKey from '@/stores/reportsConfig/constants/xAxisKey';
import yAxisKey from '@/stores/reportsConfig/constants/yAxisKey';

const aiInsightsIcon = getIconAsset('artificialIntelligence.svg');

export default function getDowntimeColumns(options) {
  const {
    isLink, isFirstIndex, getPrependImg,
  } = getHelperFunctions(options);
  return {
    COMMENT: {
      text: i18n.global.t('Stop reasons'),
      id: dimension.COMMENT,
      secondaryId: xAxisKey.ENTITY_ID,
      textKey: 'entityName',
      isFixed: isFirstIndex,
      isBold: isFirstIndex,
      isLink,
      defaultDirection: 'asc',
      relatedParam: queryParam.COMMENT_ID,
      prependImage: getPrependImg(xAxisKey.ENTITY_ID),
      style: useDeviceStore().isMobileView ? { maxWidth: '170px' } : { width: '200px' },
      // AI Insights indicator (image-based icon via IconWithTooltip's iconSrc prop)
      appendIconSrc: (item) => (item._hasAiInsights ? aiInsightsIcon : ''),
      appendIconId: (item) => (item._hasAiInsights ? getAiInsightsIconId(getStopReasonId(item)) : ''),
      appendIconSize: 24,
      appendIconTooltipText: i18n.global.t('Get AI insights from extra notes'),
      appendIconClickFn: (item) => {
        const id = getStopReasonId(item);
        if (id) useAiInsightsStore().openMenu(id);
      },
    },
    COMMENT_GROUP: {
      textKey: 'entityGroupName',
      id: dimension.COMMENT_GROUP,
      secondaryId: xAxisKey.ENTITY_GROUP_ID,
      groupById: 'entityid',
      text: i18n.global.t('Stop groups'),
      type: 'text',
      defaultDirection: 'asc',
      isFixed: isFirstIndex,
      isBold: isFirstIndex,
      isLink,
      relatedParam: queryParam.COMMENT_GROUP_ID,
      prependImage: getPrependImg(xAxisKey.ENTITY_GROUP_ID),
      width: '200px',
    },
    STOP_TYPE: {
      textKey: 'entitySubType',
      id: measure.STOP_TYPE,
      text: i18n.global.t('Stop types'),
      type: 'text',
      defaultDirection: 'asc',
      width: '150px',
    },
    STOP_LOCATION: {
      textKey: 'location',
      id: dimension.STOP_LOCATION,
      secondaryId: xAxisKey.POSITION_ID,
      text: i18n.global.t('Machine locations'),
      type: 'text',
      defaultDirection: 'asc',
      isFixed: isFirstIndex,
      isBold: isFirstIndex,
      isLink,
      prependImage: getPrependImg(xAxisKey.POSITION_ID),
      width: '150px',
    },
    STOP_COUNT: {
      textKey: 'entityCount',
      id: measure.STOP_COUNT,
      text: i18n.global.t('stopcount'),
      hasTotal: true,
      type: 'number',
      defaultDirection: 'desc',
      formatFn: formatNumber,
      prependImage: getPrependImg(xAxisKey.ENTITY_COUNT),
      width: '75px',
    },
    STOP_DURATION: {
      textKey: 'valueSec',
      valueKey: 'valueSec',
      id: measure.STOP_DURATION,
      text: `${i18n.global.t('Duration')} (${i18n.global.t('All')})`,
      align: 'end',
      hasTotal: true,
      type: 'number',
      defaultDirection: 'desc',
      isDurationValue: true,
      formatFn: (val) => formatDuration(val, options.durFormatType, { keepDecimalPlaces: true }),
      prependImage: getPrependImg(yAxisKey.VALUE),
      width: '150px',
    },
    INCL_IN_OEE_STOP_DURATION: {
      textKey: 'includedInOeeStops',
      valueKey: 'includedInOeeStops',
      id: measure.STOPS_INCLUDED_IN_OEE,
      text: `${i18n.global.t('Duration')} (${i18n.global.t('incl. in OEE')})`,
      align: 'end',
      hasTotal: true,
      type: 'number',
      defaultDirection: 'desc',
      isDurationValue: true,
      formatFn: (val) => formatDuration(val, options.durFormatType),
      prependImage: getPrependImg(yAxisKey.VALUE),
      width: '150px',
    },
    IDEAL_QTY: {
      textKey: 'idealQtyFormatted',
      valueKey: 'idealQty',
      id: measure.IDEAL_QTY,
      text: `${i18n.global.t('Loss')} (${i18n.global.t('Primary unit').toLowerCase()})`,
      type: 'number',
      defaultDirection: 'desc',
      hasTotal: true,
      width: '120px',
    },
    IDEAL_ALT_QTY: {
      textKey: 'idealAltQtyFormatted',
      valueKey: 'idealAltQty',
      id: measure.IDEAL_ALT_QTY,
      text: `${i18n.global.t('Loss')} (${i18n.global.t('Alternative unit').toLowerCase()})`,
      type: 'number',
      defaultDirection: 'desc',
      hasTotal: true,
      width: '120px',
    },
  };
}
