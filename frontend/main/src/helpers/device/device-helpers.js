import { differenceInSeconds } from 'date-fns';

import i18n from '@/services/i18n';
import useStationStore from '@/stores/station';
import { calculateTimePassed } from '@/helpers/time/calculateTimePassed';

export const deviceLastOnline = (lastOnline) => {
  const lastOnlineText = calculateTimePassed(lastOnline, true);
  if (lastOnlineText) return `${i18n.global.t('Last online')}: ${i18n.global.t('{variable} ago', { variable: lastOnlineText })}`;
  return '';
};

export const deviceStatus = (lastOnline, offlineInterval) => (differenceInSeconds(new Date(), new Date(lastOnline)) < offlineInterval ? 'online' : 'offline');

export const getDeviceInput = (inputs, inputNumber) => inputs.find((el) => el.inputNumber === inputNumber) || {};

export const isDeviceInactive = (inputs, inputNumber) => {
  const input = getDeviceInput(inputs, inputNumber);
  const stations = useStationStore().stationsMap;
  return !!(input.stationId === 0 || (input.stationId && !stations[input.stationId]));
};

export const getFormattedDeviceInput = (inputs, inputNumber) => {
  if (isDeviceInactive(inputs, inputNumber)) return i18n.global.t('Inactive');
  const { stationsMap } = useStationStore();
  const deviceInputStationId = getDeviceInput(inputs, inputNumber).stationId;
  return stationsMap[deviceInputStationId]?.name || '';
};

export const getDeviceStatusTranslationsMap = () => ({
  online: i18n.global.t('Online'),
  offline: i18n.global.t('Offline'),
});

export function getDeviceStatusTranslation(status) {
  return getDeviceStatusTranslationsMap()[status] ?? '';
}
