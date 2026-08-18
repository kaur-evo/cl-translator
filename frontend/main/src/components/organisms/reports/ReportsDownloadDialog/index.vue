<template>
  <form-dialog-template
    :primary-segment-title="`${$t('Export data')}: ${$t(dialogData.name)}`"
  >
    <template #primary-segment>
      <v-form
        ref="form"
        v-model="valid"
        @submit="onSaveClick"
      >
        <v-row>
          <v-col
            v-if="hasDateRange"
            class="pa-1"
            cols="12"
          >
            <double-date-range-menu
              v-model:selection-type="formData.selectionType"
              v-model:date-range="formData.dateRange"
              :placeholder="$t('Select range')"
              :hint="$t('Select range')"
            />
          </v-col>
          <v-col
            v-if="hasMultipleFactories"
            class="pa-1"
            cols="12"
            lg="6"
          >
            <selection-input
              :model-value="formData.factoryId"
              :items="factories"
              :placeholder="$t('Factories')"
              :hint="$t('Factories')"
              show-empty-array-as-all-selected
              @update:model-value="onFactoryChange"
            />
          </v-col>
          <v-col
            class="pa-1"
            :lg="hasMultipleFactories ? 6 : 12"
            cols="12"
          >
            <generic-station-input
              v-model="formData.stationId"
              :items-override="filteredStations"
              show-empty-array-as-all-selected
              :is-single-select="isSingleStation"
            />
          </v-col>
        </v-row>
      </v-form>
    </template>
    <template #actions>
      <v-spacer />
      <evocon-v-button
        type="secondary"
        :text="$t('Cancel')"
        @click="onCancelClick()"
      />
      <evocon-v-button
        :loading="customReportsLoading[dialogData.name]"
        type="primary"
        color="primary"
        :text="$t('Export')"
        @click="onSaveClick()"
      />
    </template>
  </form-dialog-template>
</template>
<script>
import { mdiMenuDown } from '@mdi/js';
import { mapActions, mapState } from 'pinia';

import { useGenericDialogStore, useFactoryStore, useCustomReportStore, useFilterbarStore, useStationStore, useProfileStore } from '@/stores';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import FormDialogTemplate from '@/components/templates/FormDialogTemplate/index.vue';
import DoubleDateRangeMenu from '@/components/molecules/DoubleDateRangeMenu/index.vue';
import { getCurrentPeriod } from '@/constants/rollingPeriodRangeDefinitions';
import GenericStationInput from '@/components/organisms/GenericStationInput/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';

const vectorIcons = { mdiMenuDown };
export default {
  name: 'ReportsDownloadDialog',
  components: {
    EvoconVButton,
    FormDialogTemplate,
    DoubleDateRangeMenu,
    GenericStationInput,
    SelectionInput,
  },
  data() {
    return {
      ...vectorIcons,
      valid: true,
      formData: {
        dateRange: [],
        selectionType: 'rolling7days',
        stationId: [],
        factoryId: [],
      },
    };
  },

  computed: {
    ...mapState(useGenericDialogStore, ['dialogData']),
    ...mapState(useFactoryStore, ['factories', 'hasMultipleFactories']),
    ...mapState(useCustomReportStore, ['customReportsLoading']),
    ...mapState(useFilterbarStore, ['requestFilterState']),
    ...mapState(useStationStore, ['stations', 'stationsMap']),
    ...mapState(useProfileStore, ['firstDayOfWeek']),
    filteredStations() {
      if (!this.hasMultipleFactories) return this.stations;
      return this.stations.filter(
        (station) => this.formData.factoryId?.includes(station.factoryId) || this.formData.factoryId?.length === 0,
      );
    },
    isSingleStation() {
      return this.dialogData.singleStation ?? false;
    },
    hasDateRange() {
      return this.dialogData.dateRangeEnabled ?? true;
    },
  },
  created() {
    this.setDefaults();
  },
  methods: {
    ...mapActions(useCustomReportStore, ['exportCustomReport', 'cancelExportCustomReportRequest']),
    ...mapActions(useGenericDialogStore, ['closeDialog']),
    async onFactoryChange(factoryIds) {
      this.formData.factoryId = factoryIds;

      if (this.isSingleStation) {
        const allowSelectedStation = this.filteredStations.some((station) => this.formData.stationId.includes(station.id));
        if (!allowSelectedStation) {
          this.formData.stationId = [this.filteredStations[0].id];
        }
      } else {
        this.formData.stationId = [];
      }
    },
    setDefaultDateByFilterVal(val) {
      if (typeof val === 'string') {
        const currentPeriod = getCurrentPeriod(val, { weekStartsOn: this.firstDayOfWeek });

        this.formData.selectionType = val;
        this.formData.dateRange = currentPeriod;
      }
      if (Array.isArray(val)) {
        this.formData.dateRange = val;
        this.formData.selectionType = 'custom';
      }
    },
    getDefaultStationId() {
      if (this.isSingleStation) {
        const reqStationIds = this.requestFilterState.stationId;
        if (reqStationIds.length && this.stationsMap[reqStationIds[0]]) {
          return [reqStationIds[0]];
        }
        return [this.filteredStations[0].id];
      }
      return this.requestFilterState.stationId;
    },
    setDefaults() {
      this.formData.stationId = this.getDefaultStationId();
      this.formData.factoryId = this.requestFilterState.factoryId || [];
      this.setDefaultDateByFilterVal(this.requestFilterState.period);
    },
    async downloadReport() {
      const [startTime, endTime] = [...this.formData.dateRange].sort();
      const stationId = this.formData.factoryId.length && !this.formData.stationId.length ? this.filteredStations.map((station) => station.id) : this.formData.stationId;
      const requestParams = {
        reportName: this.dialogData.name,
        params: {
          stationId,
          startTime,
          endTime,
        },
      };
      await this.exportCustomReport(requestParams);
    },
    async onSaveClick() {
      await this.$refs.form.validate();
      if (this.valid) {
        await this.downloadReport();
      }
    },
    async onCancelClick() {
      this.cancelExportCustomReportRequest();
      this.closeDialog();
    },
  },
};
</script>
