<template>
  <v-checkbox
    :model-value="modelValue"
    v-bind="$attrs"
    hide-details
    :true-value="trueValue"
    color="primary"
    :disabled="disabled"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <template #label>
      <input-label
        class="ml-4"
        :label="label"
        :sub-label="subLabel"
        :dark="dark"
        :disabled="disabled"
      />
    </template>
  </v-checkbox>
</template>

<script>
import InputLabel from '@/components/atoms/InputLabel/index.vue';

export default {
  name: 'EvoconVCheckbox',
  components: { InputLabel },
  props: {
    modelValue: {
      type: [Boolean, String, Number, Array],
      default: false,
    },
    label: {
      type: String,
      default: '',
    },
    subLabel: {
      type: String,
      default: '',
    },
    dark: {
      type: Boolean,
    },
    trueValue: {
      type: [Boolean, String, Number, Array],
      default: true,
    },
    disabled: { type: Boolean },
  },
  emits: ['update:model-value'],
};
</script>

<style lang="scss" scoped>
.v-checkbox {
  &.v-input--density-default {
    :deep(.v-selection-control--density-default) {
      --v-input-control-height: 24px !important;
      .v-selection-control__wrapper {
        width: 24px;
        height: 24px;

        .v-selection-control__input {
          position: absolute;
        }
      }
    }
  }
}

.v-checkbox.v-input--density-compact {
  :deep(.v-selection-control--density-compact) {
    --v-input-control-height: 24px !important;
    .v-selection-control__wrapper {
      width: 24px;
      height: 24px;

      .v-selection-control__input {
        position: absolute;

        .v-icon {
          height: 20px;
          width: 20px;
        }
      }
    }
  }
}
</style>
