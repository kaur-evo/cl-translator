<template>
  <div :class="paddingClass" class="bg-black d-flex flex-column flex-grow-1 rounded">
    <shift-view-skeleton-loader v-if="loading" />
    <template v-else>
      <div class="position-relative d-flex align-center" :class="headerBottomMarginClass">
        <div class="title-wrapper" :class="{ 'title-wrapper--large': large }">
          <evocon-v-button
            v-if="batchList.length > 1"
            :icon="mdiChevronLeft"
            :disabled="index === 0"
            color="white"
            :size="buttonSize"
            @click="index--"
          />
          <div
            class="shift-view-label mx-1"
            :class="{ 'large-label': large }"
          >
            {{ batchList[index]?.title }}
          </div>
          <evocon-v-button
            v-if="batchList.length > 1"
            :icon="mdiChevronRight"
            :disabled="index === batchList.length - 1"
            color="white"
            :size="buttonSize"
            @click="index++"
          />
        </div>
        <evocon-v-button
          v-if="!expanded"
          :icon="mdiArrowExpand"
          color="white"
          :size="buttonSize"
          class="expand-btn"
          @click="emit('click:expand', batchList[index].key)"
        />
      </div>
      <div class="widget-container flex-grow-1">
        <component
          :is="activeComponentData?.component"
          v-if="activeComponentData?.component"
          v-bind="activeComponentData.props"
        />
      </div>
    </template>
  </div>
</template>
<script setup name="ShiftViewBatchWidgetBlock">
import { useI18n } from 'vue-i18n';
import { ref, computed, watch } from 'vue';
import { mdiArrowExpand, mdiChevronLeft, mdiChevronRight } from '@mdi/js';

import ShiftViewSkeletonLoader from '@/components/atoms/ShiftViewSkeletonLoader/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import PreviousProducts from '@/components/organisms/shiftview/PreviousProducts/index.vue';
import CurrentBatch from '@/components/organisms/shiftview/CurrentBatch/index.vue';
import NextProducts from '@/components/organisms/shiftview/NextProducts/index.vue';
import { useConfigurationStore } from '@/stores';

const configurationStore = useConfigurationStore();
const { t } = useI18n();

const emit = defineEmits(['click:expand']);

const props = defineProps({
  loading: Boolean,
  large: Boolean,
  showCurrentBatch: Boolean,
  expanded: Boolean,
  valueClass: {
    type: String,
    default: '',
  },
  progressType: {
    type: String,
    default: 'circle',
  },
  buttonSize: {
    type: String,
    default: 'default',
  },
  headerBottomMarginClass: {
    type: String,
    default: 'mb-1',
  },
});

const paddingClass = computed(() => {
  if (props.loading) return '';
  return props.large ? 'pa-4' : 'pa-2';
});

const ordersTabExists = computed(() => configurationStore.productChangeTabs.includes('orders'));

const batchList = computed(() => {
  const list = [{ key: 'completed', title: t('Completed batches') }];

  if (props.showCurrentBatch) {
    list.push({ key: 'current', title: t('Current batch') });
  }
  if (ordersTabExists.value) {
    list.push({ key: 'upcoming', title: t('Upcoming batches') });
  }
  return list;
});

const index = ref(0);

watch(batchList, (newList) => {
  // If showCurrentBatch is true - default index should be 1 (current batch)
  // If showCurrentBatch is false and orders exist - default index should be 1 (upcoming batches)
  // In other cases default index should be 0 (completed batches)
  index.value = newList.length > 1 ? 1 : 0;
}, { immediate: true });

const activeComponentData = computed(() => {
  const key = batchList.value[index.value]?.key;

  if (key === 'completed') {
    return { component: PreviousProducts, props: { valueClass: props.valueClass } };
  }
  if (key === 'current') {
    return { component: CurrentBatch, props: { progressType: props.progressType, expanded: props.expanded, valueClass: 'text-body-medium' } };
  }
  if (key === 'upcoming') {
    return { component: NextProducts, props: { valueClass: props.valueClass } };
  }
  return null;
});
</script>
<style lang="scss" scoped>
.title-wrapper {
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;

  &--large {
    min-height: 40px;
  }
}

.expand-btn {
  position: absolute;
  right: 0;
}

.widget-container {
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgb(var(--v-theme-primary-dark)) transparent;
}
</style>
