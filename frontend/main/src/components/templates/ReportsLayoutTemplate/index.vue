<template>
  <v-row
    class="bg-quaternary-dark flex-nowrap fill-height"
    :class="{ 'pt-8 px-4': !isMobileView }"
  >
    <v-col :class="$vuetify.display.mdAndDown ? 'compact-layout-nav' : 'flex-shrink-1 flex-grow-0'">
      <slot name="left-nav-drawer" />
    </v-col>
    <v-col :class="mainContentClass">
      <!-- HEADER ROW -->
      <v-row
        v-if="!isMobileView"
        class="align-start justify-space-between mb-6 flex-nowrap"
        :class="$vuetify.display.mdAndDown && !isMobileView ? 'compact-header-content' : 'mx-4'"
      >
        <slot name="header" />
        <slot name="header-action" />
      </v-row>
      <!-- FILTERS CARD -->
      <v-sheet
        v-if="$slots.filters"
        color="white"
        class="ma-4 px-3 py-1"
      >
        <slot name="filters" />
      </v-sheet>
      <!-- MAIN CARD -->
      <v-sheet
        color="white"
        class="ma-4 pa-4"
      >
        <!-- OPTIONS ROW -->
        <v-row class="flex-nowrap">
          <v-col v-if="!isMobileView" class="flex-grow-0 flex-shirink-0">
            <slot name="chart-back-btn" />
          </v-col>
          <v-col class="d-flex overflow-auto flex-shrink-0 flex-grow">
            <v-spacer />
            <slot name="chart-actions" />
          </v-col>
        </v-row>
        <!-- CHART ROW -->
        <v-row>
          <v-col
            cols="12"
            class="chart-height"
          >
            <slot name="chart" />
          </v-col>
        </v-row>
        <!-- LEGEND ROW -->
        <v-row>
          <v-col cols="12">
            <slot name="legend" />
          </v-col>
        </v-row>
      </v-sheet>
      <!-- TABLE  -->
      <v-sheet
        v-if="$slots.table"
        color="white"
        class="ma-4 pa-2"
      >
        <slot name="table" />
      </v-sheet>
    </v-col>
  </v-row>
</template>
<script>
import { mapState } from 'pinia';

import { useDeviceStore } from '@/stores/index';

export default {
  name: 'ReportsLayoutTemplate',
  props: {
    isSideMenuMini: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState(useDeviceStore, ['isMobileView']),
    mainContentClass() {
      if (this.$vuetify.display.mdAndDown) return 'compact-layout-content';
      if (this.isSideMenuMini) return 'layout-content--mini-nav';
      return 'layout-content';
    },
  },
};
</script>
<style scoped lang="scss">
.compact-layout-nav {
  position: absolute;
  width: auto;
  max-width: auto;
  z-index: 4;
  height: auto;
  margin-left: 12px;
}

.compact-layout-content {
  left: 0;
  right: 0;
  height: calc(100% - 128px);
  width: 100%;
}

.layout-content {
  max-width: calc(100% - 256px);

  &--mini-nav {
    max-width: calc(100% - 72px);
  }
}

.compact-header-content {
  margin-left: 72px;
  margin-right: 16px;
  max-width: calc(100% - 72px);
}

.chart-height {
  height: calc(var(--app-height) * 0.5px);
  min-height: 500px;
}
</style>
