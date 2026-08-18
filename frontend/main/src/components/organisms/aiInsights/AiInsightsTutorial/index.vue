<template>
  <div class="ai-insights-tutorial-container">
    <v-slide-y-reverse-transition mode="out-in">
      <v-card
        v-if="showTutorial"
        ref="tutorialCard"
        class="ai-insights-tutorial"
        width="400"
        tabindex="-1"
        @keydown.escape="onLater"
      >
        <div class="tutorial-image-container">
          <img
            :src="currentStepConfig.image"
            :alt="currentStepConfig.title"
            class="tutorial-image"
          >
        </div>

        <v-progress-linear
          :model-value="progressPercentage"
          color="primary"
        />

        <v-card-text class="text-center px-6 pt-5 pb-4">
          <span class="text-headline-small mb-2 d-block">
            {{ currentStepConfig.title }}
          </span>
          <p class="text-body-medium text-medium-emphasis">
            {{ currentStepConfig.description }}
          </p>
        </v-card-text>

        <v-card-actions class="px-6 pb-5 pt-0">
          <evocon-v-button
            :text="$t('Later')"
            data-testid="tutorial-later-btn"
            @click="onLater"
          />
          <v-spacer />
          <evocon-v-button
            v-if="currentStep > 0"
            :text="$t('Back')"
            data-testid="tutorial-back-btn"
            @click="onBack"
          />
          <evocon-v-button
            v-if="isLastStep"
            color="primary"
            :text="$t('Done')"
            data-testid="tutorial-done-btn"
            @click="onDone"
          />
          <evocon-v-button
            v-else
            color="primary"
            :text="$t('Next_noun')"
            data-testid="tutorial-next-btn"
            @click="onNext"
          />
        </v-card-actions>
      </v-card>
    </v-slide-y-reverse-transition>

    <v-fade-transition mode="out-in">
      <tutorial-c-t-a
        v-if="showCTA"
        @click="onCTAClick"
      />
    </v-fade-transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';

import TutorialCTA from './TutorialCTA.vue';

import productTourApi from '@/api/productTourApi';
import { REPORTS } from '@/constants/routeNames';
import { OFFICE_USER } from '@/constants/userRoles';
import { isRoleSameLevelOrAbove } from '@/helpers/permissions/isRoleSameLevelOrAbove';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import { getTutorialSteps, type TutorialStepConfig } from '@/constants/aiInsightsTutorialConfig';
import { useConfigurationStore, useProfileStore, useFeatureStore } from '@/stores';

const { t } = useI18n();
const configurationStore = useConfigurationStore();
const profileStore = useProfileStore();
const featureStore = useFeatureStore();

const tutorialCard = ref<{ $el?: HTMLElement } | null>(null);

const flowStates = ref<Record<string, unknown>>({});
const currentStep = ref(0);
const showTutorial = ref(false);
const showCTA = ref(false);

const aiNotesInsightsEnabled = computed(
  () => configurationStore.aiNotesInsightsEnabled,
);

const tutorialSteps = computed(() => getTutorialSteps(t));
const totalSteps = computed(() => tutorialSteps.value.length);
const currentStepConfig = computed(() => tutorialSteps.value[currentStep.value] as TutorialStepConfig);
const isLastStep = computed(() => currentStep.value === totalSteps.value - 1);
const progressPercentage = computed(() => ((currentStep.value + 1) / totalSteps.value) * 100);

const isOfficeUserOrAbove = computed(
  () => isRoleSameLevelOrAbove(profileStore.highestUserRole, OFFICE_USER),
);

const isReportsProductTourVisible = computed(
  () => featureStore.productTourEnabled && profileStore.highestUserRole === OFFICE_USER,
);

const isReportsProductTourComplete = computed(() => {
  if (!isReportsProductTourVisible.value) return true;

  const reportsTour = flowStates.value[REPORTS] as {
    closed?: boolean;
    flows?: Record<string, boolean>;
  } | undefined;

  if (!reportsTour) return true;
  if (reportsTour.closed) return true;

  const { flows } = reportsTour;
  if (!flows || Object.keys(flows).length === 0) return true;
  return Object.values(flows).every(Boolean);
});

const getAiInsightsSection = () => {
  const section = flowStates.value.aiInsights as {
    closed?: boolean; step?: number; lastDismissed?: string | null;
  } | undefined;
  return section || { closed: false, step: 0, lastDismissed: null };
};

const saveAiInsightsSection = async (updates: Record<string, unknown>) => {
  const requestBody = {
    ...flowStates.value,
    aiInsights: { ...getAiInsightsSection(), ...updates },
  };
  flowStates.value = await productTourApi.updateFlowStates(requestBody);
};

const updateVisibility = () => {
  if (!aiNotesInsightsEnabled.value || !isOfficeUserOrAbove.value || !isReportsProductTourComplete.value) {
    showTutorial.value = false;
    showCTA.value = false;
    return;
  }

  const section = getAiInsightsSection();
  if (section.closed) {
    showTutorial.value = false;
    showCTA.value = false;
  } else if (section.lastDismissed) {
    showTutorial.value = false;
    showCTA.value = true;
  } else {
    // First visit — never dismissed, auto-open tutorial
    showTutorial.value = true;
    showCTA.value = false;
  }
};

// Auto-focus card when it appears (for keyboard Escape handling)
watch(showTutorial, async (visible) => {
  if (visible) {
    await nextTick();
    tutorialCard.value?.$el?.focus();
  }
});

const onNext = () => {
  if (currentStep.value < totalSteps.value - 1) currentStep.value += 1;
};

const onBack = () => {
  if (currentStep.value > 0) currentStep.value -= 1;
};

const onLater = async () => {
  showTutorial.value = false;
  showCTA.value = true;
  try {
    await saveAiInsightsSection({ closed: false, step: currentStep.value, lastDismissed: new Date().toISOString() });
  } catch {
    // Save failed silently; local state still updated so session continues
  }
};

const onDone = async () => {
  showTutorial.value = false;
  showCTA.value = false;
  try {
    await saveAiInsightsSection({ closed: true, step: totalSteps.value, lastDismissed: null });
  } catch {
    // Save failed silently; tutorial is non-critical
  }
};

const onCTAClick = () => {
  currentStep.value = 0;
  showTutorial.value = true;
  showCTA.value = false;
};

onMounted(async () => {
  if (!aiNotesInsightsEnabled.value || !isOfficeUserOrAbove.value) return;
  try {
    flowStates.value = await productTourApi.getFlowStates();
  } catch {
    // API unavailable; fallback to default state (first-visit behavior)
  }
  updateVisibility();
});
</script>

<style scoped>
.ai-insights-tutorial-container {
  position: fixed;
  bottom: 40px;
  right: 40px;
  z-index: 9999;
}

.ai-insights-tutorial {
  overflow: hidden;
  margin-bottom: 8px;
  max-width: calc(100vw - 32px);
}

.tutorial-image-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 232px;
}

.tutorial-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
