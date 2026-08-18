import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { DateTime } from 'luxon';
import { createTestingPinia } from '@pinia/testing';

import SettingsShiftTimelineHeaderSegment from './index.vue';

import { viewRange } from '@/components/organisms/settings/SettingsShiftTimelineBlock/constants.js';

describe('SettingsShiftTimelineHeaderSegment', () => {
  const currentRangeType = viewRange.WEEK;
  const startDate = DateTime.fromISO('2024-01-01T00:00:00Z');


  it('renders correctly', () => {
    const wrapper = shallowMount(SettingsShiftTimelineHeaderSegment, {
      propsData: {
        currentRangeType: currentRangeType,
        startDate: startDate,
        viewRangeConfig: {},
        zoneId: 'UTC',
      },
      global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: { profile: { language: 'en' } } })] },
    });
    expect(wrapper.element).toMatchSnapshot();
  });
});
