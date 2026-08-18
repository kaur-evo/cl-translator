<template>
  <div>
    <span v-if="topReasons.length" class="text-label-small text-secondary-text">
      {{ $t('Most used reasons') }}
    </span>
    <v-card
      v-if="topReasons.length || topReasonsLoading"
      :flat="!isMobileView"
      :class="{ 'px-2 mt-2': isMobileView, 'rounded-0': !isMobileView }"
    >
      <v-progress-linear
        v-if="topReasonsLoading"
        indeterminate
        color="primary"
      />
      <div
        v-else
        class="justify-start my-1"
      >
        <evocon-v-chip
          v-for="(reason, i) in topReasons"
          :key="`chip${i}`"
          :value="reason.entityId"
          :label="reason.name"
          :disabled="visibleReasons.findIndex((comment) => comment.id === reason.entityId) === -1"
          type="primary"
          :active="reason.entityId === selectedReason"
          :size="isMobileView ? 'small' : 'default'"
          :dark="false"
          class="my-1 mr-2"
          @select="$emit('reason-selected', reason.entityId)"
        />
      </div>
    </v-card>
  </div>
</template>

<script setup name="TopReasonsSelection">
import { computed } from 'vue';

import EvoconVChip from '@/components/atoms/EvoconVChip/index.vue';
import { useDeviceStore } from '@/stores';

const deviceStore = useDeviceStore();
const isMobileView = computed(() => deviceStore.isMobileView);

defineEmits(['reason-selected']);

const props = defineProps({
  topReasons: {
    type: Array,
    default: () => [],
  },
  topReasonsLoading: {
    type: Boolean,
    default: false,
  },
  visibleReasons: {
    type: Array,
    default: () => [],
  },
  selectedReason: {
    type: Number,
    default: 0,
  },
});
</script>
