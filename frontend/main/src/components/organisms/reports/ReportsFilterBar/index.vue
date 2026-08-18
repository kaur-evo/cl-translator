<template>
  <filter-bar
    :default-filters="defaultFilters"
    :filter-configuration="filterConfigurationMap"
    :filter-item-limit="FILTER_ITEM_LIMIT"
    :disabled-filters="disabledParams"
    use-chips
    @on-reset-click="onResetClick"
  />
</template>
<script>
import { mapState, mapActions } from 'pinia';

import { useBookmarkStore, useReportsConfigStore } from '@/stores';
import FilterBar from '@/components/organisms/FilterBar/index.vue';
import { FILTER_ITEM_LIMIT } from '@/stores/reportsConfig/configurations/FilterBarConfig';

export default {
  name: 'ReportsFilterBar',
  components: {
    FilterBar,
  },
  data() {
    return {
      FILTER_ITEM_LIMIT,
    };
  },
  computed: {
    ...mapState(useBookmarkStore, ['currentBookmark', 'bookmarkPresetsMap']),
    ...mapState(useReportsConfigStore, ['filterConfiguration', 'disabledParams', 'configType']),
    reportsConfigStore() {
      return useReportsConfigStore();
    },
    defaultFilters() {
      const type = this.configType;
      if (this.bookmarkPresetsMap[type] === undefined) {
        return this.bookmarkPresetsMap[Object.keys(this.bookmarkPresetsMap)[0]].defaults;
      }
      return this.bookmarkPresetsMap[type].defaults;
    },
    filterConfigurationMap() {
      return this.filterConfiguration(this.configType);
    },
  },
  mounted() {
    this.setFilterEntityCounts();
  },
  methods: {
    ...mapActions(useReportsConfigStore, ['setFilterEntityCounts']),
    onResetClick() {
      if (this.currentBookmark) {
        this.reportsConfigStore.hiddenGroupingValues = [];
      }
    },
  },
};
</script>
