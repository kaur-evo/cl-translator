<template>
  <div v-if="value.length > 0">
    <div
      v-for="(entry, i) in value"
      :key="`object-key-val-${i}`"
      :class="{ 'text-secondary-dark': entry.unchanged }"
    >
      <span v-if="entry.keyPrefix" :class="entry.prefixClass">{{ entry.keyPrefix }}</span>
      <span v-if="entry.key" :class="entry.keyClass || keyClass">{{ getEntryKey(entry) }}</span>
      <object-data-visualizer
        v-if="Array.isArray(entry.value) && val !== null"
        :value="entry.value"
        :key-class="''"
      />
      <template v-else>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-html="DOMPurify.sanitize(entry.value).replace(/\n/g, '<br>')" />
        <span v-if="entry.unchanged"> ({{ $t('Unchanged') }}) </span>
      </template>
    </div>
    <br>
  </div>
  <span v-else>-</span>
</template>
<script setup name="ObjectDataVisualizer">
import DOMPurify from 'dompurify';

defineProps({
  value: {
    type: Object,
    default: () => ({}),
  },
  keyClass: {
    type: String,
    default: 'font-weight-medium',
  },
});

const getEntryKey = (entry) => {
  if (entry.isSubheader) return entry.key;
  return `${entry.key}: `;
};
</script>
