import { mdiCircle, mdiSquareRounded } from '@mdi/js';
import { useI18n } from 'vue-i18n';

import {
  rightArrowHeader, statusHeader, stationHeader,
} from '@/components/organisms/settings/SettingsEntitiesTable/TableConfigs/settingsTableHeaders';
import useDeviceStore from '@/stores/device';

export function createTableHeadersConf() {
  const { t } = useI18n();
  const headers = [
    statusHeader('enabled', { tooltip: t('Deleting or turning off templates will not affect active shifts or historical data.') }),
    {
      prependIcon: mdiSquareRounded,
      prependIconColor: (item) => item.color,
      prependIconSize: 16,
      text: t('Shifts'),
      value: 'name',
      textKey: 'name',
      style: useDeviceStore().isMobileView ? { maxWidth: '170px' } : { minWidth: '200px' },
      isFixed: true,
      isBold: true,
    },
    {
      ...stationHeader(),
      headerAppendIcon: new Date() < new Date('2024-12-03') ? mdiCircle : null,
      headerAppendIconSize: 9,
      headerAppendIconColor: 'primary',
      headerAppendIconClass: 'ml-1 mt-n1',
    },
    {
      text: t('Days'),
      valueKey: 'shiftDays',
      textKey: 'shiftDays',
    },
    {
      text: t('Shift time'),
      valueKey: 'startTime',
      textKey: 'shiftTime',
    },
    {
      text: t('No shift'),
      valueKey: 'noShiftDeviationCount',
      textKey: 'noShiftDeviationCount',
      formatFn: (count) => count || '-',
      isPopUp: (item) => item.noShiftDeviationCount > 0,
      filterable: false,
      additionalStyle: { float: 'right' },
      style: { width: '120px' },
      isBold: true,
    },
    rightArrowHeader,
  ];

  return headers;
}
