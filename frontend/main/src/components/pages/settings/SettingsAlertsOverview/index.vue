<template>
  <settings-entities-overview
    entity-name="alert"
    :overview-header="$t('Alerts')"
    :primary-btn-text="$t('Alert')"
    :table-headers="createTableHeadersConf()"
    :filter-configuration="createFilterConfiguration()"
    :items="tableAlerts"
    :loading="isLoading"
    :status-key="'active'"
    @on-dropdown-select="onDropdownSelect"
  >
    <template #header-append>
      <icon-with-tooltip
        additional-classes="ml-2"
        :icon="mdiInformationOutline"
        :tooltip-text="$t('Learn more')"
        :icon-clicked-fn="onOpenHelp"
      />
    </template>
  </settings-entities-overview>
</template>
<script>
import { mapState, mapActions } from 'pinia';
import cloneDeep from 'lodash/cloneDeep';
import { mdiInformationOutline } from '@mdi/js';

import SettingsEntitiesOverview from '@/components/pages/settings/SettingsEntitiesOverview/index.vue';
import { createTableHeadersConf } from '@/components/organisms/settings/SettingsEntitiesTable/TableConfigs/alertsTableHeadersConf';
import { createFilterConfiguration } from '@/components/organisms/settings/SettingsFilterBar/FilterBarConfigurations/alertsFilterBarConf';
import listToKeyMap from '@/helpers/list/listToKeyMap';
import { getAlertTypeById, getChannelTypeById } from '@/constants/alerts';
import { getProductNamesArray, getFirstProductIds } from '@/helpers/product/productHelpers';
import productApi from '@/api/productApi';
import IconWithTooltip from '@/components/atoms/IconWithTooltip/index.vue';
import useStationStore from '@/stores/station';
import useFactoryStore from '@/stores/factory';
import useOperatorStore from '@/stores/operator';
import useAlertStore from '@/stores/alert';
import useShiftTemplateStore from '@/stores/shiftTemplate';
import usePositionStore from '@/stores/position';

const icons = { mdiInformationOutline };
export default {
  name: 'AlertsOverviewComponent',
  components: {
    SettingsEntitiesOverview,
    IconWithTooltip,
  },
  data() {
    return {
      ...icons,
      products: [],
    };
  },
  computed: {
    ...mapState(useStationStore, ['getOrderedStationNamesArray', 'stations']),
    ...mapState(useFactoryStore, ['getOrderedFactoryNamesArrayByStationIds', 'getFactoryIdsByStationIds']),
    ...mapState(useOperatorStore, ['operatorsMap']),
    ...mapState(useAlertStore, ['alerts', 'isLoading']),
    ...mapState(useShiftTemplateStore, ['shiftTemplatesMap']),
    ...mapState(usePositionStore, ['positionsMap']),
    tableAlerts() {
      return this.alerts.reduce((acc, alert) => {
        const stationIds = alert.requirements.stationIds?.length ? alert.requirements.stationIds : this.stations.map((station) => station.id);
        const factoryNamesArray = this.getOrderedFactoryNamesArrayByStationIds(stationIds, false);
        if (factoryNamesArray.length === 0) return acc;
        const copy = cloneDeep(alert);
        copy.stationIds = stationIds;
        copy.stationNamesArray = this.getOrderedStationNamesArray(stationIds);
        copy.factoryIds = this.getFactoryIdsByStationIds(stationIds);
        copy.factoryNamesArray = factoryNamesArray;
        copy.productIds = alert.requirements.productIds;
        copy.productNamesArray = getProductNamesArray(alert.requirements.productIds, this.productsMap);
        copy.operatorIds = alert.requirements.operatorIds || [];
        copy.operatorNamesArray = copy.operatorIds.map((id) => this.operatorsMap[id]?.name || '');
        copy.shiftTemplateIds = alert.requirements.shiftTemplateIds || [];
        copy.shiftTemplateNamesArray = copy.shiftTemplateIds.map(
          (id) => this.shiftTemplatesMap[id]?.name || '',
        ).filter(Boolean);
        copy.positionIds = alert.requirements.positionIds || [];
        copy.positionNamesArray = copy.positionIds.map(
          (id) => this.positionsMap[id]?.primaryName || '',
        ).filter(Boolean);
        copy.type = copy.requirements.type;
        copy.triggerName = getAlertTypeById(copy.requirements.type)?.name;
        copy.channels = copy.output.channels.map((channel) => getChannelTypeById(channel.type).name);
        copy.emailOutputString = this.getEmailOutputString(copy.output);
        acc.push(copy);
        return acc;
      }, []);
    },
    productsMap() {
      return listToKeyMap(this.products, 'id');
    },
  },
  async mounted() {
    await Promise.all([
      this.fetchAlerts(),
      this.fetchShiftTemplates(),
      this.fetchPositions(),
    ]);
    const firstProductIds = getFirstProductIds(this.alerts, 'requirements');
    this.products = await productApi.getFilteredProducts({ id: firstProductIds });
  },
  methods: {
    createTableHeadersConf,
    createFilterConfiguration,
    ...mapActions(useAlertStore, ['fetchAlerts', 'saveAlert']),
    ...mapActions(useShiftTemplateStore, ['fetchShiftTemplates']),
    ...mapActions(usePositionStore, ['fetchPositions']),
    async onDropdownSelect(value) {
      this.saveAlert(value);
    },
    onOpenHelp() {
      window.open('https://support.evocon.com/Managing-alerts-2d9209b4286642ffa42e92845944017e', '_blank');
    },
    getEmailOutputString(output) {
      const emailOutput = output.channels.find((item) => item.type === 'EMAIL');
      if (!emailOutput) return '-';
      return emailOutput.targets.join(', ');
    },
  },
};
</script>
