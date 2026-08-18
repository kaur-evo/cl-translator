<template>
  <settings-entities-overview
    entity-name="operator"
    :overview-header="$t('Operators')"
    :primary-btn-text="$t('operator')"
    :filter-configuration="createFilterConfiguration(stationsWithoutOperators, checklistsEnabled)"
    :items="tableOperators"
    :table-headers="tableHeaders"
    :loading="isLoading"
  />
</template>
<script>
import { mapState } from 'pinia';

import useOperatorStore from '@/stores/operator';
import useFactoryStore from '@/stores/factory';
import useStationStore from '@/stores/station';
import useFeatureStore from '@/stores/feature';
import SettingsEntitiesOverview from '@/components/pages/settings/SettingsEntitiesOverview/index.vue';
import { createFilterConfiguration } from '@/components/organisms/settings/SettingsFilterBar/FilterBarConfigurations/operatorsFilterBarConf';
import { createTableHeadersConf } from '@/components/organisms/settings/SettingsEntitiesTable/TableConfigs/operatorsTableHeadersConf';

export default {
  name: 'SettingsOperatorsOverview',
  components: {
    SettingsEntitiesOverview,
  },
  computed: {
    ...mapState(useOperatorStore, ['operators', 'isLoading']),
    ...mapState(useFactoryStore, ['getOrderedFactoryNamesArrayByStationIds']),
    ...mapState(useStationStore, ['stations', 'getOrderedStationNamesArray']),
    ...mapState(useFeatureStore, ['checklistsEnabled']),
    tableOperators() {
      return this.operators.reduce((result, operator) => {
        const factoryNamesArray = this.getOrderedFactoryNamesArrayByStationIds(operator.stationIds, false);
        if (factoryNamesArray.length === 0) return result;
        const operatorObj = {
          ...operator,
          factoryNamesArray,
          stationNamesArray: this.getOrderedStationNamesArray(operator.stationIds, false),
        };
        result.push(operatorObj);
        return result;
      }, []);
    },
    stationsWithoutOperators() {
      return this.stations.reduce((result, station) => {
        if (this.operators.every((operator) => !operator.stationIds.includes(station.id))) {
          result.push(station.id);
        }
        return result;
      }, []);
    },
    tableHeaders() {
      return createTableHeadersConf(this.checklistsEnabled);
    },
  },
  methods: {
    createFilterConfiguration,
  },
};
</script>
