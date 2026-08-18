<template>
  <v-bottom-sheet
    :model-value="isOpen"
    :height="height"
    :theme="theme"
    @update:model-value="closeBottomSheet"
  >
    <v-card>
      <div class="bottom-sheet-header d-flex align-center justify-center px-6">
        <span
          v-if="title"
          class="text-headline-small"
        >
          {{ title }}
        </span>
        <evocon-v-button
          :icon="mdiClose"
          size="default"
          :color="theme === 'light' ? 'secondary-dark' : 'white'"
          class="close-button"
          @click="closeBottomSheet"
        />
      </div>
      <slot />
    </v-card>
  </v-bottom-sheet>
</template>
<script setup name="BottomSheetTemplate">
import { storeToRefs } from 'pinia';
import { mdiClose } from '@mdi/js';

import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import useBottomSheetStore from '@/stores/bottomSheet';

defineProps({
  title: {
    type: String,
    default: '',
  },
  height: {
    type: Number,
    default: null,
  },
  theme: {
    type: String,
    default: 'dark',
  },
});

const bottomSheetStore = useBottomSheetStore();
const { isOpen } = storeToRefs(bottomSheetStore);

const closeBottomSheet = () => bottomSheetStore.closeBottomSheet();
</script>
<style lang="scss" scoped>
.bottom-sheet-header {
  min-height: 48px;
}

.close-button {
  position: absolute;
  right: 24px;
}
</style>
