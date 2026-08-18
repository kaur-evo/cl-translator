<template>
  <graph-legend
    :model-value="legendValue"
    :data="legendData"
    class="d-flex align-center"
    @update:model-value="onLegendToggle"
  >
    <template #button="{ item }">
      <evocon-v-button
        v-if="item.visible"
        :text="$t(item.text)"
        variant="tonal"
        size="small"
        class="mr-2"
        :disabled="item.disabled"
        @click="item.clickAction"
      />
    </template>
  </graph-legend>
</template>
<script>
import { mapState, mapActions } from 'pinia';

import { useFilterbarStore, useReportsConfigStore, useStationStore, useGenericNotificationStore } from '@/stores';
import GraphLegend from '@/components/molecules/GraphLegend/index.vue';
import { getHiddenLegendValues } from '@/stores/reportsConfig/index';
import configType from '@/stores/reportsConfig/constants/configType';
import { formatPercentage } from '@/helpers/numbers/formatNumber';
import colorConstants from '@/constants/colorConstants';
import graphColors from '@/constants/graphColors';
import productionSpeedLegendType from '@/stores/reportsConfig/constants/productionSpeedLegendType';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import { areRequiredFiltersValid } from '@/stores/reportsConfig/configurations/productionSpeedCommonFn';
import yAxisKey from '@/stores/reportsConfig/constants/yAxisKey';

const saveInUrlTypes = new Set([configType.OEE, configType.QUANTITY, configType.TIME_USAGE]);
const persistentLegendTypes = new Set([configType.OEE, configType.QUANTITY, configType.TIME_USAGE, configType.CHECKLIST, configType.PRODUCTION_SPEED]);

export default {
  name: 'ReportsGraphLegend',
  components: {
    GraphLegend,
    EvoconVButton,
  },
  props: {
    totals: { type: Object, required: true },
  },
  computed: {
    ...mapState(useReportsConfigStore, ['configType', 'stackLegend', 'chartLegendState', 'hiddenGroupingValues', 'yAxis']),
    ...mapState(useFilterbarStore, ['requestFilterState']),
    ...mapState(useStationStore, ['adminStationsMap']),
    reportsConfigStore() {
      return useReportsConfigStore();
    },
    legendValue() {
      if (persistentLegendTypes.has(this.configType)) {
        return this.chartLegendState;
      }
      return getHiddenLegendValues(this.stackLegend, this.hiddenGroupingValues);
    },
    legendData() {
      const legendData = [];
      this.stackLegend.forEach(({ color, text }, groupingValue) => {
        if (this.hiddenLegendEntries.includes(groupingValue)) return;
        let label;
        if (this.configType === configType.PRODUCTION_SPEED) {
          const fasterThanTargetPct = (this.totals.belowTargetCount / this.totals.productionCount) * 100;
          if (text === productionSpeedLegendType.ABOVE_TARGET) {
            label = `${this.$t('Slower than target')} ${formatPercentage(100 - fasterThanTargetPct)}`;
          } else if (text === productionSpeedLegendType.BELOW_TARGET) {
            label = `${this.$t('Faster than target')} ${formatPercentage(fasterThanTargetPct)}`;
          } else {
            label = this.$t(text);
          }
        } else if (persistentLegendTypes.has(this.configType)) {
          if (text === 'Planned stops (excl. from OEE)') {
            label = `${this.$t('Planned stops')} (${this.$t('excl. from OEE')})`;
          } else if (text === 'Planned stops (incl. in OEE)') {
            label = `${this.$t('Planned stops')} (${this.$t('incl. in OEE')})`;
          } else {
            label = this.$t(text);
          }
        } else {
          label = text;
        }
        legendData.push({ text: label, color, value: groupingValue });
      });
      if (this.configType === configType.PRODUCTION_SPEED) {
        const { stationId, productId } = this.requestFilterState;
        const filtersValid = areRequiredFiltersValid(this.requestFilterState);
        legendData.push(
          {
            text: this.$t('Most frequent'),
            color: graphColors['graph-blue'],
            value: productionSpeedLegendType.MOST_FREQUENT,
          },
          {
            customSlot: 'button',
            text: this.$t('Edit'),
            disabled: !filtersValid,
            visible: this.roleAllowsTargetEdit,
            clickAction: () => {
              if (!filtersValid) {
                this.notifyError(this.$t('Something went wrong. Please try again.'));
                return;
              }
              window.open(`/#/settings/products/${productId[0]}/edit?routeStationId=${stationId[0]}`, '_blank');
            },
            value: 'editButton',
          },
          {
            text: this.$t('Target speed'),
            color: colorConstants.light.black,
            value: productionSpeedLegendType.TARGET_SPEED,
          },
        );
      }

      const legendOrderingConfig = {
        [configType.PRODUCTION_SPEED]: {
          [productionSpeedLegendType.ABOVE_TARGET]: 0,
          [productionSpeedLegendType.BELOW_TARGET]: 1,
          [productionSpeedLegendType.MOST_FREQUENT]: 2,
          editButton: 3,
          [productionSpeedLegendType.TARGET_SPEED]: 4,
        },
      };
      if (legendOrderingConfig[this.configType]) {
        legendData.sort((a, b) => (legendOrderingConfig[this.configType][a.value] || 0) - (legendOrderingConfig[this.configType][b.value] || 0));
      }
      legendData.reverse();
      return legendData;
    },
    roleAllowsTargetEdit() {
      return !!this.adminStationsMap?.[this.requestFilterState.stationId];
    },
    hiddenLegendEntries() {
      if (this.configType === configType.TIME_USAGE && this.yAxis === yAxisKey.PCT_OF_PLANNED_TIME) {
        return ['plannedStopNotIncludedInOee'];
      }
      return [];
    },
  },
  watch: {
    stackLegend(newVal, prevVal) {
      this.onStackLegendChange(newVal, prevVal);
    },
  },
  methods: {
    ...mapActions(useReportsConfigStore, ['initMapperCalculation', 'onChartLegendChange']),
    ...mapActions(useGenericNotificationStore, ['notifyError']),
    async onLegendToggle(val) {
      if (persistentLegendTypes.has(this.configType)) {
        const oldchartLegendState = [...this.chartLegendState];
        await this.onChartLegendChange(val);
        if (JSON.stringify(oldchartLegendState) !== JSON.stringify(this.chartLegendState)) {
          this.initMapperCalculation();
        }
      } else {
        this.reportsConfigStore.hiddenGroupingValues = getHiddenLegendValues(this.stackLegend, val);
        this.initMapperCalculation();
      }
    },
    sanitizeLegendSelectedState(newVal, deSelected) {
      const deSelectedSet = new Set(deSelected);
      // Remove deselected items
      deSelectedSet.forEach((groupingValue) => {
        if (!newVal.has(groupingValue)) {
          deSelectedSet.delete(groupingValue);
        }
      });
      return { deSelected: Array.from(deSelectedSet) };
    },
    onStackLegendChange(newVal) {
      if (!saveInUrlTypes.has(this.configType)) {
        const selectedObject = this.sanitizeLegendSelectedState(newVal, this.hiddenGroupingValues);
        this.reportsConfigStore.hiddenGroupingValues = selectedObject.deSelected;
      }
    },
  },
};
</script>
