<template>
  <filter-bar
    :default-filters="{}"
    :filter-configuration="createFilterConfiguration(translations, firstDayOfWeek)"
    :has-filter-bar-buttons="false"
    use-chips
  >
    <template #toggle-button>
      <evocon-v-toggle-button
        :items="[
          {
            icon: mdiApps,
            text: $t('Grid'),
          },
          {
            icon: mdiFormatListBulleted,
            text: $t('List'),
          },
        ]"
        :model-value="viewIndex"
        :is-compact="$vuetify.display.mdAndDown"
        @update:model-value="$emit('view-changed', $event)"
      />
    </template>
  </filter-bar>
</template>
<script>
import { mapState } from 'pinia';
import { mdiApps, mdiFormatListBulleted } from '@mdi/js';

import { useProfileStore } from '@/stores/index';
import FilterBar from '@/components/organisms/FilterBar/index.vue';
import { createFilterConfiguration } from '@/components/organisms/improvements/ImprovementsFilterBar/ImprovementsFilterBarConf';
import EvoconVToggleButton from '@/components/molecules/EvoconVToggleButton/index.vue';

const icons = { mdiApps, mdiFormatListBulleted };

export default {
  name: 'ImprovementsFilterBar',
  components: {
    FilterBar,
    EvoconVToggleButton,
  },
  props: {
    viewIndex: { type: Number, default: 0 },
  },
  emits: ['view-changed'],
  data() {
    return {
      ...icons,
    };
  },
  computed: {
    ...mapState(useProfileStore, ['firstDayOfWeek']),
    translations() {
      return {
        Search: this.$t('Search by name'),
        Factories: this.$t('Factories'),
        Stations: this.$t('Stations'),
        Team: this.$t('Team'),
      };
    },
  },
  methods: {
    createFilterConfiguration,
  },
};
</script>
