<template>
  <div>
    <dialog-toolbar
      :title-icon="mdiMonitor"
      :title="$t('Select station')"
    />
    <v-card-text class="d-flex flex-column py-0">
      <v-list-item
        v-if="currentUser.defaultStationId && stationsMap[currentUser.defaultStationId]"
        class="mb-2 pl-2"
        :height="isMobileView ? '40px' : '48px'"
        :density="isMobileView ? 'compact' : 'default'"
        @click="onSelectStation(currentUser.defaultStationId)"
      >
        <list-item-contents
          :primary-text="stationsMap[currentUser.defaultStationId].name"
          :icon="mdiStar"
          icon-color="secondary"
          :dark="false"
          :dense="isMobileView"
        />
      </v-list-item>
      <div
        class="station-select"
        :class="{ 'station-select--mobile': isMobileView, 'station-select--tablet': showFullscreenDialogs && !isMobileView }"
      >
        <double-grouped-selection
          v-if="Object.keys(factoriesMap).length > 1"
          :model-value="[lineviewStation.id]"
          :grouped-items="groupedStations"
          :items="stations"
          :dense="isMobileView"
          :density="isMobileView ? 'compact' : 'default'"
          is-single-select
          required
          :show-append-on-hover="(item) => !showFullscreenDialogs && item.id !== currentUser.defaultStationId"
          @update:search="search = $event"
          @update:model-value="onSelectStation(...$event)"
        >
          <template #append="{ item }">
            <default-station-icon :id="item.id" />
          </template>
        </double-grouped-selection>
        <grouped-selection
          v-else
          :model-value="[lineviewStation.id]"
          :items="stations"
          :groups="stationGroups"
          :dense="isMobileView"
          :is-dropdown="false"
          is-single-select
          required
          :show-append-on-hover="(item) => !showFullscreenDialogs && item.id !== currentUser.defaultStationId"
          height="auto"
          @update:model-value="onSelectStation($event[0])"
        >
          <template #append="{ item }">
            <default-station-icon :id="item.id" />
          </template>
        </grouped-selection>
      </div>
    </v-card-text>
    <v-card-actions :class="{ 'fullscreen-card-actions': showFullscreenDialogs }">
      <v-spacer />
      <evocon-v-button
        id="cancel-button"
        :text="$t('Cancel')"
        type="secondary"
        @click="closeDialog"
      />
    </v-card-actions>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { mdiMonitor, mdiStar } from '@mdi/js';

import DefaultStationIcon from './defaultStationIcon.vue';

import {
  useProfileStore,
  useStationStore,
  useFactoryStore,
  useDeviceStore,
  useGenericDialogStore,
} from '@/stores/index';
import DialogToolbar from '@/components/atoms/DialogToolbar/index.vue';
import GroupedSelection from '@/components/molecules/GroupedSelection/index.vue';
import ListItemContents from '@/components/molecules/ListItemContents/index.vue';
import DoubleGroupedSelection from '@/components/molecules/DoubleGroupedSelection/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';

const icons = { mdiMonitor, mdiStar };

export default {
  name: 'StationSelectDialog',
  components: {
    DoubleGroupedSelection,
    DialogToolbar,
    GroupedSelection,
    ListItemContents,
    EvoconVButton,
    DefaultStationIcon,
  },
  data() {
    return {
      ...icons,
      search: '',
    };
  },
  computed: {
    ...mapState(useProfileStore, ['currentUser']),
    ...mapState(useStationStore, ['stationsMap', 'lineviewStation', 'stations', 'stationGroups', 'stationGroupsMap']),
    ...mapState(useFactoryStore, ['factoriesMap']),
    ...mapState(useDeviceStore, ['showFullscreenDialogs', 'isMobileView']),
    groupedStations() {
      const groupedStationsMap = this.stations.reduce((groupedStations, station) => {
        const subGroup = this.stationGroupsMap[station.groupId];
        const group = this.factoriesMap[station.factoryId];
        const matchingSubGroup = subGroup && this.matchesSearch(subGroup.name);
        const matchingGroup = group && this.matchesSearch(group.name);
        const isGroupOpen = !!this.search.length && this.matchesSearch(station.name);

        if (!this.matchesSearch(station.name) && !matchingSubGroup && !matchingGroup) return groupedStations;

        if (groupedStations[station.factoryId]) {
          const { groupItems } = groupedStations[station.factoryId];
          if (groupItems[station.groupId]) {
            groupItems[station.groupId].subGroupItems.push(station);
          } else {
            groupItems[station.groupId] = {
              subGroupItems: [station],
              isOpen: isGroupOpen,
              groupLabel: subGroup.name,
              id: subGroup.id,
            };
          }
          return groupedStations;
        }

        return {
          ...groupedStations,
          [station.factoryId]: {
            groupItems: {
              [station.groupId]: {
                subGroupItems: [station],
                isOpen: isGroupOpen,
                groupLabel: subGroup.name,
                id: subGroup.id,
              },
            },
            isOpen: isGroupOpen,
            groupLabel: group.name,
            id: group.id,
          },
        };
      }, {});

      // if only one group and subgroup are present, open them by default
      const groupKeys = Object.keys(groupedStationsMap);
      if (!this.search.length && groupKeys.length === 1) {
        const firstItem = groupedStationsMap[groupKeys[0]];
        firstItem.isOpen = true;

        const subGroupKeys = Object.keys(firstItem.groupItems);
        firstItem.groupItems[subGroupKeys[0]].isOpen = true;
      }

      return Object.values(groupedStationsMap);
    },
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog']),
    matchesSearch(text) {
      return String(text).toLowerCase().includes(String(this.search).toLowerCase());
    },
    onSelectStation(stationId) {
      this.$router.push({ name: 'shiftview', params: { stationId } }).catch((e) => e);
      this.closeDialog();
    },
  },
};
</script>

<style lang="scss" scoped>
.station-select {
  max-height: calc(var(--app-height) * 0.9px - 204px);
  overflow-y: auto;

  &--tablet {
    max-height: calc(var(--app-height) * 1px - 192px);
  }

  &--mobile {
    max-height: calc(var(--app-height) * 1px - 164px);
  }
}
</style>
