<template>
  <div class="py-2">
    <multi-line-switch
      :model-value="comparisonEnabled"
      :main-text="$t('Compare with preceding period')"
      :dark="false"
      :density="isMobileView ? 'compact' : 'default'"
      @update:model-value="onToggleComparison"
    >
      <template #enabled-input>
        <v-radio-group :model-value="modelValue" class="ml-6" @update:model-value="$emit('update:model-value', $event)">
          <evocon-v-radio
            v-for="comparison in comparisonOptions"
            :key="comparison.value"
            class="mt-2"
            :value="comparison.value"
            :label="comparison.label"
            :sub-label="comparison.secondaryLabel"
          />
        </v-radio-group>
      </template>
    </multi-line-switch>
  </div>
</template>
<script>
import { mapState } from 'pinia';
import { format, differenceInDays, subDays } from 'date-fns';

import MultiLineSwitch from '@/components/atoms/MultiLineSwitch/index.vue';
import EvoconVRadio from '@/components/atoms/EvoconVRadio/index.vue';
import timePeriodType from '@/constants/predefinedTimePeriodNames';
import { getPrecedingPeriod, getCurrentPeriod } from '@/constants/rollingPeriodRangeDefinitions';
import widgetType from '@/constants/dashboardWidgetTypes';
import comparisonType, { isComparisonTypeAllowed } from '@/constants/dashboardComparisonType';
import { formatDate } from '@/helpers/date/formatDate';
import parseDateStr from '@/helpers/date/parseDateStr';
import { formatWeekday, formatMonth } from '@/helpers/date/formatLocaleDate';
import { useProfileStore, useDeviceStore } from '@/stores/index';

export default {
  name: 'DashboardComparisonSelection',
  components: {
    MultiLineSwitch,
    EvoconVRadio,
  },
  props: {
    modelValue: {
      type: String,
      default: comparisonType.NO_COMPARISON,
    },
    periodName: {
      type: String,
      default: timePeriodType.THIS_WEEK,
    },
    dateRange: {
      type: Array,
      default: () => [],
    },
    widgetType: {
      type: String,
      default: widgetType.OEE_CHART,
    },
    isEdit: {
      type: Boolean,
    },
  },
  emits: ['update:model-value'],
  computed: {
    ...mapState(useProfileStore, ['dateFormat', 'firstDayOfWeek']),
    ...mapState(useDeviceStore, ['isMobileView']),
    comparisonEnabled() {
      return this.modelValue !== comparisonType.NO_COMPARISON;
    },
    comparisonOptions() {
      const comparisonOptions = [
        {
          value: comparisonType.COMPARISON_WITH_PREVIOUS,
          label: this.$t('Matching period'),
          secondaryLabel: this.getPeriodLabel(comparisonType.COMPARISON_WITH_PREVIOUS),
        },
        {
          value: comparisonType.COMPARISON_WITH_PREVIOUS_FULL,
          label: this.$t('Whole period'),
          secondaryLabel: this.getPeriodLabel(comparisonType.COMPARISON_WITH_PREVIOUS_FULL),
        },
      ];
      return comparisonOptions.filter((option) => isComparisonTypeAllowed(this.periodName, this.widgetType, option.value));
    },
    firstAvailableType() {
      if (this.comparisonOptions.length) return this.comparisonOptions[0].value;
      return comparisonType.NO_COMPARISON;
    },
  },
  watch: {
    comparisonOptions(val) {
      const selectionNotInOptions = !val.find((option) => option.value === this.modelValue);
      if (selectionNotInOptions) this.$emit('update:model-value', this.firstAvailableType);
    },
  },
  mounted() {
    if (!this.isEdit) {
      this.$emit('update:model-value', this.firstAvailableType);
    }
  },
  methods: {
    onToggleComparison() {
      if (this.comparisonEnabled) {
        this.$emit('update:model-value', comparisonType.NO_COMPARISON);
      } else {
        this.$emit('update:model-value', this.firstAvailableType);
      }
    },
    getPeriodLabel(_comparisonType) {
      if (timePeriodType.ROLLING_7_SHIFTS === this.periodName) {
        return this.$t('Preceding 7 shifts');
      }
      return this.formatPeriodRange(this.getComparisonPeriodRange(_comparisonType, this.periodName), this.periodName);
    },
    formatDay(date, dateFormat) {
      return `${formatWeekday(date, this.$i18n.locale, 'short')}, ${formatDate(date, this.dateFormat[dateFormat])}`;
    },
    formatMonth(date) {
      return formatMonth(date, this.$i18n.locale, 'long', true);
    },
    formatPeriodRange(range, periodName) {
      if ([timePeriodType.TODAY, timePeriodType.YESTERDAY].includes(periodName)) {
        if (!range.length) return '';
        return this.formatDay(parseDateStr(range[0]), 'short');
      }

      if (periodName === timePeriodType.CUSTOM) {
        if (range.length === 2 && range[0] === range[1]) {
          return this.formatDay(parseDateStr(range[0]), 'long');
        }
        return range.map((date) => this.formatDay(parseDateStr(date), 'long')).join(' - ');
      }

      if ([
        timePeriodType.THIS_WEEK, timePeriodType.LAST_WEEK,
        timePeriodType.THIS_MONTH, timePeriodType.LAST_MONTH,
        timePeriodType.ROLLING_7_DAYS, timePeriodType.ROLLING_30_DAYS,
      ].includes(periodName)) {
        return range.map((date) => this.formatDay(parseDateStr(date), 'short')).join(' - ');
      }
      if ([timePeriodType.ROLLING_12_MONTHS, timePeriodType.THIS_YEAR, timePeriodType.LAST_YEAR].includes(periodName)) {
        return range.map((date) => this.formatMonth(parseDateStr(date))).join(' - ');
      }
      return range.map((date) => format(parseDateStr(date), 'dd.MM.yyyy')).join(' - ');
    },
    getCustomPrecedingRange() {
      const [startStr, endStr] = this.dateRange;
      const start = parseDateStr(startStr);
      const end = parseDateStr(endStr);
      const diffDays = differenceInDays(end, start);
      const precedingStart = subDays(start, diffDays + 1);
      const precedingEnd = subDays(end, diffDays + 1);
      return [format(precedingStart, 'yyyy-MM-dd'), format(precedingEnd, 'yyyy-MM-dd')];
    },
    getComparisonPeriodRange(_comparisonType, periodName) {
      const addDaysIgnoringDST = (d, days) => new Date(d.valueOf() + (days * 24 * 60 * 60 * 1000));
      let precedingRange = [];
      let currentRange = [];
      if (periodName === timePeriodType.CUSTOM && this.dateRange.length) {
        precedingRange = this.getCustomPrecedingRange();
        currentRange = this.dateRange;
      } else {
        precedingRange = getPrecedingPeriod(periodName, { weekStartsOn: this.firstDayOfWeek });
        currentRange = getCurrentPeriod(periodName, { weekStartsOn: this.firstDayOfWeek });
      }
      if (precedingRange !== null) {
        if (_comparisonType === comparisonType.COMPARISON_WITH_PREVIOUS_FULL) {
          return precedingRange;
        }
        if (_comparisonType === comparisonType.COMPARISON_WITH_PREVIOUS) {
          const diffDays = Math.abs(differenceInDays(parseDateStr(currentRange[0]), new Date()));
          const precedingDiffDays = Math.abs(differenceInDays(
            parseDateStr(precedingRange[0]),
            parseDateStr(precedingRange[1]),
          ));
          if (diffDays > precedingDiffDays) return precedingRange;
          return [precedingRange[0], format(addDaysIgnoringDST(parseDateStr(precedingRange[0]), diffDays), 'yyyy-MM-dd')];
        }
      }
      return [];
    },
  },
};
</script>
