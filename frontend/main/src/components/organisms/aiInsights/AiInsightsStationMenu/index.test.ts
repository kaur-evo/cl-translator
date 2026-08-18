import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import AiInsightsStationMenu from './index.vue';

import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import useAiInsightsStore from '@/stores/aiInsights';

vi.mock('@/helpers/file/getAsset', () => ({
  getIconAsset: (filename: string) => `/mocked/icons/${filename}`,
}));

interface AiInsightsStateOverrides {
  menuOpen?: boolean;
  selectedStopReasonId?: number | null;
  selectedStationId?: number | null;
  analyzing?: boolean;
  eligibleStationsMap?: Record<string, { stopReasonName?: string; stations: { id: number; name: string; noteCount: number }[] }>;
  emailConfirmationOpen?: boolean;
  lastEligibleStationsFetchKey?: string | null;
  lastRequestId?: string | null;
}

const defaultAiInsightsState: AiInsightsStateOverrides = {
  menuOpen: true,
  selectedStopReasonId: 10,
  selectedStationId: null,
  analyzing: false,
  eligibleStationsMap: {
    10: {
      stopReasonName: 'Mechanical failure',
      stations: [
        { id: 1, name: 'Assembly Line 1', noteCount: 120 },
        { id: 2, name: 'Packaging Line 2', noteCount: 85 },
        { id: 3, name: 'Paint Booth 3', noteCount: 67 },
      ],
    },
  },
  emailConfirmationOpen: false,
  lastEligibleStationsFetchKey: null,
  lastRequestId: null,
};

const createPinia = (stateOverrides: AiInsightsStateOverrides = {}) => createTestingPinia({
  createSpy: vi.fn,
  stubActions: true,
  initialState: {
    aiInsights: { ...defaultAiInsightsState, ...stateOverrides },
  },
});

const createWrapper = (stateOverrides: AiInsightsStateOverrides = {}) => shallowMount(AiInsightsStationMenu, {
  global: { plugins: [createPinia(stateOverrides)] },
});

describe('AiInsightsStationMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('passes correct default props to v-menu', () => {
    const wrapper = createWrapper();
    const menu = wrapper.findComponent({ name: 'v-menu' });

    expect(menu.exists()).toBe(true);
    expect(menu.props('modelValue')).toBe(true);
    expect(menu.props('target')).toBe('#ai-insights-icon-10');
    expect(menu.props('closeOnContentClick')).toBe(false);
  });

  it('mounts v-menu with target pointing to the correct stop reason icon', () => {
    const wrapper = createWrapper();
    const menu = wrapper.findComponent({ name: 'v-menu' });

    expect(menu.exists()).toBe(true);
    expect(menu.props('target')).toBe('#ai-insights-icon-10');
  });

  it('sets menu modelValue to false when menuOpen is false', () => {
    const wrapper = createWrapper({ menuOpen: false });
    const menu = wrapper.findComponent({ name: 'v-menu' });

    expect(menu.props('modelValue')).toBe(false);
  });

  it('shows stop reason name as card title', () => {
    const wrapper = createWrapper();
    const title = wrapper.find('v-card-title-stub');

    expect(title.text()).toContain('Mechanical failure');
  });

  it('renders close button with accessible label in card title', () => {
    const wrapper = createWrapper();
    const closeBtn = wrapper.find('[aria-label="Close"]');

    expect(closeBtn.exists()).toBe(true);
  });

  it('calls closeMenu when close button is clicked', async () => {
    const pinia = createPinia();
    const wrapper = shallowMount(AiInsightsStationMenu, { global: { plugins: [pinia] } });
    const aiInsightsStore = useAiInsightsStore(pinia);
    const closeBtn = wrapper.find('[aria-label="Close"]');

    await closeBtn.trigger('click');

    expect(aiInsightsStore.closeMenu).toHaveBeenCalled();
  });

  it('renders a SelectionList with eligible stations', () => {
    const wrapper = createWrapper();
    const selectionList = wrapper.findComponent({ name: 'SelectionList' });

    expect(selectionList.exists()).toBe(true);
    expect(selectionList.props('items')).toHaveLength(3);
    expect(selectionList.props('isSingleSelect')).toBe(true);
    expect(selectionList.props('hideSearch')).toBe(true);
  });

  it('displays stations in pre-sorted alphabetical order', () => {
    const wrapper = createWrapper();
    const selectionList = wrapper.findComponent({ name: 'SelectionList' });
    const items = selectionList.props('items') as { name: string }[];

    expect(items[0]?.name).toBe('Assembly Line 1');
    expect(items[1]?.name).toBe('Packaging Line 2');
    expect(items[2]?.name).toBe('Paint Booth 3');
  });

  it('disables submit button when no station selected', () => {
    const wrapper = createWrapper({ selectedStationId: null });
    const buttons = wrapper.findAllComponents(EvoconVButton);
    const submitBtn = buttons.find((b) => b.attributes('text') === 'Get insights');

    expect(submitBtn?.attributes('disabled')).toBe('true');
  });

  it('enables submit button when a station is selected', () => {
    const wrapper = createWrapper({ selectedStationId: 1 });
    const buttons = wrapper.findAllComponents(EvoconVButton);
    const submitBtn = buttons.find((b) => b.attributes('text') === 'Get insights');

    expect(submitBtn?.attributes('disabled')).toBe('false');
  });

  it('shows loading state on submit button during analysis', () => {
    const wrapper = createWrapper({ selectedStationId: 1, analyzing: true });
    const buttons = wrapper.findAllComponents(EvoconVButton);
    const submitBtn = buttons.find((b) => b.attributes('text') === 'Get insights');

    expect(submitBtn?.attributes('loading')).toBe('true');
    expect(submitBtn?.attributes('disabled')).toBe('true');
  });

  it('emits submit event when submit button is clicked with a station selected', async () => {
    const wrapper = createWrapper({ selectedStationId: 1 });
    const buttons = wrapper.findAllComponents(EvoconVButton);
    const submitBtn = buttons.find((b) => b.attributes('text') === 'Get insights');

    await submitBtn?.trigger('click');

    expect(wrapper.emitted('submit')).toHaveLength(1);
  });

  it('does not emit submit when no station or stop reason selected', async () => {
    const wrapper = createWrapper({ selectedStationId: null, selectedStopReasonId: null });
    const buttons = wrapper.findAllComponents(EvoconVButton);
    const submitBtn = buttons.find((b) => b.attributes('text') === 'Get insights');

    await submitBtn?.trigger('click');

    expect(wrapper.emitted('submit')).toBeUndefined();
  });

  it('calls closeMenu when menu is dismissed', async () => {
    const pinia = createPinia();
    const wrapper = shallowMount(AiInsightsStationMenu, { global: { plugins: [pinia] } });
    const aiInsightsStore = useAiInsightsStore(pinia);
    const menu = wrapper.findComponent({ name: 'v-menu' });

    await menu.vm.$emit('update:model-value', false);

    expect(aiInsightsStore.closeMenu).toHaveBeenCalled();
  });

  it('shows empty state when no eligible stations', () => {
    const wrapper = createWrapper({ selectedStopReasonId: 999 });
    const emptyMessage = wrapper.find('#no-stations-message');

    expect(emptyMessage.text()).toBe('No stations with enough notes for analysis.');
    expect(wrapper.findComponent({ name: 'SelectionList' }).exists()).toBe(false);
  });

  it('calls selectStation when a station is selected', async () => {
    const pinia = createPinia();
    const wrapper = shallowMount(AiInsightsStationMenu, { global: { plugins: [pinia] } });
    const aiInsightsStore = useAiInsightsStore(pinia);
    const selectionList = wrapper.findComponent({ name: 'SelectionList' });

    await selectionList.vm.$emit('update:model-value', [2]);

    expect(aiInsightsStore.selectStation).toHaveBeenCalledWith(2);
  });

  it('calls selectStation with null when empty array is selected (deselection)', async () => {
    const pinia = createPinia();
    const wrapper = shallowMount(AiInsightsStationMenu, { global: { plugins: [pinia] } });
    const aiInsightsStore = useAiInsightsStore(pinia);
    const selectionList = wrapper.findComponent({ name: 'SelectionList' });

    await selectionList.vm.$emit('update:model-value', []);

    expect(aiInsightsStore.selectStation).toHaveBeenCalledWith(null);
  });

  it('passes selected station as array to SelectionList model-value', () => {
    const wrapper = createWrapper({ selectedStationId: 2 });
    const selectionList = wrapper.findComponent({ name: 'SelectionList' });

    expect(selectionList.props('modelValue')).toEqual([2]);
  });

  it('passes empty array to SelectionList when no station selected', () => {
    const wrapper = createWrapper({ selectedStationId: null });
    const selectionList = wrapper.findComponent({ name: 'SelectionList' });

    expect(selectionList.props('modelValue')).toEqual([]);
  });

  describe('menuActivator watcher', () => {
    it('updates menu target when selectedStopReasonId changes', async () => {
      const pinia = createPinia({ selectedStopReasonId: 10 });
      const wrapper = shallowMount(AiInsightsStationMenu, { global: { plugins: [pinia] } });

      expect(wrapper.findComponent({ name: 'v-menu' }).props('target')).toBe('#ai-insights-icon-10');

      useAiInsightsStore(pinia).selectedStopReasonId = 20;
      await wrapper.vm.$nextTick();

      expect(wrapper.findComponent({ name: 'v-menu' }).props('target')).toBe('#ai-insights-icon-20');
    });

    it('retains last valid target when stopReasonId becomes null', async () => {
      const pinia = createPinia({ selectedStopReasonId: 10 });
      const wrapper = shallowMount(AiInsightsStationMenu, { global: { plugins: [pinia] } });

      expect(wrapper.findComponent({ name: 'v-menu' }).props('target')).toBe('#ai-insights-icon-10');

      useAiInsightsStore(pinia).selectedStopReasonId = null;
      await wrapper.vm.$nextTick();

      expect(wrapper.findComponent({ name: 'v-menu' }).props('target')).toBe('#ai-insights-icon-10');
    });
  });

  it('passes getStationNoteCountText as item-secondary-text to SelectionList', () => {
    const wrapper = createWrapper();
    const selectionList = wrapper.findComponent({ name: 'SelectionList' });
    const fn = selectionList.props('itemSecondaryText') as (station: { noteCount: number }) => string;
    expect(typeof fn).toBe('function');
    // $t mock returns the translation key as-is (no interpolation)
    expect(fn({ noteCount: 120 })).toBe('{count} notes');
  });
});
