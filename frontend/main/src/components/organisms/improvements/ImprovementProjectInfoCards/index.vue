<template>
  <v-row>
    <v-col class="pa-1 pl-3">
      <v-card class="pa-4 fill-height d-flex flex-column justify-space-between">
        <div class="text-label-small text-uppercase font-weight-medium text-medium-emphasis mb-2 d-flex">
          {{ `${$t('Baseline')} ${getBaselineOrCurrentLabel()}` }}
          <v-tooltip
            content-class="pa-4"
            location="top"
          >
            <template #activator="{ props }">
              <div v-bind="props">
                <v-icon
                  class="ml-2"
                  size="small"
                  color="grey-darken-1"
                >
                  {{ mdiInformation }}
                </v-icon>
              </div>
            </template>
            <span>{{ `${$t('Average')}: ${formatDate(project.baselineStartDate)} - ${formatDate(project.baselineEndDate)}` }}</span>
          </v-tooltip>
        </div>
        <div class="text-headline-medium font-weight-medium text-high-emphasis mb-2">
          {{ projectDataMeasuredByTime ? formatSecondsFriendly(stats.initialDailyAverage) : formatNumber(stats.initialDailyAverage) }}
        </div>
      </v-card>
    </v-col>
    <v-col class="pa-1">
      <v-card class="pa-4 fill-height d-flex flex-column justify-space-between">
        <div class="text-label-small text-uppercase font-weight-medium text-medium-emphasis mb-2 d-flex">
          {{ `${$t('Target')} ${getBaselineOrCurrentLabel()}` }}
        </div>
        <div class="text-headline-medium font-weight-medium text-high-emphasis mb-2">
          {{ projectDataMeasuredByTime ? formatSecondsFriendly(stats.targetDailyAverage) : formatNumber(stats.targetDailyAverage) }}
        </div>
      </v-card>
    </v-col>
    <v-col class="pa-1">
      <v-card class="pa-4 fill-height d-flex flex-column justify-space-between">
        <div class="text-label-small text-uppercase font-weight-medium text-medium-emphasis mb-2 d-flex">
          {{ `${$t('Current')} ${getBaselineOrCurrentLabel()}` }}
          <v-tooltip
            content-class="pa-4"
            location="top"
          >
            <template #activator="{ props }">
              <div v-bind="props">
                <v-icon
                  class="ml-2"
                  size="small"
                  color="grey-darken-1"
                >
                  {{ mdiInformation }}
                </v-icon>
              </div>
            </template>
            <span>{{ `${$t('Average')}: ${formatDate(project.startDate)} - ${tooltipEndTime}` }}</span>
          </v-tooltip>
        </div>
        <div class="text-headline-medium font-weight-medium text-high-emphasis mb-2">
          {{ projectDataMeasuredByTime ? formatSecondsFriendly(stats.currentDailyAverage) : formatNumber(stats.currentDailyAverage) }}
        </div>
      </v-card>
    </v-col>
    <v-col class="pa-1">
      <v-card class="pa-4 fill-height d-flex flex-column justify-space-between">
        <div class="text-label-small text-uppercase font-weight-medium text-medium-emphasis mb-2">
          {{ $t('rolling7days') }}
        </div>
        <div class="text-headline-medium font-weight-medium text-high-emphasis mb-2">
          {{ projectDataMeasuredByTime ? formatSecondsFriendly(stats.last7DaysPeriodAverage) : formatNumber(stats.last7DaysPeriodAverage) }}
        </div>
      </v-card>
    </v-col>
    <v-col
      v-if="projectDataMeasuredByTime"
      class="pa-1"
    >
      <v-card class="pa-4 fill-height d-flex flex-column justify-space-between">
        <div class="text-label-small text-uppercase font-weight-medium text-medium-emphasis d-flex mb-2">
          {{ $t('Total time saved') }}
          <v-tooltip
            content-class="pa-4"
            location="top"
          >
            <template #activator="{ props }">
              <div v-bind="props">
                <v-icon
                  class="ml-2"
                  size="small"
                  color="grey-darken-1"
                >
                  {{ mdiInformation }}
                </v-icon>
              </div>
            </template>
            <span>{{ totalSavedTooltip }}</span>
          </v-tooltip>
        </div>
        <div class="text-headline-medium font-weight-medium text-high-emphasis mb-2">
          {{ formatSecondsFriendly(stats.totalTimeSaved) }}
        </div>
      </v-card>
    </v-col>
    <v-col
      v-else
      class="pa-1"
    >
      <v-card class="pa-4 fill-height d-flex flex-column justify-space-between">
        <div class="text-label-small text-uppercase font-weight-medium text-medium-emphasis d-flex mb-2">
          {{ $t('Total stops saved') }}
          <v-tooltip
            content-class="pa-4"
            location="top"
          >
            <template #activator="{ props }">
              <div v-bind="props">
                <v-icon
                  class="ml-2"
                  size="small"
                  color="grey-darken-1"
                >
                  {{ mdiInformation }}
                </v-icon>
              </div>
            </template>
            <span>{{ totalSavedTooltip }}</span>
          </v-tooltip>
        </div>
        <div class="text-headline-medium font-weight-medium text-high-emphasis mb-2">
          {{ formatNumber(stats.totalTimeSaved) }}
        </div>
      </v-card>
    </v-col>
    <v-col class="pa-1 pr-3">
      <v-card class="pa-4 fill-height d-flex flex-column justify-space-between">
        <div class="text-label-small text-uppercase font-weight-medium text-medium-emphasis mb-2">
          {{ $t('Total money saved') }}
        </div>
        <div class="text-headline-medium font-weight-medium text-high-emphasis d-flex align-start mb-2">
          {{ getCurrency() }}{{ getTotalSavedMoney() }}
          <evocon-v-button
            v-if="canEdit"
            class="mt-n1 ml-2"
            :icon="mdiPencil"
            @click="editMonetaryValue"
          />
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>
<script>
import { mapActions } from 'pinia';
import { mdiInformation, mdiPencil } from '@mdi/js';
import { defineAsyncComponent } from 'vue';

import { useGenericDialogStore, useImprovementsProjectStore } from '@/stores/index';
import { formatDate } from '@/helpers/date/formatDate';
import formatSecondsFriendly from '@/helpers/time/formatSecondsFriendly';
import { REDUCE_TO_TIME, REDUCE_BY_PCT, PER_DAY } from '@/constants/improvementsDataTrackingTypes';
import improvementsMonetaryValueApi from '@/api/improvementsMonetaryValueApi';
import { formatNumber } from '@/helpers/numbers/formatNumber';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import parseDateStr from '@/helpers/date/parseDateStr';

const vectorIcons = { mdiInformation, mdiPencil };

export default {
  name: 'ImprovementProjectInfoCards',
  components: { EvoconVButton },
  props: {
    project: {
      type: Object,
      default: () => {},
    },
    canEdit: {
      type: Boolean,
    },
    stats: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      ...vectorIcons,
      projectDataMeasuredByTime: true,
    };
  },
  computed: {
    tooltipEndTime() {
      const endDate = parseDateStr(this.project.endDate);
      if (endDate <= new Date()) {
        return this.formatDate(this.project.endDate);
      }
      return formatDate(new Date(), 'long');
    },
    totalSavedTooltip() {
      const startDate = this.formatDate(this.project.startDate);
      if (this.projectDataMeasuredByTime) {
        return `${this.$t('Total time saved')}: ${startDate} - ${this.tooltipEndTime}`;
      }
      return `${this.$t('Total stops saved')}: ${startDate} - ${this.tooltipEndTime}`;
    },
  },
  mounted() {
    this.projectDataMeasuredByTime = this.project.targetType === REDUCE_TO_TIME || this.project.targetType === REDUCE_BY_PCT;
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['openDialog']),
    ...mapActions(useImprovementsProjectStore, ['fetchProject']),
    formatDate(date) {
      return formatDate(date, 'long');
    },
    formatSecondsFriendly,
    getBaselineOrCurrentLabel() {
      if (this.project.periodType === PER_DAY) {
        return this.$t('Per day');
      }
      return this.$t('Per stop');
    },
    editMonetaryValue() {
      this.openDialog({
        title: this.projectDataMeasuredByTime ? this.$t('Hourly running cost') : this.$t('Cost of one stop'),
        component: defineAsyncComponent(() => import('../ImprovementMonetaryValueEdit/index.vue')),
        allowFullscreen: false,
        width: 404,
        data: {
          project: this.project,
          saveCB: ({ formData }) => this.saveMonetaryValue(formData),
        },
      });
    },
    async saveMonetaryValue(formData) {
      await improvementsMonetaryValueApi.setMonetaryValue(this.project.id, formData);
      await this.fetchProject({ projectId: this.project.id });
    },
    getTotalSavedMoney() {
      if (this.project.ratePerHour) {
        const timeSaved = this.projectDataMeasuredByTime ? this.stats.totalTimeSaved / 3600 : this.stats.totalTimeSaved;
        return this.formatNumber(timeSaved * this.project.ratePerHour);
      }
      return 'N/A';
    },
    getCurrency() {
      if (this.project.ratePerHour) {
        if (this.project.currency === 'eur') return '€';
        if (this.project.currency === 'usd') return '$';
        return '£';
      }
      return '';
    },
    formatNumber(number) {
      return formatNumber(number);
    },
  },
};
</script>
