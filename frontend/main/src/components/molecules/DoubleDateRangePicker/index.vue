<template>
  <div class="mx-auto date-picker-sheet">
    <period-selection-list
      v-if="showPeriodSelection"
      :items="periods"
      :model-value="selectionType"
      :date-range="internalDateRange"
      class="pa-4"
      @change="onPeriodSelectionChange"
    />
    <v-row class="flex-nowrap">
      <v-col class="pb-2 px-2">
        <v-row class="justify-space-between mb-n8">
          <evocon-v-button
            :icon="mdiChevronLeft"
            :disabled="isNavigateLeftDisabled"
            @click="onNavigateLeft"
          />
          <div>
            <evocon-v-button
              :icon="mdiChevronRight"
              :disabled="isNavigateRightDisabled"
              @click="onNavigateRight"
            />
            <evocon-v-button
              v-if="max && !navigateToEndDisabled"
              class="ml-1"
              :icon="mdiPageLast"
              :disabled="isNavigateRightDisabled"
              @click="goToLastPage"
            />
          </div>
        </v-row>
        <v-row class="flex-nowrap">
          <v-col class="text-center">
            <v-row class="mb-4">
              <v-col class="text-center text-body-medium">
                {{ leftPickerLabel }}
              </v-col>
            </v-row>
            <date-range-picker
              :model-value="internalDateRange"
              :picker-date-month="formattedLeftPickerDate"
              :max="max"
              :min="min"
              double
              hide-header
              @update:model-value="onDateRangeChange"
            />
          </v-col>
          <v-col
            v-if="!isMobileView"
            class="text-center"
          >
            <v-row class="mb-4">
              <v-col class="text-center text-body-medium">
                {{ rightPickerLabel }}
              </v-col>
            </v-row>
            <date-range-picker
              :model-value="internalDateRange"
              :picker-date-month="formattedRightPickerDate"
              :max="max"
              :min="min"
              double
              hide-header
              @update:model-value="onDateRangeChange"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>
<script>
import { isEqual } from 'lodash';
import { mdiChevronLeft, mdiChevronRight, mdiPageLast } from '@mdi/js';
import { mapState } from 'pinia';
import {
  addMonths, startOfMonth, subMonths, isSameMonth, format, isValid, parseISO,
} from 'date-fns';

import { useProfileStore, useDeviceStore } from '@/stores/index';
import { firstUpper } from '@/helpers/string-formatting';
import DateRangePicker from '@/components/molecules/DateRangePicker/index.vue';
import PeriodSelectionList from '@/components/molecules/PeriodSelectionList/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import getDefaults from '@/components/molecules/PeriodSelectionList/defaults';
import { formatMonth } from '@/helpers/date/formatLocaleDate';

const icons = { mdiChevronLeft, mdiChevronRight, mdiPageLast };

export default {
  name: 'DoubleDateRangePicker',
  components: {
    DateRangePicker,
    PeriodSelectionList,
    EvoconVButton,
  },
  props: {
    periodsList: { type: Array, default: () => [] },
    modelValue: { type: Array, default: () => [] },
    selectionType: { type: String, default: 'thisweek' },
    max: { type: String, default: null },
    min: { type: String, default: null },
    showPeriodSelection: { type: Boolean, default: true },
    navigateToEndDisabled: { type: Boolean, default: false },
  },
  emits: ['change', 'change-selection-type'],
  data() {
    return {
      ...icons,
      internalDateRange: this.modelValue,
      pickerDate: new Date(),
    };
  },
  computed: {
    ...mapState(useProfileStore, ['firstDayOfWeek', 'language']),
    ...mapState(useDeviceStore, ['isMobileView']),
    leftPickerDate() {
      return startOfMonth(this.pickerDate);
    },
    formattedLeftPickerDate() {
      return format(this.leftPickerDate, 'yyyy-MM');
    },
    rightPickerDate() {
      return addMonths(this.leftPickerDate, 1);
    },
    formattedRightPickerDate() {
      return format(this.rightPickerDate, 'yyyy-MM');
    },
    leftPickerLabel() {
      return firstUpper(formatMonth(this.leftPickerDate, this.language, 'long', true));
    },
    rightPickerLabel() {
      return firstUpper(formatMonth(this.rightPickerDate, this.language, 'long', true));
    },
    periods() {
      if (this.periodsList?.length) return this.periodsList;
      return getDefaults(this.firstDayOfWeek);
    },
    maxDate() {
      if (this.max && isValid(parseISO(this.max))) return parseISO(this.max);
      return null;
    },
    minDate() {
      if (this.min && isValid(parseISO(this.min))) return parseISO(this.min);
      return null;
    },
    isNavigateRightDisabled() {
      return this.maxDate && (isSameMonth(this.leftPickerDate, this.maxDate) || isSameMonth(this.rightPickerDate, this.maxDate));
    },
    isNavigateLeftDisabled() {
      return this.minDate && (isSameMonth(this.leftPickerDate, this.minDate) || isSameMonth(this.rightPickerDate, this.minDate));
    },
  },
  watch: {
    modelValue(val) {
      this.internalDateRange = val;
      if (val.length) {
        this.pickerDate = startOfMonth(new Date(this.internalDateRange[0]));
      }
    },
    internalDateRange(newVal, prevVal) {
      if (newVal.length === 2 && !isEqual(newVal, prevVal)) {
        this.$emit('change', { dateRange: newVal.sort() });
      }
    },
  },
  methods: {
    onNavigateLeft() {
      this.pickerDate = startOfMonth(subMonths(this.pickerDate, 1));
    },
    onNavigateRight() {
      this.pickerDate = startOfMonth(addMonths(this.pickerDate, 1));
    },
    onPeriodSelectionChange({ dateRange, value }) {
      if (value === 'all') {
        this.$emit('change', { dateRange });
        this.$emit('change-selection-type', value);
      } else {
        this.internalDateRange = dateRange;
        if (dateRange.length === 2 && !isEqual(value, this.selectionType)) {
          this.$emit('change-selection-type', value);
        }
      }
    },
    onDateRangeChange(val) {
      this.onPeriodSelectionChange({ dateRange: val, value: 'custom' });
    },
    goToLastPage() {
      this.pickerDate = startOfMonth(subMonths(new Date(this.maxDate), 1));
    },
  },
};
</script>

<style scoped>
.date-picker-sheet {
  width: 100%;
  max-width: 600px;
}
</style>
