<template>
  <range-chip-selection
    :is-open="isOpen"
    :prev-btn-tooltip-text="getPeriodLabel('previous')"
    :previous-disabled="previousDisabled"
    :next-btn-tooltip-text="getPeriodLabel('next')"
    :next-disabled="nextDisabled"
    :range-label="dateRangeLabel"
    :is-chip-active="isChipActive"
    :close-on-content-click="false"
    @click-previous="onPreviousClick"
    @click-next="onNextClick"
    @update:is-open="isOpen = $event"
  >
    <template #selection-list>
      <double-date-range-picker
        :periods-list="predefinedPeriods"
        :model-value="dateRange"
        :selection-type="selectionType"
        :max="currentDate"
        @change="onDateRangeChange"
        @change-selection-type="selectionType = $event"
      />
    </template>
    <template #actions>
      <v-spacer />
      <evocon-v-button
        type="secondary"
        :text="$t('Cancel')"
        size="small"
        class="mr-2"
        @click="cancelDateRangeSelection"
      />
      <evocon-v-button
        color="primary"
        :text="$t('Apply')"
        size="small"
        @click="onApplyDateRange"
      />
    </template>
  </range-chip-selection>
</template>
<script>
import { mdiChevronLeft, mdiChevronRight, mdiMenuDown } from '@mdi/js';
import { mapState, mapActions } from 'pinia';
import {
  format, isAfter, differenceInDays,
} from 'date-fns';
import { DateTime } from 'luxon';

import DoubleDateRangePicker from '@/components/molecules/DoubleDateRangePicker/index.vue';
import RangeChipSelection from '@/components/molecules/RangeChipSelection/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import timePeriodType from '@/constants/predefinedTimePeriodNames';
import { formatDate } from '@/helpers/date/formatDate';
import parseDateStr from '@/helpers/date/parseDateStr';
import useFilterbarStore, { resolvePiniaAction } from '@/stores/filterbar';


const icons = { mdiChevronLeft, mdiChevronRight, mdiMenuDown };

const specialSelectionType = { ALL: 'all', CUSTOM: 'custom' };

export default {
  name: 'DateRangeFilter',
  components: {
    DoubleDateRangePicker,
    RangeChipSelection,
    EvoconVButton,
  },
  props: {
    predefinedPeriods: { type: Array, default: () => [] },
    includeDateRangeParam: { type: Boolean },
    onApplyAction: { type: String, default: '' },
    updateDateRangeAction: { type: String, default: '' },
    selectPrevOrNextAction: { type: String, default: '' },
  },
  data() {
    return {
      ...icons,
      dateRange: [],
      selectionType: null,
      isOpen: false,
      selectionPeriodType: null,
      newDate: new Date(),
    };
  },
  computed: {
    ...mapState(useFilterbarStore, ['requestFilterState']),
    isChipActive() {
      return this.selectionType !== specialSelectionType.ALL;
    },
    currentDate() {
      return format(this.newDate, 'yyyy-MM-dd');
    },
    actualDateRange() {
      if (this.dateRange.length === 1) {
        return [this.dateRange[0], this.dateRange[0]];
      }
      return this.dateRange;
    },
    startAsDate() {
      if (this.actualDateRange[0] === undefined) return new Date();
      return parseDateStr(this.actualDateRange[0]);
    },
    endAsDate() {
      if (this.actualDateRange[1] === undefined) return new Date();
      return parseDateStr(this.actualDateRange[1]);
    },
    rangeDiffDays() {
      return Math.abs(differenceInDays(this.startAsDate, this.endAsDate));
    },
    dateRangeLabel() {
      if (!this.selectionType) return '';
      if (this.selectionType === specialSelectionType.CUSTOM) {
        return this.actualDateRange
          .map((d) => formatDate(d, 'long')).join(' - ');
      }
      if (this.selectionType === specialSelectionType.ALL) return this.$t('All');
      if (this.selectionType === timePeriodType.LAST_QUARTER) return this.$t('Last quarter');
      if (this.selectionType === timePeriodType.THIS_QUARTER) return this.$t('This quarter');
      if (this.selectionType === timePeriodType.LAST_4_QUARTERS) return this.$t('Last 4 quarters');
      if (this.selectionType === timePeriodType.ROLLING_12_MONTHS) return this.$t('Last 12 months');
      return this.$t(this.selectionType);
    },
    nextDisabled() {
      if (this.selectionType === specialSelectionType.ALL) return true;
      const firstDate = this.dateRange[0];
      const lastDate = this.dateRange[1];
      const today = DateTime.now().toISODate();
      if (today <= lastDate) return true;
      return firstDate > today;
    },
    previousDisabled() {
      return this.selectionType === specialSelectionType.ALL;
    },
    dateFilterState() {
      return this.requestFilterState.period;
    },
    moveStep() {
      const start = this.dateRange[0];
      const end = this.dateRange[this.dateRange.length - 1];
      try {
        return Math.floor(Object.values(DateTime.fromISO(end).diff(DateTime.fromISO(start), this.selectionPeriodType).toObject())[0]) + 1;
      } catch {
        return 1;
      }
    },
  },
  watch: {
    dateFilterState(val) {
      this.setByFilterVal(val);
    },
    async isOpen(val) {
      setTimeout(() => {
        if (!val) this.setByFilterVal(this.requestFilterState.period);
      }, 300);
    },
  },
  async created() {
    await this.setByFilterVal(this.requestFilterState?.period);
    this.selectionPeriodType = this.getSelectionPeriodType(this.selectionType, this.dateRange);
  },
  methods: {
    ...mapActions(useFilterbarStore, ['updateFilterValue', 'cancelFilterChange', 'triggerDataRequest']),
    async setByFilterVal(val) {
      if (typeof val === 'string') {
        this.selectionType = val;
      }
      if (Array.isArray(val)) {
        this.dateRange = val;
        await this.updateDateRange();
        this.selectionType = specialSelectionType.CUSTOM;
      }
    },
    async onNextClick() {
      this.selectionType = specialSelectionType.CUSTOM;
      this.dateRange = this.getNewDateRange(1);
      await this.updateDateRange();
      await this.updateFilterValue({ period: this.dateRange });
      if (this.includeDateRangeParam) {
        await this.updateFilterValue({ dateRange: this.dateRange });
      }
      if (this.selectPrevOrNextAction) resolvePiniaAction(this.selectPrevOrNextAction, { start: this.actualDateRange[0], end: this.actualDateRange[1] });
      else this.triggerDataRequest();
    },
    async onPreviousClick() {
      this.selectionType = specialSelectionType.CUSTOM;
      this.dateRange = this.getNewDateRange(-1);
      await this.updateDateRange();
      await this.updateFilterValue({ period: this.dateRange });
      if (this.includeDateRangeParam) {
        await this.updateFilterValue({ dateRange: this.dateRange });
      }
      if (this.selectPrevOrNextAction) resolvePiniaAction(this.selectPrevOrNextAction, { start: this.actualDateRange[0], end: this.actualDateRange[1] });
      else this.triggerDataRequest();
    },
    getNewDateRange(moveDirection) {
      const start = this.dateRange[0];
      const end = this.dateRange[this.dateRange.length - 1];

      const newStart = DateTime.fromISO(start).plus({ [this.selectionPeriodType]: moveDirection * this.moveStep }).startOf(this.selectionPeriodType);
      let newEnd = DateTime.fromISO(end).plus({ [this.selectionPeriodType]: moveDirection * this.moveStep }).endOf(this.selectionPeriodType);

      // if newEnd is after current date, set it to current date
      if (newEnd > DateTime.now()) newEnd = DateTime.now();

      return [newStart.toISODate(), newEnd.toISODate()];
    },
    async onDateRangeChange({ dateRange }) {
      if (dateRange.length === 1) {
        this.dateRange = [dateRange[0], dateRange[0]];
      } else if (isAfter(new Date(dateRange[1]), new Date(this.currentDate))) {
        this.dateRange = [dateRange[0], this.currentDate];
      } else {
        this.dateRange = dateRange;
      }
      this.selectionPeriodType = this.getSelectionPeriodType(this.selectionType, dateRange);
      await this.updateDateRange();
      const params = { period: this.selectionType === specialSelectionType.CUSTOM ? dateRange : this.selectionType };
      if (this.includeDateRangeParam) {
        params.dateRange = this.dateRange;
      }
      this.updateFilterValue(params);
    },
    getSelectionPeriodType(value, dateRange) {
      const predefinedTimeFrameTypes = ['year', 'quarter', 'month', 'week'];
      if ([timePeriodType.LAST_QUARTER, timePeriodType.THIS_QUARTER, timePeriodType.LAST_4_QUARTERS].includes(value)) return 'quarter';
      if ([timePeriodType.THIS_YEAR, timePeriodType.LAST_YEAR].includes(value)) return 'year';
      if ([timePeriodType.THIS_MONTH, timePeriodType.LAST_MONTH].includes(value)) return 'month';
      if ([timePeriodType.THIS_WEEK, timePeriodType.LAST_WEEK].includes(value)) return 'week';
      const rangeStart = DateTime.fromISO(dateRange[0]);
      const rangeEnd = DateTime.fromISO(dateRange[dateRange.length - 1]);
      const predefType = predefinedTimeFrameTypes.find((type) => {
        const start = rangeStart.startOf(type);
        const end = rangeStart.plus({ [type]: this.moveStep - 1 }).endOf(type);
        return (rangeStart.hasSame(start, 'day') && rangeEnd.hasSame(end, 'day'));
      });
      if (predefType) return predefType;
      return 'day';
    },
    async updateDateRange() {
      if (this.updateDateRangeAction) await resolvePiniaAction(this.updateDateRangeAction, this.dateRange);
    },
    async onApplyDateRange() {
      if (this.onApplyAction) {
        await resolvePiniaAction(this.onApplyAction, {
          start: this.actualDateRange[0],
          end: this.actualDateRange[1],
          selectionType: this.selectionType,
        });
      } else {
        await this.triggerDataRequest();
      }
      this.isOpen = false;// this must be last otherwise state gets cleared beforehand
    },
    cancelDateRangeSelection() {
      this.isOpen = false;
      this.cancelFilterChange();
    },
    // eslint-disable-next-line sonarjs/cognitive-complexity
    getPeriodLabel(period) {
      const isPrevious = period === 'previous';
      if (this.selectionPeriodType === 'year') {
        return isPrevious ? this.$t('Previous year') : this.$t('Next year');
      }
      if (this.selectionPeriodType === 'month') {
        return isPrevious ? this.$t('Previous month') : this.$t('Next month');
      }
      if (this.selectionPeriodType === 'quarter') {
        if (this.moveStep === 4) {
          return isPrevious ? this.$t('Previous 4 quarters') : this.$t('Next 4 quarters');
        }
        return isPrevious ? this.$t('Previous quarter') : this.$t('Next quarter');
      }
      if (this.selectionPeriodType === 'week') {
        return isPrevious ? this.$t('Previous week') : this.$t('Next week');
      }
      if (isPrevious) return `${this.$t('Previous {value} days', { value: this.rangeDiffDays + 1 })}`;
      return `${this.$t('Next {value} days', { value: this.rangeDiffDays + 1 })}`;
    },
  },
};
</script>
<style lang="scss">
.rotate180deg {
    transform: rotateX(180deg);
}

</style>
