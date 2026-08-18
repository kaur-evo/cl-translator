<template>
  <settings-entities-overview
    :group-fields="['name', 'color', 'local', 'translations', 'tags']"
    language-text-entity="scrap_reason_group"
    entity-name="scrapReason"
    name-field="primaryName"
    save-action-name="saveScrapReasonGroup"
    :overview-header="isListViewVisible ? $t('Scrap reasons') : $t('Scrap groups')"
    :secondary-btn-text="$t('Group')"
    :primary-btn-text="$t('Reason')"
    :filter-configuration="createFilterConfiguration()"
    :groups="scrapReasonGroupsWithAdminPermissions"
    :items="tableScrapReasons"
    :table-headers="createTableHeadersConf(isListViewVisible, userHasGlobalGroupsIcon)"
    :loading="isLoading"
    :toggle-btn-value="toggleBtnValue"
    :is-deleting-group-in-progress="isDeletingGroupInProgress"
    :show-global-groups-icon="userHasGlobalGroupsIcon"
    show-drag-icon
    has-group-view
    :group-delete-fn="onGroupDelete"
    @on-group-order-change="updateScrapReasonGroupOrder($event)"
    @update:toggle-btn-value="toggleBtnValue = $event"
    @on-items-order-change="updateScrapReasonOrder($event)"
  />
</template>
<script>
import { mapState, mapActions } from 'pinia';

import useScrapReasonStore from '@/stores/scrapReason';
import useFactoryStore from '@/stores/factory';
import useStationStore from '@/stores/station';
import useProfileStore from '@/stores/profile';
import SettingsEntitiesOverview from '@/components/pages/settings/SettingsEntitiesOverview/index.vue';
import { createTableHeadersConf } from '@/components/organisms/settings/SettingsEntitiesTable/TableConfigs/scrapReasonsTableHeadersConf';
import { createFilterConfiguration } from '@/components/organisms/settings/SettingsFilterBar/FilterBarConfigurations/scrapReasonsFilterBarConf';
import builtInViewTypes from '@/components/pages/settings/SettingsEntitiesOverview/settingsBuiltInViewTypes.js';

export default {
  name: 'SettingsScrapReasonOverview',
  components: {
    SettingsEntitiesOverview,
  },
  data() {
    return {
      isDeletingGroupInProgress: false,
      toggleBtnValue: builtInViewTypes.LIST,
    };
  },
  computed: {
    ...mapState(useScrapReasonStore, ['scrapReasonGroupsWithAdminPermissions', 'scrapReasonGroupsWithAdminPermissionsMap', 'scrapReasons', 'isLoading']),
    ...mapState(useFactoryStore, ['getOrderedFactoryNamesArrayByStationIds', 'getFactoryIdsByStationIds']),
    ...mapState(useStationStore, ['getOrderedStationNamesArray']),
    ...mapState(useProfileStore, ['userHasGlobalGroupsIcon']),
    isListViewVisible() {
      return this.toggleBtnValue === builtInViewTypes.LIST;
    },
    tableScrapReasons() {
      return this.scrapReasons.reduce((result, scrapReason) => {
        if (scrapReason.groupId > -1) {
          const scrapReasonGroup = this.scrapReasonGroupsWithAdminPermissionsMap[scrapReason.groupId];
          if (!scrapReasonGroup) return result;
          const scrapReasonObj = {
            ...scrapReason,
            groupName: scrapReasonGroup.name,
            factoryIds: this.getFactoryIdsByStationIds(scrapReason.stationIds),
            factoryNamesArray: this.getOrderedFactoryNamesArrayByStationIds(scrapReason.stationIds, false),
            stationNamesArray: this.getOrderedStationNamesArray(scrapReason.stationIds, false),
            groupColor: scrapReasonGroup.color,
          };
          result.push(scrapReasonObj);
        }
        return result;
      }, []);
    },
  },
  methods: {
    ...mapActions(useScrapReasonStore, ['updateScrapReasonGroupOrder', 'updateScrapReasonOrder', 'deleteScrapReasonGroup']),
    createFilterConfiguration,
    createTableHeadersConf,
    async onGroupDelete(group) {
      this.isDeletingGroupInProgress = true;
      await this.deleteScrapReasonGroup(group);
      this.isDeletingGroupInProgress = false;
    },
  },
};
</script>
