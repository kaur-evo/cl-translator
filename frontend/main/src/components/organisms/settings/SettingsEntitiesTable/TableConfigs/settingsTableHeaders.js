import { mdiChevronRight, mdiWeb, mdiSquareRounded } from '@mdi/js';

import i18n from '@/services/i18n';
import listToShortenedString from '@/helpers/list/listToShortenedString';
import listToCommaSeparatedString from '@/helpers/list/listToCommaSeparatedString';
import useFactoryStore from '@/stores/factory';
import useStationStore from '@/stores/station';
import useDeviceStore from '@/stores/device';
import useCommentStore from '@/stores/comment';
import usePerfCommentStore from '@/stores/perfComment';
import useScrapReasonStore from '@/stores/scrapReason';
import useProductStore from '@/stores/product';
import useChecklistTemplateStore from '@/stores/checklistTemplate';

const formatListOfStrings = (list, showEmptyAsAll = false, totalCount = -1) => {
  if (!list) return '-';
  if (list.length === 0 && showEmptyAsAll) return i18n.global.t('All');
  if (list.length === 0) return '-';
  if (totalCount > 0 && list.length >= totalCount) return i18n.global.t('All');
  return list.join(', ');
};

const groupsListByKey = (storeKey) => {
  const storeKeyMap = {
    'comment/commentGroups': () => useCommentStore().commentGroups,
    'station/stationGroups': () => useStationStore().stationGroups,
    'product/productGroups': () => useProductStore().productGroups,
    'checklistTemplate/checklistGroups': () => useChecklistTemplateStore().checklistGroups,
    'perfComment/perfCommentGroups': () => usePerfCommentStore().perfCommentGroups,
    'scrapReason/scrapReasonGroups': () => useScrapReasonStore().scrapReasonGroups,
  };
  return storeKeyMap[storeKey]?.() ?? [];
};

export function factoryHeader(isSortable, showEmptyAsAll = true) {
  return {
    text: i18n.global.t('Factories'),
    textKey: 'factoryNamesArray',
    sortable: isSortable,
    isHidden: () => useFactoryStore().factories.length <= 1,
    showTooltip: (factories) => factories.length > 1,
    formatTooltipFn: listToCommaSeparatedString,
    formatFn: (factoryNamesArray) => formatListOfStrings(factoryNamesArray, showEmptyAsAll, useFactoryStore().factories.length),
  };
}

export function stationHeader(isSortable = true, showEmptyAsAll = false) {
  return {
    text: i18n.global.t('Stations'),
    textKey: 'stationNamesArray',
    sortable: isSortable,
    formatTooltipFn: listToCommaSeparatedString,
    formatFn: (list) => formatListOfStrings(list, showEmptyAsAll, useStationStore().stations.length),
  };
}

export function groupHeader(storeKey, userHasGlobalGroupsIcon) {
  return {
    prependIcon: (item) => (item.groupColor ? mdiSquareRounded : ''),
    prependIconColor: (item) => item.groupColor,
    prependIconSize: 16,
    text: i18n.global.t('Group'),
    value: 'groupId',
    textKey: 'groupName',
    appendIcon: (entity) => (userHasGlobalGroupsIcon && groupsListByKey(storeKey).find((g) => g.id === entity.groupId)?.local === false ? mdiWeb : ''),
    appendIconClass: 'ml-2',
    appendIconSize: 16,
    appendIconTooltipText: i18n.global.t('Global group'),
  };
}

export const rightArrowHeader = {
  filterable: false,
  appendIcon: mdiChevronRight,
  sortable: false,
  isHidden: () => useDeviceStore().isMobileView,
  additionalStyle: { float: 'right' },
  style: { width: '50px' },
};

export const statusHeader = (textKey = 'active', options) => ({
  text: i18n.global.t('Status'),
  textKey,
  isBold: true,
  isSlotColumn: true,
  isFixed: true,
  slotName: 'dropdown-selection',
  notClickable: true,
  width: '152px',
  additionalStyle: { minWidth: '120px' },
  tooltip: options?.tooltip || null,
});

export const productHeader = () => ({
  text: i18n.global.t('Product'),
  textKey: 'productNamesArray',
  hasProgressBarOnLoad: true,
  formatTooltipFn: (productNamesArray) => listToShortenedString(productNamesArray, 10),
  formatFn: (productNamesArray) => {
    if (!productNamesArray.length) return i18n.global.t('All');
    return listToCommaSeparatedString(productNamesArray);
  },
});

export { formatListOfStrings };
