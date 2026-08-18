import { mdiCircle } from '@mdi/js';

import i18n from '@/services/i18n';
import { getDeviceStatusTranslation, isDeviceInactive } from '@/helpers/device/device-helpers';
import { rightArrowHeader } from '@/components/organisms/settings/SettingsEntitiesTable/TableConfigs/settingsTableHeaders';

const getInputClass = (inputs, inputNumber) => (isDeviceInactive(inputs, inputNumber) ? 'text--secondary' : '');

export function createTableHeadersConf() {
  const headers = [
    {
      text: i18n.global.t('Serial number'),
      value: 'serialNumber',
      textKey: 'serialNumber',
      isFixed: true,
      isBold: true,
    },
    {
      text: i18n.global.t('Status'),
      textKey: 'status',
      secondaryTextKey: 'lastOnline',
      tooltipTextKey: 'lastOnline',
      secondaryTextClass: 'text-body-small',
      isBold: true,
      prependIcon: mdiCircle,
      prependIconSize: 9,
      prependIconColor: (item) => (item.status === 'online' ? 'primary' : 'error'),
      formatFn: (status) => (getDeviceStatusTranslation(status)),
    },
    {
      text: () => `${i18n.global.t('Input')} 1`,
      textKey: 'input1',
      class: (device) => getInputClass(device.inputs, 1),
    },
    {
      text: () => `${i18n.global.t('Input')} 2`,
      textKey: 'input2',
      class: (device) => getInputClass(device.inputs, 2),
    },
    {
      text: () => `${i18n.global.t('Input')} 3`,
      textKey: 'input3',
      class: (device) => getInputClass(device.inputs, 3),
    },
    {
      text: () => `${i18n.global.t('Input')} 4`,
      textKey: 'input4',
      class: (device) => getInputClass(device.inputs, 4),
    },
    {
      text: i18n.global.t('Description'),
      textKey: 'description',
      classes: 'py-2',
      noTruncation: true,
    },
    rightArrowHeader,
  ];
  return headers;
}
