<template>
  <evocon-v-tooltip-wrap :text="text" :disabled="!hasTooltip">
    <template #activator="{ props }">
      <span
        v-bind="{ ...props, ...$attrs }"
        ref="elem"
        class="text-no-wrap overflow-hidden text-overflow-ellipsis"
      >
        {{ text }}
      </span>
    </template>
  </evocon-v-tooltip-wrap>
</template>

<script setup name="TruncatedText">
import { nextTick, ref, onMounted } from 'vue';

import EvoconVTooltipWrap from '@/components/atoms/EvoconVTooltipWrap/index.vue';

defineProps({
  text: {
    type: String,
    required: true,
  },
});

const elem = ref(null);
const hasTooltip = ref(false);

onMounted(async () => {
  await nextTick();
  const element = elem.value;
  if (element) {
    hasTooltip.value = element.scrollWidth > element.clientWidth;
  }
});

</script>
