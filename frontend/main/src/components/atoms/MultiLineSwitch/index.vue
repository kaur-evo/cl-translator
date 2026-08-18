<template>
  <div class="d-flex flex-column" :class="{ 'justify-space-between': sameLineInput }">
    <v-switch
      v-bind="$attrs"
      :model-value="modelValue"
      inset
      density="compact"
      hide-details
      class="d-inline-block evocon-v-switch"
      :class="{ 'evocon-v-switch--on': modelValue, 'v-theme--dark': isDark }"
      :disabled="disabled"
      @update:model-value="$emit('update:model-value', $event)"
    >
      <template v-if="mainText || helpText" #label>
        <input-label
          :label="mainText"
          :sub-label="helpText"
          :dark="dark"
        >
          <template #label-additions>
            <slot name="label-additions" />
          </template>
        </input-label>
      </template>
    </v-switch>
    <slot
      v-if="modelValue"
      name="enabled-input"
    />
  </div>
</template>

<script>
import InputLabel from '@/components/atoms/InputLabel/index.vue';

export default {
  name: 'MultiLineSwitch',
  components: { InputLabel },
  props: {
    modelValue: {
      type: Boolean,
    },
    disabled: {
      type: Boolean,
    },
    mainText: {
      type: String,
      default: '',
    },
    helpText: {
      type: String,
      default: '',
    },
    sameLineInput: {
      type: Boolean,
    },
    dark: { type: Boolean, default: null },
  },
  emits: ['update:model-value'],
  computed: {
    isDark() {
      return this.dark === null ? this.$vuetify.theme.name === 'dark' : this.dark;
    },
  },
};
</script>
