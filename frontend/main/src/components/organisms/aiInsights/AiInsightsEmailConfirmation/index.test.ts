import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import AiInsightsEmailConfirmation from './index.vue';

import { EMAIL_CONFIRMATION_DIALOG_WIDTH } from '@/constants/aiInsights';
import useAiInsightsStore from '@/stores/aiInsights';

const defaultPiniaState = {
  aiInsights: {
    emailConfirmationOpen: true,
  },
};

const createWrapper = (storeOverrides = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
    initialState: {
      aiInsights: { ...defaultPiniaState.aiInsights, ...storeOverrides },
    },
  });

  return shallowMount(AiInsightsEmailConfirmation, {
    global: {
      plugins: [pinia],
    },
  });
};

describe('AiInsightsEmailConfirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders GenericDialog when emailConfirmationOpen is true', () => {
    const wrapper = createWrapper();
    const dialog = wrapper.findComponent({ name: 'GenericDialog' });

    expect(dialog.exists()).toBe(true);
    expect(dialog.props('modelValue')).toBe(true);
  });

  it('does not render when emailConfirmationOpen is false', () => {
    const wrapper = createWrapper({ emailConfirmationOpen: false });
    const dialog = wrapper.findComponent({ name: 'GenericDialog' });

    expect(dialog.props('modelValue')).toBe(false);
  });

  it('passes generating summary message to EmptyView header', () => {
    const wrapper = createWrapper();
    const emptyView = wrapper.findComponent({ name: 'EmptyView' });

    expect(emptyView.props('header')).toBe("Generating AI summary. We'll send it to your e-mail shortly.");
  });

  it('uses the shared export illustration', () => {
    const wrapper = createWrapper();
    const emptyView = wrapper.findComponent({ name: 'EmptyView' });

    expect(emptyView.props('imgUrl')).toBe('export-custom-report');
  });

  it('calls closeEmailConfirmation on Close click', async () => {
    const wrapper = createWrapper();
    const aiInsightsStore = useAiInsightsStore();
    const spy = vi.spyOn(aiInsightsStore, 'closeEmailConfirmation');
    const closeBtn = wrapper.findComponent({ name: 'EvoconVButton' });

    await closeBtn.trigger('click');

    expect(spy).toHaveBeenCalled();
  });

  it('calls closeEmailConfirmation when dialog model-value changes to false', async () => {
    const wrapper = createWrapper();
    const aiInsightsStore = useAiInsightsStore();
    const spy = vi.spyOn(aiInsightsStore, 'closeEmailConfirmation');
    const dialog = wrapper.findComponent({ name: 'GenericDialog' });

    await dialog.vm.$emit('update:model-value', false);

    expect(spy).toHaveBeenCalled();
  });

  it('renders without a title', () => {
    const wrapper = createWrapper();
    const dialog = wrapper.findComponent({ name: 'GenericDialog' });

    expect(dialog.props('title')).toBeFalsy();
  });

  it('has dialog width matching EMAIL_CONFIRMATION_DIALOG_WIDTH', () => {
    const wrapper = createWrapper();
    const dialog = wrapper.findComponent({ name: 'GenericDialog' });

    expect(dialog.props('width')).toBe(EMAIL_CONFIRMATION_DIALOG_WIDTH);
  });
});
