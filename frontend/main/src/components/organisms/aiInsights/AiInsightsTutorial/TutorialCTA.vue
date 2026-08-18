<template>
  <evocon-v-button
    class="ai-insights-tutorial-cta"
    color="primary"
    size="default"
    :icon-src="aiIconWhite"
    :text="$t('Extra notes insights')"
    :aria-label="$t('Open AI insights tutorial')"
    data-testid="ai-insights-tutorial-cta"
    @click="$emit('click')"
  />
</template>

<script setup lang="ts">
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import aiIconWhite from '@/assets/icons/artificialIntelligenceWhite.svg';

defineEmits<{
  click: [];
}>();
</script>
