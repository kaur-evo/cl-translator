<template>
  <Evocon12HTimeInput
    v-if="timeFormat === 12"
    ref="time-input"
    v-bind="$attrs"
    :model-value="modelValue"
    :class="{ 'empty-input': !modelValue }"
    :use-chip="useChip"
    @update:model-value="$emit('update:model-value', $event)"
  />
  <Evocon24HTimeInput
    v-else
    ref="time-input"
    :model-value="modelValue"
    v-bind="$attrs"
    :class="{ 'empty-input': !modelValue }"
    :use-chip="useChip"
    @update:model-value="$emit('update:model-value', $event)"
  />
</template>

<script>
import { mapState } from 'pinia';

import Evocon24HTimeInput from '@/components/atoms/Evocon24HTimeInput/index.vue';
import Evocon12HTimeInput from '@/components/atoms/Evocon12HTimeInput/index.vue';
import useProfileStore from '@/stores/profile';

export default {
  name: 'EvoconTimeInput',
  components: { Evocon12HTimeInput, Evocon24HTimeInput },
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    useChip: {
      type: Boolean,
    },
  },
  emits: ['update:model-value'],
  computed: {
    ...mapState(useProfileStore, ['currentUser']),
    timeFormat() {
      return this.currentUser.timeFormat;
    },
  },
};
</script>

<style lang="less" scoped>
.empty-input :deep(input) {
  color: rgb(var(--v-theme-tertiary-dark));
}
</style>
