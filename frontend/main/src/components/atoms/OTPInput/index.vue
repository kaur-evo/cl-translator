<template>
  <div ref="otpCont">
    <v-otp-input
      ref="otpInput"
      v-bind="$attrs"
      :value="modelValue"
      :error="invalid"
      :length="digitCount"
      autocomplete="off"
      @update:model-value="$emit('update:model-value', $event)"
    />
    <div
      class="text-center input-label text-body-small mt-n2"
      :class="{ 'text-error': invalid }"
    >
      {{ label }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'OTPInput',
  props: {
    modelValue: {
      type: String,
      default: null,
    },
    digitCount: {
      type: Number,
      required: true,
    },
    label: {
      type: String,
      default: '',
    },
    invalid: {
      type: Boolean,
    },
  },
  emits: ['update:model-value'],
  mounted() {
    this.$refs.otpInput?.focus?.();
  },
};
</script>
