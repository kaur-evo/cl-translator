<template>
  <form-dialog-template
    :primary-segment-title="'View options'"
  >
    <template #primary-segment>
      <v-form
        ref="form"
        v-model="valid"
        @submit="onSaveClick"
      >
        <template v-if="isDev">
          <span class="text-body-small text-secondary-text">Only visible for system admins below this</span>
          <v-divider />
          <v-row>
            <v-col
              class="pa-1"
              cols="6"
            >
              <evocon-v-select
                :model-value="chartType"
                :hint="'Chart type'"
                :placeholder="'Chart type'"
                :items="chartTypeMenuItems"
                persistent-hint
                item-text="text"
                item-value="value"
                density="compact"
                multiple
                autocomplete="off"
                type="hidden"
                @update:model-value="onChartTypeChange"
              />
            </v-col>
            <v-col
              class="pa-1"
              cols="6"
            >
              <evocon-v-select
                :disabled="curveSelectDisabled"
                :model-value="chartCurve"
                :hint="'Chart curve type'"
                :placeholder="'Chart curve type'"
                :items="chartCurveTypeMenuItems"
                persistent-hint
                item-text="text"
                item-value="value"
                density="compact"
                autocomplete="off"
                type="hidden"
                @update:model-value="onChartCurveChange"
              />
            </v-col>
            <v-col
              class="pa-1"
              cols="6"
            >
              <evocon-v-select
                :model-value="granularity"
                :hint="'granularity X-axis'"
                :placeholder="'granularity X-axis'"
                :items="granularityMenuItems"
                persistent-hint
                item-text="text"
                item-value="value"
                density="compact"
                autocomplete="off"
                type="hidden"
                @update:model-value="onGranularityChange"
              />
            </v-col>
          </v-row>
        </template>
      </v-form>
    </template>
    <template #actions>
      <v-spacer />
      <evocon-v-button
        type="secondary"
        :text="'Cancel'"
        @click="onCancelClick()"
      />
      <evocon-v-button
        :text="'Save'"
        type="primary"
        color="primary"
        @click="onSaveClick()"
      />
    </template>
  </form-dialog-template>
</template>
<script>
import { mapActions, mapState } from 'pinia';

import { useProfileStore, useFilterbarStore, useReportsConfigStore, useGenericDialogStore } from '@/stores';
import FormDialogTemplate from '@/components/templates/FormDialogTemplate/index.vue';
import EvoconVSelect from '@/components/atoms/EvoconVSelect/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import chartType from '@/stores/reportsConfig/constants/chartType';
import { getExtendedGranularityMenu } from '@/stores/reportsConfig/configurations/granularityMenuItems';
import chartCurveTypeMenuItems from '@/stores/reportsConfig/configurations/chartCurveTypeMenuItems';
import chartTypeMenuItems from '@/stores/reportsConfig/configurations/chartTypeMenuItems';

export default {
  name: 'ReportsViewOptionsForm',
  components: { FormDialogTemplate, EvoconVSelect, EvoconVButton },
  data() {
    return {
      valid: true,
    };
  },
  computed: {
    ...mapState(useProfileStore, ['language']),
    ...mapState(useFilterbarStore, ['currentFilterState']),
    ...mapState(useReportsConfigStore, ['granularity']),
    isDev() {
      return import.meta.env.VITE_VUE_APP_SYSTEM_NAME === 'DEV';
    },
    chartType() {
      return this.currentFilterState.chartType;
    },
    currentChartType() {
      return this.currentFilterState.chartType;
    },
    chartCurve() {
      return this.currentFilterState.chartCurve;
    },
    curveSelectDisabled() {
      return ![chartType.LINE, chartType.AREA].some((val) => this.currentChartType.includes(val));
    },
    granularityMenuItems() {
      return getExtendedGranularityMenu(this.language);
    },
    chartCurveTypeMenuItems() {
      return chartCurveTypeMenuItems;
    },
    chartTypeMenuItems() {
      return chartTypeMenuItems;
    },
  },

  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog']),
    ...mapActions(useFilterbarStore, ['updateFilterValue', 'triggerDataRequest']),
    ...mapActions(useReportsConfigStore, ['onGranularityChange']),
    async onSaveClick() {
      this.triggerDataRequest();
      this.closeDialog();
    },
    onCancelClick() {
      this.closeDialog();
    },
    onChartTypeChange(val) {
      this.updateFilterValue({ chartType: val });
    },
    onChartCurveChange(val) {
      this.updateFilterValue({ chartCurve: val });
    },
  },
};
</script>
