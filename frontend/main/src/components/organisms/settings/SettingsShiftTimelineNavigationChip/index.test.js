import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import SettingsShiftTimelineNavigationChip from './index.vue';

import RangeChipSelection from '@/components/molecules/RangeChipSelection/index.vue';
import SelectionList from '@/components/molecules/SelectionList/index.vue';
import useDeviceStore from '@/stores/device';

describe('SettingsShiftTimelineNavigationChip', () => {
  const mockViewRangeConfig = {
    prevBtnTooltipText: 'Previous',
    isPreviousDisabled: false,
    nextBtnTooltipText: 'Next',
    isNextDisabled: false,
    label: 'Range Label',
    onPreviousClick: vi.fn(),
    onNextClick: vi.fn(),
  };

  const mockCurrentRangeType = 'DAY';

  const createWrapper = (props = {}, options = {}) => {
    const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });
    useDeviceStore(pinia).isMobileView = false;
    return mount(SettingsShiftTimelineNavigationChip, {
      props: {
        viewRangeConfig: mockViewRangeConfig,
        currentRangeType: mockCurrentRangeType,
        ...props,
      },
      global: {
        stubs: {
          RangeChipSelection,
          SelectionList,
        },
        plugins: [pinia],
      },
      ...options,
    });
  };

  it('renders correctly with default props', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.findComponent(RangeChipSelection).exists()).toBe(true);
    expect(wrapper.findComponent(SelectionList).exists()).toBe(true);
  });

  it('calls onPreviousClick when previous button is clicked', async () => {
    const wrapper = createWrapper();
    await wrapper.findComponent(RangeChipSelection).vm.$emit('click-previous');
    expect(mockViewRangeConfig.onPreviousClick).toHaveBeenCalled();
  });

  it('calls onNextClick when next button is clicked', async () => {
    const wrapper = createWrapper();
    await wrapper.findComponent(RangeChipSelection).vm.$emit('click-next');
    expect(mockViewRangeConfig.onNextClick).toHaveBeenCalled();
  });
});
