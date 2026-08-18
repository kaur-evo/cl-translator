import { subMinutes, subYears, subSeconds } from 'date-fns';
import { setActivePinia, createPinia } from 'pinia';

import {
  deviceLastOnline, deviceStatus, isDeviceInactive, getFormattedDeviceInput, getDeviceInput, getDeviceStatusTranslation,
} from './device-helpers';

import useStationStore from '@/stores/station';

describe('deviceLastOnline', () => {
  test('that deviceLastOnline method returns empty string, when lastOnline param is undefined', () => {
    expect(deviceLastOnline(undefined)).toBe('');
  });
  test('that deviceLastOnline method returns empty string, when device was last online more than a year ago', () => {
    expect(deviceLastOnline(subYears(new Date(), 2))).toBe('');
  });
  test('that deviceLastOnline method returns phrase with lastOnline variable placeholder', () => {
    expect(deviceLastOnline(subMinutes(new Date(), 1400))).toBe('Last online: {variable} ago');
  });
});

describe('deviceStatus', () => {
  const offlineNotificationInterval = 720;
  test('that device is online, when it was active less than offlineNotificationInterval seconds ago', () => {
    expect(deviceStatus(subSeconds(new Date(), offlineNotificationInterval - 100), offlineNotificationInterval)).toBe('online');
  });
  test('that device is online, when it was active more than offlineNotificationInterval seconds ago', () => {
    expect(deviceStatus(subMinutes(new Date(), offlineNotificationInterval + 100), offlineNotificationInterval)).toBe('offline');
  });
});

describe('isDeviceInactive and getFormattedDeviceInput', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    useStationStore().stations = [{ id: 1, name: 'Station1' }];
  });
  test('that result is truthy and formatted device input returns "Inactive", if station is not present', () => {
    expect(isDeviceInactive([{ inputNumber: 1, stationId: 2 }], 1)).toBeTruthy();
    expect(getFormattedDeviceInput([{ inputNumber: 1, stationId: 2 }], 1)).toEqual('Inactive');
  });
  test('that result is falsy and formatted device input returns station name, id station is present', () => {
    expect(isDeviceInactive([{ inputNumber: 1, stationId: 1 }], 1)).toBeFalsy();
    expect(getFormattedDeviceInput([{ inputNumber: 1, stationId: 1 }], 1)).toEqual('Station1');
  });
  test('that result is truthy and formatted device input returns "Inactive", if station id is 0', () => {
    expect(isDeviceInactive([{ inputNumber: 1, stationId: 0 }], 1)).toBeTruthy();
    expect(getFormattedDeviceInput([{ inputNumber: 1, stationId: 0 }], 1)).toEqual('Inactive');
  });
  test('that result is falsy and formatted device input returns empty string, if there is not a device with given input number', () => {
    expect(isDeviceInactive([{ inputNumber: 1, stationId: 1 }], 2)).toBeFalsy();
    expect(getFormattedDeviceInput([{ inputNumber: 1, stationId: 1 }], 2)).toEqual('');
  });
});

describe('getDeviceInput', () => {
  it('returns correct input from inputs array, if input exists with given number', () => {
    expect(getDeviceInput([{ inputNumber: 1, stationId: 1 }, { inputNumber: 2, stationId: 1 }], 2)).toEqual({ inputNumber: 2, stationId: 1 });
  });
  it('returns empty object, if inputs array does not contain an input with given number', () => {
    expect(getDeviceInput([{ inputNumber: 1, stationId: 1 }, { inputNumber: 2, stationId: 1 }], 3)).toEqual({});
  });
});

describe('getDeviceStatusTranslation', () => {
  it('returns correct phrase for online status', () => {
    expect(getDeviceStatusTranslation('online')).toBe('Online');
  });
  it('returns correct phrase for offline status', () => {
    expect(getDeviceStatusTranslation('offline')).toBe('Offline');
  });
  it('returns empty string, if status is not recognized', () => {
    expect(getDeviceStatusTranslation('unknown')).toBe('');
  });
});
