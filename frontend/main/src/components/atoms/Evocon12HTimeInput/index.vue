<template>
  <evocon-v-input
    ref="evoconTimeInput"
    :model-value="innerValue"
    :input-mask="timeMask"
    v-bind="$attrs"
    :rules="[timeRule, ...($attrs.rules || [])]"
    :placeholder="placeholder"
    :use-chip="useChip"
    @update:model-value="onInput"
  />
</template>

<script>
/* eslint-disable sonarjs/duplicates-in-character-class */
/* eslint-disable sonarjs/concise-regex */
import { setMinutes, setHours, format } from 'date-fns';

import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import { timeInput12h } from '@/helpers/validationRules';

export default {
  name: 'Evocon12HTimeInput',
  components: { EvoconVInput },
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
  data() {
    return {
      innerValue: null,
      timeRegex: timeInput12h,
      timeMask: '',
    };
  },
  computed: {
    timeRule() {
      return !this.innerValue || this.timeRegex.test(this.innerValue) || this.$t('Invalid time');
    },
    placeholder() {
      return format(new Date(), 'h:mma');
    },
  },
  watch: {
    modelValue(newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        this.innerValue = this.getInnerValue();
        this.setMaskValue(this.innerValue);
      }
    },
    innerValue(newVal) {
      if (!newVal || this.timeRegex.test(newVal)) {
        this.$emit('update:model-value', this.getEmitValue(newVal));
      } else this.$emit('update:model-value', null);
    },
  },
  mounted() {
    this.innerValue = this.getInnerValue();
    if (this.useChip) {
      const input = this.$refs.evoconTimeInput.$refs.evoconInputChip?.chipInput;
      if (input) input.style = 'width: 58px;';
    }
  },
  methods: {
    getInnerValue() {
      if (!this.modelValue) return null;
      return format(setMinutes(setHours(new Date(), this.modelValue.split(':')[0]), this.modelValue.split(':')[1]), 'h:mma');
    },
    getEmitValue(input) {
      if (!input) return null;
      const isAm = input.includes('AM');
      const hoursPart = input.split(':')[0];
      const minutesPart = input.split(':')[1].split(isAm ? 'AM' : 'PM')[0];
      let hours;
      if (hoursPart === '12') {
        hours = isAm ? '00' : '12';
      } else {
        hours = isAm ? hoursPart.padStart(2, '0') : (parseInt(hoursPart, 10) + 12).toString();
      }
      return `${hours}:${minutesPart}`;
    },
    setMaskValue(input) {
      if (input && input.charAt(0) === '1' && (input.length === 1 || ['0', '1', '2'].includes(input.charAt(1)))) { // 1:22 and 12:22 should both be allowed
        this.timeMask = { mask: '1#:m#AM', tokens: { '#': { pattern: /\d?/ }, m: { pattern: /[0-5]/ }, A: { pattern: /[A|a|P|p]/ } } };
      } else {
        this.timeMask = {
          mask: '#:m%AM',
          tokens: {
            '#': { pattern: /[1-9]/ }, m: { pattern: /[0-5]/ }, '%': { pattern: /[0-9]/ }, A: { pattern: /[A|a|P|p]/ },
          },
        };
      }
    },
    onInput(input) {
      this.timeMask = ''; // disable mask until it's known what's the input
      this.innerValue = input.toUpperCase();
      this.setMaskValue(input);
    },
  },
};
</script>
