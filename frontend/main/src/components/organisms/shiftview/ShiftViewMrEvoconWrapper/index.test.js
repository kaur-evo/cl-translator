import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { vi } from 'vitest';

import index from './index.vue';

import { useUserPreferencesStore, useStationStore } from '@/stores/index';

const createWrapper = (piniaOverrides = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });
  const userPreferencesStore = useUserPreferencesStore(pinia);
  const stationStore = useStationStore(pinia);

  userPreferencesStore.viewSettings = piniaOverrides.viewSettings ?? { useStandardEvocon: false };
  stationStore.lineviewStation = piniaOverrides.lineviewStation ?? {
    oeeGoalHappy: 80,
    oeeGoalSad: 40,
  };

  return shallowMount(index, {
    global: { plugins: [pinia] },
  });
};

describe('ShiftViewMrEvoconWrapper', () => {
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

  describe('useSpecialVersion', () => {
    it('returns false if viewSettings.useStandardEvocon is true', () => {
      const wrapper = createWrapper({ viewSettings: { useStandardEvocon: true } });

      expect(wrapper.vm.useSpecialVersion).toBe(false);
    });

    it('returns false if viewSettings.useStandardEvocon is false and date is not holiday', () => {
      vi.useFakeTimers().setSystemTime(new Date('2024-12-02'));
      const wrapper = createWrapper({ viewSettings: { useStandardEvocon: false } });

      expect(wrapper.vm.useSpecialVersion).toBe(false);
      vi.useRealTimers();
    });

    it('returns true if viewSettings.useStandardEvocon is false and date is holiday', () => {
      vi.useFakeTimers().setSystemTime(new Date('2026-02-24T12:00:00Z'));
      const wrapper = createWrapper({ viewSettings: { useStandardEvocon: false } });

      expect(wrapper.vm.useSpecialVersion).toBe(true);
      vi.useRealTimers();
    });
  });
});
