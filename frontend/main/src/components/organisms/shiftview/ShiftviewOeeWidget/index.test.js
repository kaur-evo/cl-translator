import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ShiftviewOeeWidget from './index.vue';

import colorConstants from '@/constants/colorConstants';
import {
  useShiftStore,
  useStationStore,
  useDeviceStore,
} from '@/stores/index';

const createWrapper = ({ statistics = { hourStatistics: {} } } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const shiftStore = useShiftStore(pinia);
  shiftStore.shift = { id: 123 };
  shiftStore.statistics = statistics;

  const stationStore = useStationStore(pinia);
  stationStore.lineviewStation = { zoneId: 'UTC', oeeGoalHappy: 80 };

  const deviceStore = useDeviceStore(pinia);
  deviceStore.screenWidth = 0;

  return shallowMount(ShiftviewOeeWidget, {
    global: { plugins: [pinia] },
  });
};

describe('ShiftviewOeeWidget', () => {
  it('has sorted hour statistics', () => {
    const wrapper = createWrapper({
      statistics: {
        shiftTotal: {
          availability: 0,
          performance: 0,
          quality: 1,
          oee: 0,
        },
        hourStatistics: {
          '2019-12-24T01:00:00.000Z': { dateTime: '2019-12-24T01:00:00.000Z' },
          '2019-12-24T02:00:00.000Z': { dateTime: '2019-12-24T02:00:00.000Z' },
        },
      },
    });
    expect(wrapper.vm.sortedHourStatisticsKeys.length).toBe(2);
    expect(wrapper.vm.sortedHourStatisticsKeys).toEqual(['2019-12-24T01:00:00.000Z', '2019-12-24T02:00:00.000Z']);
  });

  it('is sorting hour statistics values', () => {
    const inputHourStats = {
      '2019-12-24T00:00:00.000Z': { dateTime: '2019-12-24T00:00:00.000Z' },
      '2019-12-24T01:00:00.000Z': { dateTime: '2019-12-24T01:00:00.000Z' },
      '2019-12-24T02:00:00.000Z': { dateTime: '2019-12-24T02:00:00.000Z' },
      '2019-12-23T22:00:00.000Z': { dateTime: '2019-12-23T22:00:00.000Z' },
      '2019-12-23T23:00:00.000Z': { dateTime: '2019-12-23T23:00:00.000Z' },
    };
    const resultHourStats = [
      '2019-12-23T22:00:00.000Z',
      '2019-12-23T23:00:00.000Z',
      '2019-12-24T00:00:00.000Z',
      '2019-12-24T01:00:00.000Z',
      '2019-12-24T02:00:00.000Z',
    ];
    const wrapper = createWrapper({
      statistics: {
        shiftTotal: {
          availability: 0,
          performance: 0,
          quality: 1,
          oee: 0,
        },
        hourStatistics: inputHourStats,
      },
    });
    expect(wrapper.vm.sortedHourStatisticsKeys.length).toBe(5);
    expect(wrapper.vm.sortedHourStatisticsKeys).toEqual(resultHourStats);
  });

  it('creates x domain values', () => {
    const inputHourStats = {
      '2019-12-24T00:00:00.000Z': { dateTime: '2019-12-24T00:00:00.000Z' },
      '2019-12-24T01:00:00.000Z': { dateTime: '2019-12-24T01:00:00.000Z' },
      '2019-12-24T02:00:00.000Z': { dateTime: '2019-12-24T02:00:00.000Z' },
      '2019-12-23T22:00:00.000Z': { dateTime: '2019-12-23T22:00:00.000Z' },
      '2019-12-23T23:00:00.000Z': { dateTime: '2019-12-23T23:00:00.000Z' },
    };
    const resultHourStats = [
      '2019-12-23T22:00:00.000Z',
      '2019-12-23T23:00:00.000Z',
      '2019-12-24T00:00:00.000Z',
      '2019-12-24T01:00:00.000Z',
      '2019-12-24T02:00:00.000Z',
    ];
    const wrapper = createWrapper({
      statistics: {
        shiftTotal: {
          availability: 0,
          performance: 0,
          quality: 1,
          oee: 0,
        },
        hourStatistics: inputHourStats,
      },
    });
    expect(wrapper.vm.xDomain.length).toBe(5);
    expect(wrapper.vm.xDomain).toEqual(resultHourStats);
  });

  test('that it returns processed statistics values', () => {
    const inputHourStats = {
      '2019-12-24T00:00:00.000Z': {
        dateTime: '2019-12-24T00:00:00.000Z', productionTime: 0, plannedTime: 0, delaysTime: 0, availability: 1, performance: 1, quality: 1, oee: 1,
      },
      '2019-12-24T01:00:00.000Z': {
        dateTime: '2019-12-24T01:00:00.000Z', productionTime: 10, plannedTime: 60, delaysTime: 50, availability: 0.5, performance: 1, quality: 1, oee: 0.5,
      },
      '2019-12-24T02:00:00.000Z': {
        dateTime: '2019-12-24T02:00:00.000Z', productionTime: 0, plannedTime: 0, delaysTime: 0, availability: 1, performance: 1, quality: 1, oee: 1,
      },
      '2019-12-23T22:00:00.000Z': {
        dateTime: '2019-12-23T22:00:00.000Z', productionTime: 20, plannedTime: 20, delaysTime: 0, availability: 1, performance: 0.9, quality: 1, oee: 0.9,
      },
      '2019-12-23T23:00:00.000Z': {
        dateTime: '2019-12-23T23:00:00.000Z', productionTime: 0, plannedTime: 0, delaysTime: 0, availability: 1, performance: 1, quality: 0.7, oee: 0.7,
      },
    };
    const resultHourStats = [
      {
        availability: 1,
        color: colorConstants.dark['quaternary-dark-2'],
        dateTime: '2019-12-23T22:00:00.000Z',
        measure: '2019-12-23T22:00:00.000Z',
        oee: 0.9,
        performance: 0.9,
        startTime: '22:00',
        endTime: '23:00',
        productionTime: 20,
        quality: 1,
        plannedTime: 20,
        delaysTime: 0,
        target: 80,
      },
      {
        availability: 1,
        color: colorConstants.dark['secondary-dark'],
        dateTime: '2019-12-23T23:00:00.000Z',
        measure: '2019-12-23T23:00:00.000Z',
        oee: 0.7,
        performance: 1,
        startTime: '23:00',
        endTime: '00:00',
        productionTime: 0,
        quality: 0.7,
        plannedTime: 0,
        delaysTime: 0,
        target: 80,
      },
      {
        availability: 1,
        color: colorConstants.dark['quaternary-dark-2'],
        dateTime: '2019-12-24T00:00:00.000Z',
        measure: '2019-12-24T00:00:00.000Z',
        oee: 1,
        performance: 1,
        startTime: '00:00',
        endTime: '01:00',
        productionTime: 0,
        quality: 1,
        plannedTime: 0,
        delaysTime: 0,
        target: 80,
      },
      {
        availability: 0.5,
        color: colorConstants.dark['secondary-dark'],
        dateTime: '2019-12-24T01:00:00.000Z',
        measure: '2019-12-24T01:00:00.000Z',
        oee: 0.5,
        performance: 1,
        quality: 1,
        startTime: '01:00',
        endTime: '02:00',
        productionTime: 10,
        plannedTime: 60,
        delaysTime: 50,
        target: 80,
      },
      {
        availability: 1,
        color: colorConstants.dark['quaternary-dark-2'],
        dateTime: '2019-12-24T02:00:00.000Z',
        measure: '2019-12-24T02:00:00.000Z',
        oee: 1,
        performance: 1,
        quality: 1,
        startTime: '02:00',
        endTime: '03:00',
        productionTime: 0,
        plannedTime: 0,
        delaysTime: 0,
        target: 80,
      },
    ];
    const wrapper = createWrapper({
      statistics: {
        shiftTotal: {
          availability: 0,
          performance: 0,
          quality: 1,
        },
        hourStatistics: inputHourStats,
      },
    });
    expect(wrapper.vm.processedHourStatistics.length).toBe(5);
    expect(wrapper.vm.processedHourStatistics).toEqual(resultHourStats);
  });
});
