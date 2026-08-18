<template>
  <div class="dashboard-grid-wrapper">
    <draggable
      :model-value="currentPageWidgets"
      class="v-row ma-2"
      draggable=".draggable-item"
      filter=".no-drag"
      :animation="300"
      :delay="400"
      :delay-on-touch-only="true"
      item-key="i"
      ghost-class="ghost"
      @update:model-value="widgetOrderCopy = $event"
      @end="onDragEnd"
    >
      <template #item="{ element: item }">
        <v-col
          cols="12"
          sm="12"
          md="6"
          lg="4"
          xl="3"
          class="pa-2 grabbable draggable-item"
          :style="{ height: `${rowHeight}px` }"
        >
          <widget
            :key="`widget-${item.i}`"
            :widget="item"
            :update-trigger="gridLayoutRedrawTrigger"
          />
        </v-col>
      </template>
      <template #footer>
        <v-col
          cols="12"
          sm="12"
          md="6"
          lg="4"
          xl="3"
          class="pa-2"
          :style="{ height: `${rowHeight}px` }"
        >
          <widget-placeholder
            class="no-drag"
            @click="onAddNewWidget"
          />
        </v-col>
      </template>
    </draggable>
  </div>
</template>
<script>
import { nextTick, defineAsyncComponent } from 'vue';
import { mapActions, mapState } from 'pinia';
import draggable from 'vuedraggable';

import WidgetPlaceholder from '@/components/organisms/dashboard/WidgetPlaceholder/index.vue';
import Widget from '@/components/organisms/dashboard/DashboardWidget/index.vue';
import { useDashboardConfigStore, useDeviceStore, useGenericDialogStore } from '@/stores/index';

export default {
  name: 'DashboardGrid',
  components: {
    Widget,
    draggable,
    WidgetPlaceholder,
  },
  data() {
    return {
      rowHeight: 150,
      gridLayoutRedrawTrigger: 0,
      widgetOrderCopy: [],
    };
  },
  computed: {
    ...mapState(useDashboardConfigStore, ['currentPageId', 'currentPageWidgets']),
    ...mapState(useDeviceStore, ['isMobileView']),
  },
  watch: {
    currentPageWidgets(val, oldVal) {
      if (this.$refs['grid-layout'] && val.length !== oldVal.length) {
        this.gridLayoutRedrawTrigger = new Date().getTime();
      }
    },
    currentPageId(val) {
      if (!this.$vuetify.display.mdAndUp) {
        // this hack avoids grid-layout collapse bug on mobile tab change
        this.gridLayoutRedrawTrigger = val;
      }
    },
  },
  async mounted() {
    this.loadDashboardConfig();
    window.addEventListener('resize', this.calcRow);
    await nextTick();
    this.calcRow();
  },
  unmounted() {
    window.removeEventListener('resize', this.calcRow);
  },
  methods: {
    ...mapActions(useDashboardConfigStore, ['loadDashboardConfig', 'reorderCurrentPage', 'saveDashboardConfig']),
    ...mapActions(useGenericDialogStore, ['openDialog']),
    calcRow() {
      /* eslint-disable no-magic-numbers */
      if (this.isMobileView) this.rowHeight = 320;
      else {
        const height = document.documentElement.clientHeight;
        // 112 - toolbar height + grid layout spacing; 64 - toolbar height
        const toolbarsAndSpacingOffset = window.innerHeight > 700 ? 112 : 64;
        const rowsOnScreenCount = window.innerHeight > 700 ? 2 : 1;
        this.rowHeight = (height - toolbarsAndSpacingOffset) / rowsOnScreenCount;
      }
      this.gridLayoutRedrawTrigger = new Date().getTime();
      /* eslint-enable no-magic-numbers */
    },
    onDragEnd() {
      if (this.widgetOrderCopy.length !== this.currentPageWidgets.length) {
        // avoid saving if no change or if drag is not finished
        return;
      }
      this.reorderCurrentPage(this.widgetOrderCopy);
      this.saveDashboardConfig();
    },
    openWidgetEditForDesktop(widget) {
      const dialogConfig = {
        width: 716,
        data: { widget },
        component: defineAsyncComponent(() => import('../DashboardWidgetEdit/index.vue')),
      };
      this.openDialog(dialogConfig);
    },
    onAddNewWidget() {
      this.openWidgetEditForDesktop({
        i: `new_${new Date().getTime()}`,
      });
    },
  },
};
</script>
