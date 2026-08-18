<template>
  <template
    v-for="(group, groupIndex) in groupsCopy"
    :key="`list-group-${groupIndex}`"
  >
    <draggable-list
      :items="group.items"
      :disabled="!group.reOrderFn || group.items.length < 2"
      @change="group.reOrderFn"
    >
      <template #item="{ item, index }">
        <secondary-nav-drawer-item
          :class="{ 'draggable-item': group.reOrderFn && group.items.length >= 2 }"
          :item="item"
          :active-key="activeKey"
          :active-value="activeValue"
          :active-sub-item-value="activeSubItemValue"
          :label-key="labelKey"
          :icon-key="index === hovered?.index && groupIndex === hovered?.groupIndex && group.reOrderFn ? '' : iconKey"
          :icon="index === hovered?.index && groupIndex === hovered?.groupIndex && group.reOrderFn ? mdiDragVertical : ''"
          :active-color-key="activeColorKey"
          :loading-key="loadingKey"
          :collapsed="collapsed"
          :opened-drawer-items="openedDrawerItems"
          @click="onItemClick"
          @update:collapsed="$emit('update:collapsed', $event)"
          @update:opened-drawer-items="$emit('update:opened-drawer-items', $event)"
          @mouseenter="group.items.length > 1 ? hovered = { groupIndex, index } : null"
          @mouseleave="hovered = null"
        />
      </template>
    </draggable-list>
    <slot
      v-if="!group.items.length && !collapsed"
      :name="`placeholder-${groupIndex}`"
    />
    <v-divider
      v-if="groupIndex < groupsCopy.length - 1"
      class="my-2 separator"
      :class="collapsed && !isMobileView ? 'mx-2' : 'mx-15'"
    />
  </template>
</template>
<script>
import { mdiMenuOpen, mdiDragVertical } from '@mdi/js';
import cloneDeep from 'lodash/cloneDeep';
import { mapState } from 'pinia';

import { useDeviceStore } from '@/stores/index';
import DraggableList from '@/components/molecules/DraggableList/index.vue';
import SecondaryNavDrawerItem from '@/components/molecules/SecondaryNavDrawerItem/index.vue';

const vectorIcons = { mdiMenuOpen, mdiDragVertical };
export default {
  name: 'SecondaryNavDrawer',
  components: {
    SecondaryNavDrawerItem,
    DraggableList,
  },
  props: {
    collapsed: {
      type: Boolean,
    },
    groups: {
      type: Array,
      default: () => [{}],
    },
    activeKey: {
      type: String,
      default: '',
    },
    activeValue: {
      type: [String, Number],
      default: '',
    },
    activeSubItemValue: {
      type: String,
      default: '',
    },
    labelKey: {
      type: String,
      default: '',
    },
    iconKey: {
      type: String,
      default: '',
    },
    activeColorKey: {
      type: String,
      default: '',
    },
    loadingKey: {
      type: String,
      default: 'isLoading',
    },
    openedDrawerItems: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['update:collapsed', 'item-click', 'update:opened-drawer-items'],
  data() {
    return {
      ...vectorIcons,
      hovered: null,
      groupsCopy: [],
    };
  },
  computed: {
    ...mapState(useDeviceStore, ['isMobileView']),
    isBreakpointMdAndDown() {
      return this.$vuetify.display.mdAndDown;
    },
  },
  watch: {
    isBreakpointMdAndDown(val) {
      this.$emit('update:collapsed', val);
    },
    groups: {
      handler(val) {
        this.groupsCopy = cloneDeep(val);
      },
      deep: true,
    },
  },
  mounted() {
    this.groupsCopy = cloneDeep(this.groups);
  },
  methods: {
    onItemClick(item) {
      this.$emit('item-click', item);
      if (this.isBreakpointMdAndDown) {
        this.$emit('update:collapsed', true);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.separator {
  opacity: 1;
  color: rgb(var(--v-theme-tertiary-dark));
}
.draggable-item {
  /* Prevents the mobile browser from triggering the link context menu on long press */
  touch-action: auto;
  /* Specifically targets iOS link pop-ups */
  -webkit-touch-callout: none;
  /* Prevents text selection and the associated context menu on long press */
  -webkit-user-select: none;
  user-select: none;
}
</style>
