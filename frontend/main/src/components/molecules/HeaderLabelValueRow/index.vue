<template>
  <div class="d-flex align-center text-truncate full-width">
    <div class="shift-view-label mr-1" :class="[{ 'large-label': large }, labelClass]">
      {{ label }}:
    </div>
    <div class="text-truncate" :class="valueClass">
      <slot>{{ value }}</slot>
    </div>
  </div>
</template>
<script setup name="HeaderLabelValueRow">
defineProps({
  large: Boolean,
  label: { type: String, required: true },
  value: { type: String, default: '' },
  labelClass: { type: String, default: '' },
  valueClass: { type: String, default: '' },
});
</script>
