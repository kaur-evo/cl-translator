<template>
  <v-col class="pa-0">
    <v-row class="info-target-description justify-center align-center">
      <div class="text-center">
        <div class="text-headline-small font-weight-medium">
          {{ $t('Target and baseline') }}
        </div>
        <div class="text-body-medium text-medium-emphasis">
          {{ $t('Define how data should be tracked') }}
        </div>
      </div>
    </v-row>
    <v-row>
      <v-col
        class="pr-2 pb-2"
        cols="12"
        md="6"
      >
        <selection-input
          :model-value="[formData.targetType]"
          :items="targetMetrics"
          :placeholder="$t('Target data')"
          :hint="$t('Target data')"
          :disabled="isDisabled"
          item-value="type"
          is-single-select
          hide-search
          required
          @update:model-value="onTargetTypeChange($event[0])"
        />
      </v-col>
      <v-col
        class="pr-2 pb-2"
        cols="12"
        md="6"
      >
        <selection-input
          :model-value="[formData.periodType]"
          :items="periods"
          :placeholder="$t('Period')"
          :hint="$t('Period')"
          :disabled="isDisabled"
          item-value="type"
          is-single-select
          hide-search
          required
          @update:model-value="onPeriodTypeChange($event[0])"
        />
      </v-col>
      <v-col
        class="pr-3"
        cols="12"
        md="6"
      >
        <evocon-date-input
          v-model="baselinePeriod"
          :max="getMaxBaselineDate"
          :format-fn="formatDateRange"
          :rules="[() => baselinePeriod.length === 2 || $t('Baseline period')]"
          :hint="$t('Baseline period')"
          range
          :disabled="isDisabled"
          required
          @change="$emit('get-comment-stats', { dateRange: $event });"
        />
      </v-col>
      <v-col
        class="pl-2"
        cols="12"
        md="6"
      >
        <v-row class="fill-height align-center">
          <div class="mb-6">
            <div
              v-if="formData.targetType === REDUCE_BY_NUMBER"
              class="text-body-small text-medium-emphasis mb-1"
            >
              {{ $t('Baseline average') }}
            </div>
            <div
              v-else
              class="text-body-small text-medium-emphasis mb-1"
            >
              {{ getBaselineLabel() }}
            </div>
            <div class="text-body-large text-high-emphasis">
              {{ getPeriodAverage }}
            </div>
          </div>
        </v-row>
      </v-col>
      <v-col
        class="pr-2 pb-2"
        cols="12"
      >
        <multi-line-switch
          :model-value="formData.excludeNoDataDays"
          :disabled="excludeDaysSwitchDisabled"
          :main-text="$t('Exclude days with no stops from data')"
          :help-text="$t('Enable when tracked event is infrequent (e.g. once a week).')"
          class="my-2"
          @update:model-value="onExcludeNoDataDaysChange($event)"
        />
      </v-col>
      <v-col
        class="pr-2"
        cols="12"
        md="6"
      >
        <evocon-v-input
          v-if="formData.targetType === REDUCE_TO_TIME"
          key="targetTime"
          v-model="targetTime"
          v-maska="mask"
          :hint="$t('Set target (hours:minutes:seconds)')"
          :disabled="isDisabled"
          :rules="[isTargetTimeValid]"
          :append-icon="mdiTimerOutline"
          required
        />
        <evocon-number-input
          v-else
          key="stopFrequencyTarget"
          v-model="stopFrequencyTarget"
          :hint="$t('Set target')"
          :rules="[(v) => !isNaN(parseFloat(v)) || $t('Input must be a number')]"
          :disabled="isDisabled"
          required
        />
      </v-col>
      <v-col
        class="pl-2"
        cols="12"
        md="6"
      >
        <v-row class="fill-height align-center">
          <div class="mb-6">
            <div
              v-if="formData.targetType === REDUCE_BY_NUMBER"
              class="text-body-small text-medium-emphasis mb-1"
            >
              {{ $t('Target') }}
            </div>
            <div
              v-else
              class="text-body-small text-medium-emphasis mb-1"
            >
              {{ $t('Target') }}
            </div>
            <div class="text-body-large text-high-emphasis">
              {{ getPeriodAverage }}
              <v-icon size="small" color="grey-darken-1">
                {{ mdiTrendingNeutral }}
              </v-icon>
              {{ getTarget }}
            </div>
          </div>
        </v-row>
      </v-col>
    </v-row>
  </v-col>
</template>
<script>
import { mdiCalendarRange, mdiTimerOutline, mdiTrendingNeutral } from '@mdi/js';
import { vMaska } from 'maska/vue';
import { subDays, format } from 'date-fns';

import {
  REDUCE_BY_PCT,
  REDUCE_TO_TIME,
  REDUCE_BY_NUMBER,
  PER_DAY,
  PER_STOP,
} from '@/constants/improvementsDataTrackingTypes';
import formatSecondsFriendly from '@/helpers/time/formatSecondsFriendly';
import formatSecondsShort from '@/helpers/time/formatSecondsShort';
import MultiLineSwitch from '@/components/atoms/MultiLineSwitch/index.vue';
import { formatNumber } from '@/helpers/numbers/formatNumber';
import { formatDate } from '@/helpers/date/formatDate';
import EvoconNumberInput from '@/components/atoms/EvoconNumberInput/index.vue';
import EvoconDateInput from '@/components/molecules/EvoconDateInput/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';

const vectorIcons = { mdiCalendarRange, mdiTimerOutline, mdiTrendingNeutral };
const dataTrackingTypes = { REDUCE_TO_TIME, REDUCE_BY_NUMBER };

export default {
  name: 'ImprovementTargetSection',
  directives: { maska: vMaska },
  components: {
    MultiLineSwitch,
    EvoconNumberInput,
    EvoconDateInput,
    SelectionInput,
    EvoconVInput,
  },
  props: {
    project: {
      type: Object,
      default: () => {},
    },
    formData: {
      type: Object,
      default: () => {},
    },
    stopDuration: {
      type: Object,
      default: () => {},
    },
    isDisabled: {
      type: Boolean,
    },
  },
  emits: ['form-data-changed', 'get-comment-stats'],
  data() {
    return {
      ...vectorIcons,
      ...dataTrackingTypes,
      baselinePeriod: [],
      targetTime: undefined,
      stopFrequencyTarget: 0,
      targetMetrics: [
        { name: 'Average duration', type: REDUCE_TO_TIME },
        { name: 'Stop frequency', type: REDUCE_BY_NUMBER },
      ],
      periods: [
        { name: 'Per day', type: PER_DAY },
        { name: 'Per stop', type: PER_STOP },
      ],
      projectDataMeasuredByTime: true,
      mask: { mask: 'H#:M#:M#', tokens: { '#': { pattern: /\d/ }, H: { pattern: /[0-3]/ }, M: { pattern: /[0-5]/ } } },
    };
  },
  computed: {
    getPeriodAverage() {
      if (this.stopDuration && this.formData.targetType === REDUCE_TO_TIME) {
        return formatSecondsFriendly(this.stopDuration.periodAverage);
      }
      if (this.stopDuration && this.stopDuration.periodAverage) {
        return this.formatNumber(this.stopDuration.periodAverage);
      }
      return 0;
    },
    getTarget() {
      if (this.formData.targetType === REDUCE_TO_TIME) {
        this.getTargetTime();
        return formatSecondsFriendly(this.formData.targetValue, true);
      }
      return this.formatNumber(this.stopFrequencyTarget, { decimalPlaces: null });
    },
    excludeDaysSwitchDisabled() {
      return (this.formData.targetType !== REDUCE_BY_NUMBER && this.formData.periodType === PER_STOP) || this.isDisabled;
    },
    isTargetTimeValid() {
      if (this.stopDuration) {
        this.getTargetTime();
        const targetTimeRegex = /\d\d:\d\d:\d\d/g;
        return (targetTimeRegex.test(this.targetTime) && this.stopDuration.periodAverage > this.formData.targetValue) || this.$t('Set target to achieve (hours:minutes:seconds)');
      }
      return true;
    },
    getMaxBaselineDate() {
      return format(subDays(new Date(`${this.project.startDate}T00:00:00`), 1), 'yyyy-MM-dd');
    },
  },
  watch: {
    targetTime(val) {
      if (val) {
        this.getTargetTime();
      }
    },
    stopFrequencyTarget(val) {
      if (val) {
        this.$emit('form-data-changed', { targetValue: Number(val) });
      }
    },
    excludeDaysSwitchDisabled(val) {
      if (val) {
        this.$emit('form-data-changed', { excludeNoDataDays: false });
      }
    },
    baselinePeriod(val) {
      if (val.length === 2) {
        const dates = [...val].sort();
        const [start, end] = dates;
        this.$emit('form-data-changed', { baselineStartDate: start });
        this.$emit('form-data-changed', { baselineEndDate: end });
      }
    },
  },
  mounted() {
    this.baselinePeriod = [this.formData.baselineStartDate, this.formData.baselineEndDate];
    this.projectDataMeasuredByTime = this.formData.targetType === REDUCE_TO_TIME || this.formData.targetType === REDUCE_BY_PCT;
    this.targetTime = this.formData.targetValue && this.projectDataMeasuredByTime ? formatSecondsShort(this.formData.targetValue) : '00:00:00';
    this.stopFrequencyTarget = this.formData.targetValue && this.formData.targetType === REDUCE_BY_NUMBER ? this.formData.targetValue : 0;
  },
  methods: {
    getTargetTime() {
      if (this.targetTime) {
        const [hours, minutes, seconds] = this.targetTime.split(':');
        const totalSeconds = (Number(hours || 0) * 60 * 60) + (Number(minutes || 0) * 60) + (Number(seconds || 0));
        if (this.formData.targetValue !== totalSeconds) this.$emit('form-data-changed', { targetValue: totalSeconds });
      }
    },
    getBaselineLabel() {
      let label = this.$t('Baseline average');
      if (this.formData.periodType === PER_DAY) label += ` (${this.$t('Per day').toLowerCase()})`;
      else label += ` (${this.$t('Per stop').toLowerCase()})`;
      return label;
    },
    formatDateRange(list) {
      const ordered = [...list].sort();
      const formatted = ordered.map((val) => formatDate(val, 'long'));
      return formatted.join(' - ');
    },
    onTargetTypeChange(val) {
      this.$emit('form-data-changed', { targetType: val });
      this.$emit('get-comment-stats');
    },
    onPeriodTypeChange(val) {
      this.$emit('form-data-changed', { periodType: val });
      this.$emit('get-comment-stats');
    },
    onExcludeNoDataDaysChange(val) {
      this.$emit('form-data-changed', { excludeNoDataDays: val });
      this.$emit('get-comment-stats');
    },
    formatNumber(number, options = {}) {
      return formatNumber(number, options);
    },
  },
};
</script>
<style lang="less" scoped>
.info-target-description {
  height: 96px;
}
</style>
