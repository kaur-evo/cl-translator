import useProfileStore from '@/stores/profile';
import useFilterbarStore from '@/stores/filterbar';
import i18n from '@/services/i18n';
import listToKeyMap from '@/helpers/list/listToKeyMap';
import { entities, settingsUserActions, svUserActions } from '@/constants/activityLogsConstants';
import { getCurrentPeriod } from '@/constants/rollingPeriodRangeDefinitions';

const svUserActionMapping = {
  [svUserActions.ADDED]: [svUserActions.ADDED, svUserActions.SAVED],
};

export const getRequestParams = async (requestEntities, tableOptions) => {
  const filterbarStore = useFilterbarStore();
  const profileStore = useProfileStore();
  const { requestFilterState } = filterbarStore;
  const dates = Array.isArray(requestFilterState.period) ? requestFilterState.period : getCurrentPeriod(requestFilterState.period, { weekStartsOn: profileStore.firstDayOfWeek });
  const params = {
    filter: {
      entities: requestEntities,
      startDate: dates?.[0],
      endDate: dates?.[1],
    },
    limit: tableOptions.itemsPerPage,
    page: tableOptions.page - 1,
  };
  if (requestFilterState.userActions?.length > 0) {
    params.filter.userActions = requestFilterState.userActions.flatMap(
      (action) => svUserActionMapping[action] || [action],
    );
  }
  return params;
};

export const getEntitiesList = (checklistsEnabled, securitySettingsEnabled) => {
  const entitiesList = [
    { name: i18n.global.t('Users'), id: entities.USER },
    { name: i18n.global.t('Operators'), id: entities.OPERATOR },
    { name: i18n.global.t('Stop reasons'), id: entities.STOP_REASON },
    { name: i18n.global.t('Stop groups'), id: entities.STOP_REASON_GROUP },
    { name: i18n.global.t('Speed loss reasons'), id: entities.SPEED_LOSS },
    { name: i18n.global.t('Speed loss groups'), id: entities.SPEED_LOSS_GROUP },
    { name: i18n.global.t('Scrap reasons'), id: entities.SCRAP_REASON },
    { name: i18n.global.t('Scrap groups'), id: entities.SCRAP_REASON_GROUP },
    { name: i18n.global.t('Stations'), id: entities.STATION },
    { name: i18n.global.t('Station groups'), id: entities.STATION_GROUP },
    { name: i18n.global.t('Machine locations'), id: entities.POSITION },
    { name: i18n.global.t('products'), id: entities.PRODUCT },
    { name: i18n.global.t('Product groups'), id: entities.PRODUCT_GROUP },
    { name: i18n.global.t('Shifts'), id: entities.SHIFT },
    { name: i18n.global.t('Checklists'), id: entities.CHECKLIST, isHidden: !checklistsEnabled },
    { name: i18n.global.t('Checklist groups'), id: entities.CHECKLIST_GROUP, isHidden: !checklistsEnabled },
    { name: i18n.global.t('Security'), id: entities.SECURITY, isHidden: !securitySettingsEnabled },
  ];
  return entitiesList.filter((entity) => !entity.isHidden);
};

export function getEntityString(entity) {
  return listToKeyMap(getEntitiesList(true, true), 'id')[entity]?.name ?? '';
}

export const getSVLogsEventsList = (checklistsEnabled) => {
  const eventsList = [
    { name: i18n.global.t('Changeover'), id: entities.BATCH },
    { name: i18n.global.t('Checklists'), id: entities.CHECKLIST, isHidden: !checklistsEnabled },
    { name: i18n.global.t('Downtime'), id: entities.DOWNTIME },
    { name: i18n.global.t('Operators'), id: entities.OPERATOR },
    { name: i18n.global.t('Scrap'), id: entities.SCRAP },
    { name: i18n.global.t('Shift'), id: entities.SHIFT },
    { name: i18n.global.t('Signal'), id: entities.SIGNAL },
    { name: i18n.global.t('Speed loss'), id: entities.SPEED_LOSS },
  ];
  return eventsList.filter((event) => !event.isHidden);
};

export function getSVLogsEventString(event) {
  return listToKeyMap(getSVLogsEventsList(true), 'id')[event]?.name ?? '';
}

export const getSettingsUserActionsList = () => [
  { name: i18n.global.t('Added'), id: settingsUserActions.SAVED },
  { name: i18n.global.t('Edited'), id: settingsUserActions.EDITED },
  { name: i18n.global.t('Deleted'), id: settingsUserActions.DELETED },
];

export const getSVUserActionsList = (checklistsEnabled) => {
  const actionsList = [
    { name: i18n.global.t('Added'), id: svUserActions.ADDED },
    { name: i18n.global.t('Edited'), id: svUserActions.EDITED },
    { name: i18n.global.t('Deleted'), id: svUserActions.DELETED },
    { name: i18n.global.t('First fill'), id: svUserActions.FIRST_FILL, isHidden: !checklistsEnabled },
  ];
  return actionsList.filter((action) => !action.isHidden);
};
