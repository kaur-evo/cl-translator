<template>
  <form-page-template
    v-if="$route.name === 'qualityOverview'"
    :primary-segment-title="$t('quality')"
  >
    <template #primary-segment>
      <v-row class="text-body-small px-4">
        <v-col
          cols="2.4"
          class="quality-col py-3"
        >
          {{ $t('Stations') }}
        </v-col>
        <v-col
          cols="2.4"
          class="quality-col px-2 py-3"
        >
          {{ $t('Start date') }}
        </v-col>
        <v-col
          cols="2.4"
          class="quality-col px-2 py-3"
        >
          {{ $t('End date') }}
        </v-col>
        <v-col
          cols="2.4"
          class="quality-col px-2 py-3"
        >
          {{ $t('Entry date') }}
        </v-col>
        <v-col
          cols="2.4"
          class="text-right py-3"
        >
          {{ $t('quality') }}
        </v-col>
      </v-row>
      <v-list v-model:opened="openGroups">
        <v-list-group
          v-for="(stations, id) in groupedQualities"
          :key="`item-${id}`"
          :value="id"
          color="black"
          class="quality-row"
        >
          <template #activator="{ props }">
            <v-list-item v-bind="props">
              <v-row class="text-body-medium">
                <v-col
                  cols="2.4"
                  class="quality-field"
                >
                  {{ `${stations.values.length} ${$t('stations-case')}` }}
                </v-col>
                <v-col
                  cols="2.4"
                  class="quality-field"
                >
                  {{ formatDate(stations.startDate) }}
                </v-col>
                <v-col
                  cols="2.4"
                  class="quality-field"
                >
                  {{ formatDate(stations.endDate) }}
                </v-col>
                <v-col
                  cols="2.4"
                  class="quality-field"
                >
                  {{ formatDate(stations.entryDate) }}
                </v-col>
              </v-row>
            </v-list-item>
          </template>
          <v-list-item class="quality-group">
            <v-row
              v-for="(value, i) in stations.values"
              :key="`row${i}`"
              class="py-3 text-body-medium"
            >
              <v-col>
                {{ stationsMap[value.stationId].name }}
              </v-col>
              <v-col class="text-right">
                {{ formatPercentage(value.yield) }}
              </v-col>
            </v-row>
          </v-list-item>
        </v-list-group>
      </v-list>
    </template>
    <template #actions>
      <v-spacer />
      <evocon-v-button
        :icon="mdiPlus"
        :text="$t('quality')"
        color="primary"
        @click="onAddQuality"
      />
    </template>
  </form-page-template>
  <router-view v-else />
</template>

<script>
import { mdiPlus, mdiDomain, mdiMonitor } from '@mdi/js';
import { mapState, mapActions } from 'pinia';

import useStationStore from '@/stores/station';
import useYieldStore from '@/stores/yield';
import { formatDate } from '@/helpers/date/formatDate';
import { formatPercentage } from '@/helpers/numbers/formatNumber';
import FormPageTemplate from '@/components/templates/FormPageTemplate/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';

const icons = { mdiPlus, mdiDomain, mdiMonitor };
export default {
  name: 'QualityOverviewComponent',
  components: {
    FormPageTemplate,
    EvoconVButton,
  },
  data() {
    return {
      ...icons,
      openGroups: [],
    };
  },
  computed: {
    ...mapState(useStationStore, ['stationsMap']),
    ...mapState(useYieldStore, ['yields']),
    groupedQualities() {
      return this.groupQualitiesByDates(this.yields);
    },
  },
  async mounted() {
    await this.fetchYields();
  },
  methods: {
    ...mapActions(useYieldStore, ['fetchYields']),
    formatDate(date) {
      return formatDate(date, 'long');
    },
    groupQualitiesByDates(qualities) {
      const temp = {};

      qualities.forEach((d) => {
        if (!temp[[d.startDate, d.endDate]]) {
          temp[[d.startDate, d.endDate]] = {
            endDate: d.endDate,
            yield: d.yield,
            entryDate: d.createdDate,
            startDate: d.startDate,
            values: [d],
          };
        } else if (temp[[d.startDate, d.endDate]].values.indexOf(d.stationId) === -1) {
          temp[[d.startDate, d.endDate]].values.push(d);
        }
      });

      return Object.values(temp);
    },
    onAddQuality() {
      this.$router.push({ name: 'qualityEdit' });
    },
    formatPercentage(val) {
      return formatPercentage(val, { decimalPlaces: null });
    },
  },
};
</script>

<style lang="less" scoped>
.quality-row {
  border-top: 1px rgb(var(--v-theme-quaternary-dark)) solid;
}
.quality-col {
  border-right: 1px rgb(var(--v-theme-quaternary-dark)) solid;
}
.quality-field {
  max-width: calc((100% - 48px) / 4);
}
.quality-group {
  background: rgba(218, 218, 218, 0.2);
}
</style>
