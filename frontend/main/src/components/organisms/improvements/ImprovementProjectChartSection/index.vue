<template>
  <v-row v-if="isTrackingDataAdded">
    <v-col>
      <v-card class="ma-3 pa-4">
        <div class="d-flex">
          <div class="mr-2 text-headline-medium font-weight-medium text-high-emphasis">
            {{ project.commentIds.length > 1 ? `${project.commentIds.length} ${$t('Stop reasons')}:` : `${getSelectedCommentsNames()}:` }}
          </div>
          <span
            v-if="projectDataMeasuredByTime && project.periodType === PER_DAY"
            class="text-headline-medium font-weight-medium text-high-emphasis"
          >
            {{ $t('Duration by day') }}
          </span>
          <span
            v-else-if="projectDataMeasuredByTime"
            class="text-headline-medium font-weight-medium text-high-emphasis"
          >
            {{ $t('Duration by stop') }}
          </span>
          <span
            v-else
            class="text-headline-medium font-weight-medium text-high-emphasis"
          >
            {{ $t('Count by day') }}
          </span>
          <v-tooltip
            v-if="project.commentIds.length > 1"
            content-class="pa-4"
            location="top"
          >
            <template #activator="{ props }">
              <v-icon
                class="ml-2 align-self-center"
                v-bind="props"
                color="grey-darken-1"
              >
                {{ mdiInformation }}
              </v-icon>
            </template>
            <div>
              <div class="pb-1 font-weight-regular text-uppercase text-label-small">
                {{ $t('Stop reasons') }}: {{ project.commentIds.length }}
              </div>
              <div class="text-body-small">
                {{ getSelectedCommentsNames() }}
              </div>
            </div>
          </v-tooltip>
          <evocon-v-button
            class="justify-end ml-auto"
            icon-color="grey-darken-1"
            color="quaternary-dark"
            :icon="mdiPencil"
            :text="$t('Edit')"
            @click="manageTrackingData"
          />
        </div>
        <div class="d-flex mt-2">
          <div class="text-label-small mr-4">
            <span class="project-section-info">{{ $t('Baseline') }}</span>
            <span class="text-body-small font-weight-medium">
              {{ `${formatDate(project.baselineStartDate)} - ${formatDate(project.baselineEndDate)}` }}
            </span>
          </div>
          <div class="text-label-small">
            <span class="project-section-info">{{ $t('Improvement') }}</span>
            <span class="text-body-small font-weight-medium">
              {{ `${formatDate(project.startDate)} - ${formatDate(project.endDate)}` }}
            </span>
          </div>
        </div>
        <improvements-bar-chart
          v-if="stats.currentData.length"
          :project="project"
          :stats="stats"
          :actions="actions"
          :solutions="solutions"
        />
        <empty-view
          v-else
          id="improvements-chart-empty-view"
          :header="$t('There is no data to display')"
          :description="$t('Check back later and use the chart to evaluate the impact of your actions.')"
          :img-url="'detective'"
        />
        <div
          v-if="stats.currentData.length"
          class="mx-3 mt-6 text-end"
        >
          <span
            v-for="value in legendValues"
            :key="value.name"
          >
            <v-icon
              :color="colors[value.iconColor]"
              :size="value.iconWidth || 32"
              :class="value.additionalClass"
            >
              {{ value.icon }}
            </v-icon>
            <span
              v-if="value.name"
              class="text-body-small text-medium-emphasis font-weight-regular"
            >
              {{ value.name }}
            </span>
          </span>
        </div>
      </v-card>
    </v-col>
  </v-row>
  <v-row v-else>
    <v-col>
      <v-card class="justify-between ma-3 pa-6">
        <div class="d-flex align-center">
          <v-icon color="warning">
            {{ mdiAlertCircle }}
          </v-icon>
          <span class="ml-4">{{ $t('Data tracking not active') }}</span>
          <evocon-v-button
            class="justify-end ml-auto"
            :icon="mdiPlus"
            :text="$t('Data')"
            color="grey-lighten-4"
            @click="manageTrackingData"
          />
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>
<script>
import { mapState } from 'pinia';
import {
  mdiPlus,
  mdiMinus,
  mdiPencil,
  mdiInformation,
  mdiAlertCircle,
  mdiSquareMedium,
  mdiCircle,
} from '@mdi/js';

import {
  useCommentStore,
  useImprovementsActionsStore,
  useImprovementsSolutionsStore,
} from '@/stores/index';
import { REDUCE_TO_TIME, REDUCE_BY_PCT, PER_DAY } from '@/constants/improvementsDataTrackingTypes';
import colorConstants from '@/constants/colorConstants';
import { formatDate } from '@/helpers/date/formatDate';
import formatTooltipByLimit from '@/helpers/formatTooltipByLimit';
import ImprovementsBarChart from '@/components/organisms/improvements/ImprovementsBarChart/index.vue';
import EmptyView from '@/components/atoms/EmptyView/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import graphColors from '@/constants/graphColors';

const vectorIcons = {
  mdiPlus,
  mdiPencil,
  mdiInformation,
  mdiAlertCircle,
};
const dataTrackingTypes = { PER_DAY };

export default {
  name: 'ImprovementProjectChartSection',
  components: {
    ImprovementsBarChart,
    EmptyView,
    EvoconVButton,
  },
  props: {
    project: {
      type: Object,
      default: () => {},
    },
    isTrackingDataAdded: {
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
      ...dataTrackingTypes,
      projectDataMeasuredByTime: true,
      legendValues: [
        {
          name: this.$t('Baseline average'),
          icon: mdiMinus,
          iconColor: 'primary-dark',
        },
        {
          name: this.$t('Target'),
          icon: mdiMinus,
          iconColor: 'secondary-dark',
        },
        {
          name: this.$t('Baseline'),
          icon: mdiSquareMedium,
          iconColor: 'primary-dark',
        },
        {
          name: this.$t('Over target'),
          icon: mdiSquareMedium,
          iconColor: graphColors['improvement-above-target'],
        },
        {
          name: this.$t('Within target'),
          icon: mdiSquareMedium,
          iconColor: graphColors['improvement-below-target'],
        },
        {
          icon: mdiCircle,
          iconColor: 'primary-dark',
          iconWidth: '14px',
          additionalClass: 'mx-2',
        },
        {
          name: this.$t('No stops'),
          icon: mdiCircle,
          iconColor: graphColors['improvement-below-target'],
          iconWidth: '14px',
          additionalClass: 'mr-2',
        },
      ],
    };
  },
  computed: {
    ...mapState(useCommentStore, ['commentsMap']),
    ...mapState(useImprovementsActionsStore, ['actions']),
    ...mapState(useImprovementsSolutionsStore, ['solutions']),
    colors() {
      return colorConstants[this.$vuetify.theme.name];
    },
  },
  mounted() {
    this.projectDataMeasuredByTime = this.project.targetType === REDUCE_TO_TIME || this.project.targetType === REDUCE_BY_PCT;
  },
  methods: {
    formatDate(date) {
      return formatDate(date, 'long');
    },
    manageTrackingData() {
      this.$router.push({ name: 'improvementTrackingData', params: { id: this.project.id } });
    },
    getSelectedCommentsNames() {
      const names = this.project.commentIds.map((commentId) => this.commentsMap[commentId] && this.commentsMap[commentId].name);
      return formatTooltipByLimit(names);
    },
  },
};
</script>
<style lang="less" scoped>
.project-section-info {
  color: rgb(var(--v-theme-secondary-dark));
  margin-right: 4px;
}
</style>
