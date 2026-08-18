<template>
  <div class="d-flex flex-wrap px-3 py-1">
    <evocon-input-chip
      :model-value="filter.search"
      :placeholder="$t('Name')"
      :prepend-inner-icon="mdiMagnify"
      :append-inner-icon="filter.search.length ? mdiCloseCircle : null"
      is-dynamic-chip
      class="ma-1"
      @click:append-inner="$emit('update:filter', { search: '' })"
      @update:model-value="$emit('update:filter', { search: $event })"
      @update:input-chip-opened="$emit('update:input-chip-opened')"
    />
    <selection-input
      v-if="hasMultipleFactories"
      :model-value="filter.factoryIds"
      :items="factories"
      :prepend-text="`${$t('Factories')}:`"
      :prepend-inner-icon="mdiDomain"
      show-empty-array-as-all-selected
      remove-non-existent-selections
      use-chips
      menu-input-class="ma-1"
      @update:model-value="$emit('update:filter', { factoryIds: $event })"
    />
    <selection-input
      :model-value="filter.stationIds"
      :items="filteredStations"
      :groups="stationGroups"
      :prepend-text="`${$t('Stations')}:`"
      :prepend-inner-icon="mdiMonitor"
      show-empty-array-as-all-selected
      remove-non-existent-selections
      is-grouped-select
      use-chips
      menu-input-class="ma-1"
      @update:model-value="$emit('update:filter', { stationIds: $event })"
    />
    <selection-input
      :model-value="filter.roles"
      :items="visibleUserRoles"
      :prepend-text="`${$t('Roles')}:`"
      :prepend-inner-icon="mdiClipboardAccount"
      show-empty-array-as-all-selected
      use-chips
      menu-input-class="ma-1"
      @update:model-value="$emit('update:filter', { roles: $event })"
    />
  </div>
</template>
<script setup name="ShareDashboardDialogFilter">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import {
  mdiMagnify, mdiCloseCircle, mdiDomain, mdiMonitor, mdiClipboardAccount,
} from '@mdi/js';

import { LINEVIEW_USER } from '@/constants/userRoles';
import EvoconInputChip from '@/components/atoms/EvoconInputChip/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import { useProfileStore, useFactoryStore, useStationStore } from '@/stores/index';

const profileStore = useProfileStore();
const factoryStore = useFactoryStore();
const stationStore = useStationStore();

const props = defineProps({
  filter: {
    type: Object,
    required: true,
  },
});

defineEmits(['update:filter', 'update:input-chip-opened']);

const visibleUserRoles = computed(() => profileStore.visibleUserRolesFormatted.filter((role) => role.id !== LINEVIEW_USER));
const { hasMultipleFactories, factories } = storeToRefs(factoryStore);
const { stationGroups } = storeToRefs(stationStore);
const filteredStations = computed(() => stationStore.stations.filter((station) => !props.filter.factoryIds?.length || props.filter.factoryIds.includes(station.factoryId)));

onMounted(async () => {
  if (!visibleUserRoles.value.length) await profileStore.fetchVisibleRoles();
});
</script>
