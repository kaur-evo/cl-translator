import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import MrEvocon from './index.vue';

import { useShiftStore, useStationStore } from '@/stores/index';

const defaultStation = { oeeGoalSad: 40, oeeGoalHappy: 70 };
const defaultStatistics = { shiftTotal: { oee: 0.72, quantity: 3 } };

const createWrapper = ({ statistics = defaultStatistics, station = defaultStation, props = {} } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const shiftStore = useShiftStore(pinia);
  shiftStore.statistics = statistics;

  const stationStore = useStationStore(pinia);
  stationStore.lineviewStation = station;

  return mount(MrEvocon, {
    props,
    global: { plugins: [pinia] },
  });
};

describe('MrEvocon', () => {
  test('that it has static mr evocon', async () => {
    const wrapper = createWrapper();

    expect(wrapper.find('#static-mr-evocon').exists()).toBe(true);
  });

  test('that oeeStatus is positive if oee is above oeeGoalHappy', () => {
    const wrapper = createWrapper({
      statistics: { shiftTotal: { oee: 0.8, quantity: 10, delaysTime: 0 } },
    });

    expect(wrapper.vm.oeeStatus).toBe('positive');
  });

  test('that oeeStatus is noshift if quantity is 0 and delaysTime is 0', () => {
    const wrapper = createWrapper({
      statistics: { shiftTotal: { oee: 0, quantity: 0, delaysTime: 0 } },
    });

    expect(wrapper.vm.oeeStatus).toBe('noshift');
  });

  test('that oeeStatus is rollEyes if quantity is 0 and delaysTime is more than 0', () => {
    const wrapper = createWrapper({
      statistics: { shiftTotal: { oee: 0, quantity: 0, delaysTime: 1000 } },
    });

    expect(wrapper.vm.oeeStatus).toBe('rollEyes');
  });

  test('that oeeStatus is negative if oee is below oeeGoalSad', () => {
    const wrapper = createWrapper({
      statistics: { shiftTotal: { oee: 0.3, quantity: 2 } },
    });

    expect(wrapper.vm.oeeStatus).toBe('negative');
  });

  test('that oeeStatus is neutral if oee is between oeeGoalSad and oeeGoalHappy', () => {
    const wrapper = createWrapper({
      statistics: { shiftTotal: { oee: 0.6, quantity: 2 } },
    });

    expect(wrapper.vm.oeeStatus).toBe('neutral');
  });

  test('that imgFolder is special if isSpecial is true', () => {
    const wrapper = createWrapper({ props: { isSpecial: true } });

    expect(wrapper.vm.imgFolder).toBe('special');
  });

  test('that imgFolder is regular if isSpecial is false', () => {
    const wrapper = createWrapper({ props: { isSpecial: false } });

    expect(wrapper.vm.imgFolder).toBe('regular');
  });
});
