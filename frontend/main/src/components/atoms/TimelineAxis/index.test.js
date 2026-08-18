import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import TimelineAxis from './index.vue';

const createWrapper = (overrides = {}, props = { id: 1 }) => shallowMount(TimelineAxis, {
  global: {
    plugins: [createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        factoryOverviewConfig: { timelinesInterval: 12 },
        profile: {
          currentUser: { timeFormat: 24, ...overrides.currentUser },
          ...overrides.profile,
        },
      },
    })],
  },
  props,
});

describe('TimelineAxis', () => {
  it('renders correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('getHourWidth', () => {
    it('calculates hour width correctly based on element width and timelinesInterval', () => {
      const wrapper = createWrapper({}, { id: 1, xScale: () => {} });
      const mockElement = {
        node: () => ({ getBoundingClientRect: () => ({ width: 480 }) }),
      };
      const result = wrapper.vm.getHourWidth(mockElement);
      // 480 / 12 = 40
      expect(result).toBe(40);
    });

    it('handles different element widths', () => {
      const wrapper = createWrapper({}, { id: 1, xScale: () => {} });
      const mockElement = {
        node: () => ({ getBoundingClientRect: () => ({ width: 240 }) }),
      };
      const result = wrapper.vm.getHourWidth(mockElement);
      // 240 / 12 = 20
      expect(result).toBe(20);
    });
  });

  describe('getFontSize', () => {
    it('returns max fontSize when calculated size exceeds max (14px)', () => {
      const wrapper = createWrapper({}, { id: 1, xScale: () => {} });
      const mockElement = {
        node: () => ({ getBoundingClientRect: () => ({ width: 1000 }) }),
      };
      const result = wrapper.vm.getFontSize(mockElement);
      expect(result).toBe(14);
    });

    it('returns min fontSize when calculated size is below min (8px)', () => {
      const wrapper = createWrapper({}, { id: 1, xScale: () => {} });
      const mockElement = {
        node: () => ({ getBoundingClientRect: () => ({ width: 20 }) }),
      };
      const result = wrapper.vm.getFontSize(mockElement);
      expect(result).toBe(8);
    });

    it('returns calculated fontSize when within min and max bounds', () => {
      const wrapper = createWrapper({}, { id: 1, xScale: () => {} });
      const mockElement = {
        node: () => ({ getBoundingClientRect: () => ({ width: 100 }) }),
      };
      const result = wrapper.vm.getFontSize(mockElement);
      expect(result).toBeGreaterThanOrEqual(8);
      expect(result).toBeLessThanOrEqual(14);
    });

    it('accounts for 12-hour timeFormat with different char count', () => {
      const wrapper = createWrapper({ currentUser: { timeFormat: 12 } }, { id: 1, xScale: () => {} });
      const mockElement = {
        node: () => ({ getBoundingClientRect: () => ({ width: 100 }) }),
      };
      const result = wrapper.vm.getFontSize(mockElement);
      expect(result).toBeGreaterThanOrEqual(8);
      expect(result).toBeLessThanOrEqual(14);
    });
  });
});
