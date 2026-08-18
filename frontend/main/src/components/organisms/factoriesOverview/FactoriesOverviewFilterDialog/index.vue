<template>
  <dialog-template :title="$t('Filters')" color="primary-dark">
    <template #content>
      <factory-overview-filter
        v-model:stat-prop="stat"
        v-model:interval-prop="interval"
        v-model:stations-prop="stations"
        v-model:unit-prop="unit"
        v-model:status-prop="statuses"
        no-save
      />
    </template>
    <template #actions>
      <v-spacer />
      <evocon-v-button
        id="cancel-button"
        :text="$t('Cancel')"
        type="secondary"
        @click="closeDialog"
      />
      <evocon-v-button
        id="save-button"
        color="primary"
        :text="$t('Save')"
        @click="onSave"
      />
    </template>
  </dialog-template>
</template>
<script>
import { mapActions, mapState } from 'pinia';

import DialogTemplate from '@/components/templates/DialogTemplate/index.vue';
import FactoryOverviewFilter from '@/components/organisms/factoriesOverview/FactoryOverviewFilter/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import { REALTIME } from '@/constants/routeNames';
import { useGenericDialogStore, useFactoryOverviewConfigStore } from '@/stores';

export default {
  name: 'FactoriesOverviewFilterDialog',
  components: {
    EvoconVButton,
    DialogTemplate,
    FactoryOverviewFilter,
  },
  data() {
    return {
      stat: null,
      interval: null,
      stations: [],
      unit: 'primary',
      statuses: [],
    };
  },
  computed: {
    ...mapState(useFactoryOverviewConfigStore, [
      'timelinesInterval',
      'timelinesStatColumn',
      'unitType',
      'statusFilter',
    ]),
  },
  mounted() {
    this.stat = this.timelinesStatColumn;
    this.interval = this.timelinesInterval;
    this.unit = this.unitType;
    this.statuses = this.statusFilter;
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog']),
    ...mapActions(useFactoryOverviewConfigStore, [
      'subscribeToFactoryViewStations',
      'saveFactoryOverviewConfig',
      'modifyFactoryViewStationOrdering',
      'setTimelinesStatColumn',
      'setTimelinesInterval',
      'setUnitType',
      'setStatusFilter',
    ]),
    async onSave() {
      await this.modifyFactoryViewStationOrdering(this.stations);

      this.setTimelinesStatColumn(this.stat);
      this.setTimelinesInterval(this.interval);
      this.setUnitType(this.unit);
      this.setStatusFilter(this.statuses);
      await this.saveFactoryOverviewConfig();
      if (this.$route.name === REALTIME) {
        this.subscribeToFactoryViewStations();
      }
      this.closeDialog();
    },
  },
};
</script>
