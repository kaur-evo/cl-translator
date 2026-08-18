import { setActivePinia, createPinia } from 'pinia';

import formatSecondsFriendly from './formatSecondsFriendly';

beforeEach(() => {
  setActivePinia(createPinia());
});

describe('formatSecondsFriendly', () => {
  const timeInSecs = {
    55: {
      val: 55,
      showSecondIfZero: true,
      usePadFunc: false,
      shortenedMinutes: 'min',
      result: '55s',
    },
    '60-1': {
      val: 60,
      showSecondIfZero: true,
      usePadFunc: true,
      shortenedMinutes: 'min',
      result: '01min 00s',
    },
    '60-2': {
      val: 60,
      showSecondIfZero: true,
      usePadFunc: false,
      shortenedMinutes: 'min',
      result: '1min 0s',
    },
    '60-3': {
      val: 60,
      showSecondIfZero: false,
      usePadFunc: true,
      shortenedMinutes: 'min',
      result: '01min',
    },
    '60-4': {
      val: 60,
      showSecondIfZero: false,
      usePadFunc: false,
      shortenedMinutes: 'min',
      result: '1min',
    },
    180: {
      val: 180,
      showSecondIfZero: false,
      usePadFunc: false,
      shortenedMinutes: 'min',
      result: '3min',
    },
    1800: {
      val: 1800,
      showSecondIfZero: true,
      usePadFunc: true,
      shortenedMinutes: 'm',
      result: '30m 00s',
    },
    1860: {
      val: 1860,
      showSecondIfZero: true,
      usePadFunc: false,
      shortenedMinutes: 'm',
      result: '31m 0s',
    },
    7200: {
      val: 7200,
      showSecondIfZero: false,
      usePadFunc: false,
      shortenedMinutes: 'min',
      result: '2h',
    },
    10800: {
      val: 10800,
      showSecondIfZero: true,
      usePadFunc: true,
      shortenedMinutes: 'm',
      result: '3h 00m 00s',
    },
    14400: {
      val: 14400,
      showSecondIfZero: true,
      usePadFunc: false,
      shortenedMinutes: 'min',
      result: '4h 0min',
    },
  };
  Object.values(timeInSecs).forEach((timeObj) => {
    test(
      `formatted time for ${timeObj.val},
          when showSecondIfZero is ${timeObj.showSecondIfZero}, usePadFunc is ${timeObj.usePadFunc} and shortenedMinutes is ${timeObj.shortenedMinutes},
          is ${timeObj.result}`,
      () => {
        expect(formatSecondsFriendly(timeObj.val, timeObj.showSecondIfZero, timeObj.usePadFunc, timeObj.shortenedMinutes)).toBe(timeObj.result);
      },
    );
  });
});
