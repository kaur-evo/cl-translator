<template>
  <div class="full-width">
    <div
      class="text-input"
      :class="{
        'text-input--error': !isValid,
        'text-input--mobile': isMobileView,
        'text-input--comfortable': density === 'comfortable',
        'text-input--wrap': wrapChips,
        'text-input--disabled': disabled,
      }"
      @click.stop="addEmptyChip"
    >
      <div v-if="placeholder.length > 0 && modelValue.length === 0" class="text-placeholder">
        {{ placeholder }}
      </div>
      <div
        v-else
        ref="textContainer"
        class="text-container d-flex"
      >
        <component
          :is="chipComponent"
          v-for="(chip, i) in modelValue"
          :key="`chip-${i}`"
          :ref="`chip-${i}`"
          :model-value="modelValue[i]"
          class="ma-1"
          v-bind="chipComponentProps"
          grow
          :append-inner-icon="mdiCloseCircle"
          :error="hasChipError(chip)"
          :warning="hasChipWarning(chip)"
          @update:model-value="onUpdateChip(i, $event)"
          @click.stop=""
          @blur="onBlur(i)"
          @keydown="onKeyDown(i, $event)"
          @click:append-inner="removeChip(i)"
        >
          <template v-if="showOrderingNumbers" #prepend>
            <ordering-number
              :number="i + 1"
              small
              outlined
              :color="hasChipError(chip) ? 'error' : hasChipWarning(chip) ? 'secondary' : 'primary'"
              class="mr-1"
            />
          </template>
        </component>
        <div v-if="$slots['append-inner']" class="append-inner-content" @click.stop="">
          <slot name="append-inner" />
        </div>
      </div>
    </div>
    <div class="d-flex flex-row justify-space-between">
      <span class="hint-text" :class="{ 'hint-text--error': !isValid }">
        {{ hint }}
      </span>
      <span class="hint-text" :class="{ 'hint-text--error': !isValid }">
        <slot
          name="hint-addition"
          :count="modelValue.length"
          :is-limit-reached="isLimitReached"
          :limit="limit"
        />
      </span>
    </div>
  </div>
</template>

<script>
import { mdiCloseCircle } from '@mdi/js';
import { VInput } from 'vuetify/components';
import { mapState } from 'pinia';
import { nextTick } from 'vue';

import { useDeviceStore } from '@/stores/index';
import EvoconInputChip from '@/components/atoms/EvoconInputChip/index.vue';
import EvoconNumberInput from '@/components/atoms/EvoconNumberInput/index.vue';
import OrderingNumber from '@/components/atoms/OrderingNumber/index.vue';
import EvoconBooleanChip from '@/components/molecules/EvoconBooleanChip/index.vue';

const icons = { mdiCloseCircle };

export default {
  name: 'EvoconMultiChipInput',
  components: { EvoconInputChip, EvoconNumberInput, OrderingNumber, EvoconBooleanChip },
  extends: VInput,
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
    chipValidationFn: {
      type: Function,
      required: true,
    },
    hint: {
      type: String,
      default: '',
    },
    density: {
      type: String,
      default: 'default',
    },
    validate: {
      type: Boolean,
      default: true,
    },
    showOrderingNumbers: {
      type: Boolean,
      default: false,
    },
    wrapChips: {
      type: Boolean,
      default: false,
    },
    limit: {
      type: Number,
      default: 0,
    },
    chipType: {
      type: String,
      default: 'String',
      validator: (value) => ['String', 'Number', 'Boolean'].includes(value),
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:model-value'],
  data() {
    return {
      ...icons,
    };
  },
  computed: {
    ...mapState(useDeviceStore, ['isMobileView']),
    isNumberType() {
      return this.chipType === 'Number';
    },
    isBooleanType() {
      return this.chipType === 'Boolean';
    },
    isLimitReached() {
      return this.limit > 0 && this.modelValue.length >= this.limit;
    },
    chipComponent() {
      if (this.isBooleanType) return 'evocon-boolean-chip';
      return this.isNumberType ? 'evocon-number-input' : 'evocon-input-chip';
    },
    chipComponentProps() {
      return this.isNumberType ? { useChip: true, allowNegative: true } : {};
    },
    isValid() {
      if (!this.validate) return true;
      if (this.required && this.modelValue.length === 0) return false;
      return this.modelValue?.every((chip) => this.chipValidationFn(chip) === true);
    },
    keyHandlers() {
      return {
        Tab: {
          handler: this.handleTab,
          prevent: true,
          stop: true,
        },
        Enter: {
          handler: this.handleAddChip,
          prevent: true,
          stop: true,
        },
        Space: {
          handler: this.handleAddChip,
          prevent: true,
          stop: true,
        },
        Backspace: {
          handler: this.handleBackspace,
          prevent: false,
          stop: false,
        },
        ArrowRight: {
          handler: this.handleArrowRight,
          prevent: false,
          stop: false,
        },
        ArrowLeft: {
          handler: this.handleArrowLeft,
          prevent: false,
          stop: false,
        },
      };
    },
  },
  methods: {
    getChipInputEl(index) {
      const ref = this.$refs[`chip-${index}`];
      if (!ref || !ref[0]) return null;
      if (this.isNumberType) {
        return ref[0].$refs.evoconNumberField?.$refs.evoconInputChip?.chipInput;
      }
      return ref[0].$refs.chipInput;
    },
    isChipEmpty(chip) {
      if (this.isBooleanType) return false;
      return this.isNumberType ? chip === null : chip.length === 0;
    },
    async addEmptyChip() {
      if (this.disabled) return;
      if (this.isBooleanType) return;
      if (this.isLimitReached) return;
      if (this.modelValue.findIndex((chip) => this.isChipEmpty(chip)) > -1) return;
      const emptyValue = this.isNumberType ? null : '';
      await this.$emit('update:model-value', [...this.modelValue, emptyValue]);
      await nextTick();
      const lastChipIndex = this.modelValue.length - 1;
      this.getChipInputEl(lastChipIndex)?.focus();
    },
    hasChipError(chip) {
      if (!this.validate) return false;
      if (this.isBooleanType) return false;
      return !this.isChipEmpty(chip) && this.chipValidationFn(chip) !== true;
    },
    hasChipWarning(chip) {
      if (this.validate) return false;
      return !this.isChipEmpty(chip) && this.chipValidationFn(chip) !== true;
    },
    onUpdateChip(index, value) {
      if (this.isNumberType || this.isBooleanType) {
        this.onValueChipInput(index, value);
      } else {
        this.onTextChipInput(index, value);
      }
    },
    onBlur(index) {
      if (this.isBooleanType) return;
      if (index >= this.modelValue.length) return;
      if (this.isChipEmpty(this.modelValue[index])) {
        this.removeChip(index);
      }
    },
    removeChip(index) {
      const newValue = [...this.modelValue];
      newValue.splice(index, 1);
      this.$emit('update:model-value', newValue);
    },
    onTextChipInput(index, value) {
      const chips = value.split(',').reduce((acc, chip) => {
        if (chip.trim().length > 0) acc.push(chip.trim());
        return acc;
      }, []);
      const newVal = [...this.modelValue];
      newVal.splice(index, 1, ...chips);
      if (this.limit > 0 && newVal.length > this.limit) {
        newVal.length = this.limit;
      }
      this.$emit('update:model-value', newVal);
    },
    onValueChipInput(index, value) {
      const newVal = [...this.modelValue];
      newVal[index] = value;
      this.$emit('update:model-value', newVal);
    },
    onKeyDown(i, event) {
      const key = event.code === 'Space' ? 'Space' : event.key;
      const handlerObj = this.keyHandlers[key];
      if (handlerObj) {
        if (handlerObj.prevent) event.preventDefault();
        if (handlerObj.stop) event.stopPropagation();
        handlerObj.handler(i, event);
      }
    },
    handleTab(i, event) {
      const isLastFocused = i === this.modelValue.length - 1;
      const lastChip = this.modelValue[this.modelValue.length - 1];
      if (isLastFocused && !this.isChipEmpty(lastChip)) {
        this.addEmptyChip();
      }
    },
    handleAddChip(i, event) {
      this.addEmptyChip();
    },
    handleBackspace(i, event) {
      if (this.isChipEmpty(this.modelValue[i]) && i > 0) {
        event.preventDefault();
        event.stopPropagation();
        this.removeChip(i - 1);
        nextTick(() => {
          this.getChipInputEl(i - 1)?.focus();
        });
      }
    },
    handleArrowRight(i, event) {
      const chipInput = this.getChipInputEl(i);
      if (!chipInput) return;
      const valueStr = String(this.modelValue[i] ?? '');
      if (chipInput.selectionStart === valueStr.length) {
        event.preventDefault();
        event.stopPropagation();
        const nextInput = this.getChipInputEl(i + 1);
        if (nextInput) {
          nextInput.focus();
          nextInput.setSelectionRange(0, 0);
        }
      }
    },
    handleArrowLeft(i, event) {
      const chipInput = this.getChipInputEl(i);
      if (!chipInput) return;
      if (chipInput.selectionStart === 0) {
        event.preventDefault();
        event.stopPropagation();
        const prevInput = this.getChipInputEl(i - 1);
        if (prevInput) prevInput.focus();
      }
    },
  },
};
</script>

<style lang="less" scoped>
.text-input {
  display: flex;
  width: 100%;
  flex-direction: column;
  background: rgba(var(--v-theme-input-background));
  border-radius: 4px 4px 0 0;
  border-bottom: 1px solid rgba(var(--v-theme-tertiary-dark));
  outline: none;
  transition: all 0.2s ease-in-out;
  min-height: 56px;

  .text-placeholder {
    display: flex;
    align-items: center;
    padding-left: 16px;
    min-height: 56px;
    opacity: 0.5;
  }

  .text-container {
    height: auto;
    flex-grow: 1;
    position: relative;
    overflow-y: hidden;
    overflow-x: auto;
    margin: 8px 8px 7px;

    &::-webkit-scrollbar {
      display: none;
    }

    .append-inner-content {
      display: flex;
      align-items: center;
      margin-left: auto;
      white-space: nowrap;
      font-size: 16px;
    }
  }

  &:hover {
    background: rgba(var(--v-theme-quaternary-dark));
  }

  &--error {
    border-bottom: 1px solid rgb(var(--v-theme-error));
  }

  &--comfortable {
    min-height: 48px;

    .text-container {
      margin: 3px 12px;
    }
  }

  &--mobile {
    min-height: 40px;

    .text-container {
      margin: 0px 16px;
    }
  }

  &--wrap {
    .text-container {
      flex-wrap: wrap;
      overflow-y: auto;
    }
  }

  &--disabled {
    pointer-events: none;
    opacity: var(--v-disabled-opacity);
  }
}

.hint-text {
  display: block;
  font-size: 12px;
  line-height: 14px;
  color: rgba(var(--v-theme-secondary-dark));
  margin-left: 12px;
  margin-top: 7px;
  margin-bottom: 1px;

  &--error {
    color: rgb(var(--v-theme-error));
  }
}

</style>
