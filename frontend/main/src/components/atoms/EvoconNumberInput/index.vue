<template>
  <evocon-v-input
    v-bind="$attrs"
    ref="evoconNumberField"
    :model-value="displayValue"
    :use-chip="useChip"
    :grow="grow"
    input-with-bottom-border
    @focus="onFocus"
    @blur="onBlur"
    @keydown="onKeydown"
    @update:model-value="onInput"
  >
    <template
      v-for="slot in Object.keys($slots)"
      #[slot]="scope"
      :key="slot"
    >
      <slot
        :name="slot"
        v-bind="scope"
      />
    </template>
  </evocon-v-input>
</template>

<script>
import { round } from 'lodash';

import { formatNumber } from '@/helpers/numbers/formatNumber';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';

export default {
  name: 'EvoconNumberInput',
  components: { EvoconVInput },
  props: {
    modelValue: {
      type: Number,
      default: null,
    },
    allowNegative: {
      type: Boolean,
    },
    useChip: {
      type: Boolean,
    },
    grow: {
      type: Boolean,
    },
    allowFloat: {
      type: Boolean,
      default: true,
    },
    maxValue: {
      type: Number,
      default: 999999999999999, // to not lose precision
    },
  },
  emits: ['update:model-value', 'focus', 'blur'],
  data() {
    return {
      focused: false,
      rawInput: '',
    };
  },
  computed: {
    displayValue() {
      if (this.focused) return this.rawInput;
      if (this.modelValue === null) return '';
      return formatNumber(this.modelValue, { decimalPlaces: null });
    },
  },
  methods: {
    onKeydown($event) {
      const charStr = $event.key;
      if (!charStr) return;
      if (charStr === 'v' && $event.metaKey) return; // allow ctrl + v copy
      if (charStr.match('ArrowLeft') || charStr.match('ArrowRight') || charStr.match('Backspace') || charStr.match('Tab')) return; // allow arrows, backspace and tab
      const ruleForNegativeNumber = !this.allowNegative || (this.allowNegative && !charStr.match('-'));
      // eslint-disable-next-line sonarjs/concise-regex
      const ruleForNumbers = this.allowFloat ? !charStr.match(/^[0-9,.]+$/) : !charStr.match(/^[0-9]+$/);
      if (this.rawInput.length >= this.maxValue.toString().length) $event.preventDefault(); // max length reached
      if (ruleForNumbers && ruleForNegativeNumber) {
        $event.preventDefault();
      }
    },
    isIntermediateValue(val) {
      const normalized = val.replace(',', '.').replaceAll(' ', '');
      if (!normalized || normalized === '-' || normalized === '.') return true;
      if (normalized.endsWith('.')) return true;
      const num = Number(normalized);
      if (isNaN(num)) return true;
      // Trailing zeros after decimal would be lost by Number conversion (e.g. "1.50" -> 1.5)
      if (normalized.includes('.') && String(num) !== normalized) return true;
      return false;
    },
    onInput(val) {
      this.rawInput = val;
      if (!val) {
        this.$emit('update:model-value', null);
        return;
      }
      if (this.isIntermediateValue(val)) return;
      const emitVal = Number(val.replace(',', '.').replaceAll(' ', ''));
      this.$emit('update:model-value', Math.min(this.maxValue, round(emitVal, 5)));
    },
    onFocus($event) {
      this.focused = true;
      this.rawInput = this.modelValue === null ? '' : String(round(this.modelValue, 5));
      this.$emit('focus', $event);
    },
    onBlur($event) {
      if (!this.focused) {
        this.$emit('blur', $event);
        return;
      }
      if (this.rawInput && this.rawInput !== '-') {
        const emitVal = Number(this.rawInput.replace(',', '.').replaceAll(' ', ''));
        if (!isNaN(emitVal)) {
          this.$emit('update:model-value', Math.min(this.maxValue, round(emitVal, 5)));
        }
      } else if (!this.rawInput) {
        this.$emit('update:model-value', null);
      }
      this.focused = false;
      this.$emit('blur', $event);
    },
  },
};
</script>
