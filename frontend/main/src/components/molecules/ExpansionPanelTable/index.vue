<template>
  <v-expansion-panel>
    <v-expansion-panel-title>
      <v-icon v-if="icon" size="24" class="mr-4">
        {{ icon }}
      </v-icon>
      <div>
        <div class="text-body-large font-weight-bold">
          {{ title }}
        </div>
        <div class="text-body-medium text-secondary-text">
          {{ description }}
        </div>
      </div>
    </v-expansion-panel-title>
    <v-expansion-panel-text class="expansion-panel-text">
      <evocon-v-table
        v-if="items.length || tableEmptyText"
        v-model:options="options"
        :headers="headers"
        :items="items"
        :empty-view-header="tableEmptyText"
        width="auto"
        height="auto"
        hide-default-footer
        are-rows-clickable
        @row-click="emit('edit', $event)"
      >
        <template #row-actions="rowActionsProps">
          <span class="d-block text-align-end">
            <v-icon
              v-if="hasWarning(rowActionsProps)"
              color="warning"
              class="my-auto mx-2"
            >
              {{ mdiAlert }}
            </v-icon>
            <icon-with-tooltip
              v-if="hasDelete"
              :icon="mdiDelete"
              :tooltip-text="$t('Delete')"
              :button-size="compact ? 'small' : 'default'"
              tooltip-location="bottom"
              additional-classes="mx-2"
              :icon-clicked-fn="() => onDelete(rowActionsProps)"
            />
            <icon-with-tooltip
              v-if="hasEdit"
              :icon="mdiPencil"
              :tooltip-text="$t('Edit')"
              :button-size="compact ? 'small' : 'default'"
              tooltip-location="bottom"
              additional-classes="mx-2"
              :icon-clicked-fn="() => emit('edit', rowActionsProps)"
            />
          </span>
        </template>
      </evocon-v-table>
      <div v-if="addButtonText" class="d-flex justify-start">
        <evocon-v-button
          id="add-item-btn"
          :icon="mdiPlus"
          color="quaternary-dark"
          class="mt-2"
          :disabled="addBtnDisabled"
          :size="compact ? 'small' : 'default'"
          :text="addButtonText"
          @click="emit('edit')"
        />
      </div>
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>
<script setup>
import { mdiPencil, mdiDelete, mdiPlus, mdiAlert } from '@mdi/js';
import { reactive, computed } from 'vue';

import EvoconVTable from '@/components/molecules/EvoconVTable/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import IconWithTooltip from '@/components/atoms/IconWithTooltip/index.vue';

const props = defineProps({
  icon: {
    type: String,
    default: null,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  addButtonText: {
    type: String,
    default: null,
  },
  tableEmptyText: {
    type: String,
    default: null,
  },
  headers: {
    type: Array,
    required: true,
  },
  items: {
    type: Array,
    default: () => [],
  },
  warningKey: {
    type: String,
    default: null,
  },
  showEdit: {
    type: Boolean,
    default: false,
  },
  showDelete: {
    type: Boolean,
    default: false,
  },
  compact: {
    type: Boolean,
    default: false,
  },
  addBtnDisabled: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(['edit', 'delete']);
const options = reactive({
  sortBy: { key: 'startDate', order: 'desc' },
  itemsPerPage: -1,
});
const hasEdit = computed(() => props.showEdit);
const hasDelete = computed(() => props.showDelete);
const hasWarning = (rowActionsProps) => props.warningKey && rowActionsProps.item[props.warningKey];
const onDelete = (rowActionsProps) => {
  emit('delete', rowActionsProps);
};
</script>
<style scoped lang="scss">
.expansion-panel-text {
  :deep(.v-expansion-panel-text__wrapper) {
    padding: 8px 16px 16px 16px;
  }
}
</style>
