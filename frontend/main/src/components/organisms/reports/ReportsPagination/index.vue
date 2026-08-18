<template>
  <evocon-v-data-footer
    v-if="isVisible"
    v-model:options="options"
    :items-per-page-options="itemsPerPageOptions"
    :items="items"
    :scroll-into-view="scrollIntoView"
  />
</template>
<script>
import { mapActions, mapState } from 'pinia';
import { isEqual } from 'lodash';

import { useFilterbarStore, useReportsConfigStore } from '@/stores';
import getPaginationConfig from '@/stores/reportsConfig/configurations/paginationConfig';
import EvoconVDataFooter from '@/components/atoms/EvoconVDataFooter/index.vue';

export default {
  name: 'ReportsPagination',
  components: {
    EvoconVDataFooter,
  },
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    scrollIntoView: {
      type: Boolean,
    },
  },
  computed: {
    ...mapState(useFilterbarStore, ['requestFilterState']),
    ...mapState(useReportsConfigStore, ['configType']),

    options: {
      get() {
        return {
          itemsPerPage: Number(this.requestFilterState.itemsPerPage),
          page: Number(this.requestFilterState.page),
          mustSort: true,
        };
      },
      set(newValue) {
        const newItemsPerPage = newValue.itemsPerPage;
        const newPage = newValue.page;
        const isItemsPerPageChanged = !isEqual(newItemsPerPage, Number(this.requestFilterState.itemsPerPage));
        const isPageChanged = !isEqual(newPage, Number(this.requestFilterState.page));
        if (isItemsPerPageChanged || isPageChanged) {
          this.updateFilterValue({
            itemsPerPage: Number(newItemsPerPage),
            page: Number(newPage),
          });
          this.triggerDataRequest();
        }
      },
    },
    itemsPerPageOptions() {
      return getPaginationConfig(this.configType).ITEMS_PER_PAGE_OPTIONS;
    },
    isVisible() {
      return this.itemsPerPageOptions.length > 0 && this.itemsPerPageOptions[0] > 0;
    },
  },
  methods: {
    ...mapActions(useFilterbarStore, ['updateFilterValue', 'triggerDataRequest']),
  },
};
</script>
