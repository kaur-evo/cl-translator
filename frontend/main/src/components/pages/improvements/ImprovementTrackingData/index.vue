<template>
  <div
    v-if="$route.name === 'improvementTrackingData'"
    class="py-10 fill-height bg-quaternary-dark"
  >
    <v-container class="fill-height d-flex flex-wrap justify-center">
      <v-card class="improvement-card-container">
        <div class="pa-6 pt-0">
          <improvement-tracking-section
            v-if="dataLoaded"
            :form-data="formData"
            :stop-duration="stopDuration"
            @form-data-changed="formDataChanged"
            @get-comment-stats="getCommentStats"
          />
          <improvement-target-section
            v-if="dataLoaded"
            :project="project"
            :form-data="formData"
            :stop-duration="stopDuration"
            :is-disabled="formData.commentIds?.length === 0"
            @form-data-changed="formDataChanged"
            @get-comment-stats="getCommentStats"
          />
          <v-card-actions class="pa-0 justify-end">
            <evocon-v-button
              :text="$t('Cancel')"
              variant="text"
              @click="goBack"
            />
            <evocon-v-button
              class="bg-primary"
              :text="$t('Save')"
              :disabled="formData.commentIds?.length === 0"
              @click="onSaveClick"
            />
          </v-card-actions>
        </div>
      </v-card>
    </v-container>
  </div>
  <router-view v-else />
</template>
<script>
import { mapActions } from 'pinia';
import { format, subDays, subMonths } from 'date-fns';

import { useGenericNotificationStore, useImprovementsProjectStore } from '@/stores/index';
import { NO_TRACKING_DATA, STOP_REASON } from '@/constants/improvementsEventTypes';
import { REDUCE_TO_TIME, PER_DAY } from '@/constants/improvementsDataTrackingTypes';
import improvementsProjectApi from '@/api/improvementsProjectApi';
import improvementsStatsApi from '@/api/improvementsStatsApi';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import ImprovementTrackingSection from '@/components/organisms/improvements/ImprovementTrackingSection/index.vue';
import ImprovementTargetSection from '@/components/organisms/improvements/ImprovementTargetSection/index.vue';

export default {
  name: 'ImprovementTrackingData',
  components: {
    EvoconVButton,
    ImprovementTrackingSection,
    ImprovementTargetSection,
  },
  async beforeRouteEnter(to, from, next) {
    const project = await improvementsProjectApi.getProject(to.params.id);
    // eslint-disable-next-line no-param-reassign
    to.meta.project = project;
    // eslint-disable-next-line no-param-reassign
    to.meta.formData = { ...project };
    next();
  },
  data() {
    return {
      dataLoaded: false,
      stopDuration: null,
      project: undefined,
      formData: {},
    };
  },
  mounted() {
    this.dataLoaded = false;
    this.project = this.$route.meta.project;
    this.formData = this.$route.meta.formData;
    if (!Object.keys(this.formData.commentIds).length) {
      this.formData.targetType = REDUCE_TO_TIME;
      this.formData.periodType = PER_DAY;
      this.formData.includeNewProducts = true;
    }
    this.dataLoaded = true;
  },
  methods: {
    ...mapActions(useGenericNotificationStore, ['openNotification']),
    ...mapActions(useImprovementsProjectStore, ['fetchProject']),
    goBack() {
      this.$router.push({ name: 'improvementProject', params: { id: this.project.id } });
    },
    async onSaveClick() {
      if (this.formData.eventType === NO_TRACKING_DATA && this.formData.commentIds.length) {
        this.formData.eventType = STOP_REASON;
      }
      await improvementsProjectApi.saveProject(this.formData);
      const response = await improvementsProjectApi.saveProject(this.formData);
      this.openNotification({
        text: response.message || this.$t('{value} saved', { value: this.formData.name }),
        type: response.message ? 'error' : 'success',
      });
      await this.fetchProject({ projectId: this.project.id });
      await this.goBack();
    },
    formDataChanged(changedData) {
      this.formData = { ...this.formData, ...changedData };
    },
    async getCommentStats({ dateRange } = {}) {
      let start;
      let end;
      if (dateRange && dateRange.length === 2) {
        [start, end] = dateRange;
      }

      if (this.formData.commentIds.length) {
        const defaultStart = format(subMonths(new Date(this.formData.startDate), 3), 'yyyy-MM-dd');
        const defaultEnd = format(subDays(new Date(this.formData.startDate), 1), 'yyyy-MM-dd');
        const requestBody = {
          filter: {
            excludeNoDataDays: this.formData.excludeNoDataDays || false,
            positionIds: this.formData.positionIds,
            productId: this.formData.productIds,
            stationId: this.formData.stationIds,
            commentIds: this.formData.commentIds,
            end: end || this.formData.baselineEndDate || defaultEnd,
            start: start || this.formData.baselineStartDate || defaultStart,
            targetType: this.formData.targetType,
            periodType: this.formData.periodType,
            productsAllSelected: this.formData.productsAllSelected,
          },
        };
        this.stopDuration = await improvementsStatsApi.getCommentStats(requestBody);
      }
    },
  },
};
</script>
<style lang="less" scoped>
.improvement-card-container {
  width: 732px;
  .improvement-information {
    height: 96px;
  }
}
</style>
