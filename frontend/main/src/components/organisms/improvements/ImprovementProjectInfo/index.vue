<template>
  <v-expansion-panels class="py-2">
    <v-expansion-panel elevation="0">
      <template #title>
        <v-row>
          <v-col
            v-if="project.description"
            cols="8"
          >
            <div class="text-body-small text-medium-emphasis mb-1">
              {{ $t('Problem statement') }}
            </div>
            <div class="font-weight-medium">
              {{ project.description }}
            </div>
          </v-col>
          <v-col>
            <div class="text-body-small text-medium-emphasis mb-1">
              {{ $t('Team') }}
            </div>
            <div>
              {{ getTeam() }}
            </div>
          </v-col>
        </v-row>
        <v-row v-if="project.finalSummary">
          <v-col
            class="py-2"
            :class="project.finalSummary && !project.finished ? 'inactive-summary' : ''"
            cols="8"
          >
            <div class="text-body-small text-medium-emphasis">
              {{ $t('Improvement summary') }}
            </div>
            <div class="font-weight-medium">
              {{ project.finalSummary }}
            </div>
          </v-col>
          <v-col
            class="py-2"
            :class="project.endDate && !project.finished ? 'inactive-summary' : ''"
            cols="4"
          >
            <div class="text-body-small text-medium-emphasis">
              {{ $t('Done') }}
            </div>
            <div class="font-weight-medium">
              {{ formatDate(project.endDate, 'long') }}
            </div>
          </v-col>
        </v-row>
      </template>
      <template #text>
        <v-divider />
        <v-row>
          <v-col
            class="py-2"
            cols="3"
          >
            <div class="text-body-small text-medium-emphasis my-1">
              {{ $t('Stations') }}
            </div>
            <div
              v-if="stations.length === project.stationIds.length"
              class="text-body-large text-high-emphasis font-weight-regular my-1"
            >
              {{ $t('All') }}
            </div>
            <div
              v-for="station in selectedStations"
              v-else
              :key="`station-${station.id}`"
              class="text-body-large text-high-emphasis font-weight-regular my-1"
            >
              {{ station.name }}
            </div>
          </v-col>
          <v-col
            class="py-2"
            cols="6"
          >
            <div class="text-body-small text-medium-emphasis my-1">
              {{ $t('Stop reason') }}
            </div>
            <v-row
              v-for="(comments, groupId) in selectedComments"
              :key="`commentGroup${groupId}`"
              class="mb-2"
            >
              <v-col
                class="font-weight-medium pr-1"
                cols="4"
              >
                {{ getStopGroupName(groupId) }}
                <v-icon color="grey-darken-1">
                  {{ mdiArrowRight }}
                </v-icon>
              </v-col>
              <v-col cols="8">
                {{ getStopsNames(comments) }}
              </v-col>
            </v-row>
          </v-col>
          <v-col
            class="py-2"
            cols="3"
          >
            <div class="text-body-small text-medium-emphasis my-1">
              {{ $t('Products') }}
            </div>
            <div
              v-if="project.productIds.length === 0 || project.productIds.length === filteredProducts.length"
              class="text-body-large text-high-emphasis font-weight-regular my-1"
            >
              {{ $t('All') }}
            </div>
            <div
              v-for="productId in project.productIds"
              v-else
              :key="`product-${productId}`"
              class="text-body-large text-high-emphasis font-weight-regular my-1"
            >
              {{ productsMap[productId] ? productsMap[productId].name : '' }}
            </div>
          </v-col>
        </v-row>
      </template>
    </v-expansion-panel>
  </v-expansion-panels>
</template>
<script>
import { mapState, mapActions } from 'pinia';
import { mdiMenuDown, mdiMenuUp, mdiArrowRight } from '@mdi/js';

import {
  useStationStore,
  useProductStore,
  useCommentStore,
} from '@/stores/index';
import { formatDate } from '@/helpers/date/formatDate';
import groupByFilterRule from '@/helpers/improvementsGroupByFilterRule';

const vectorIcons = { mdiMenuDown, mdiMenuUp, mdiArrowRight };

export default {
  name: 'ImprovementProjectInfo',
  props: {
    project: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      ...vectorIcons,
    };
  },
  computed: {
    ...mapState(useStationStore, ['stations']),
    ...mapState(useProductStore, ['products', 'productsMap']),
    ...mapState(useCommentStore, ['allComments', 'commentsMap', 'commentGroupsMap']),
    selectedStations() {
      return this.stations.filter((station) => this.project.stationIds.includes(station.id));
    },
    selectedComments() {
      return groupByFilterRule({
        list: this.allComments,
        groupBy: 'groupId',
        filterRule: (val) => (this.project.commentIds.includes(val.id)),
      });
    },
    filteredProducts() {
      return this.products.filter((product) => product.stationIds.some((id) => this.project.stationIds.includes(id)));
    },
  },
  async mounted() {
    await this.fetchProducts({ stationId: this.project.stationIds });
  },
  methods: {
    ...mapActions(useProductStore, ['fetchProducts']),
    formatDate,
    getTeam() {
      return this.project.users.map((user) => user.fullName).sort().join(', ');
    },
    getStopGroupName(groupId) {
      if (!this.commentGroupsMap[groupId]) return '-';
      return this.commentGroupsMap[groupId].name;
    },
    getStopsNames(selectedStops) {
      const names = selectedStops.map((stop) => this.commentsMap[stop.id] && this.commentsMap[stop.id].name);
      return names.join(', ');
    },
  },
};
</script>
<style lang="scss" scoped>
.inactive-summary {
  opacity: 0.5;
}
</style>
