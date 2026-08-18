<template>
  <generic-tabs-row
    :model-value="modelValue"
    :items="widgetsList"
    :not-clickable="widgetsList.length === 1"
    :tab-name-fn="getTabName"
    :dark="dark"
    :height="height"
    :size-class="sizeClass"
    :background-color="backgroundColor"
    :show-arrows="showArrows"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <template #append-inner="{ currentTab }">
      <span v-if="currentTab.component === 'performance-widget'" class="d-inline-block">
        <menu-with-button-activator
          :value="perfWidgetType"
          :items="performanceChartConfigList"
          :button-icon="mdiMenuDown"
          button-classes="mt-n2 mb-n2"
          button-icon-color="white"
          location="bottom left"
          offset="6"
          has-checkbox
          is-single-select
          primary-text-field="label"
          value-key="value"
          size="small"
          button-type="secondary"
          list-width="auto"
          @item-clicked="updatePerformanceWidgetType"
        />
      </span>
    </template>
  </generic-tabs-row>
</template>
<script setup name="WidgetTabsRow">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { mdiMenuDown } from '@mdi/js';

import { useShiftViewWidgetsStore, useUserPreferencesStore } from '@/stores/index';
import GenericTabsRow from '@/components/molecules/GenericTabsRow/index.vue';
import MenuWithButtonActivator from '@/components/molecules/MenuWithButtonActivator/index.vue';

const shiftViewWidgetsStore = useShiftViewWidgetsStore();
const userPreferencesStore = useUserPreferencesStore();
const { t } = useI18n();

const props = defineProps({
  modelValue: {
    type: Number,
    required: true,
  },
  widgetsList: {
    type: Array,
    required: true,
  },
  dark: Boolean,
  height: {
    type: Number,
    default: 33,
  },
  sizeClass: {
    type: String,
    default: '',
  },
  backgroundColor: {
    type: String,
    default: 'black',
  },
  showArrows: Boolean,
});

defineEmits(['update:model-value']);

const perfWidgetType = computed(() => shiftViewWidgetsStore.perfWidgetType);
const viewSettings = computed(() => userPreferencesStore.viewSettings);
const performanceChartConfigList = computed(() => shiftViewWidgetsStore.performanceChartConfigList);

const getTabName = (widget) => {
  if (widget.component === 'performance-widget') {
    return performanceChartConfigList.value.find((x) => x.value === perfWidgetType.value)?.label ?? t('Speed');
  }
  if (widget.config?.widgetTitle) return t(widget.config.widgetTitle);
  return t(widget.name);
};

const updatePerformanceWidgetType = (newType) => {
  userPreferencesStore.saveViewSettings({ ...viewSettings.value, performanceWidgetType: newType.value });
};
</script>
