<template>
  <dialog-toolbar :title="isStartShiftDialog ? $t('Start shift') : $t('Edit shift time')">
    <template #prepend>
      <evocon-v-button
        v-if="isStartShiftDialog && !isShiftStartSelectionVisible"
        class="back-button"
        :icon="mdiArrowLeft"
        @click="$emit('on-back-button-click')"
      />
    </template>
    <template #append>
      <icon-with-tooltip
        additional-classes="ml-2"
        :icon="mdiInformationOutline"
        :tooltip-text="$t('Learn more')"
        :icon-clicked-fn="() => $emit('on-help-click')"
      />
    </template>
  </dialog-toolbar>
</template>
<script setup name="ShiftManagementDialogToolbar">
import { mdiArrowLeft, mdiInformationOutline } from '@mdi/js';

import DialogToolbar from '@/components/atoms/DialogToolbar/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import IconWithTooltip from '@/components/atoms/IconWithTooltip/index.vue';

defineProps({
  isStartShiftDialog: Boolean,
  isShiftStartSelectionVisible: Boolean,
});

defineEmits(['on-back-button-click', 'on-help-click']);
</script>
<style lang="scss" scoped>
.back-button {
  position: absolute;
  left: 8px;
}
</style>
