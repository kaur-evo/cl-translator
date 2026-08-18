import i18n from '@/services/i18n';
import { useDeviceStore } from '@/stores';
import measure from '@/stores/reportsConfig/constants/measure';
import dimension from '@/stores/reportsConfig/constants/dimension';
import queryParam from '@/stores/reportsConfig/constants/queryParam';
import { formatNumber } from '@/helpers/numbers/formatNumber';
import getHelperFunctions from '@/stores/reportsConfig/configurations/tableColumns/columnHelperFunctions';
import formatDuration from '@/helpers/time/formatDuration';
import yAxisKey from '@/stores/reportsConfig/constants/yAxisKey';
import xAxisKey from '@/stores/reportsConfig/constants/xAxisKey';

export default function getSpeedlossColumns(options) {
  const {
    isLink, isFirstIndex, getPrependImg, hasNotesCount,
  } = getHelperFunctions(options);
  return {
    PERFORMANCE_COMMENT: {
      text: i18n.global.t('Speed loss reasons'),
      id: dimension.PERFORMANCE_COMMENT,
      secondaryId: xAxisKey.ENTITY_ID,
      textKey: 'entityName',
      isFixed: isFirstIndex,
      isBold: isFirstIndex,
      isLink,
      defaultDirection: 'asc',
      relatedParam: queryParam.PERFORMANCE_COMMENT_ID,
      prependImage: getPrependImg(xAxisKey.ENTITY_ID),
      style: useDeviceStore().isMobileView ? { maxWidth: '170px' } : { width: '200px' },
    },
    PERFORMANCE_COMMENT_GROUP: {
      textKey: 'entityGroupName',
      id: dimension.PERFORMANCE_COMMENT_GROUP,
      secondaryId: xAxisKey.ENTITY_GROUP_ID,
      groupById: 'entityid',
      text: i18n.global.t('Speed loss groups'),
      type: 'text',
      defaultDirection: 'asc',
      isFixed: isFirstIndex,
      isBold: isFirstIndex,
      isLink,
      relatedParam: queryParam.PERFORMANCE_COMMENT_GROUP_ID,
      prependImage: getPrependImg(xAxisKey.ENTITY_GROUP_ID),
      width: '200px',
    },
    PERFORMANCE_LOSS_LOCATION: {
      textKey: 'location',
      id: dimension.PERFORMANCE_LOSS_LOCATION,
      secondaryId: xAxisKey.PERFORMANCE_POSITION_ID,
      text: i18n.global.t('Machine locations'),
      type: 'text',
      defaultDirection: 'asc',
      isFixed: isFirstIndex,
      isBold: isFirstIndex,
      isLink,
      prependImage: getPrependImg(xAxisKey.PERFORMANCE_POSITION_ID),
      width: '200px',
    },
    PERFORMANCE_LOSS_COUNT: {
      textKey: 'entityCount',
      id: measure.PERFORMANCE_LOSS_COUNT,
      text: i18n.global.t('stopcount'),
      hasTotal: true,
      type: 'number',
      defaultDirection: 'desc',
      formatFn: formatNumber,
      prependImage: getPrependImg(yAxisKey.ENTITY_COUNT),
      width: '75px',
    },
    PERFORMANCE_LOSS_NOTES_COUNT: {
      textKey: 'notesCount',
      id: measure.PERFORMANCE_LOSS_NOTES_COUNT,
      text: i18n.global.t('Notes'),
      hasTotal: true,
      type: 'number',
      defaultDirection: 'desc',
      isPopUp: hasNotesCount,
      formatFn: (val) => (val > 0 ? '' : 0),
      prependImage: getPrependImg(yAxisKey.NOTES_COUNT),
      width: '75px',
    },
    PERFORMANCE_LOSS_DURATION: {
      textKey: 'valueSec',
      valueKey: 'valueSec',
      id: measure.PERFORMANCE_LOSS_DURATION,
      text: i18n.global.t('Duration'),
      align: 'end',
      hasTotal: true,
      type: 'number',
      defaultDirection: 'desc',
      isDurationValue: true,
      formatFn: (val) => formatDuration(val, options.durFormatType, { keepDecimalPlaces: true }),
      prependImage: getPrependImg(yAxisKey.VALUE),
      width: '150px',
    },
    PERFORMANCE_LOSS_QTY: {
      textKey: 'lossQtyFormatted',
      valueKey: 'lossQty',
      id: measure.IDEAL_QTY,
      text: `${i18n.global.t('Loss')} (${i18n.global.t('Primary unit').toLowerCase()})`,
      type: 'number',
      defaultDirection: 'desc',
      hasTotal: true,
      width: '120px',
    },
    PERFORMANCE_LOSS_ALT_QTY: {
      textKey: 'lossAltQtyFormatted',
      valueKey: 'lossAltQty',
      id: measure.IDEAL_ALT_QTY,
      text: `${i18n.global.t('Loss')} (${i18n.global.t('Alternative unit').toLowerCase()})`,
      type: 'number',
      defaultDirection: 'desc',
      hasTotal: true,
      width: '120px',
    },
  };
}
