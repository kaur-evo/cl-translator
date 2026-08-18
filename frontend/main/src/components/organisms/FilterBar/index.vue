<template>
  <div class="d-flex align-center">
    <div class="d-flex flex-wrap align-center flex-grow-1">
      <filter-bar-filter
        v-for="(filter) in visibleFilters()"
        :key="filter"
        :filter="filter"
        :limit="filterItemLimit"
        :use-chips="useChips"
      />
      <slot name="notification" />
      <div v-if="!isMobileView" class="filter-bar__extra-actions">
        <v-menu
          :disabled="!notAppliedFilters.length"
          min-width="200"
        >
          <template #activator="{ props }">
            <evocon-v-button
              v-if="hasFilterBtn"
              class="mx-1"
              type="primary-light"
              :text="$t('Filter_noun')"
              :icon="mdiPlus"
              depressed
              :disabled="!notAppliedFilters.length"
              size="small"
              v-bind="props"
            />
          </template>
          <single-select-list
            :items="notAppliedFilters"
            item-text="label"
            dense
            icon-key="attr.prependInnerIcon"
            @select="updateFilterSelection($event.name)"
          />
        </v-menu>
        <evocon-v-button
          v-if="!hideResetBtn"
          class="mx-1"
          type="secondary"
          :disabled="isResetBtnDisabled"
          :text="$t('Reset')"
          size="small"
          @click="onResetClick"
        />
      </div>
    </div>
    <evocon-v-button
      v-if="isMobileView"
      :icon="mdiFilter"
      :color="iconColor"
      class="ml-1"
      size="small"
      @click="openFiltersDialog"
    />
  </div>
</template>
<script>
import { mdiDelete, mdiPlus, mdiFilter } from '@mdi/js';
import { mapActions, mapState } from 'pinia';
import { defineAsyncComponent } from 'vue';
import { isEqual } from 'lodash';

import FilterBarFilter from '@/components/organisms/FilterBarFilter/index.vue';
import SingleSelectList from '@/components/molecules/SingleSelectList/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import useBookmarkStore from '@/stores/bookmark';
import useDeviceStore from '@/stores/device';
import useFilterbarStore from '@/stores/filterbar';
import useGenericDialogStore from '@/stores/genericDialog';

const vectorIcons = { mdiDelete, mdiPlus, mdiFilter };

export default {
  name: 'FilterBar',
  components: {
    FilterBarFilter,
    SingleSelectList,
    EvoconVButton,
  },
  props: {
    filterConfiguration: { type: Map, required: true },
    defaultFilters: { type: Object, default: () => {} },
    filterItemLimit: { type: Number, default: 1000 },
    useChips: { type: Boolean },
    disabledFilters: { type: Array, default: () => [] },
    hideResetBtn: { type: Boolean, default: false },
    persistentFilters: { type: Array, default: () => [] },
  },
  emits: ['on-reset-clicked'],
  data() {
    return {
      ...vectorIcons,
    };
  },
  computed: {
    ...mapState(useFilterbarStore, ['requestFilterState', 'calculatedFilterConfig', 'visibleFilters', 'notAppliedFilters']),
    ...mapState(useBookmarkStore, ['currentBookmark', 'isCurrentBookmarkModified']),
    ...mapState(useDeviceStore, ['isMobileView']),
    vueQueryObj() {
      return this.$route && this.$route.query;
    },
    hasFilterBtn() {
      const filters = [...this.calculatedFilterConfig.values()];
      const removableFilters = filters.filter((filter) => filter.removable);
      return removableFilters.length > 0;
    },
    hasFilterApplied() {
      return this.visibleFilters(true).find((filter) => {
        const filterValue = this.requestFilterState[filter];
        const currentFilterConfig = this.calculatedFilterConfig.get(filter);
        const defaultValue = currentFilterConfig?.defaultValue ?? null;
        const isRemovable = currentFilterConfig?.removable ?? false;
        if (defaultValue) return !isEqual(filterValue, defaultValue) || isRemovable;
        return !!filterValue && Array.isArray(filterValue) && filterValue.length > 0;
      });
    },
    iconColor() {
      return this.hasFilterApplied ? 'primary' : '';
    },
    isResetBtnDisabled() {
      if (this.currentBookmark) {
        return !this.isCurrentBookmarkModified(this.$route.href);
      }
      return !this.hasFilterApplied;
    },
  },
  watch: {
    vueQueryObj(newVal) {
      if (!newVal || Object.keys(newVal).length === 0) return;
      // basically everything is triggered by this
      this.setReactiveFilterState({
        filterConfiguration: this.filterConfiguration,
        defaultFilters: this.defaultFilters,
        disabledFilters: this.disabledFilters,
      });
    },
    disabledFilters() {
      this.setReactiveFilterState({
        filterConfiguration: this.filterConfiguration,
        defaultFilters: this.defaultFilters,
        disabledFilters: this.disabledFilters,
      });
    },
    filterConfiguration() {
      this.setReactiveFilterState({
        filterConfiguration: this.filterConfiguration,
        defaultFilters: this.defaultFilters,
        disabledFilters: this.disabledFilters,
      });
    },
    isMobileView(newVal, oldVal) {
      if (!newVal && !!oldVal) {
        this.visibleFilters().forEach((filter) => {
          const isRemovable = this.calculatedFilterConfig.get(filter).removable === true;
          const { defaultValue } = this.calculatedFilterConfig.get(filter);
          const filterValue = this.requestFilterState[filter];
          if (isRemovable && isEqual(filterValue, defaultValue)) {
            this.removeFilter(filter);
          }
        });
      }
      this.initialize({
        filterConfiguration: this.filterConfiguration,
        defaultFilters: this.defaultFilters,
        disabledFilters: this.disabledFilters,
        isMobileFilterBar: newVal,
        persistentFilters: this.persistentFilters,
      });
    },
  },
  created() {
    this.initialize({
      filterConfiguration: this.filterConfiguration,
      defaultFilters: this.defaultFilters,
      disabledFilters: this.disabledFilters,
      isMobileFilterBar: this.isMobileView,
      persistentFilters: this.persistentFilters,
    });
  },
  methods: {
    ...mapActions(useFilterbarStore, [
      'initialize',
      'setReactiveFilterState',
      'updateFilterSelection',
      'updateFilterValue',
      'triggerDataRequest',
      'removeFilter',
    ]),
    ...mapActions(useGenericDialogStore, ['openDialog']),
    openFiltersDialog() {
      this.openDialog({
        component: defineAsyncComponent(() => import('@/components/organisms/MobileFilterBarDialog/index.vue')),
        data: { limit: this.filterItemLimit, filterConfiguration: this.filterConfiguration },
      });
    },
    onResetClick() {
      if (this.currentBookmark) {
        window.location.hash = this.currentBookmark.url;
      } else {
        this.visibleFilters().forEach((filter) => {
          const currentFilterConfig = this.calculatedFilterConfig.get(filter);
          if (currentFilterConfig.removable) this.removeFilter(filter);
          else this.updateFilterValue({ [filter]: currentFilterConfig.defaultValue });
        });
        this.triggerDataRequest();
      }
      this.$emit('on-reset-clicked');
    },
  },
};
</script>

<style lang="less" scoped>
.filter-bar__extra-actions {
  height: 40px;
  display: flex;
  align-items: center;
}
</style>
