<template>
  <div class="bg-black rounded d-flex flex-column overflow-hidden" :class="paddingClass">
    <shift-view-skeleton-loader v-if="loading" />
    <template v-else>
      <div class="d-flex align-center">
        <div class="tabs-flex-wrapper">
          <widget-tabs-row
            :model-value="currentIndex"
            :widgets-list="widgetsList"
            dark
            :height="large ? 44 : 33"
            :size-class="large ? 'text-headline-small' : ''"
            background-color="black"
            show-arrows
            @update:model-value="setCurrentIndex"
          />
        </div>
        <evocon-v-button
          v-if="openInBottomSheet"
          :icon="mdiArrowExpand"
          color="white"
          size="small"
          @click="openWidgetsSheet"
        />
      </div>
      <widget-renderer
        v-if="widgetsList.length"
        :widget="widgetsList[currentIndex]"
        :widget-key="widgetKey"
        :large="large"
        :value-class="widgetValueClass"
      />
    </template>
  </div>
</template>
<script setup name="WidgetHolder">
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { mdiArrowExpand } from '@mdi/js';

import { useShiftViewWidgetsStore } from '@/stores/index';
import ShiftViewSkeletonLoader from '@/components/atoms/ShiftViewSkeletonLoader/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import WidgetTabsRow from '@/components/molecules/WidgetTabsRow/index.vue';
import WidgetRenderer from '@/components/molecules/WidgetRenderer/index.vue';
import ShiftViewWidgetsBottomSheet from '@/components/organisms/shiftview/ShiftViewWidgetsBottomSheet/index.vue';
import useBottomSheetStore from '@/stores/bottomSheet';

const shiftViewWidgetsStore = useShiftViewWidgetsStore();
const { t } = useI18n();
const bottomSheetStore = useBottomSheetStore();

const props = defineProps({
  loading: Boolean,
  widgetKey: {
    type: Number,
    default: 0,
  },
  defaultActiveTab: {
    type: Number,
    default: 0,
  },
  large: {
    type: Boolean,
  },
  widgetValueClass: {
    type: String,
    default: '',
  },
  openInBottomSheet: Boolean,
});

const paddingClass = computed(() => {
  if (props.loading) return '';
  return props.large ? 'pa-4' : 'pa-2';
});

const currentIndex = computed(() => shiftViewWidgetsStore.getActiveIndex(props.widgetKey));

const setCurrentIndex = (index) => {
  shiftViewWidgetsStore.setIndex({
    widgetKey: props.widgetKey,
    index,
  });
};

const widgetsList = computed(() => shiftViewWidgetsStore.widgetsList);

const openWidgetsSheet = () => {
  bottomSheetStore.openBottomSheet({
    component: ShiftViewWidgetsBottomSheet,
    componentProps: { widgetKey: props.widgetKey },
    title: t('Metrics'),
    height: 360,
  });
};

onMounted(() => {
  if (props.defaultActiveTab) {
    shiftViewWidgetsStore.setIndex({
      widgetKey: props.widgetKey,
      index: props.defaultActiveTab,
    });
  }
});
</script>
<style lang="scss" scoped>
.tabs-flex-wrapper {
  flex: 1 1 0;
  min-width: 0;
}
</style>
