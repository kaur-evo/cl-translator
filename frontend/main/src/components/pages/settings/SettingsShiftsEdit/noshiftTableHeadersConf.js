import { useI18n } from 'vue-i18n';

import useCommonColumns from '@/components/pages/settings/SettingsShiftsEdit/useCommonColumns';
import { formatDateInZone } from '@/helpers/date/formatDate';
import useStationStore from '@/stores/station';

export default function getNoshiftsTableHeaders(hasActions, deviationAllowedStationsIds) {
  const allowedStationIdsSet = new Set(deviationAllowedStationsIds);
  const stationStore = useStationStore();
  const { getRowActionsColumn, getPrimaryColumn } = useCommonColumns();
  const { t } = useI18n();
  const headers = [
    getPrimaryColumn({
      text: t('Name'),
      value: 'description',
      textKey: 'description',
    }),
    {
      text: t('Start'),
      value: 'startTime',
      textKey: 'startTime',
      formatFn: (val, obj) => formatDateInZone(val, stationStore.getZoneIdByStationIds(obj.stationIds), 'long'),
    },
    {
      text: t('End'),
      value: 'endTime',
      textKey: 'endTime',
      formatFn: (val, obj) => formatDateInZone(val, stationStore.getZoneIdByStationIds(obj.stationIds), 'long'),
    },
    {
      text: t('Stations'),
      value: 'stationIds',
      textKey: 'stationIds',
      formatFn: (val) => stationStore.getOrderedStationNamesArray(val.filter((id) => allowedStationIdsSet.has(id))).join(', '),
    },
  ];
  if (hasActions) {
    headers.push(getRowActionsColumn());
  }
  return headers;
}
