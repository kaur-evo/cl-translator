import { mdiCircle } from '@mdi/js';

import i18n from '@/services/i18n';
import measure from '@/stores/reportsConfig/constants/measure';
import dimension from '@/stores/reportsConfig/constants/dimension';
import queryParam from '@/stores/reportsConfig/constants/queryParam';
import { formatNumber } from '@/helpers/numbers/formatNumber';
import getHelperFunctions from '@/stores/reportsConfig/configurations/tableColumns/columnHelperFunctions';
import xAxisKey from '@/stores/reportsConfig/constants/xAxisKey';
import { COLOR_QUALITY, COLOR_GOOD, COLOR_ERROR } from '@/stores/reportsConfig/constants/colors';
import formatDuration from '@/helpers/time/formatDuration';

export default function getChecklistColumns(options) {
  const { isLink, isFirstIndex, getPrependImg } = getHelperFunctions(options);
  return {
    CHECKLIST: {
      text: i18n.global.t('Checklists'),
      id: dimension.CHECKLIST,
      secondaryId: xAxisKey.ENTITY_ID,
      textKey: 'entityName',
      isFixed: isFirstIndex,
      isBold: isFirstIndex,
      isLink,
      defaultDirection: 'asc',
      relatedParam: queryParam.CHECKLIST_ID,
      prependImage: getPrependImg(xAxisKey.ENTITY_ID),
      width: '200px',
    },
    CHECKLIST_GROUP: {
      textKey: 'checklistGroupName',
      id: dimension.CHECKLIST_GROUP,
      secondaryId: xAxisKey.ENTITY_GROUP_ID,
      groupById: 'entityid',
      text: i18n.global.t('Checklist groups'),
      type: 'text',
      defaultDirection: 'asc',
      isFixed: isFirstIndex,
      isBold: isFirstIndex,
      isLink,
      relatedParam: queryParam.CHECKLIST_GROUP_ID,
      prependImage: getPrependImg(xAxisKey.ENTITY_GROUP_ID),
      width: '200px',
    },
    CHECKLIST_TOTAL_COUNT: {
      textKey: 'entityCount',
      id: measure.CHECKLIST_TOTAL_COUNT,
      text: i18n.global.t('Count'),
      hasTotal: true,
      type: 'number',
      defaultDirection: 'desc',
      formatFn: formatNumber,
      prependImage: getPrependImg(xAxisKey.ENTITY_COUNT),
      width: '75px',
    },
    CHECKLIST_SUCCESSFUL_COUNT: {
      textKey: 'successfulChecks',
      secondaryTextKey: 'successfulChecksPctFormatted',
      valueKey: 'successfulChecks',
      id: measure.CHECKLIST_SUCCESSFUL_COUNT,
      text: i18n.global.t('Successful'),
      hasTotal: true,
      type: 'number',
      defaultDirection: 'desc',
      headerPrependIcon: mdiCircle,
      headerPrependIconSize: 12,
      headerPrependIconColor: COLOR_GOOD,
      width: '120px',
    },
    CHECKLIST_UNSUCCESSFUL_COUNT: {
      textKey: 'unsuccessfulChecks',
      secondaryTextKey: 'unsuccessfulChecksPctFormatted',
      valueKey: 'unsuccessfulChecks',
      id: measure.CHECKLIST_UNSUCCESSFUL_COUNT,
      text: i18n.global.t('Unsuccessful'),
      hasTotal: true,
      type: 'number',
      defaultDirection: 'desc',
      headerPrependIcon: mdiCircle,
      headerPrependIconSize: 12,
      headerPrependIconColor: COLOR_QUALITY,
      width: '120px',
    },
    CHECKLIST_MISSED_COUNT: {
      textKey: 'missedChecks',
      secondaryTextKey: 'missedChecksPctFormatted',
      valueKey: 'missedChecks',
      id: measure.CHECKLIST_MISSED_COUNT,
      text: i18n.global.t('Missed'),
      hasTotal: true,
      type: 'number',
      defaultDirection: 'desc',
      headerPrependIcon: mdiCircle,
      headerPrependIconSize: 12,
      headerPrependIconColor: COLOR_ERROR,
      width: '120px',
    },
    MEDIAN_CHECK_DURATION: {
      textKey: 'medianCheckTime',
      valueKey: 'medianCheckTime',
      id: measure.MEDIAN_CHECK_DURATION,
      text: i18n.global.t('Median time'),
      isDurationValue: true,
      type: 'number',
      defaultDirection: 'desc',
      width: '120px',
      formatFn: (val) => (Number.isNaN(Number(val)) ? '-' : formatDuration(val, options.durFormatType, { keepDecimalPlaces: true })),
    },
    CHECKLIST_DONE_BY: {
      textKey: 'doneBy',
      valueKey: 'doneBy',
      id: dimension.CHECKLIST_DONE_BY,
      secondaryId: xAxisKey.CHECKLIST_DONE_BY,
      text: i18n.global.t('Done by'),
      defaultDirection: 'asc',
      isFixed: isFirstIndex,
      isBold: isFirstIndex,
      width: '200px',
    },
  };
}
