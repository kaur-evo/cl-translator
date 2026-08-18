<template>
  <evocon-multi-chip-input
    :model-value="modelValue"
    :placeholder="placeholder"
    :required="required"
    :chip-validation-fn="isValidEmail"
    :hint="$t('Emails')"
    :error="!isValid"
    validate
    @update:model-value="$emit('update:model-value', $event)"
  />
</template>

<script>
import { isValidEmail } from '@/helpers/validationRules';
import EvoconMultiChipInput from '@/components/molecules/EvoconMultiChipInput/index.vue';

export default {
  name: 'EvoconEmailInput',
  components: { EvoconMultiChipInput },
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
    placeholder: {
      type: String,
      default: '',
    },
    required: {
      type: Boolean,
    },
  },
  emits: ['update:model-value'],
  computed: {
    // important: this is used in form validations!
    isValid() {
      if (this.required && this.modelValue.length === 0) return false;
      return this.modelValue.every((email) => isValidEmail(email) === true);
    },
  },
  methods: {
    isValidEmail,
  },
};
</script>
