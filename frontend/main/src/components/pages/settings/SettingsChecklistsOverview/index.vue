<template>
  <settings-entities-overview
    :group-fields="['name', 'color']"
    entity-name="checklistTemplate"
    :overview-header="$t('Checklists')"
    :primary-btn-text="$t('Checklist')"
    :secondary-btn-text="$t('Group')"
    :filter-configuration="createFilterConfiguration(frequencies, products)"
    :items="tableChecklists"
    :table-headers="createTableHeadersConf(isListViewOpen)"
    :loading="isLoading"
    :are-cols-loading="productsLoading"
    :groups="checklistGroups"
    :status-key="'active'"
    :toggle-btn-value="toggleBtnValue"
    has-group-view
    save-action-name="saveChecklistGroup"
    :group-delete-fn="deleteChecklistGroup"
    @on-dropdown-select="onStatusChange"
    @update:toggle-btn-value="toggleBtnValue = $event"
  />
</template>
<script>
import { mapState, mapActions } from 'pinia';
import { defineAsyncComponent } from 'vue';

import productApi from '@/api/productApi';
import { checklistTypes, periodicSubTypes } from '@/constants/checklistsConstants';
import SettingsEntitiesOverview from '@/components/pages/settings/SettingsEntitiesOverview/index.vue';
import { createTableHeadersConf } from '@/components/organisms/settings/SettingsEntitiesTable/TableConfigs/checklistsTableHeadersConf';
import { createFilterConfiguration } from '@/components/organisms/settings/SettingsFilterBar/FilterBarConfigurations/checklistsFilterBarConf';
import listToKeyMap from '@/helpers/list/listToKeyMap';
import { getProductNamesArray, getFirstProductIds } from '@/helpers/product/productHelpers';
import builtInViewTypes from '@/components/pages/settings/SettingsEntitiesOverview/settingsBuiltInViewTypes.js';
import useChecklistTemplateStore from '@/stores/checklistTemplate';
import useStationStore from '@/stores/station';
import useFactoryStore from '@/stores/factory';
import useConfigurationStore from '@/stores/configuration';
import useGenericDialogStore from '@/stores/genericDialog';


export default {
  name: 'SettingsChecklistsOverview',
  components: {
    SettingsEntitiesOverview,
  },
  data() {
    return {
      products: [],
      productsLoading: false,
      productsMap: {},
      toggleBtnValue: builtInViewTypes.LIST,
    };
  },
  computed: {
    ...mapState(useChecklistTemplateStore, ['checklistTemplates', 'isLoading', 'checklistGroups', 'checklistGroupsMap']),
    ...mapState(useStationStore, ['getOrderedStationNamesArray']),
    ...mapState(useFactoryStore, ['getFactoryIdsByStationIds', 'getOrderedFactoryNamesArrayByStationIds']),
    ...mapState(useConfigurationStore, ['adminChecklistStations']),
    isListViewOpen() {
      return this.toggleBtnValue === builtInViewTypes.LIST;
    },
    frequencies() {
      return [
        { id: checklistTypes.INTERVAL, name: this.$t('Regular intervals') },
        { id: checklistTypes.CHANGEOVER, name: this.$t('Changeover') },
        { id: checklistTypes.QUANTITY, name: this.$t('Quantity produced') },
        { id: checklistTypes.STOPREASON, name: this.$t('Downtime reason') },
        { id: checklistTypes.MANUAL, name: this.$t('Manual activation') },
        { id: checklistTypes.SHIFT, name: this.$t('Shift time') },
        { id: periodicSubTypes.DAILY, name: this.$t('Daily') },
        { id: periodicSubTypes.WEEKLY, name: this.$t('Weekly') },
        { id: periodicSubTypes.MONTHLY, name: this.$t('Monthly') },
      ];
    },
    tableChecklists() {
      return this.checklistTemplates.reduce((acc, checklist) => {
        if (checklist.stationIds.every((id) => !this.adminChecklistStations.includes(id))) return acc;
        const factoryNamesArray = this.getOrderedFactoryNamesArrayByStationIds(checklist.stationIds, false);
        if (factoryNamesArray.length === 0) return acc;
        const group = this.checklistGroupsMap[checklist.groupId];
        const checklistObj = {
          ...checklist,
          groupName: group?.name ?? '',
          factoryIds: this.getFactoryIdsByStationIds(checklist.stationIds),
          factoryNamesArray,
          frequencyTableItem: this.frequencies.find((frequency) => [checklist.frequency.type, checklist.frequency.subType].includes(frequency.id)).name,
          stationNamesArray: this.getOrderedStationNamesArray(checklist.stationIds, false),
          productNamesArray: getProductNamesArray(checklist.frequency.productIds, this.productsMap),
          type: checklist.frequency.type === checklistTypes.PERIODIC ? checklist.frequency.subType : checklist.frequency.type,
          groupColor: group?.color,
        };
        acc.push(checklistObj);
        return acc;
      }, []);
    },
  },
  watch: {
    checklistTemplates() {
      this.fetchProducts();
    },
  },
  async mounted() {
    this.fetchChecklistGroups();
    await this.fetchChecklists();
    await this.fetchProducts();
  },
  methods: {
    ...mapActions(useChecklistTemplateStore, ['fetchChecklists', 'saveChecklist', 'fetchChecklistGroups', 'deleteChecklistGroup']),
    ...mapActions(useGenericDialogStore, ['openDialog']),
    createFilterConfiguration,
    createTableHeadersConf,
    async fetchProducts() {
      try {
        this.productsLoading = true;
        const productIds = getFirstProductIds(this.checklistTemplates, 'frequency');
        const uniqueProductIds = Array.from(new Set(productIds));
        if (uniqueProductIds.length) {
          this.products = await productApi.getFilteredProducts({ id: uniqueProductIds });
          this.productsMap = listToKeyMap(this.products, 'id');
        }
      } catch {
        this.products = [];
      } finally {
        this.productsLoading = false;
      }
    },
    onStatusChange(checklist) {
      if (checklist.active && checklist.frequency.type === checklistTypes.INTERVAL) {
        this.openDialog({
          title: this.$t('Confirmation'),
          component: defineAsyncComponent(() => import('@/components/organisms/settings/IntervalChecklistStartTimeDialog/index.vue')),
          allowFullscreen: false,
          width: '400px',
          data: { checklist },
        });
      } else this.saveChecklist(checklist);
    },
  },
};
</script>
