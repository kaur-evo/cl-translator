<template>
  <div class="pa-4 pt-2 d-flex flex-column flex-grow-1">
    <div class="bg-black pa-2 rounded d-flex flex-column flex-grow-1">
      <widget-tabs-row
        :model-value="currentIndex"
        :widgets-list="widgetsList"
        size-class="text-body-medium"
        show-arrows
        @update:model-value="setCurrentIndex"
      />
      <widget-renderer
        v-if="widgetsList.length"
        :widget="widgetsList[currentIndex]"
        :widget-key="widgetKey"
        large
      />
    </div>
  </div>
</template>
<script setup name="ShiftViewWidgetsBottomSheet">
import { computed } from 'vue';

import WidgetTabsRow from '@/components/molecules/WidgetTabsRow/index.vue';
import WidgetRenderer from '@/components/molecules/WidgetRenderer/index.vue';
import { useShiftViewWidgetsStore } from '@/stores';

const shiftViewWidgetsStore = useShiftViewWidgetsStore();

const props = defineProps({
  widgetKey: {
    type: Number,
    default: 0,
  },
});

const currentIndex = computed(() => shiftViewWidgetsStore.getActiveIndex(props.widgetKey));

const setCurrentIndex = (index) => {
  shiftViewWidgetsStore.setIndex({
    widgetKey: props.widgetKey,
    index,
  });
};

const widgetsList = computed(() => shiftViewWidgetsStore.widgetsList);
</script>
