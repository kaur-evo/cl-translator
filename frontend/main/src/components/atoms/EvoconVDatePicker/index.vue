<template>
  <v-date-picker
    v-bind="$attrs"
    ref="date-picker"
    :key="`${month}-${year}-${key}`"
    :model-value="value"
    hide-header
    color="primary"
    scrollable
    :month="month"
    :first-day-of-week="firstDayOfWeek"
    :year="year"
    class="evocon-v-date-picker"
    :allowed-dates="($event) => getAllowedDates($event, viewMode)"
    :class="{ 'v-picker--small': small }"
    :max="max"
    control-variant="modal"
    @update:model-value="onUpdateModelValue"
    @update:month="onMonthUpdate"
    @update:year="onYearUpdate"
    @update:view-mode="onViewModeUpdate"
  >
    <template
      v-for="slot in Object.keys($slots)"
      #[slot]="scope"
      :key="slot"
    >
      <slot v-bind="scope" :key="slot" :name="slot" />
    </template>
  </v-date-picker>
</template>
<script>
import { format, startOfWeek, addDays, startOfMonth, differenceInCalendarDays,
  isValid, parseISO } from 'date-fns';
import { nextTick } from 'vue';
import { mapState } from 'pinia';

import parseDateStr from '@/helpers/date/parseDateStr';
import useProfileStore from '@/stores/profile';
import { formatWeekday } from '@/helpers/date/formatLocaleDate';

export default {
  name: 'EvoconVDatePicker',
  props: {
    modelValue: {
      type: [String, Array],
      default: null,
    },
    small: {
      type: Boolean,
    },
    range: {
      type: Boolean,
    },
    pickerDate: {
      type: String,
      default: null,
    },
    double: {
      type: Boolean,
    },
    getAllowedDates: {
      type: Function,
      default: () => () => true,
    },
    max: {
      type: String,
      default: null,
    },
  },
  emits: ['update:modelValue', 'update:pickerDate'],
  data() {
    return {
      viewMode: 'month',
      month: null,
      year: null,
      key: '',
      notSupportedLanguages: ['sq'],
    };
  },
  computed: {
    ...mapState(useProfileStore, ['firstDayOfWeek', 'language']),
    rangeSet() {
      if (this.range) {
        if (this.modelValue.length === 2) {
          return this.getDatesListFromRange(parseDateStr(this.modelValue[0]), parseDateStr(this.modelValue[1]));
        }
        if (this.modelValue.length === 1) {
          return this.getDatesListFromRange(parseDateStr(this.modelValue[0]), parseDateStr(this.modelValue[0]));
        }
        return new Set();
      }
      return new Set();
    },
    value() {
      if (this.range) {
        if (this.modelValue.length) {
          return Array.from(this.rangeSet);
        }
        return [];
      }
      return this.modelValue ? parseDateStr(this.modelValue) : null;
    },
    maxDate() {
      if (this.max && isValid(parseISO(this.max))) return parseISO(this.max);
      return null;
    },
  },
  watch: {
    async pickerDate() {
      this.month = Number(this.pickerDate.substring(5, 7)) - 1;
      this.year = Number(this.pickerDate.substring(0, 4));
      await nextTick();
      this.addRangeSelectionClasses();
      this.replaceWeekDays();
    },
    async modelValue(modelValue, prevModelValue) {
      await nextTick();
      this.removeRangeSelectionClasses(prevModelValue);
      this.addRangeSelectionClasses();
      this.replaceWeekDays();
    },
  },
  async mounted() {
    this.key = new Date().valueOf();
    if (this.pickerDate) {
      this.month = Number(this.pickerDate.substring(5, 7)) - 1;
      this.year = Number(this.pickerDate.substring(0, 4));
    } else if (this.modelValue && !Array.isArray(this.modelValue)) {
      this.month = Number(this.modelValue.substring(5, 7)) - 1;
      this.year = Number(this.modelValue.substring(0, 4));
    } else if (this.modelValue?.length) {
      const lastValue = this.modelValue[this.modelValue.length - 1];
      this.month = Number(lastValue.substring(5, 7)) - 1;
      this.year = Number(lastValue.substring(0, 4));
    } else {
      this.month = new Date().getMonth();
      this.year = new Date().getFullYear();
    }
    await nextTick();
    this.addRangeSelectionClasses();
    this.replaceWeekDays();
  },
  methods: {
    async addRangeSelectionClasses() {
      if (!this.range) return;
      this.modelValue.forEach((date, index) => {
        let dt = date;
        if (this.maxDate && parseDateStr(dt) > this.maxDate) {
          dt = format(this.maxDate, 'yyyy-MM-dd');
        }
        const element = this.$refs['date-picker']?.$el?.querySelector?.(`[data-v-date="${dt}"]`);
        if (element) {
          if (index === 0) {
            element.classList.add('range-start');
          } else if (index === 1) {
            element.classList.add('range-end');
          }
        }
      });
    },
    removeRangeSelectionClasses(prevModelValue) {
      if (!this.range) return;
      prevModelValue.forEach((date) => {
        const element = this.$refs['date-picker']?.$el?.querySelector?.(`[data-v-date="${date}"]`);
        if (element) {
          element.classList.remove('range-start');
          element.classList.remove('range-end');
        }
      });
    },
    onUpdateModelValue(value) {
      if (this.range) {
        let val = value;
        if (this.maxDate !== null && val > this.maxDate) {
          val = this.maxDate;
        }
        if (this.modelValue.length === 1) {
          this.$emit('update:modelValue', [this.modelValue[0], format(val, 'yyyy-MM-dd')].sort());
        } else {
          this.$emit('update:modelValue', [format(val, 'yyyy-MM-dd')]);
        }
      } else {
        this.$emit('update:modelValue', format(value, 'yyyy-MM-dd'));
      }
    },
    getDatesListFromRange(d1, d2) {
      let date2 = d2;
      if (this.maxDate && d2 > this.maxDate) {
        date2 = this.maxDate;
      }
      const diffInDays = differenceInCalendarDays(date2, d1);
      const res = [];
      for (let i = 0; i <= diffInDays; i += 1) {
        res.push(addDays(d1, i));
      }
      return res;
    },
    // following is implemented to fix Vuetify bug, remove when fixed in Vuetify
    async onMonthUpdate(month) {
      // generating new key to avoid unwanted vuetify side effects
      if (this.double) this.key = new Date().valueOf();
      else {
        if (this.month === month) return;
        this.month = month;
        if (this.pickerDate) {
          this.$emit('update:pickerDate', format(parseDateStr(`${this.pickerDate}-01`).setMonth(month), 'yyyy-MM'));
        }
      }
    },
    onYearUpdate(year) {
      // generating new key to avoid unwanted vuetify side effects
      if (this.double) this.key = new Date().valueOf();
      else {
        const currentVisibleYear = this.year;
        this.year = year;
        if (this.viewMode === 'month') {
          if (year < currentVisibleYear) { // moved to past year with arrows, month update not triggered
            this.month = 11;
            this.$emit('update:pickerDate', `${year}-12`);
          } else { // moved to next year with arrows, but month update wasn't triggered
            this.month = 0;
            this.$emit('update:pickerDate', `${year}-01`);
          }
        } else {
          this.$emit('update:pickerDate', format(parseDateStr(`${this.pickerDate}-01`).setFullYear(year), 'yyyy-MM'));
        }
      }
    },
    onViewModeUpdate(viewMode) {
      setTimeout(() => {
        this.viewMode = viewMode;
        this.replaceMonths();
      }, 200);
    },
    replaceWeekDays() {
      if (this.notSupportedLanguages.includes(this.language)) {
        const weekdays = this.$refs['date-picker']?.$el?.querySelectorAll?.('.v-date-picker-month__weekday') || [];
        weekdays.forEach((weekday, i) => {
          const date = addDays(startOfWeek(new Date(), { weekStartsOn: this.firstDayOfWeek }), i);
          const newString = formatWeekday(date, this.language, 'narrow');
          // eslint-disable-next-line no-param-reassign
          weekday.innerHTML = newString;
        });
        const monthBtn = this.$refs['date-picker']?.$el?.querySelector?.('.v-date-picker-controls__month-btn');
        if (monthBtn) {
          const monthBtnContent = monthBtn?.querySelector('.v-btn__content');
          const date = startOfMonth(new Date());
          date.setMonth(this.month);
          const monthReplacement = this.$t(date.toLocaleString(this.language, { month: 'long' }));
          monthBtnContent.innerHTML = `${monthReplacement} ${this.year}`;
        }
      }
    },
    replaceMonths() {
      if (this.notSupportedLanguages.includes(this.language) && this.viewMode === 'months') {
        const content = this.$refs['date-picker']?.$el?.querySelector?.('.v-date-picker-months__content');
        const monthButtons = content?.querySelectorAll('.v-btn') || [];
        monthButtons.forEach((monthBtn, i) => {
          const date = startOfMonth(new Date());
          date.setMonth(i);
          const newString = this.$t(date.toLocaleString(this.language, { month: 'long' }));
          const monthBtnContent = monthBtn?.querySelector('.v-btn__content');
          if (monthBtnContent) {
            monthBtnContent.innerHTML = newString;
          }
        });
      }
    },
  },
};
</script>
