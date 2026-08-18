<template>
  <settings-entities-overview
    :group-fields="['name', 'color', 'local', 'translations', 'tags']"
    language-text-entity="performance_commentgroup"
    entity-name="perfComment"
    name-field="primaryName"
    save-action-name="savePerfCommentGroup"
    :overview-header="isListViewVisible ? $t('Speed loss reasons') : $t('Speed loss groups')"
    :secondary-btn-text="$t('Group')"
    :primary-btn-text="$t('Reason')"
    :filter-configuration="createFilterConfiguration()"
    :groups="perfCommentGroupsWithAdminPermissions"
    :items="tablePerfComments"
    :table-headers="createTableHeadersConf(isListViewVisible, userHasGlobalGroupsIcon)"
    :loading="isLoading"
    :toggle-btn-value="toggleBtnValue"
    :is-deleting-group-in-progress="isDeletingGroupInProgress"
    :show-global-groups-icon="userHasGlobalGroupsIcon"
    show-drag-icon
    has-group-view
    :group-delete-fn="onGroupDelete"
    @on-group-order-change="updatePerfCommentGroupOrder($event)"
    @update:toggle-btn-value="toggleBtnValue = $event"
    @on-items-order-change="updatePerfCommentOrder($event)"
  />
</template>
<script>
import { mapState, mapActions } from 'pinia';

import usePerfCommentStore from '@/stores/perfComment';
import useFactoryStore from '@/stores/factory';
import useStationStore from '@/stores/station';
import useProfileStore from '@/stores/profile';
import SettingsEntitiesOverview from '@/components/pages/settings/SettingsEntitiesOverview/index.vue';
import { createTableHeadersConf } from '@/components/organisms/settings/SettingsEntitiesTable/TableConfigs/speedLossReasonsTableHeadersConf';
import { createFilterConfiguration } from '@/components/organisms/settings/SettingsFilterBar/FilterBarConfigurations/speedLossReasonsFilterBarConf';
import builtInViewTypes from '@/components/pages/settings/SettingsEntitiesOverview/settingsBuiltInViewTypes.js';

export default {
  name: 'SettingsSpeedLossOverview',
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
    ...mapState(usePerfCommentStore, ['perfCommentGroupsWithAdminPermissions', 'perfCommentGroupsWithAdminPermissionsMap', 'perfComments', 'isLoading']),
    ...mapState(useFactoryStore, ['getOrderedFactoryNamesArrayByStationIds', 'getFactoryIdsByStationIds']),
    ...mapState(useStationStore, ['getOrderedStationNamesArray']),
    ...mapState(useProfileStore, ['userHasGlobalGroupsIcon']),
    isListViewVisible() {
      return this.toggleBtnValue === builtInViewTypes.LIST;
    },
    tablePerfComments() {
      return this.perfComments.reduce((result, perfComment) => {
        if (perfComment.groupId > -1) {
          const perfCommentGroup = this.perfCommentGroupsWithAdminPermissionsMap[perfComment.groupId];
          if (!perfCommentGroup) return result;
          const perfCommentObj = {
            ...perfComment,
            groupName: perfCommentGroup.name,
            factoryIds: this.getFactoryIdsByStationIds(perfComment.stationIds),
            factoryNamesArray: this.getOrderedFactoryNamesArrayByStationIds(perfComment.stationIds, false),
            stationNamesArray: this.getOrderedStationNamesArray(perfComment.stationIds, false),
            groupColor: perfCommentGroup.color,
          };
          result.push(perfCommentObj);
        }
        return result;
      }, []);
    },
  },
  methods: {
    ...mapActions(usePerfCommentStore, ['updatePerfCommentGroupOrder', 'updatePerfCommentOrder', 'deletePerfCommentGroup']),
    createFilterConfiguration,
    createTableHeadersConf,
    async onGroupDelete(group) {
      this.isDeletingGroupInProgress = true;
      await this.deletePerfCommentGroup(group);
      this.isDeletingGroupInProgress = false;
    },
  },
};
</script>
