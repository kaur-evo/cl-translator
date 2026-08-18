import { setActivePinia, createPinia } from 'pinia';

import {
  getDate, getFormat, formatDate, formatDateInZone,
} from './formatDate';

import useProfileStore from '@/stores/profile';

beforeEach(() => {
  setActivePinia(createPinia());
  // DD/MM/YYYY maps to { short: 'dd/MM', long: 'dd/MM/yyyy' } in dateFormatsMap
  useProfileStore().currentUser = { dateFormat: 'DD/MM/YYYY' };
});

describe('getDate', () => {
  test('getDate with Date objects', () => {
    const date1 = new Date();
    expect(getDate(date1)).toEqual(date1);
    const date2 = new Date('2019-01-01');
    expect(getDate(date2)).toEqual(date2);
    const date3 = new Date('2019-23-01');
    expect(() => {
      getDate(date3);
    }).toThrowError();
  });

  test('getDate with strings', () => {
    const date1 = '2019-01-01';
    expect(getDate(date1)).toEqual(new Date('2019-01-01T00:00:00'));
    const date2 = '2019-23-01';
    expect(() => {
      getDate(date2);
    }).toThrowError();
    const date3 = '2023-01-01T12:12:00';
    expect(getDate(date3)).toEqual(new Date(date3));
    const date4 = '2023-13-01T12:12:00';
    expect(() => {
      getDate(date4);
    }).toThrowError();
  });
});

describe('getFormat', () => {
  test('getFormat', () => {
    expect(getFormat('short')).toEqual('dd/MM');
    expect(getFormat('long')).toEqual('dd/MM/yyyy');
    expect(getFormat('other')).toEqual('other');
    expect(getFormat('yyyy-MM-dd')).toEqual('yyyy-MM-dd');
  });
});

describe('formatDate', () => {
  test('formatDate', () => {
    expect(formatDate('2019-01-01', 'short')).toEqual('01/01');
    expect(formatDate('2019-01-01', 'long')).toEqual('01/01/2019');
    expect(formatDate('2019-01-01', 'yyyy-MM-dd')).toEqual('2019-01-01');
    expect(() => {
      formatDate('2019-01-01', 'other');
    }).toThrowError();
  });
});

describe('formatDateInZone', () => {
  test('formatDateInZone with default timezone', () => {
    expect(formatDateInZone('2019-01-01T00:00:00.000Z', 'UTC', 'short')).toEqual('01/01');
    expect(formatDateInZone('2019-01-01T00:00:00.000Z', 'UTC', 'long')).toEqual('01/01/2019');
    expect(formatDateInZone('2019-01-01T00:00:00.000Z', 'UTC', 'yyyy-MM-dd')).toEqual('2019-01-01');
  });

  test('formatDateInZone with specific timezone', () => {
    expect(formatDateInZone('2019-01-01T00:00:00.000Z', 'America/New_York', 'short')).toEqual('31/12');
    expect(formatDateInZone('2019-01-01T00:00:00.000Z', 'America/New_York', 'long')).toEqual('31/12/2018');
    expect(formatDateInZone('2019-01-01T00:00:00.000Z', 'America/New_York', 'yyyy-MM-dd')).toEqual('2018-12-31');
  });
});
