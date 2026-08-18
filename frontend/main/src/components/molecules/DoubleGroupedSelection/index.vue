<template>
  <selection-list-search-input
    v-model="search"
    :label="$t('Search')"
    :density="density"
    class="mb-2"
    @keydown.enter="onInputEnterDown"
    @blur="$emit('blur')"
    @update:model-value="$emit('update:search', $event)"
  />
  <v-list v-model:opened="openGroups" class="pa-0" open-strategy="multiple">
    <v-list-item v-if="orderedGroupsList.length === 0 ">
      <v-list-item-subtitle>
        {{ search.length ? $t('No search results') : $t('No data available') }}
      </v-list-item-subtitle>
    </v-list-item>
    <v-list-group
      v-for="(group, index) in orderedGroupsList"
      :key="`group-${index}`"
      :value="`group-value-${group.id}`"
    >
      <template #activator="groupActivator">
        <v-list-item v-bind="groupActivator.props" :density="density">
          <list-item-contents
            :primary-text="group[groupLabelKey]"
            :primary-highlight="search"
            :dense="dense"
          />
        </v-list-item>
      </template>
      <v-list-group
        v-for="(subGroup, subIndex) in group[groupItemsKey]"
        :key="`sub-group-${subIndex}`"
        :value="`sub-group-value-${group.id}-${subGroup.id}`"
        :density="density"
      >
        <template #activator="subGroupActivator">
          <v-list-item v-bind="subGroupActivator.props" :density="density">
            <list-item-contents
              :primary-text="subGroup[groupLabelKey]"
              :primary-highlight="search"
              :dense="dense"
            />
          </v-list-item>
        </template>
        <selection-list-item-group
          :key="search"
          :items="subGroup[subGroupItemsKey]"
          :list-selection="listSelection"
          is-single-select
          :search="search"
          :dense="dense"
          :group-id="subIndex"
          :show-append-on-hover="props.showAppendOnHover"
          @update:model-value="$emit('update:model-value', $event)"
        >
          <template #append="{ item }">
            <slot name="append" :item="item" />
          </template>
        </selection-list-item-group>
      </v-list-group>
    </v-list-group>
  </v-list>
</template>
<script setup name="DoubleGroupedSelection">
import {
  onMounted, ref, computed, watch,
} from 'vue';

import ListSelection from '@/helpers/listSelection/ListSelection';
import ListItemContents from '@/components/molecules/ListItemContents/index.vue';
import SelectionListSearchInput from '@/components/atoms/SelectionListSearchInput/index.vue';
import SelectionListItemGroup from '@/components/molecules/SelectionListItemGroup/index.vue';

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  items: { type: Array, default: () => [] },
  groupedItems: { type: Array, default: () => [] },
  groupItemsKey: { type: String, default: 'groupItems' },
  subGroupItemsKey: { type: String, default: 'subGroupItems' },
  groupLabelKey: { type: String, default: 'groupLabel' },
  listSelectionKey: { type: String, default: 'id' },
  listSelectionText: { type: String, default: 'name' },
  isGroupOpenKey: { type: String, default: 'isOpen' },
  isSingleSelect: { type: Boolean },
  dense: { type: Boolean },
  density: { type: String, default: 'default' },
  inverted: { type: Boolean },
  required: { type: Boolean },
  showAppendOnHover: { type: Boolean, Function },
});

const emit = defineEmits(['update:model-value', 'blur', 'update:search']);

const search = ref('');
const openGroups = ref([]);

const stringSortAsc = (a, b) => String(a).localeCompare(String(b));

const listSelection = computed(() => ListSelection({
  itemsList: props.items,
  selectedValuesList: props.modelValue,
  selectionKey: props.listSelectionKey,
  inverted: props.inverted,
  itemText: props.listSelectionText,
  isSingleSelect: props.isSingleSelect,
  required: props.required,
}));

const orderedGroupsList = computed(() => {
  const groupedItemsCopy = [...props.groupedItems];
  return groupedItemsCopy.sort((a, b) => stringSortAsc(a[props.groupLabelKey], b[props.groupLabelKey]));
});

const onInputEnterDown = () => {
  if (orderedGroupsList.value.length === 1 && Object.values(orderedGroupsList.value[0][props.groupItemsKey]).length === 1) {
    const subGroup = Object.values(orderedGroupsList.value[0][props.groupItemsKey])[0];
    const subGroupItems = subGroup[props.subGroupItemsKey];
    if (subGroupItems.length === 1) {
      emit('update:model-value', [subGroupItems[0].id]);
    }
  }
};

const hasSelectedSubGroupItems = (group) => listSelection.value.areSomeItemsSelected(group[props.subGroupItemsKey]);
const hasSelectedSubGroupItemsInGroup = (group) => Object.values(group[props.groupItemsKey]).some(hasSelectedSubGroupItems);

const updateOpenGroups = () => {
  openGroups.value = orderedGroupsList.value.reduce((acc, group) => {
    if (group[props.isGroupOpenKey] || hasSelectedSubGroupItemsInGroup(group)) {
      acc.push(`group-value-${group.id}`);
      Object.values(group[props.groupItemsKey]).forEach((groupItem) => {
        if (groupItem[props.isGroupOpenKey] || hasSelectedSubGroupItems(groupItem)) {
          acc.push(`sub-group-value-${group.id}-${groupItem.id}`);
        }
      });
    }
    return acc;
  }, []);
};

watch(orderedGroupsList, updateOpenGroups);

onMounted(() => {
  updateOpenGroups();
});
</script>
