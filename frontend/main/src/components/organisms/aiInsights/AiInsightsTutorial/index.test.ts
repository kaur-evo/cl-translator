import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import productTourApi from '@/api/productTourApi';
import AiInsightsTutorial from '@/components/organisms/aiInsights/AiInsightsTutorial/index.vue';
import { getTutorialSteps } from '@/constants/aiInsightsTutorialConfig';
import { REPORTS } from '@/constants/routeNames';
import { useConfigurationStore, useProfileStore, useFeatureStore } from '@/stores';

vi.mock('@/api/productTourApi', () => ({
  default: {
    getFlowStates: vi.fn(),
    updateFlowStates: vi.fn(),
  },
}));

vi.mock('@/assets/images/product-tour/ai-insights/Extra_notes-1-1.png', () => ({
  default: '/mocked/step1.png',
}));
vi.mock('@/assets/images/product-tour/ai-insights/Extra_notes-2-2.png', () => ({
  default: '/mocked/step2.png',
}));
vi.mock('@/assets/images/product-tour/ai-insights/Extra_notes-3-3.png', () => ({
  default: '/mocked/step3.png',
}));
vi.mock('@/assets/images/product-tour/ai-insights/Extra_notes-4-4.png', () => ({
  default: '/mocked/step4.png',
}));

const TUTORIAL_STEPS_COUNT = getTutorialSteps((key: string) => key).length;

interface StoreOverrides {
  configuration?: Record<string, unknown>;
  profile?: Record<string, unknown>;
  feature?: Record<string, unknown>;
}

const createPinia = (overrides: StoreOverrides = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
  });

  const configurationStore = useConfigurationStore(pinia);
  configurationStore.$patch({
    configuration: { aiNotesInsightsEnabled: overrides.configuration?.aiNotesInsightsEnabled ?? true },
  });

  const profileStore = useProfileStore(pinia);
  (profileStore as unknown as Record<string, unknown>).highestUserRole = overrides.profile?.highestUserRole ?? 'OFFICE_USER';

  const featureStore = useFeatureStore(pinia);
  featureStore.$patch({
    showProductTour: (overrides.feature?.productTourEnabled ?? false) as boolean,
  });

  return pinia;
};

const createWrapper = async (
  flowStatesResponse: Record<string, unknown> = { aiInsights: { closed: false, step: 0, lastDismissed: null } },
  storeOverrides: StoreOverrides = {},
) => {
  const pinia = createPinia(storeOverrides);

  (productTourApi.getFlowStates as ReturnType<typeof vi.fn>).mockResolvedValue(flowStatesResponse);
  (productTourApi.updateFlowStates as ReturnType<typeof vi.fn>).mockResolvedValue(flowStatesResponse);

  const wrapper = shallowMount(AiInsightsTutorial, {
    global: {
      plugins: [pinia],
    },
  });

  await flushPromises();
  return wrapper;
};

const openTutorial = async (wrapper: Awaited<ReturnType<typeof createWrapper>>) => {
  // If tutorial is already open (e.g. first visit auto-open), skip CTA click
  if (wrapper.find('.ai-insights-tutorial').exists()) return;
  const cta = wrapper.findComponent({ name: 'TutorialCTA' });
  await cta.vm.$emit('click');
  await wrapper.vm.$nextTick();
};

const navigateToLastStep = async (wrapper: Awaited<ReturnType<typeof createWrapper>>) => {
  for (let i = 0; i < TUTORIAL_STEPS_COUNT - 1; i++) {
    await wrapper.find('[data-testid="tutorial-next-btn"]').trigger('click');
  }
};

describe('AiInsightsTutorial', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('auto-opens tutorial on first visit when lastDismissed is null and closed is false', async () => {
    const wrapper = await createWrapper(
      { aiInsights: { closed: false, step: 0, lastDismissed: null } },
    );

    expect(wrapper.find('.ai-insights-tutorial').exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'TutorialCTA' }).exists()).toBe(false);
  });

  it('does not show when aiNotesInsightsEnabled is false', async () => {
    const wrapper = await createWrapper(
      undefined,
      { configuration: { aiNotesInsightsEnabled: false } },
    );

    expect(wrapper.find('.ai-insights-tutorial').exists()).toBe(false);
    expect(wrapper.findComponent({ name: 'TutorialCTA' }).exists()).toBe(false);
    expect(productTourApi.getFlowStates).not.toHaveBeenCalled();
  });

  it('does not show when aiInsights.closed is true', async () => {
    const wrapper = await createWrapper(
      { aiInsights: { closed: true, step: 4, lastDismissed: '2026-02-20T10:00:00Z' } },
    );

    expect(wrapper.find('.ai-insights-tutorial').exists()).toBe(false);
    expect(wrapper.findComponent({ name: 'TutorialCTA' }).exists()).toBe(false);
  });

  it('shows CTA (not tutorial) when lastDismissed is set and not closed', async () => {
    const wrapper = await createWrapper(
      { aiInsights: { closed: false, step: 2, lastDismissed: '2026-02-20T10:00:00Z' } },
    );

    expect(wrapper.find('.ai-insights-tutorial').exists()).toBe(false);
    expect(wrapper.findComponent({ name: 'TutorialCTA' }).exists()).toBe(true);
  });

  it('advances through steps on Next click', async () => {
    const wrapper = await createWrapper();
    await openTutorial(wrapper);

    expect(wrapper.text()).toContain('Get AI insights from extra notes');

    await wrapper.find('[data-testid="tutorial-next-btn"]').trigger('click');

    expect(wrapper.text()).toContain('At least 50 notes needed');
  });

  it('goes back on Back click', async () => {
    const wrapper = await createWrapper();
    await openTutorial(wrapper);

    // First go to step 2
    await wrapper.find('[data-testid="tutorial-next-btn"]').trigger('click');

    expect(wrapper.text()).toContain('At least 50 notes needed');

    await wrapper.find('[data-testid="tutorial-back-btn"]').trigger('click');

    expect(wrapper.text()).toContain('Get AI insights from extra notes');
  });

  it('does not show Back button on step 0', async () => {
    const wrapper = await createWrapper();
    await openTutorial(wrapper);

    expect(wrapper.find('[data-testid="tutorial-back-btn"]').exists()).toBe(false);
  });

  it('calls updateFlowStates with lastDismissed on Later click', async () => {
    const updatedFlowStates = { aiInsights: { closed: false, step: 0, lastDismissed: '2026-02-20T10:00:00Z' } };
    (productTourApi.updateFlowStates as ReturnType<typeof vi.fn>).mockResolvedValue(updatedFlowStates);

    const wrapper = await createWrapper();
    await openTutorial(wrapper);

    await wrapper.find('[data-testid="tutorial-later-btn"]').trigger('click');

    expect(productTourApi.updateFlowStates).toHaveBeenCalledTimes(1);
    const callArg = vi.mocked(productTourApi.updateFlowStates).mock.calls[0]?.[0];
    expect(callArg.aiInsights.closed).toBe(false);
    expect(callArg.aiInsights.step).toBe(0);
    expect(typeof callArg.aiInsights.lastDismissed).toBe('string');
  });

  it('hides tutorial and shows CTA after Later click', async () => {
    const updatedFlowStates = { aiInsights: { closed: false, step: 0, lastDismissed: '2026-02-20T10:00:00Z' } };
    (productTourApi.updateFlowStates as ReturnType<typeof vi.fn>).mockResolvedValue(updatedFlowStates);

    const wrapper = await createWrapper();
    await openTutorial(wrapper);

    await wrapper.find('[data-testid="tutorial-later-btn"]').trigger('click');
    await flushPromises();

    expect(wrapper.find('.ai-insights-tutorial').exists()).toBe(false);
    expect(wrapper.findComponent({ name: 'TutorialCTA' }).exists()).toBe(true);
  });

  it('dismisses tutorial when Escape key is pressed', async () => {
    const wrapper = await createWrapper();
    await openTutorial(wrapper);

    await wrapper.find('.ai-insights-tutorial').trigger('keydown.escape');
    await flushPromises();

    expect(wrapper.find('.ai-insights-tutorial').exists()).toBe(false);
    expect(wrapper.findComponent({ name: 'TutorialCTA' }).exists()).toBe(true);
    expect(productTourApi.updateFlowStates).toHaveBeenCalledTimes(1);
    const callArg = vi.mocked(productTourApi.updateFlowStates).mock.calls[0]?.[0];
    expect(callArg.aiInsights.closed).toBe(false);
    expect(typeof callArg.aiInsights.lastDismissed).toBe('string');
  });

  it('calls updateFlowStates with closed=true on Done click', async () => {
    const wrapper = await createWrapper();
    await openTutorial(wrapper);

    await navigateToLastStep(wrapper);

    await wrapper.find('[data-testid="tutorial-done-btn"]').trigger('click');

    expect(productTourApi.updateFlowStates).toHaveBeenCalledWith({
      aiInsights: { closed: true, step: 4, lastDismissed: null },
    });
  });

  it('hides tutorial and CTA after Done click', async () => {
    const updatedFlowStates = { aiInsights: { closed: true, step: 4, lastDismissed: null } };
    (productTourApi.updateFlowStates as ReturnType<typeof vi.fn>).mockResolvedValue(updatedFlowStates);

    const wrapper = await createWrapper();
    await openTutorial(wrapper);

    await navigateToLastStep(wrapper);

    await wrapper.find('[data-testid="tutorial-done-btn"]').trigger('click');
    await flushPromises();

    expect(wrapper.find('.ai-insights-tutorial').exists()).toBe(false);
    expect(wrapper.findComponent({ name: 'TutorialCTA' }).exists()).toBe(false);
  });

  it('resets progress to step 0 when CTA is clicked after partial progress', async () => {
    const wrapper = await createWrapper(
      { aiInsights: { closed: false, step: 2, lastDismissed: '2026-02-20T10:00:00Z' } },
    );

    const cta = wrapper.findComponent({ name: 'TutorialCTA' });
    await cta.vm.$emit('click');
    await flushPromises();

    const bar = wrapper.findComponent({ name: 'v-progress-linear' });
    const expectedProgress = (1 / TUTORIAL_STEPS_COUNT) * 100;
    expect(bar.props('modelValue')).toBe(expectedProgress);
  });

  it('re-opens tutorial from step 0 when CTA is clicked', async () => {
    const wrapper = await createWrapper(
      { aiInsights: { closed: false, step: 2, lastDismissed: '2026-02-20T10:00:00Z' } },
    );

    // CTA should be visible
    const cta = wrapper.findComponent({ name: 'TutorialCTA' });
    expect(cta.exists()).toBe(true);

    await cta.vm.$emit('click');
    await wrapper.vm.$nextTick();

    // Tutorial should now be open at step 0 (first step)
    expect(wrapper.find('.ai-insights-tutorial').exists()).toBe(true);
    expect(wrapper.text()).toContain('Get AI insights from extra notes');
    expect(wrapper.findComponent({ name: 'TutorialCTA' }).exists()).toBe(false);
  });

  it('auto-opens tutorial when getFlowStates API call fails (defaults to first visit)', async () => {
    (productTourApi.getFlowStates as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

    const pinia = createPinia();

    const wrapper = shallowMount(AiInsightsTutorial, {
      global: { plugins: [pinia] },
    });
    await flushPromises();

    expect(wrapper.find('.ai-insights-tutorial').exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'TutorialCTA' }).exists()).toBe(false);
  });

  it('handles updateFlowStates failure on Later click gracefully', async () => {
    (productTourApi.updateFlowStates as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

    const wrapper = await createWrapper();
    await openTutorial(wrapper);

    await wrapper.find('[data-testid="tutorial-later-btn"]').trigger('click');
    await flushPromises();

    expect(wrapper.find('.ai-insights-tutorial').exists()).toBe(false);
    expect(wrapper.findComponent({ name: 'TutorialCTA' }).exists()).toBe(true);
  });

  it('handles updateFlowStates failure on Done click gracefully', async () => {
    (productTourApi.updateFlowStates as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

    const wrapper = await createWrapper();
    await openTutorial(wrapper);

    await navigateToLastStep(wrapper);

    await wrapper.find('[data-testid="tutorial-done-btn"]').trigger('click');
    await flushPromises();

    expect(wrapper.find('.ai-insights-tutorial').exists()).toBe(false);
    expect(wrapper.findComponent({ name: 'TutorialCTA' }).exists()).toBe(false);
  });

  it('shows progress bar with correct percentage', async () => {
    const wrapper = await createWrapper();
    await openTutorial(wrapper);

    const progressBar = wrapper.findComponent({ name: 'v-progress-linear' });

    expect(progressBar.exists()).toBe(true);
    expect(progressBar.props('modelValue')).toBe(25); // Step 1 of 4 = 25%
  });

  it('shows Done button only on last step', async () => {
    const wrapper = await createWrapper();
    await openTutorial(wrapper);

    // Step 1 - should show Next, not Done
    expect(wrapper.find('[data-testid="tutorial-done-btn"]').exists()).toBe(false);

    await navigateToLastStep(wrapper);

    // Step 4 - should show Done, not Next
    expect(wrapper.find('[data-testid="tutorial-done-btn"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="tutorial-next-btn"]').exists()).toBe(false);
  });

  describe('step boundary behavior', () => {
    it('remains on last step after navigating to it', async () => {
      const wrapper = await createWrapper();
      await openTutorial(wrapper);
      await navigateToLastStep(wrapper);

      const progressBar = wrapper.findComponent({ name: 'v-progress-linear' });
      expect(progressBar.props('modelValue')).toBe(100);

      expect(wrapper.find('[data-testid="tutorial-next-btn"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="tutorial-done-btn"]').exists()).toBe(true);
    });

    it('remains on step 0 at initial state', async () => {
      const wrapper = await createWrapper();
      await openTutorial(wrapper);

      expect(wrapper.find('[data-testid="tutorial-back-btn"]').exists()).toBe(false);
      expect(wrapper.text()).toContain('Get AI insights from extra notes');

      const progressBar = wrapper.findComponent({ name: 'v-progress-linear' });
      expect(progressBar.props('modelValue')).toBe(25);
    });
  });
});

describe('reports product tour priority (R7)', () => {
  const tourVisibleOverrides: StoreOverrides = {
    feature: { productTourEnabled: true },
    profile: { highestUserRole: 'OFFICE_USER' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hides tutorial and CTA when reports product tour is incomplete', async () => {
    const wrapper = await createWrapper({
      aiInsights: { closed: false, step: 0, lastDismissed: null },
      [REPORTS]: {
        closed: false,
        flows: { reportsIntro: true, reportsSaving: true, reportsComparing: false, reportsExporting: false },
      },
    }, tourVisibleOverrides);

    expect(wrapper.find('.ai-insights-tutorial').exists()).toBe(false);
    expect(wrapper.findComponent({ name: 'TutorialCTA' }).exists()).toBe(false);
  });

  it('shows tutorial when reports product tour is complete', async () => {
    const wrapper = await createWrapper({
      aiInsights: { closed: false, step: 0, lastDismissed: null },
      [REPORTS]: {
        closed: false,
        flows: { reportsIntro: true, reportsSaving: true, reportsComparing: true, reportsExporting: true },
      },
    }, tourVisibleOverrides);

    expect(wrapper.find('.ai-insights-tutorial').exists()).toBe(true);
  });

  it('shows tutorial when reports product tour is closed', async () => {
    const wrapper = await createWrapper({
      aiInsights: { closed: false, step: 0, lastDismissed: null },
      [REPORTS]: { closed: true, flows: { reportsIntro: true, reportsSaving: false } },
    }, tourVisibleOverrides);

    expect(wrapper.find('.ai-insights-tutorial').exists()).toBe(true);
  });

  it('shows tutorial when no reports tour state exists in flowStates', async () => {
    const wrapper = await createWrapper({
      aiInsights: { closed: false, step: 0, lastDismissed: null },
    }, tourVisibleOverrides);

    expect(wrapper.find('.ai-insights-tutorial').exists()).toBe(true);
  });

  it('shows tutorial when reports tour is incomplete but product tour feature is disabled', async () => {
    const wrapper = await createWrapper({
      aiInsights: { closed: false, step: 0, lastDismissed: null },
      [REPORTS]: {
        closed: false,
        flows: { reportsIntro: false, reportsSaving: false, reportsComparing: false, reportsExporting: false },
      },
    }, {
      feature: { productTourEnabled: false },
      profile: { highestUserRole: 'OFFICE_USER' },
    });

    expect(wrapper.find('.ai-insights-tutorial').exists()).toBe(true);
  });

  it('hides tutorial when user role is below OFFICE_USER regardless of tour state', async () => {
    const wrapper = await createWrapper({
      aiInsights: { closed: false, step: 0, lastDismissed: null },
    }, {
      profile: { highestUserRole: 'LINEVIEW_USER' },
    });

    expect(wrapper.find('.ai-insights-tutorial').exists()).toBe(false);
    expect(wrapper.findComponent({ name: 'TutorialCTA' }).exists()).toBe(false);
    expect(productTourApi.getFlowStates).not.toHaveBeenCalled();
  });

  it('shows tutorial for roles above OFFICE_USER', async () => {
    const wrapper = await createWrapper({
      aiInsights: { closed: false, step: 0, lastDismissed: null },
    }, {
      profile: { highestUserRole: 'FACTORY_ADMIN' },
    });

    expect(productTourApi.getFlowStates).toHaveBeenCalledTimes(1);
    expect(wrapper.find('.ai-insights-tutorial').exists()).toBe(true);
  });

  it('shows tutorial for exact OFFICE_USER boundary role', async () => {
    const wrapper = await createWrapper({
      aiInsights: { closed: false, step: 0, lastDismissed: null },
    }, {
      profile: { highestUserRole: 'OFFICE_USER' },
    });

    expect(productTourApi.getFlowStates).toHaveBeenCalledTimes(1);
    expect(wrapper.find('.ai-insights-tutorial').exists()).toBe(true);
  });

  it('hides tutorial when user has an unrecognized role string', async () => {
    const wrapper = await createWrapper({
      aiInsights: { closed: false, step: 0, lastDismissed: null },
    }, {
      profile: { highestUserRole: 'VIEWER' },
    });

    expect(wrapper.find('.ai-insights-tutorial').exists()).toBe(false);
    expect(wrapper.findComponent({ name: 'TutorialCTA' }).exists()).toBe(false);
    expect(productTourApi.getFlowStates).not.toHaveBeenCalled();
  });

  it('hides tutorial when all reports tour flows are false (new user with initialized tour)', async () => {
    const wrapper = await createWrapper({
      aiInsights: { closed: false, step: 0, lastDismissed: null },
      [REPORTS]: {
        closed: false,
        flows: { reportsIntro: false, reportsSaving: false, reportsComparing: false, reportsExporting: false },
      },
    }, tourVisibleOverrides);

    expect(wrapper.find('.ai-insights-tutorial').exists()).toBe(false);
    expect(wrapper.findComponent({ name: 'TutorialCTA' }).exists()).toBe(false);
  });

  it('hides tutorial when only one reports tour flow remains incomplete', async () => {
    const wrapper = await createWrapper({
      aiInsights: { closed: false, step: 0, lastDismissed: null },
      [REPORTS]: {
        closed: false,
        flows: { reportsIntro: true, reportsSaving: true, reportsComparing: true, reportsExporting: false },
      },
    }, tourVisibleOverrides);

    expect(wrapper.find('.ai-insights-tutorial').exists()).toBe(false);
    expect(wrapper.findComponent({ name: 'TutorialCTA' }).exists()).toBe(false);
  });

  it('does not re-evaluate visibility after mount when reports tour completes in same session', async () => {
    const initialFlowStates = {
      aiInsights: { closed: false, step: 0, lastDismissed: null },
      [REPORTS]: {
        closed: false,
        flows: { reportsIntro: false, reportsSaving: false, reportsComparing: false, reportsExporting: false },
      },
    };

    const wrapper = await createWrapper(initialFlowStates, tourVisibleOverrides);

    // AI tutorial is hidden because reports tour is incomplete
    expect(wrapper.find('.ai-insights-tutorial').exists()).toBe(false);

    // Simulate reports tour completing externally (flowStates updated on backend)
    // Since updateVisibility only runs on mount, the AI tutorial stays hidden
    (productTourApi.getFlowStates as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...initialFlowStates,
      [REPORTS]: {
        closed: false,
        flows: { reportsIntro: true, reportsSaving: true, reportsComparing: true, reportsExporting: true },
      },
    });
    await flushPromises();

    // Tutorial remains hidden — requires re-mount to pick up the change
    expect(wrapper.find('.ai-insights-tutorial').exists()).toBe(false);
  });
});

describe('TutorialCTA', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders CTA when tutorial is not closed', async () => {
    const wrapper = await createWrapper(
      { aiInsights: { closed: false, step: 0, lastDismissed: '2026-02-20T10:00:00Z' } },
    );

    expect(wrapper.findComponent({ name: 'TutorialCTA' }).exists()).toBe(true);
  });

  it('emits click event when clicked', async () => {
    const wrapper = await createWrapper(
      { aiInsights: { closed: false, step: 0, lastDismissed: '2026-02-20T10:00:00Z' } },
    );
    const cta = wrapper.findComponent({ name: 'TutorialCTA' });

    await cta.vm.$emit('click');
    await wrapper.vm.$nextTick();

    // After CTA click, tutorial should open
    expect(wrapper.find('.ai-insights-tutorial').exists()).toBe(true);
  });
});
