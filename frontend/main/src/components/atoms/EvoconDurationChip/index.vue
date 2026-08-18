<template>
  <div
    class="evocon-duration-chip"
    :class="{
      'evocon-duration-chip--error': error,
      'evocon-duration-chip--empty': modelValue === null,
      'evocon-duration-chip--disabled': disabled,
    }"
    @click="focusInput"
  >
    <span class="d-flex duration-chip-content align-center">
      <v-icon
        size="16"
        color="secondary-text"
        class="mr-1"
      >
        {{ mdiClockOutline }}
      </v-icon>
      <span
        v-if="!hourInputHidden"
        ref="hourInput"
        class="content-editable hour-input"
        :contenteditable="!disabled"
        @keypress="onKeyPress"
        @input="onHourInput"
        @focus="onContentEditableFocus"
        @blur="onHourBlur"
      />
      <span v-if="!hourInputHidden" class="static-text mr-1">h</span>
      <span
        ref="minuteInput"
        :contenteditable="!disabled"
        class="content-editable minute-input"
        @keypress="onKeyPress"
        @input="onMinuteInput"
        @focus="onContentEditableFocus"
        @blur="onMinuteBlur"
      />
      <span class="static-text">m</span>
    </span>
  </div>
</template>

<script>

import { mdiClockOutline } from '@mdi/js';

const icons = { mdiClockOutline };

export default {
  name: 'EvoconDurationChip',
  props: {
    modelValue: {
      type: Number,
      default: null,
    },
    error: {
      type: Boolean,
    },
    maxHours: {
      type: Number,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: null,
    },
    hourInputHidden: {
      type: Boolean,
      default: null,
    },
  },
  emits: ['update:model-value'],
  data() {
    return {
      ...icons,
      minutes: '',
      hours: '',
    };
  },
  watch: {
    modelValue(newVal, oldVal) {
      if (newVal !== oldVal) {
        if (!this.hourInputHidden) this.setHours();
        this.setMinutes();
      }
    },
  },
  mounted() {
    if (!this.hourInputHidden) this.setHours();
    this.setMinutes();
  },
  methods: {
    setHours() {
      if (document.activeElement === this.$refs.hourInput) return;
      if (this.modelValue === null) {
        this.hours = '';
        this.$refs.hourInput.innerText = '';
      } else {
        this.hours = Math.floor(this.modelValue / 3600);
        this.$refs.hourInput.innerText = String(this.hours).padStart(2, '0');
      }
    },
    setMinutes() {
      if (document.activeElement === this.$refs.minuteInput) return;
      if (this.modelValue === null) {
        this.minutes = '';
        this.$refs.minuteInput.innerText = '';
      } else {
        if (this.hourInputHidden) this.minutes = Math.floor(this.modelValue / 60);
        else this.minutes = Math.floor((this.modelValue % 3600) / 60);
        this.$refs.minuteInput.innerText = String(this.minutes).padStart(2, '0');
      }
    },
    onKeyPress(event) {
      if (event.key === 'Enter') event.target.blur();
      if (Number.isNaN(Number(event.key))) event.preventDefault();
    },
    onContentEditableFocus(event) {
      window.getSelection().selectAllChildren(event.target);
    },
    onHourInput(event) {
      let value = event.target.innerText;
      if (value > this.maxHours) {
        this.$refs.hourInput.innerText = String(this.maxHours);
        this.$refs.minuteInput.focus();
        value = String(this.maxHours);
      }
      if (value === '00') {
        this.$refs.minuteInput.focus();
      }
      this.hours = value === '' ? '' : (Number.parseInt(value, 10) || 0);
      this.emitValue();
    },
    onHourBlur() {
      const value = this.$refs.hourInput.innerText;
      this.hours = Number.parseInt(value, 10) || 0;
      this.$refs.hourInput.innerText = String(value).padStart(2, '0');
      this.emitValue();
    },
    onMinuteInput(event) {
      const value = event.target.innerText;
      if (value === '') return;
      const maxMinutes = 59;
      if (!this.hourInputHidden && (value > maxMinutes || String(value).length > 2)) {
        this.$refs.minuteInput.innerText = maxMinutes;
        this.minutes = maxMinutes;
        this.emitValue();
        return;
      }
      this.minutes = Number.parseInt(value, 10) || 0;
      this.emitValue();
    },
    onMinuteBlur() {
      const value = this.$refs.minuteInput.innerText;
      this.minutes = Number.parseInt(value, 10) || 0;
      this.$refs.minuteInput.innerText = String(value).padStart(2, '0');
      this.emitValue();
    },
    emitValue() {
      if (this.hours === '' && this.minutes === '') {
        this.$emit('update:model-value', null);
      } else if (this.hourInputHidden) {
        this.$emit('update:model-value', this.minutes * 60);
      } else {
        this.$emit('update:model-value', (this.hours * 3600) + (this.minutes * 60));
      }
    },
    focusInput(event) {
      if (this.disabled) return;
      const isContentEditable = Array.from(event.target.classList).includes('content-editable');
      if (isContentEditable) return;
      if (this.hourInputHidden) this.$refs.minuteInput.focus();
      else this.$refs.hourInput.focus();
    },
  },
};
</script>

<style lang="scss" scoped>
.evocon-duration-chip {
  cursor: pointer;
  display: inline-block;
  border: 1px solid rgb(var(--v-theme-primary));
  background: var(--color-12-primary);
  border-radius: 16px;
  padding: 5px 12px;
  font-size: 14px;
  caret-color: rgb(var(--v-theme-primary));
  width: fit-content;

  &:hover, &:focus {
    background: var(--color-28-primary)  !important;
  }

  &--error {
    border-color: rgb(var(--v-theme-error));
    background: var(--color-12-error);
    caret-color: rgb(var(--v-theme-error));

    &:hover, &:focus {
      background: var(--color-28-error) !important;
    }

    .content-editable {
      &:focus {
        border-bottom: 1px solid rgb(var(--v-theme-error));
      }
    }
  }

  &--empty {
    background-color: rgb(var(--v-theme-quaternary-dark));
    border: 1px solid rgb(var(--v-theme-quaternary-dark));

    &:hover, &:focus {
      background-color: rgb(var(--v-theme-quaternary-dark-2)) !important;
    }

    .content-editable {
      border-bottom: 1px solid rgb(var(--v-theme-secondary-dark));
    }
  }
  &--disabled {
    pointer-events: none;
    opacity: 0.38;
  }
}

.duration-chip-content {
  height: 20px;
}

.content-editable {
  height: 20px;
  min-width: 16px;
  border: none;
  outline: none;
  line-height: 20px;

  &:focus {
    margin-bottom: -1px;
    border-bottom: 1px solid rgb(var(--v-theme-primary));
  }
}
</style>
