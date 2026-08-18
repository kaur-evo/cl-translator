<template>
  <evocon-v-chip
    :label="rangeLabel"
    class="range-chip-selection px-0"
    :type="chipType"
    :active="isChipActive"
    @click="onClick"
  >
    <template #prepend>
      <evocon-v-tooltip-wrap :text="prevBtnTooltipText">
        <template #activator="tooltipProps">
          <evocon-v-button
            :icon="mdiChevronLeft"
            size="extra-small"
            density="comfortable"
            class="mr-1"
            :disabled="previousDisabled"
            v-bind="tooltipProps.props"
            @click.stop="emit('click-previous')"
          />
        </template>
      </evocon-v-tooltip-wrap>
    </template>
    <template #append>
      <evocon-v-tooltip-wrap :text="nextBtnTooltipText">
        <template #activator="tooltipProps">
          <evocon-v-button
            :icon="mdiChevronRight"
            size="extra-small"
            density="comfortable"
            class="ml-1"
            :disabled="nextDisabled"
            v-bind="tooltipProps.props"
            @click.stop="emit('click-next')"
          />
        </template>
      </evocon-v-tooltip-wrap>
      <slot name="append" />
    </template>
  </evocon-v-chip>
  <v-dialog
    v-if="isMobileView"
    :model-value="isOpen"
    fullscreen
    eager
  >
    <v-card class="py-0 max-height-100-pct overflow-hidden rounded">
      <dialog-template
        :title="rangeLabel"
      >
        <template #content>
          <slot name="selection-list" />
        </template>
        <template #actions>
          <slot name="actions" />
        </template>
      </dialog-template>
    </v-card>
  </v-dialog>
  <v-menu
    v-else-if="!isMobileView"
    v-bind="$attrs"
    :model-value="isOpen"
    activator="parent"
    eager
    @update:model-value="$emit('update:isOpen', $event)"
  >
    <v-card>
      <div>
        <slot name="selection-list" />
      </div>
      <div v-if="slots.actions" class="px-4 pt-2 pb-4 d-flex">
        <slot name="actions" />
      </div>
    </v-card>
  </v-menu>
</template>
<script setup name="RangeChipSelection">
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import { computed, useSlots } from 'vue';

import { useDeviceStore } from '@/stores/index';
import EvoconVChip from '@/components/atoms/EvoconVChip/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import EvoconVTooltipWrap from '@/components/atoms/EvoconVTooltipWrap/index.vue';
import DialogTemplate from '@/components/templates/DialogTemplate/index.vue';

const deviceStore = useDeviceStore();
const slots = useSlots();

defineProps({
  rangeLabel: {
    type: String,
    default: '',
  },
  isChipActive: {
    type: Boolean,
  },
  previousDisabled: {
    type: Boolean,
  },
  nextDisabled: {
    type: Boolean,
  },
  prevBtnTooltipText: {
    type: String,
    default: '',
  },
  nextBtnTooltipText: {
    type: String,
    default: '',
  },
  isOpen: {
    type: Boolean,
  },
  chipType: {
    type: String,
    default: 'primary',
  },
});
const emit = defineEmits(['click-previous', 'click-next', 'update:isOpen']);
const isMobileView = computed(() => deviceStore.isMobileView);

const onClick = () => {
  if (isMobileView.value) {
    emit('update:isOpen', true);
  }
};
</script>
