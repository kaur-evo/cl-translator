<template>
  <selection-input
    :model-value="modelValue"
    v-bind="$attrs"
    :items="stationsList"
    :groups="groups"
    :placeholder="$t('Stations')"
    :hint="$t('Stations')"
    is-grouped-select
    remove-non-existent-selections
    @update:model-value="$emit('update:model-value', $event)"
  />
</template>
<script>
import { mapState } from 'pinia';

import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import useStationStore from '@/stores/station';

export default {
  name: 'GlobalStationSelect',
  components: { SelectionInput },
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
    groupsOverride: {
      type: Array,
      default: null,
    },
    itemsOverride: {
      type: Array,
      default: null,
    },
  },
  emits: ['update:model-value'],
  computed: {
    ...mapState(useStationStore, ['stationGroups', 'stations']),
    groups() {
      return this.groupsOverride === null ? this.stationGroups : this.groupsOverride;
    },
    stationsList() {
      return this.itemsOverride === null ? this.stations : this.itemsOverride;
    },
  },
};
</script>
