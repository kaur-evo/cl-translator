<template>
  <v-menu v-if="isMobileView" eager>
    <!-- eslint-disable-next-line vue/no-template-shadow -->
    <template #activator="{ props }">
      <div
        v-bind="props"
        class="d-flex align-center text-truncate"
        @click="emit('update:collapsed', false)"
      >
        <span class="pr-1 text-truncate">{{ selectedItem }}</span>
        <v-icon size="24">
          {{ mdiMenuDown }}
        </v-icon>
      </div>
      <evocon-v-button
        v-if="hasInfoIcon"
        :icon="mdiInformationOutline"
        size="extra-small"
        color="white"
        class="ml-4"
        @click="emit('info-btn-clicked')"
      />
    </template>
    <v-list theme="light" width="256">
      <slot name="nav-drawer-content" />
    </v-list>
  </v-menu>
  <div
    v-else
    class="secondary-nav-drawer"
    max-height="100%"
    :style="{ position: isBreakpointMdAndDown ? 'absolute' : 'initial' }"
  >
    <evocon-v-button
      :icon="mdiMenuOpen"
      class="mr-2"
      :class="{ rotate180deg: collapsed, 'ml-1': isBreakpointMdAndDown, 'ml-3': !isBreakpointMdAndDown }"
      @click="$emit('update:collapsed', !collapsed)"
    />
    <div
      v-if="isBreakpointLgAndUp || !collapsed"
      :class="{
        transparent: isBreakpointLgAndUp,
        'elevation-1 rounded mt-2': isBreakpointMdAndDown,
        'bg-white': isBreakpointMdAndDown,
      }"
      :style="{ width: `${menuWidth}px` }"
      class="py-2 overflow-container"
    >
      <slot name="nav-drawer-content" />
    </div>
  </div>
</template>
<script setup name="SecondaryNavDrawerWrapper">
import { useDisplay } from 'vuetify';
import { computed, watch } from 'vue';
import { mdiMenuDown, mdiMenuOpen, mdiInformationOutline } from '@mdi/js';

import { useDeviceStore } from '@/stores/index';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';

const deviceStore = useDeviceStore();
const display = useDisplay();

const props = defineProps({
  selectedItem: { type: String, default: '' },
  collapsed: { type: Boolean },
  hasInfoIcon: { type: Boolean },
});

const emit = defineEmits(['update:collapsed', 'info-btn-clicked']);

const isMobileView = computed(() => deviceStore.isMobileView);
const COLLAPSED_WIDTH = 64;
const EXPANDED_WIDTH = 256;
const menuWidth = computed(() => (props.collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH));

const isBreakpointLgAndUp = computed(() => display.lgAndUp.value);
const isBreakpointMdAndDown = computed(() => display.mdAndDown.value);

watch(isBreakpointMdAndDown, (val) => emit('update:collapsed', val));
</script>
<style lang="scss" scoped>
.secondary-nav-drawer {
  z-index: 5;
}

.rotate180deg {
  transform: rotateZ(-180deg);
}

.overflow-container {
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
