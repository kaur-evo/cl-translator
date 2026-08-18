<template>
  <evocon-v-date-picker
    ref="range-picker"
    v-bind="$attrs"
    range
    :model-value="modelValue"
    :class="{ 'hide-header': hideHeader }"
    class="evocon-date-range-picker"
    :picker-date="pickerDateMonth"
    @update:model-value="$emit('update:model-value', $event)"
    @change="$emit('change', $event)"
  >
    <slot />
  </evocon-v-date-picker>
</template>
<script>
import { format } from 'date-fns';

import EvoconVDatePicker from '@/components/atoms/EvoconVDatePicker/index.vue';

export default {
  name: 'DateRangePicker',
  components: { EvoconVDatePicker },
  props: {
    modelValue: { type: Array, default: () => [] },
    hideHeader: { type: Boolean },
    pickerDateMonth: {
      type: String,
      default: () => format(new Date(), 'yyyy-MM'),
    },
  },
  emits: ['update:model-value', 'change'],
};
</script>
<style lang="scss">
.evocon-date-range-picker {
  line-height: 14px;
  .v-date-picker-controls {
    padding-inline-end: 6px !important;
  }
  &.hide-header .v-date-picker-controls {
    display: none;
  }
  .v-date-picker-month__days {
    flex: 0 2 !important;

    .v-date-picker-month__day--selected {
      &:before {
        content: '';
        height: 32px;
        width: 100%;
        background-color: var(--color-12-primary) !important;
      }

      .v-btn {
        background-color: var(--color-12-primary) !important;
        width: 100%;
        border-radius: 0;
        .v-btn__content {
          color: #000 !important;
        }
        padding-left: 2px;
        padding-right: 2px;
      }
      &.range-start, &.range-end {
        .v-btn {
          background-color: rgb(var(--v-theme-primary)) !important;
          border-radius: 50%;
          width: 32px;
          .v-btn__content {
            color: #fff !important;
          }
        }
      }
      &.range-start {
        &:before {
          position: absolute;
          content: "";
          width: 19px;
          right: 0;
          height: 32px;
          background-color: var(--color-12-primary);
        }
      }
      &.range-end {
        &:before {
          position: absolute;
          content: "";
          width: 19px;
          left: 0;
          height: 32px;
          background-color: var(--color-12-primary);
        }
      }
    }
  }
}
</style>
