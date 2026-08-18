<template>
  <evocon-v-input
    ref="evoconTimeInput"
    v-model="innerValue"
    v-maska="mask"
    v-bind="$attrs"
    :rules="[timeRule, ...($attrs.rules || [])]"
    :placeholder="placeholder"
    :use-chip="useChip"
  />
</template>

<script>
import { vMaska } from 'maska/vue';
import { format } from 'date-fns';

import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import { timeInput24h } from '@/helpers/validationRules';

export default {
  name: 'Evocon24HTimeInput',
  components: { EvoconVInput },
  directives: { maska: vMaska },
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
      timeRegex: timeInput24h,
      mask: { mask: 'H#:M#', tokens: { '#': { pattern: /\d/ }, H: { pattern: /[0-2]/ }, M: { pattern: /[0-5]/ } } },
    };
  },
  computed: {
    timeRule() {
      return !this.innerValue || this.timeRegex.test(this.innerValue) || this.$t('Invalid time');
    },
    placeholder() {
      return format(new Date(), 'HH:mm');
    },
  },
  watch: {
    modelValue(newVal, oldVal) {
      if (newVal && newVal !== oldVal) this.innerValue = newVal;
    },
    innerValue(newVal) {
      if (!newVal || this.timeRegex.test(newVal)) this.$emit('update:model-value', newVal);
      else this.$emit('update:model-value', null);
    },
  },
  mounted() {
    if (this.modelValue) this.innerValue = this.modelValue;
    if (this.useChip) {
      const input = this.$refs.evoconTimeInput.$refs.evoconInputChip?.chipInput;
      if (input) input.style = 'width: 36px;';
    }
  },
};
</script>
