<template>
  <div class="d-flex align-center tabs-container">
    <v-icon
      v-if="showArrows"
      class="mx-3"
      :color="leftArrowEnabled ? 'white' : 'grey'"
      @click="moveLeft"
    >
      {{ mdiChevronLeft }}
    </v-icon>
    <draggable
      v-model="tabsCopy"
      item-key="id"
      :disabled="!draggingEnabled"
      class="draggable-tabs"
      @change="onOrderChange"
    >
      <template #item="{ element, index }">
        <div
          v-ripple
          class="draggable-tabs__tab"
          :class="{
            'draggable-tabs__tab--selected': index === selectedTabIndex,
          }"
          @click="$emit('update:selectedTabIndex', index)"
        >
          <v-icon
            v-if="draggingEnabled"
            size="16"
            class="drag-icon"
            color="secondary-dark"
          >
            {{ mdiDragVertical }}
          </v-icon>
          <span :class="index === selectedTabIndex ? 'text-primary-text' : 'text-quaternary-dark-2'"> {{ element[textValue] }} </span>
          <slot name="tab-append" :tab="element" />
        </div>
      </template>
    </draggable>
    <v-icon
      v-if="showArrows"
      class="mx-3"
      :color="rightArrowEnabled ? 'white' : 'grey'"
      @click="moveRight"
    >
      {{ mdiChevronRight }}
    </v-icon>
  </div>
</template>

<script setup name="DraggableTabs">
import {
  ref, onMounted, onUnmounted, watch, nextTick, toRefs,
} from 'vue';
import draggable from 'vuedraggable';
import { mdiChevronLeft, mdiChevronRight, mdiDragVertical } from '@mdi/js';

const props = defineProps({
  tabs: {
    type: Array,
    default: () => [],
  },
  selectedTabIndex: {
    type: Number,
    default: 0,
  },
  textValue: {
    type: String,
    default: 'name',
  },
  draggingEnabled: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(['update:selectedTabIndex', 'update:tabs']);

const { tabs } = toRefs(props);
// eslint-disable-next-line
const tabsCopy = ref([...tabs.value]);
const containerWidth = ref(0);
const leftArrowEnabled = ref(false);
const rightArrowEnabled = ref(true);
const showArrows = ref(false);

const setShowArrows = () => {
  const tabsContainer = document.querySelector('.tabs-container');
  const draggableTabs = document.querySelector('.draggable-tabs');
  containerWidth.value = tabsContainer?.offsetWidth;
  const val = draggableTabs?.scrollWidth > tabsContainer?.scrollWidth;
  showArrows.value = val;
};

watch(
  () => props.tabs,
  (newVal) => {
    tabsCopy.value = [...newVal];
    setShowArrows();
  },
);

watch(
  () => props.selectedTabIndex,
  async (newVal) => {
    await nextTick();
    const selectedTabEl = document.querySelectorAll('.draggable-tabs__tab')[
      newVal
    ];
    selectedTabEl.scrollIntoView({ behavior: 'smooth' });
  },
);

onMounted(async () => {
  await nextTick();
  setShowArrows();

  window.addEventListener('resize', setShowArrows);
});

onUnmounted(() => {
  window.removeEventListener('resize', setShowArrows);
});

const onOrderChange = ({ moved }) => {
  const { selectedTabIndex } = props;
  const { oldIndex } = moved; // Old index number of tab we are moving
  const { newIndex } = moved; // New index number of tab we are moving
  let tabActive = null; // The new tab which can be set as active tab
  /**
   * This is description for each if condition with corresponding number
   * 1. Check if tab moved is the active one
   * 2. Check if tab moved is placed on active tab from right side
   * 3. Check if tab moved is placed on active tab from left side
   * 4. Check if tab moved was on the right side of active tab and did not affect it
   * 5 .Check if tab moved was on the left side of active tab and did not affect it
   * 4. Check if tab moved to right side of active tab
   * 5. Check if tab moved to left side of active tab
   */
  if (selectedTabIndex === oldIndex) {
    tabActive = newIndex;
  } else if (selectedTabIndex === newIndex && selectedTabIndex < oldIndex) {
    tabActive = selectedTabIndex + 1;
  } else if (selectedTabIndex === newIndex && selectedTabIndex > oldIndex) {
    tabActive = selectedTabIndex - 1;
  } else if (selectedTabIndex > oldIndex && selectedTabIndex > newIndex) {
    tabActive = selectedTabIndex;
  } else if (selectedTabIndex < oldIndex && selectedTabIndex < newIndex) {
    tabActive = selectedTabIndex;
  } else if (selectedTabIndex < oldIndex) {
    tabActive = selectedTabIndex + 1;
  } else if (selectedTabIndex > oldIndex) {
    tabActive = selectedTabIndex - 1;
  }
  emit('update:selectedTabIndex', tabActive);
  emit('update:tabs', tabsCopy.value);
};

const moveLeft = () => {
  const currentScrollPosition = document.querySelector('.draggable-tabs').scrollLeft;
  const newScrollPosition = currentScrollPosition - (containerWidth.value - 100);
  document.querySelector('.draggable-tabs').scrollTo({
    left: newScrollPosition,
    behavior: 'smooth',
  });
  rightArrowEnabled.value = true;
  leftArrowEnabled.value = newScrollPosition > 0;
};

const moveRight = () => {
  const currentScrollPosition = document.querySelector('.draggable-tabs').scrollLeft;
  const newScrollPosition = currentScrollPosition + (containerWidth.value - 100);
  document.querySelector('.draggable-tabs').scrollTo({
    left: newScrollPosition,
    behavior: 'smooth',
  });
  leftArrowEnabled.value = true;
  rightArrowEnabled.value = newScrollPosition + containerWidth.value - 100
    < document.querySelector('.draggable-tabs').scrollWidth;
};
</script>

<style lang="less" scoped>
.draggable-tabs {
  max-width: 100%;
  overflow-x: hidden;
  display: flex;
  height: 64px;

  &::-webkit-scrollbar {
    display: none !important;
    width: 0px !important;
    height: 0px !important;
    background: transparent !important;
  }
}

.draggable-tabs__tab {
  position: relative;
  display: flex;
  flex-grow: 1;
  flex-shrink: 0;
  min-width: 90px;
  padding: 21px 36px;
  white-space: nowrap;
  height: 100%;
  align-content: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
  border-bottom: 2px solid transparent;

  &--selected {
    border-bottom: 2px solid rgb(var(--v-theme-primary));
  }

  &:hover {
    background-color: var(--color-12-light);
  }

  .drag-icon {
    cursor: grab;
    position: absolute;
    left: 10px;
    top: calc(50% - 8px);
  }
}
</style>
