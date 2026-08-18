<template>
  <div>
    <div
      class="text-body-medium d-flex align-center"
      :class="{ 'text-primary-text': !disabled }"
    >
      {{ label }}
      <slot name="label-additions" />
    </div>
    <div
      v-if="subLabel"
      class="text-body-small text-secondary-text"
    >
      {{ subLabel }}
    </div>
  </div>
</template>
<script>
export default {
  name: 'InputLabel',
  props: {
    label: {
      type: String,
      default: '',
    },
    subLabel: {
      type: String,
      default: '',
    },
    disabled: { type: Boolean },
  },
};
</script>
