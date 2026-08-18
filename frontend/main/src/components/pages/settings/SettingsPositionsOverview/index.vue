<template>
  <settings-entities-overview
    entity-name="position"
    :overview-header="$t('Machine locations')"
    :primary-btn-text="$t('Location')"
    :filter-configuration="createFilterConfiguration()"
    :table-headers="createTableHeadersConf(isListView)"
    :groups="stationsAsGroups"
    :items="tablePositions"
    :loading="isLoading"
    :toggle-btn-value="toggleBtnValue"
    has-group-view
    :can-edit-groups="false"
    :show-empty-groups="false"
    empty-view-img-override="machine-locations"
    :empty-view-header-override="$t('Define fault locations of the machines')"
    :empty-view-description-override="$t('Link reasons to specific machine locations to track exactly where issues occur')"
    empty-view-secondary-btn-color="primary"
    :empty-view-secondary-btn-icon="mdiPlus"
    :empty-view-secondary-btn="$t('Location')"
    :empty-view-tertiary-btn="$t('Learn more')"
    @update:toggle-btn-value="toggleBtnValue = $event"
    @on-items-order-change="onLocationOrderChange"
    @secondary-empty-view-btn-clicked="$router.push({ name: 'positionEdit' });"
    @tertiary-empty-view-btn-clicked="onOpenHelp"
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
import { mdiInformationOutline, mdiPlus } from '@mdi/js';

import usePositionStore from '@/stores/position';
import useStationStore from '@/stores/station';
import useFactoryStore from '@/stores/factory';
import useCommentStore from '@/stores/comment';
import usePerfCommentStore from '@/stores/perfComment';
import SettingsEntitiesOverview from '@/components/pages/settings/SettingsEntitiesOverview/index.vue';
import { createTableHeadersConf } from '@/components/organisms/settings/SettingsEntitiesTable/TableConfigs/positionsTableHeadersConf';
import { createFilterConfiguration } from '@/components/organisms/settings/SettingsFilterBar/FilterBarConfigurations/positionsFilterBarConf';
import IconWithTooltip from '@/components/atoms/IconWithTooltip/index.vue';
import builtInViewTypes from '@/components/pages/settings/SettingsEntitiesOverview/settingsBuiltInViewTypes.js';

const icons = { mdiInformationOutline, mdiPlus };

export default {
  name: 'PositionsOverviewComponent',
  components: {
    SettingsEntitiesOverview,
    IconWithTooltip,
  },
  data() {
    return {
      ...icons,
      toggleBtnValue: builtInViewTypes.LIST,
    };
  },
  computed: {
    ...mapState(usePositionStore, ['positions', 'isLoading']),
    ...mapState(useStationStore, ['stationsWithAdminPermissions', 'getOrderedStationNamesArray']),
    ...mapState(useFactoryStore, ['getFactoryIdsByStationIds', 'getOrderedFactoryNamesArrayByStationIds']),
    ...mapState(useCommentStore, ['commentsRealMap']),
    ...mapState(usePerfCommentStore, ['perfCommentsRealMap']),
    isListView() {
      return this.toggleBtnValue === builtInViewTypes.LIST;
    },
    tablePositions() {
      return this.positions.reduce((acc, position) => {
        const factoryIds = this.getFactoryIdsByStationIds(position.stationIds, false);
        if (factoryIds.length === 0) return acc;
        acc.push({
          ...position,
          stationNamesArray: this.getOrderedStationNamesArray(position.stationIds, false),
          factoryIds,
          factoryNamesArray: this.getOrderedFactoryNamesArrayByStationIds(position.stationIds, false),
          stopReasonNames: this.getNames(position, 'commentIds', this.commentsRealMap),
          performanceReasonNames: this.getNames(position, 'performanceCommentIds', this.perfCommentsRealMap),
        });
        return acc;
      }, []);
    },
    stationsAsGroups() {
      return this.stationsWithAdminPermissions.map((station) => ({ ...station, groupId: station.id }));
    },
  },
  methods: {
    ...mapActions(usePositionStore, ['reOrderPosition']),
    createFilterConfiguration,
    createTableHeadersConf,
    onOpenHelp() {
      window.open('https://support.evocon.com/Using-locations-for-production-stop-reasons-6cce1437ebed42c0b133c45e0a031005', '_blank');
    },
    onLocationOrderChange(data) {
      this.reOrderPosition({ ...data, stationId: data.groupId });
    },
    getNames(position, key, map) {
      const comments = position[key];
      if (comments.length === 0) {
        if (key === 'commentIds') {
          return position.commentsEnabled ? this.$t('All') : '-';
        }
        if (key === 'performanceCommentIds') {
          return position.performanceCommentsEnabled ? this.$t('All') : '-';
        }
      }
      return comments.map((commentId) => map.get(commentId)?.name || '').join(', ');
    },
  },
};
</script>
