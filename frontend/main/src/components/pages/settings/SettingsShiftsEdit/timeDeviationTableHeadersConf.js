import { useI18n } from 'vue-i18n';

import { formatDateInZone } from '@/helpers/date/formatDate';
import { formatTimeInZone } from '@/helpers/time/formatTime';
import humanizeDuration from '@/helpers/time/humanizeDuration';
import useCommonColumns from '@/components/pages/settings/SettingsShiftsEdit/useCommonColumns';
import useStationStore from '@/stores/station';

export function formatShiftTimeRange(obj, zoneId) {
  const timeRange = `${formatTimeInZone(obj.startTime, zoneId)} - ${formatTimeInZone(obj.endTime, zoneId)}`;
  const duration = humanizeDuration((new Date(obj.endTime) - new Date(obj.startTime)) / 1000, { type: 'min', largest: 'hour' });
  return `${timeRange} (${duration})`;
}


export default function getTimeDeviationTableHeaders(deviationAllowedStationsIds) {
  const allowedStationIdsSet = new Set(deviationAllowedStationsIds);
  const stationStore = useStationStore();
  const { t } = useI18n();
  const { getRowActionsColumn, getPrimaryColumn } = useCommonColumns();
  const headers = [
    getPrimaryColumn({
      text: t('Shift date'),
      value: 'startTime',
      textKey: 'startTime',
      formatFn: (val, obj) => formatDateInZone(val, stationStore.getZoneIdByStationIds(obj.stationIds), 'long'),
    }),
    {
      text: t('Shift time'),
      value: 'startTime',
      textKey: 'startTime',
      formatFn: (val, obj) => formatShiftTimeRange(obj, stationStore.getZoneIdByStationIds(obj.stationIds)),
    },
    {
      text: t('station'),
      value: 'stationIds',
      textKey: 'stationIds',
      formatFn: (val) => stationStore.getOrderedStationNamesArray(val.filter((id) => allowedStationIdsSet.has(id))).join(', '),
    },
    getRowActionsColumn(),
  ];

  return headers;
}
