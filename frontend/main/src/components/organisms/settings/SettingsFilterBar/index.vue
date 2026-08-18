<template>
  <div class="d-flex" :class="isMobileView ? 'flex-column' : 'flex-row align-center'">
    <filter-bar
      :filter-configuration="filterConfiguration"
      :hide-reset-btn="hideResetBtn"
      use-chips
      :persistent-filters="['stationId', 'factoryId']"
    >
      <template #notification>
        <slot v-if="!isMobileView" name="notification" />
      </template>
    </filter-bar>
    <evocon-v-toggle-button
      v-if="toggleBtnItems.length > 0"
      :items="toggleBtnItems"
      :model-value="toggleBtnValue"
      value-key="id"
      :is-compact="$vuetify.display.mdAndDown && !isMobileView"
      :class="{ 'full-width ma-1': isMobileView }"
      @update:model-value="$emit('update:toggle-btn-value', $event)"
    />
  </div>
</template>
<script>
import { mapState } from 'pinia';

import useDeviceStore from '@/stores/device';
import FilterBar from '@/components/organisms/FilterBar/index.vue';
import EvoconVToggleButton from '@/components/molecules/EvoconVToggleButton/index.vue';
import settingsBuiltInViewTypes from '@/components/pages/settings/SettingsEntitiesOverview/settingsBuiltInViewTypes';

export default {
  name: 'SettingsFilterBar',
  components: {
    FilterBar,
    EvoconVToggleButton,
  },
  props: {
    filterConfiguration: {
      type: Map,
      default: new Map(),
    },
    toggleBtnItems: { type: Array, default: () => [] },
    toggleBtnValue: { type: [Number, String], default: settingsBuiltInViewTypes.LIST },
    hideResetBtn: { type: Boolean },
  },
  emits: ['update:toggle-btn-value'],
  computed: {
    ...mapState(useDeviceStore, ['isMobileView']),
  },
};
</script>
