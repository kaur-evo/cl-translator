<template>
  <settings-entities-overview
    :group-fields="['name', 'singleFactory']"
    entity-name="station"
    name-field="name"
    save-action-name="saveStationGroup"
    :overview-header="isListViewVisible ? $t('Stations') : $t('Station groups')"
    :secondary-btn-text="$t('Group')"
    :filter-configuration="createFilterConfiguration()"
    :groups="stationGroupsWithAdminPermissions"
    :items="tableStations"
    :table-headers="createTableHeadersConf(isListViewVisible)"
    :loading="isLoading"
    :toggle-btn-value="toggleBtnValue"
    :is-deleting-group-in-progress="isDeletingGroupInProgress"
    has-group-view
    :group-delete-fn="onGroupDelete"
    @update:toggle-btn-value="toggleBtnValue = $event"
  />
</template>
<script>
import { mapState, mapActions } from 'pinia';

import useStationStore from '@/stores/station';
import useFactoryStore from '@/stores/factory';
import useCommentStore from '@/stores/comment';
import SettingsEntitiesOverview from '@/components/pages/settings/SettingsEntitiesOverview/index.vue';
import { createTableHeadersConf } from '@/components/organisms/settings/SettingsEntitiesTable/TableConfigs/stationsTableHeadersConf';
import { createFilterConfiguration } from '@/components/organisms/settings/SettingsFilterBar/FilterBarConfigurations/stationsFilterBarConf';
import builtInViewTypes from '@/components/pages/settings/SettingsEntitiesOverview/settingsBuiltInViewTypes.js';

export default {
  name: 'SettingsStationsOverview',
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
    ...mapState(useStationStore, ['stationGroupsWithAdminPermissions', 'stations', 'isLoading', 'stationGroupsRealMap']),
    ...mapState(useFactoryStore, ['getOrderedFactoryNamesArrayByStationIds']),
    ...mapState(useCommentStore, ['commentsMap']),
    isListViewVisible() {
      return this.toggleBtnValue === builtInViewTypes.LIST;
    },
    tableStations() {
      return this.stations.reduce((result, station) => {
        const factoryNamesArray = this.getOrderedFactoryNamesArrayByStationIds([station.id], false);
        if (!factoryNamesArray.length) return result;
        const stationObj = {
          ...station,
          groupName: this.stationGroupsRealMap.get(station.groupId)?.name,
          factoryNamesArray,
          emptyShiftReason: station.emptyShiftCommentId ? this.commentsMap[station.emptyShiftCommentId]?.name : '-',
        };
        result.push(stationObj);
        return result;
      }, []);
    },
  },
  methods: {
    ...mapActions(useStationStore, ['deleteStationGroup']),
    createFilterConfiguration,
    createTableHeadersConf,
    async onGroupDelete(group) {
      this.isDeletingGroupInProgress = true;
      await this.deleteStationGroup(group);
      this.isDeletingGroupInProgress = false;
    },
  },
};
</script>
