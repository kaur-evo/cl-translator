<template>
  <div class="px-2 pb-2 overflow-y-auto">
    <shift-view-shift-quantity-block value-class="text-headline-large" target-class="text-body-medium" />
    <shift-view-batch-widget-block
      class="my-2"
      header-bottom-margin-class="mb-0"
      progress-type="bar"
      show-current-batch
      expanded
    />
    <oee-component
      class="mb-2"
      oee-class="text-headline-large"
      oee-components-class="text-body-medium"
      vertical
      expanded
    />
    <div class="pa-2 bg-black rounded d-flex flex-column widget-container">
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
        value-class="text-headline-large"
      />
    </div>
  </div>
</template>
<script setup name="MobileShiftViewWidgetsDialog">
import { computed } from 'vue';

import ShiftViewShiftQuantityBlock from '@/components/organisms/shiftview/ShiftViewShiftQuantityBlock/index.vue';
import ShiftViewBatchWidgetBlock from '@/components/organisms/shiftview/ShiftViewBatchWidgetBlock/index.vue';
import OeeComponent from '@/components/organisms/shiftview/OeeComponent/index.vue';
import WidgetTabsRow from '@/components/molecules/WidgetTabsRow/index.vue';
import WidgetRenderer from '@/components/molecules/WidgetRenderer/index.vue';
import { useShiftViewWidgetsStore } from '@/stores';

const shiftViewWidgetsStore = useShiftViewWidgetsStore();

const widgetsList = computed(() => shiftViewWidgetsStore.widgetsList);
const currentIndex = computed(() => shiftViewWidgetsStore.getActiveIndex(0));

const setCurrentIndex = (index) => {
  shiftViewWidgetsStore.setIndex({ widgetKey: 0, index });
};
</script>

<style lang="scss" scoped>
$widget-default-height: 250px; // chart + selection row at default zoom

.widget-container {
  height: $widget-default-height;
}
</style>
