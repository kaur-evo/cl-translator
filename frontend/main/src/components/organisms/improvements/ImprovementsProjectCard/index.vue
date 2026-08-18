<template>
  <v-hover v-slot="hover">
    <v-card
      v-if="project"
      v-bind="hover?.props"
      :min-width="320"
      :elevation="hover?.isHovering ? 3 : 2"
      class="pa-4 project-card"
      @click="selectProject()"
    >
      <div class="d-flex">
        <div>
          <v-icon
            v-if="isFinished"
            id="finished-icon"
            class="mt-2 mr-2"
            color="grey-darken-1"
          >
            {{ mdiCheckCircle }}
          </v-icon>
          <v-icon
            v-else-if="isOverdue"
            id="overdue-icon"
            class="mt-2 mr-2"
            color="secondary"
          >
            {{ mdiAlertOutline }}
          </v-icon>
        </div>
        <div class="text-no-wrap overflow-hidden text-overflow-ellipsis">
          <div
            id="project-name"
            class="text-headline-small text-no-wrap overflow-hidden text-overflow-ellipsis"
            :style="{ opacity: project.finished ? 0.54 : '' }"
          >
            {{ project.name }}
          </div>
          <div
            id="project-users"
            class="mb-4 text-body-medium"
            :style="{ opacity: project.finished ? 0.54 : '' }"
          >
            {{ getUsers() }}
          </div>
        </div>
        <div class="ml-auto">
          <v-tooltip location="top">
            <template #activator="{ props }">
              <v-icon color="grey-darken-1" v-bind="props">
                {{ mdiInformationOutline }}
              </v-icon>
            </template>
            <evocon-v-tooltip
              :type="getIconType"
              :title="project.name"
              :icon-color="getIconColor"
              :rows="tooltipRows"
            />
          </v-tooltip>
        </div>
      </div>
      <v-row>
        <v-col
          cols="12"
          class="mb-4"
        >
          <div
            v-if="project.change === 'loading'"
            class="pa-4 d-flex justify-center data-section"
          >
            <v-progress-circular
              id="loading-circle"
              class="d-flex justify-center"
              indeterminate
              color="grey-lighten-1"
              size="50"
            />
          </div>
          <div
            v-else-if="project.eventType === NO_TRACKING_DATA"
            class="py-6 data-section d-flex justify-center"
          >
            <img
              id="mr-evocon-img"
              src="../../../../assets/images/improvements-card-no-data.svg"
              alt=""
            >
          </div>
          <div
            v-else
            class="pa-4"
            :class="getSectionClass"
          >
            <div
              class="mb-1 text-label-small font-weight-regular text-secondary-text"
            >
              {{ $t('Change') }}
            </div>
            <div class="d-flex align-center">
              <span
                id="change-value"
                class="font-weight-medium"
              >
                {{ getChangeValue() }}
              </span>
              <v-icon
                class="ml-2"
                :color="project.change > 0 ? 'primary' : 'lw-red'"
              >
                {{ project.change > 0 ? mdiTrendingDown : mdiTrendingUp }}
              </v-icon>
            </div>
          </div>
        </v-col>
      </v-row>
      <v-row v-if="project.eventType !== NO_TRACKING_DATA">
        <v-col
          cols="6"
          class="py-4 px-2"
        >
          <div class="text-body-small text-secondary-text">
            {{ $t('Baseline average') }}
          </div>
          <v-progress-linear
            v-if="project.initialDailyAverage === 'loading'"
            id="baseline-avg-loading-state"
            class="mt-2"
            indeterminate
            color="grey-lighten-1"
          />
          <div
            v-else
            id="baseline-average-value"
            class="text-body-medium"
          >
            {{ getBaselineOrCurrentAverage(project.initialDailyAverage) }}
          </div>
        </v-col>
        <v-col
          cols="6"
          class="py-4 px-2"
        >
          <div class="text-body-small text-secondary-text">
            {{ $t('Current average') }}
          </div>
          <v-progress-linear
            v-if="project.currentAverage === 'loading'"
            id="current-avg-loading-state"
            class="mt-2"
            indeterminate
            color="grey-lighten-1"
          />
          <div
            v-else
            id="current-average-value"
            class="text-body-medium"
          >
            {{ getBaselineOrCurrentAverage(project.currentAverage) }}
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="6"
          class="pa-2"
        >
          <div class="text-body-small text-secondary-text">
            {{ $t('Actions') }}
          </div>
          <div
            id="actions-value"
            class="text-body-medium"
          >
            {{ getActionsCount() }}
          </div>
          <v-progress-linear
            :model-value="progressBarValue"
            :color="getProgressBarColor"
            class="mt-1"
            rounded
          />
        </v-col>
        <v-col
          cols="6"
          class="pa-2"
        >
          <div
            id="date-val-header"
            class="text-body-small text-secondary-text"
          >
            {{ dateValueHeader }}
          </div>
          <div
            id="date-value"
            class="text-body-medium"
          >
            {{ dateValue }}
          </div>
          <div
            id="project-time-additional-info"
            :class="getInfoTextColor"
          >
            {{ getTimeAdditionalInfo }}
          </div>
        </v-col>
      </v-row>
    </v-card>
  </v-hover>
</template>
<script>
import { mapState } from 'pinia';
import {
  mdiCheckCircle, mdiAlertOutline, mdiInformationOutline, mdiTrendingUp, mdiTrendingDown,
} from '@mdi/js';
import {
  differenceInCalendarDays, isAfter, startOfDay,
} from 'date-fns';

import { useCommentStore, useStationStore } from '@/stores/index';
import { REDUCE_BY_PCT, REDUCE_TO_TIME } from '@/constants/improvementsDataTrackingTypes';
import { NO_TRACKING_DATA } from '@/constants/improvementsEventTypes';
import formatTooltipByLimit from '@/helpers/formatTooltipByLimit';
import formatSecondsFriendly from '@/helpers/time/formatSecondsFriendly';
import EvoconVTooltip from '@/components/atoms/EvoconVTooltip/index.vue';
import { formatNumber, formatPercentage } from '@/helpers/numbers/formatNumber';

const icons = {
  mdiCheckCircle, mdiAlertOutline, mdiInformationOutline, mdiTrendingUp, mdiTrendingDown,
};
const dataTypes = { NO_TRACKING_DATA };

export default {
  name: 'ImprovementsProjectCard',
  components: {
    EvoconVTooltip,
  },
  props: {
    /** THESE COMMENTS ARE FOR STORYBOOK DOC BLOCK
      * 1) change: Positive value => green; Negative value => red percentage values;
      * 2) eventType - "NO_TRACKING_DATA" => Mr Evocon pic; Empty ==> Change value;
      * 3) targetType - "REDUCE_STOP_REASON_BY_PCT" => shows baseline and current values in "x min y s" format;
      Empty ==> shows baseline and current values in x/day format;
      * 4) currentAverage - "Now" column;
      * initialDailyAverage - "Baseline" column;
      * startDate - project start date;
      * endDate - project end date;
      */
    project: { type: Object, default: () => {} },
    actions: { type: Array, default: () => [] },
    team: { type: Array, default: () => [] },
    isFinished: { type: Boolean, default: false },
    isOverdue: { type: Boolean, default: false },
    dateValueHeader: { type: String, default: '' },
    dateValue: { type: String, default: '' },
  },
  data() {
    return {
      ...icons,
      ...dataTypes,
    };
  },
  computed: {
    ...mapState(useCommentStore, ['commentsMap']),
    ...mapState(useStationStore, ['stationsMap']),
    progressBarValue() {
      const completedActionsLength = this.actions.filter((action) => action.completed).length;
      const progressPct = (completedActionsLength / this.actions.length) * 100;
      if (progressPct >= 100) return 100;
      return progressPct;
    },
    getProgressBarColor() {
      if (this.isOverdue) return 'secondary';
      if (!this.isFinished) return 'primary';
      return 'secondary-dark';
    },
    tooltipRows() {
      const stationNames = this.project.stationIds ? this.project.stationIds.map((id) => (this.stationsMap[id] ? this.stationsMap[id].name : '')) : [];
      const commentNames = this.project.commentIds ? this.project.commentIds.map((id) => (this.commentsMap[id] ? this.commentsMap[id].name : '')) : [];
      return [
        { key: this.$t('Stations'), value: formatTooltipByLimit(stationNames, 10), allowTextWrap: true },
        { key: this.$t('Stop reasons'), value: formatTooltipByLimit(commentNames, 10), allowTextWrap: true },
      ];
    },
    getIconColor() {
      if (this.isOverdue) return 'secondary';
      if (this.isFinished || isAfter(new Date(this.project.startDate), startOfDay(new Date()))) return 'white';
      return 'primary';
    },
    getIconType() {
      if (this.isOverdue) return 'overdue';
      if (this.isFinished) return 'finished';
      if (isAfter(new Date(this.project.startDate), startOfDay(new Date()))) return 'upcoming';
      return 'ongoing';
    },
    getTimeAdditionalInfo() {
      if (isAfter(new Date(this.project.startDate), startOfDay(new Date()))) {
        return `Starts in ${differenceInCalendarDays(new Date(this.project.startDate), new Date())} days`;
      }
      const endDateDiff = Math.abs(differenceInCalendarDays(new Date(), new Date(this.project.endDate)));
      if (this.isOverdue) {
        return `${endDateDiff} days overdue`;
      }
      if (this.isFinished) {
        return `${endDateDiff} days ago`;
      }
      return `${endDateDiff} days left`;
    },
    getSectionClass() {
      if (this.project.finished) return ['data-section'];
      if (this.project.change > 0) return ['text-primary', 'bg-primary-tint'];
      return ['text-lw-red', 'bg-error-tint'];
    },
    getInfoTextColor() {
      if (this.isOverdue) return ['text-secondary'];
      if (this.isFinished) return ['secondary-dark'];
      if (isAfter(new Date(this.project.startDate), startOfDay(new Date()))) return ['primary-dark'];
      return ['text-primary'];
    },
  },
  methods: {
    getUsers() {
      const userFullNames = [];
      this.team.forEach((user) => {
        userFullNames.push(user.fullName);
      });
      if (userFullNames.length > 2) {
        return `${userFullNames.slice(0, 2).join(', ')} + ${userFullNames.length - 2} ${this.$t('more')}`;
      }
      return userFullNames.join(', ');
    },
    getChangeValue() {
      if (this.project.change === 'loading') return 'loading';
      const change = Math.abs(this.project.change * 100);
      return formatPercentage(change);
    },
    getBaselineOrCurrentAverage(value) {
      if (value === 'loading') return 'loading';
      if (this.project.targetType === REDUCE_BY_PCT || this.project.targetType === REDUCE_TO_TIME) {
        return formatSecondsFriendly(value);
      }
      return `${this.formatNumber(value)}/day`;
    },
    getActionsCount() {
      return `${this.actions.filter((action) => action.completed).length}/${this.actions.length}`;
    },
    selectProject() {
      this.$router.push({ name: 'improvementProject', params: { id: this.project.id, returnParams: this.$route.query } });
    },
    formatNumber(number) {
      return formatNumber(number);
    },
  },
};
</script>
<style lang="less" scoped>

.project-card {
  border-radius: 8px;
}
#project-users {
  line-height: 16px;
}
.data-section {
  background-color: rgb(var(--v-theme-quaternary-dark));
}
#change-value {
  font-size: 32px !important;
}
#project-time-additional-info {
  font-size: 10px !important;
  line-height: 16px !important;
}
#mr-evocon-img {
  height: 120px;
}
</style>
