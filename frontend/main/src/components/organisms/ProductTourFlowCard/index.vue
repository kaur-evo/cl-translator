<template>
  <v-card theme="light" width="400">
    <img
      :src="getImageAsset(visibleStep.img)"
      width="400"
      alt=""
    >
    <v-progress-linear
      v-if="steps.length > 1"
      :model-value="progressBarPercentage"
      height="8"
      class="mt-n2"
    />
    <v-card-title class="flow-card-title">
      {{ visibleStep.title }}
    </v-card-title>
    <v-card-text class="pb-2 px-6">
      <div v-for="(line, i) in visibleStep.descrLines" :key="i">
        <p class="text-body-large white-space-pre-line">
          {{ line }}
        </p>
        <br v-if="i !== visibleStep.descrLines.length - 1">
      </div>
    </v-card-text>
    <v-card-actions>
      <evocon-v-button
        v-if="visibleStep.tertiaryBtnText"
        :text="visibleStep.tertiaryBtnText"
        @click="onTertiaryClick"
      />
      <v-spacer />
      <evocon-v-button
        v-if="currentStepIndex > 0 && visibleStep.showBackBtn"
        :text="$t('Back')"
        color="quaternary-dark"
        @click="onBackClick"
      />
      <evocon-v-button
        :text="primaryButtonText"
        color="primary"
        @click="onPrimaryButtonClick"
      />
    </v-card-actions>
  </v-card>
</template>
<script setup name="ProductTourFlowCard">
import { ref, computed, watch } from 'vue';

import i18n from '@/services/i18n';
import { getImageAsset } from '@/helpers/file/getAsset';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';

const props = defineProps({
  steps: {
    type: Array,
    default: () => [],
  },
  markCompleteOnLastStep: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['mark-flow-as-completed', 'click:tertiary-btn']);

const currentStepIndex = ref(0);

const visibleStep = computed(() => props.steps[currentStepIndex.value] ?? {});

const progressBarPercentage = computed(() => (100 / props.steps.length) * (currentStepIndex.value + 1));

const primaryButtonText = computed(() => {
  if (visibleStep.value.primaryBtnText) return visibleStep.value.primaryBtnText;
  if (currentStepIndex.value === props.steps.length - 1) return i18n.global.t('Ok');
  return i18n.global.t('Next_noun');
});

const onBackClick = () => {
  currentStepIndex.value -= 1;
};

const onPrimaryButtonClick = () => {
  if (visibleStep.value.primaryBtnAction) {
    visibleStep.value.primaryBtnAction();
  } else {
    onNextClick();
  }
};

const onTertiaryClick = () => {
  if (visibleStep.value.tertiaryBtnAction) {
    visibleStep.value.tertiaryBtnAction();
  } else {
    emit('click:tertiary-btn');
  }
};

const onNextClick = () => {
  if (currentStepIndex.value === props.steps.length - 1) emit('click:tertiary-btn');
  else currentStepIndex.value += 1;
};

watch(currentStepIndex, (newVal) => {
  if (props.markCompleteOnLastStep && newVal === props.steps.length - 1) emit('mark-flow-as-completed');
}, { immediate: true });
</script>
<style lang="scss" scoped>
.flow-card-title {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  text-wrap: auto;
}
</style>
