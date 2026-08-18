<template>
  <v-btn-toggle
    id="toggle-button"
    :model-value="modelValue"
    color="primary"
    class="ml-auto rounded button-toggle bg-quaternary-dark"
    selected-class="toggle-button--selected"
    mandatory="force"
    density="compact"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <v-btn
      v-for="(item, i) in items"
      :key="`option-${i}`"
      :ripple="false"
      :model-value="i"
      class="rounded toggle-button flex-grow-1"
      :class="{ 'px-2': isCompact }"
      size="small"
      :value="valueKey ? item[valueKey] : null"
      :icon="isCompact"
      :width="isCompact ? '32px' : 'auto'"
    >
      <v-icon :size="16">
        {{ item[iconKey] }}
      </v-icon>
      <span v-if="!isCompact" class="button-text ml-1">
        {{ item[textKey] }}
      </span>
    </v-btn>
  </v-btn-toggle>
</template>
<script>

export default {
  name: 'EvoconVToggleButton',
  props: {
    modelValue: { type: [Number, String], default: 0 },
    items: { type: Array, required: true },
    isCompact: { type: Boolean },
    iconKey: { type: String, default: 'icon' },
    textKey: { type: String, default: 'text' },
    valueKey: { type: String, default: null },
  },
  emits: ['update:model-value'],
};
</script>

<style lang="scss" scoped>
 .button-toggle {
  padding: 2px;
  height: 32px;
  min-width: fit-content;
}

.toggle-button {
  color: rgb(var(--v-theme-primary-dark)) !important;
  background: transparent;

  .v-icon {
    color: rgb(var(--v-theme-icon-default)) !important;
  }

  &--selected {
    background-color: white !important;
    color: rgb(var(--v-theme-primary-dark)) !important;
    pointer-events: none;

    .v-icon {
      color: rgb(var(--v-theme-primary)) !important;
    }
  }
}

.button-text {
  text-transform: capitalize;
  line-height: 16px;
}
</style>
