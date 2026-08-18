<template>
  <dialog-template :title="$t('Filters')" color="primary-dark">
    <template #content>
      <div
        v-for="filter in filteredFilters"
        :key="filter"
        class="my-4"
      >
        <filter-bar-filter
          :filter="filter"
          :limit="dialogData.limit"
          dense
        />
      </div>
      <div class="d-flex justify-end full-width pr-2">
        <evocon-v-button
          type="secondary"
          :disabled="!isResetEnabled"
          :text="$t('Reset')"
          size="small"
          @click="onReset"
        />
      </div>
    </template>
    <template #actions>
      <v-spacer />
      <evocon-v-button
        :text="$t('Cancel')"
        type="secondary"
        size="small"
        @click="onCancel"
      />
      <evocon-v-button
        :text="$t('Apply')"
        color="primary"
        size="small"
        @click="onSave"
      />
    </template>
  </dialog-template>
</template>
<script setup name="MobileFilterBarDialog">
import { computed, watch } from 'vue';
import { isEqual } from 'lodash';

import UrlParams from '@/helpers/UrlParams';
import DialogTemplate from '@/components/templates/DialogTemplate/index.vue';
import FilterBarFilter from '@/components/organisms/FilterBarFilter/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import useBookmarkStore from '@/stores/bookmark';
import useDeviceStore from '@/stores/device';
import useFilterbarStore from '@/stores/filterbar';
import useGenericDialogStore from '@/stores/genericDialog';

const bookmarkStore = useBookmarkStore();
const deviceStore = useDeviceStore();
const filterbarStore = useFilterbarStore();
const genericDialogStore = useGenericDialogStore();

const visibleFilters = computed(() => filterbarStore.visibleFilters(true).filter((filter) => filter !== 'search' && filter !== 'period'));
const isMobileView = computed(() => deviceStore.isMobileView);
const dialogData = computed(() => genericDialogStore.dialogData);
const currentFilterState = computed(() => filterbarStore.currentFilterState);
const isUserBookmark = computed(() => bookmarkStore.isUserBookmark);
const currentBookmark = computed(() => bookmarkStore.currentBookmark);
const bookmarkParams = computed(() => new UrlParams(currentBookmark?.value?.url));
const calculatedFilterConfig = computed(() => filterbarStore.calculatedFilterConfig);

const isResetEnabled = computed(() => !!visibleFilters.value.find((filter) => {
  const currentVal = currentFilterState.value[filter];
  const currentFilterConfig = calculatedFilterConfig.value.get(filter);
  const defaultValue = currentFilterConfig?.defaultValue ?? [];
  return isUserBookmark.value ? !isEqual(currentVal, bookmarkParams.value.get(filter)) : !isEqual(currentVal, defaultValue);
}));

const filteredFilters = computed(() => visibleFilters.value.filter((filter) => {
  const { visibleFilterValues } = calculatedFilterConfig.value.get(filter);
  if (!visibleFilterValues) return true;
  return Object.entries(visibleFilterValues).some(([key, val]) => currentFilterState.value[key][0] === val);
}));

const onCancel = () => {
  filterbarStore.cancelFilterChange();
  genericDialogStore.closeDialog();
};

const onSave = () => {
  filterbarStore.triggerDataRequest();
  genericDialogStore.closeDialog();
};

const onReset = () => {
  visibleFilters.value.forEach((filter) => {
    const currentFilterConfig = calculatedFilterConfig.value.get(filter);
    const newValue = isUserBookmark.value ? bookmarkParams.value.get(filter) : currentFilterConfig?.defaultValue ?? [];
    filterbarStore.updateFilterValue({ [filter]: newValue });
  });
};

watch(isMobileView, (newVal, prevVal) => {
  if (prevVal) genericDialogStore.closeDialog();
});
</script>
