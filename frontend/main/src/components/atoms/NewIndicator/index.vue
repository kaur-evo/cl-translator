<template>
  <div v-if="isVisible" class="new-indicator bg-primary rounded" :class="{ small }">
    <span v-if="!small" class="font-weight-bold text-uppercase">{{ text || $t('New') }}</span>
  </div>
</template>

<script setup name="NewIndicator">
import { computed } from 'vue';

const props = defineProps({
  shownUntil: {
    type: String,
    default: null,
  },
  small: {
    type: Boolean,
    default: false,
  },
  text: {
    type: String,
    default: '',
  },
});

const small = computed(() => props.small);

const isVisible = computed(() => {
  if (!props.shownUntil) return true;
  return new Date() < new Date(props.shownUntil);
});
</script>

<style lang="less" scoped>
.new-indicator {
  padding: 2px 4px;
  font-size: 8px;
  line-height: 8px;
  height: 12px;

  &.small {
    padding: 0;
    height: 9px;
    width: 9px;
  }
}
</style>
