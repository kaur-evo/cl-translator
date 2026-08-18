<template>
  <div class="fill-height flex-column bg-lw-gray">
    <main-app-toolbar
      v-if="isHandheldDevice"
      :model-value="[currentTab.resolved]"
      :items="tabs"
      selection-item-value="resolved"
      @update:model-value="onPageChange"
    >
      <template #toolbar-action>
        <evocon-v-button
          :icon="mdiFilter"
          color="white"
          size="default"
          @click="openFiltersDialog"
        />
      </template>
    </main-app-toolbar>
    <div
      v-else
      class="d-flex align-center justify-space-between bg-primary-dark pl-1 px-4 flex-shrink-1 flex-grow-0"
    >
      <div class="d-flex align-center">
        <draggable-tabs
          v-if="$vuetify.display.mdAndUp"
          :selected-tab-index="openTabIndex"
          :tabs="tabs"
          @update:selected-tab-index="updateRoute"
        />
      </div>
      <factory-overview-filter v-if="$vuetify.display.lgAndUp" use-actions use-chips />
      <evocon-v-button
        v-else
        :icon="mdiFilter"
        color="white"
        @click="openFiltersDialog"
      />
    </div>
    <div class="fo-content">
      <v-window
        :model-value="currentTab.resolved"
        class="bg-transparent"
        @update:model-value="updateRoute"
      >
        <v-window-item
          v-for="tab in tabs"
          :key="`tab-item-${tab.id}`"
          :value="resolvePath(tab.to)"
        >
          <router-view v-if="tab.to.name === $route.name" />
        </v-window-item>
      </v-window>
    </div>
  </div>
</template>
<script>
import { mapActions } from 'pinia';
import {
  mdiViewModule, mdiViewComfy, mdiFilter, mdiMenuUp, mdiMenuDown,
} from '@mdi/js';
import { defineAsyncComponent } from 'vue';

import { ALL_FACTORIES, REALTIME, TIMELINE } from '@/constants/routeNames';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import FactoryOverviewFilter from '@/components/organisms/factoriesOverview/FactoryOverviewFilter/index.vue';
import MainAppToolbar from '@/components/organisms/MainAppToolbar/index.vue';
import DraggableTabs from '@/components/molecules/DraggableTabs/index.vue';
import { useGenericDialogStore } from '@/stores';

const vectorIcons = {
  mdiViewModule,
  mdiViewComfy,
  mdiFilter,
  mdiMenuUp,
  mdiMenuDown,
};

export default {
  name: 'FactoriesOverviewMain',
  components: {
    MainAppToolbar, FactoryOverviewFilter, EvoconVButton, DraggableTabs,
  },
  data() {
    return {
      ...vectorIcons,
      openTabIndex: 0,
    };
  },
  computed: {
    currentTab() {
      return this.tabs[this.openTabIndex];
    },
    tabs() {
      return [
        {
          id: 'realtime',
          name: this.$t('Live'),
          to: { name: REALTIME },
          resolved: this.resolvePath({ name: REALTIME }),
        },
        {
          id: 'timeline',
          name: this.$t('Timeline'),
          to: { name: TIMELINE },
          resolved: this.resolvePath({ name: TIMELINE }),
        },
      ];
    },
    isHandheldDevice() {
      return this.$vuetify.display.smAndDown;
    },
  },
  mounted() {
    if (this.$route.name === ALL_FACTORIES) {
      const storedTabIndex = window.localStorage.getItem('factoryOverviewOpenTabIndex');
      if (storedTabIndex) this.openTabIndex = parseInt(storedTabIndex, 10);
      this.updateRoute(this.openTabIndex);
    } else {
      this.openTabIndex = this.tabs.findIndex((tab) => tab.resolved === this.resolvePath(this.$route));
      window.localStorage.setItem('factoryOverviewOpenTabIndex', this.openTabIndex);
    }
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['openDialog']),
    resolvePath(obj) {
      const { href } = this.$router.resolve(obj);
      if (href.startsWith('#')) {
        return href.substring(1);
      }
      return href;
    },
    updateRoute(id) {
      const route = this.tabs[id].to;
      this.$router.push(route);
      this.openTabIndex = id;
      window.localStorage.setItem('factoryOverviewOpenTabIndex', id);
    },
    openFiltersDialog() {
      this.openDialog({
        component: defineAsyncComponent(() => import('../../../organisms/factoriesOverview/FactoriesOverviewFilterDialog/index.vue')),
      });
    },
    onPageChange(ev) {
      const [resolved] = ev;
      this.$router.push(resolved);
      const tabIndex = this.tabs.findIndex((tab) => tab.resolved === resolved);
      if (tabIndex !== -1) {
        this.openTabIndex = tabIndex;
      }
    },
  },
};
</script>
<style scoped>
.fo-content {
  height: calc(var(--app-height) * 1px - 64px);
  max-height: calc(var(--app-height) * 1px - 64px);
  overflow: auto;
}
</style>
