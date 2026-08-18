<template>
  <settings-entities-overview
    :group-fields="['name', 'color', 'local', 'translations', 'tags']"
    language-text-entity="commentGroup"
    entity-name="comment"
    name-field="primaryName"
    save-action-name="saveCommentGroup"
    :overview-header="isListViewVisible ? $t('Stop reasons') : $t('Stop groups')"
    :secondary-btn-text="$t('Group')"
    :primary-btn-text="$t('Reason')"
    :filter-configuration="createFilterConfiguration(stopReasonTypes)"
    :groups="commentGroupsWithAdminPermissions"
    :items="tableStopReasons"
    :table-headers="createTableHeadersConf(isListViewVisible, userHasGlobalGroupsIcon)"
    :loading="isLoading"
    :toggle-btn-value="toggleBtnValue"
    :is-deleting-group-in-progress="isDeletingGroupInProgress"
    :show-global-groups-icon="userHasGlobalGroupsIcon"
    show-drag-icon
    has-group-view
    :menu-items="menuItems"
    :group-delete-fn="onGroupDelete"
    @on-group-order-change="updateCommentGroupOrder($event)"
    @update:toggle-btn-value="toggleBtnValue = $event"
    @on-items-order-change="updateCommentOrder($event)"
  />
</template>
<script>
import { mdiBarcode, mdiSwapVertical } from '@mdi/js';
import { mapState, mapActions } from 'pinia';
import { defineAsyncComponent } from 'vue';

import useFactoryStore from '@/stores/factory';
import useStationStore from '@/stores/station';
import useCommentStore from '@/stores/comment';
import useConfigurationStore from '@/stores/configuration';
import useProfileStore from '@/stores/profile';
import useGenericDialogStore from '@/stores/genericDialog';
import commentApi from '@/api/commentApi';
import downloadFile from '@/helpers/file/downloadFile';
import SettingsEntitiesOverview from '@/components/pages/settings/SettingsEntitiesOverview/index.vue';
import { createTableHeadersConf } from '@/components/organisms/settings/SettingsEntitiesTable/TableConfigs/stopReasonsTableHeadersConf';
import { createFilterConfiguration } from '@/components/organisms/settings/SettingsFilterBar/FilterBarConfigurations/stopReasonsFilterBarConf';
import builtInViewTypes from '@/components/pages/settings/SettingsEntitiesOverview/settingsBuiltInViewTypes.js';

export default {
  name: 'SettingsStopReasonsOverview',
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
    ...mapState(useFactoryStore, ['hasMultipleFactories', 'factories', 'getOrderedFactoryNamesArrayByStationIds', 'getFactoryIdsByStationIds']),
    ...mapState(useStationStore, ['getOrderedStationNamesArray']),
    ...mapState(useCommentStore, ['commentGroupsWithAdminPermissions', 'commentGroupsWithAdminPermissionsMap', 'comments', 'isLoading']),
    ...mapState(useConfigurationStore, ['configuration']),
    ...mapState(useProfileStore, ['userHasGlobalGroupsIcon', 'highestRoleAllows']),
    isListViewVisible() {
      return this.toggleBtnValue === builtInViewTypes.LIST;
    },
    stopReasonTypes() {
      return [
        { id: 'STOPPAGE', name: this.$t('Unplanned') },
        { id: 'STANDBY', name: this.$t('Planned') },
      ];
    },
    tableStopReasons() {
      return this.comments.reduce((result, comment) => {
        if (comment.groupId < 1) return result;
        const commentGroup = this.commentGroupsWithAdminPermissionsMap[comment.groupId];
        if (!commentGroup) return result;
        const commentObj = {
          ...comment,
          type: comment.category,
          typeName: comment.category === 'STOPPAGE' ? this.$t('Unplanned') : this.$t('Planned'),
          includeInOee: comment.includeInOee ? this.$t('Included') : this.$t('Excluded'),
          groupName: commentGroup.name,
          factoryIds: this.getFactoryIdsByStationIds(comment.stationIds),
          factoryNamesArray: this.getOrderedFactoryNamesArrayByStationIds(comment.stationIds, false),
          stationNamesArray: this.getOrderedStationNamesArray(comment.stationIds, false),
          groupColor: commentGroup.color,
        };
        result.push(commentObj);
        return result;
      }, []);
    },
    menuItems() {
      const items = [
        {
          text: this.$t('Data export and import'),
          icon: mdiSwapVertical,
          visible: this.highestRoleAllows('dataImportExport') && this.reportName.length > 0,
          onClick: this.routeToDataImport,
        },
        {
          text: this.$t('Save stops as barcodes'),
          icon: mdiBarcode,
          visible: true,
          onClick: this.onBarcodeDownload,
        },
      ];
      return items.filter((item) => item.visible);
    },
    reportName() {
      const report = (this.configuration.settingsDataExportReports || []).find((r) => r.id === 'comment');
      return report ? report.name : '';
    },
  },
  methods: {
    ...mapActions(useCommentStore, ['updateCommentGroupOrder', 'updateCommentOrder', 'deleteCommentGroup']),
    ...mapActions(useGenericDialogStore, ['openDialog', 'closeDialog']),
    createFilterConfiguration,
    createTableHeadersConf,
    async onGroupDelete(group) {
      this.isDeletingGroupInProgress = true;
      await this.deleteCommentGroup(group);
      this.isDeletingGroupInProgress = false;
    },
    onBarcodeDownload() {
      if (this.hasMultipleFactories) {
        const dialogConfig = {
          component: defineAsyncComponent(() => import('@/components/organisms/FactorySelectDialog/index.vue')),
          data: {
            action: (ids) => {
              this.downloadBarCodes(ids);
              this.closeDialog();
            },
          },
        };
        this.openDialog(dialogConfig);
      } else {
        this.downloadBarCodes(this.factories.map((factory) => factory.id));
      }
    },
    async downloadBarCodes(factoryIds) {
      const requests = [];
      factoryIds.forEach((factoryId) => {
        requests.push(commentApi.getBarcodes({ factoryId }));
      });
      const results = await Promise.all(requests);
      results.forEach((result, index) => {
        const factoryId = factoryIds[index];
        const factoryName = this.factories.find((factory) => factory.id === factoryId).name;
        downloadFile(result, `${factoryName} stops.pdf`);
      });
    },
    routeToDataImport() {
      this.$router.push({ path: '/settings/comments/dataImport', query: { reportName: this.reportName } });
    },
  },
};
</script>
