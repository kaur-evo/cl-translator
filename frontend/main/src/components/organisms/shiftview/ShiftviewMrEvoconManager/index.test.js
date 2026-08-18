import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

import { useShiftStore, useStationStore } from '@/stores/index';

const defaultShift = {
  statistics: { shiftTotal: {}, hourStatistics: {} },
  shift: { endTimeISO: '2021-01-01T00:00:00Z' },
};
const defaultStation = { lineviewStation: { zoneId: 'Europe/Tallinn' } };

const createWrapper = ({ shiftState = defaultShift, stationState = defaultStation } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const shiftStore = useShiftStore(pinia);
  shiftStore.statistics = shiftState.statistics;
  shiftStore.shift = shiftState.shift;

  const stationStore = useStationStore(pinia);
  stationStore.lineviewStation = stationState.lineviewStation;

  return shallowMount(index, {
    global: {
      plugins: [pinia],
    },
  });
};

describe('ShiftviewMrEvoconManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('oeeStatus', () => {
    it('returns meditate if total quantity is 0 and delaysTime is 0', () => {
      const wrapper = createWrapper({
        shiftState: {
          statistics: { shiftTotal: { quantity: 0, delaysTime: 0, oee: 0 }, hourStatistics: {} },
          shift: defaultShift.shift,
        },
      });

      expect(wrapper.vm.oeeStatus).toBe('meditate');
    });
    it('returns loopyRollEyes if total quantity is 0, but delaysTime is not', () => {
      const wrapper = createWrapper({
        shiftState: {
          statistics: { shiftTotal: { quantity: 0, delaysTime: 1000, oee: 0 }, hourStatistics: {} },
          shift: defaultShift.shift,
        },
      });

      expect(wrapper.vm.oeeStatus).toBe('loopyRollEyes');
    });

    it('returns loopyRollEyes if totalOee >= oeeLimitForRollEyes', () => {
      const wrapper = createWrapper({
        shiftState: {
          statistics: { shiftTotal: { quantity: 1000, delaysTime: 120, oee: 1.08 }, hourStatistics: {} },
          shift: defaultShift.shift,
        },
      });

      expect(wrapper.vm.oeeStatus).toBe('loopyRollEyes');
    });

    it('returns negative if totalOee < oeeGoalSad', () => {
      const wrapper = createWrapper({
        shiftState: {
          statistics: { shiftTotal: { quantity: 1000, delaysTime: 120, oee: 0.4 }, hourStatistics: {} },
          shift: defaultShift.shift,
        },
        stationState: { lineviewStation: { oeeGoalSad: 50, oeeGoalHappy: 80 } },
      });

      expect(wrapper.vm.oeeStatus).toBe('negative');
    });

    it('returns neutral if totalOee is between oeeGoalSad and oeeGoalHappy', () => {
      const wrapper = createWrapper({
        shiftState: {
          statistics: { shiftTotal: { quantity: 1000, delaysTime: 120, oee: 0.6 }, hourStatistics: {} },
          shift: defaultShift.shift,
        },
        stationState: { lineviewStation: { oeeGoalSad: 50, oeeGoalHappy: 80 } },
      });

      expect(wrapper.vm.oeeStatus).toBe('neutral');
    });

    it('returns positive if totalOee >= oeeGoalHappy', () => {
      const wrapper = createWrapper({
        shiftState: {
          statistics: { shiftTotal: { quantity: 1000, delaysTime: 120, oee: 0.9 }, hourStatistics: {} },
          shift: defaultShift.shift,
        },
        stationState: { lineviewStation: { oeeGoalSad: 50, oeeGoalHappy: 80 } },
      });

      expect(wrapper.vm.oeeStatus).toBe('positive');
    });
  });

  describe('event handlers', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('onScrapSave sets currentAnimation to rollEyes', () => {
      wrapper.vm.onScrapSave();
      expect(wrapper.vm.currentAnimation).toBe('rollEyes');
    });

    it('onStopReasonSaved sets currentAnimation to thumbsUp when random is 0', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0);
      wrapper.vm.onStopReasonSaved();
      expect(wrapper.vm.currentAnimation).toBe('thumbsUp');
    });

    it('onStopReasonSaved sets currentAnimation to wink when random is not 0', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      wrapper.vm.onStopReasonSaved();
      expect(wrapper.vm.currentAnimation).toBe('wink');
    });

    it('onChangeoverSaved sets currentAnimation to wink', () => {
      wrapper.vm.onChangeoverSaved();
      expect(wrapper.vm.currentAnimation).toBe('wink');
    });

    it('onTeamSaved sets currentAnimation to wave', () => {
      wrapper.vm.onTeamSaved();
      expect(wrapper.vm.currentAnimation).toBe('wave');
    });

    it('onChecklistSaved sets currentAnimation to thumbsUp', () => {
      wrapper.vm.onChecklistSaved();
      expect(wrapper.vm.currentAnimation).toBe('thumbsUp');
    });

    it('onBatchTargetReached sets currentAnimation to thumbsUp', () => {
      wrapper.vm.onBatchTargetReached();
      expect(wrapper.vm.currentAnimation).toBe('thumbsUp');
    });
  });

  describe('lifecycle hooks', () => {
    it('clears timeouts and removes event listeners on beforeUnmount', () => {
      const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
      const wrapper = createWrapper();

      wrapper.vm.firstLoadTimeout = 123;
      wrapper.vm.shiftEndTimeout = 456;
      wrapper.vm.clickTimeout = 789;
      wrapper.vm.idleTimeout = 101;

      wrapper.unmount();

      expect(clearTimeoutSpy).toHaveBeenCalledWith(123);
      expect(clearTimeoutSpy).toHaveBeenCalledWith(456);
      expect(clearTimeoutSpy).toHaveBeenCalledWith(789);
      expect(clearTimeoutSpy).toHaveBeenCalledWith(101);
      expect(wrapper.vm.shiftEndTimeout).toBe(null);
      expect(wrapper.vm.clickTimeout).toBe(null);
      expect(wrapper.vm.idleTimeout).toBe(null);
    });
  });

  describe('onMrEvoconClick', () => {
    it('sets currentAnimation to wave and resets to oeeStatus after delay', async () => {
      vi.useFakeTimers();
      const wrapper = createWrapper({
        shiftState: {
          statistics: { shiftTotal: { quantity: 1000, delaysTime: 120, oee: 0.9 }, hourStatistics: {} },
          shift: defaultShift.shift,
        },
        stationState: { lineviewStation: { oeeGoalSad: 50, oeeGoalHappy: 80 } },
      });

      wrapper.vm.onMrEvoconClick();
      expect(wrapper.vm.currentAnimation).toBe('wave');

      vi.advanceTimersByTime(3000);
      expect(wrapper.vm.currentAnimation).toBe('positive');

      vi.useRealTimers();
    });

    it('clears existing clickTimeout before setting new one', () => {
      vi.useFakeTimers();
      const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

      const wrapper = createWrapper();

      wrapper.vm.clickTimeout = 999;
      wrapper.vm.onMrEvoconClick();

      expect(clearTimeoutSpy).toHaveBeenCalledWith(999);
      expect(wrapper.vm.currentAnimation).toBe('wave');

      vi.useRealTimers();
    });
  });
});
