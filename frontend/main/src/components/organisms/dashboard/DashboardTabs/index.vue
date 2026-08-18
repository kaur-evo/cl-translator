<template>
  <v-row class="fill-height flex-column bg-lw-gray dashboard-tabs-container">
    <v-progress-linear
      v-if="isRotationEnabled && tabRotationState && tabRotationPct < 97"
      :model-value="tabRotationPct"
      class="mb-n1 above-tabs-z"
    />
    <main-app-toolbar
      v-if="isHandheldDevice"
      :model-value="[tabs[selectedTabIndex]?.id]"
      :items="tabsWithDisplayInfo"
      @update:model-value="onTabChange"
    >
      <template #toolbar-action>
        <menu-with-button-activator
          v-if="showShareDashboardBtn"
          :items="toolbarMenuItems"
          :button-icon="mdiDotsVertical"
          button-icon-color="white"
          button-type="secondary"
          icon-key="icon"
          list-width="auto"
          @item-clicked="$event.action()"
        />
        <evocon-v-button
          v-else
          :icon="mdiCog"
          color="white"
          @click="openTabSettings"
        />
      </template>
    </main-app-toolbar>
    <v-col v-else class="flex-shrink-1 flex-grow-0 d-print">
      <div class="d-flex bg-primary-dark flex-nowrap align-center pl-1">
        <div class="d-print-none tabs-max-width">
          <draggable-tabs
            v-if="tabs && tabs.length"
            v-model:selected-tab-index="selectedTabIndex"
            :tabs="tabsWithDisplayInfo"
            :dragging-enabled="isEditPages"
            @update:tabs="setPages"
          >
            <template #tab-append="{ tab }">
              <new-indicator
                v-if="tab.newIndicatorShownUntil"
                :shown-until="tab.newIndicatorShownUntil"
                class="ml-1"
                small
              />
              <menu-with-button-activator
                v-if="isEditPages"
                :items="tabEditMenuItems"
                :button-icon="mdiDotsVertical"
                button-icon-color="white"
                button-type="secondary"
                button-classes="ml-1 mt-n1 position-absolute"
                icon-key="icon"
                list-width="auto"
                size="small"
                @item-clicked="$event.action(tab)"
              />
            </template>
          </draggable-tabs>
        </div>
        <v-row class="flex-shrink-1 flex-grow-0 fill-height align-center ml-4">
          <evocon-v-tooltip-wrap
            v-if="!isEditPages"
            location="right"
            :text="$t('Add tab')"
          >
            <template #activator="{ props }">
              <evocon-v-button
                :icon="mdiPlus"
                color="white"
                v-bind="props"
                @click="initEditPageFlow"
              />
            </template>
          </evocon-v-tooltip-wrap>
        </v-row>
        <v-spacer />
        <v-row class="fill-height align-center flex-shrink-1 flex-grow-0 pl-1 pr-4">
          <span v-if="!isEditPages" class="text-tertiary-dark text--body-1 mr-3">
            {{ $t("Rotation") }}
          </span>
          <multi-line-switch
            v-if="!isEditPages"
            id="rotation-switch"
            v-model="tabRotationState"
            :disabled="tabs.length < 2"
          />
          <evocon-v-button
            v-if="isEditPages"
            id="close-edit-button"
            :text="$t('Close')"
            type="primary-light"
            class="mx-1"
            @click="cancelEditPagesFlow"
          />
          <evocon-v-tooltip-wrap v-else location="bottom" :text="$t('Edit')">
            <template #activator="{ props }">
              <evocon-v-button
                :icon="mdiPencil"
                color="white"
                :loading="isLoading"
                class="ml-2"
                v-bind="props"
                @click="startEditPagesFlow"
              />
            </template>
          </evocon-v-tooltip-wrap>
          <evocon-v-tooltip-wrap v-if="showShareDashboardBtn" location="bottom" :text="$t('Share')">
            <template #activator="{ props }">
              <evocon-v-button
                :icon="mdiShare"
                color="white"
                :loading="isLoading"
                class="ml-2 rotateY180deg"
                v-bind="props"
                @click="openDashboardSharingDialog"
              />
            </template>
          </evocon-v-tooltip-wrap>
        </v-row>
      </div>
    </v-col>
    <v-col class="dashboard-tabs-content">
      <slot
        :tab="tabs[selectedTabIndex]"
        name="tab-content"
        class="fill-height"
      />
      <div
        v-if="isEditPages"
        id="page-edit-overflow"
        class="fill-height"
        @click="cancelEditPagesFlow()"
      />
    </v-col>
  </v-row>
</template>
<script>
import {
  mdiPlus, mdiPencil, mdiCog, mdiShare, mdiDotsVertical, mdiContentDuplicate, mdiDelete,
} from '@mdi/js';
import { mapState, mapActions } from 'pinia';
import { defineAsyncComponent } from 'vue';

import CustomInterval from '@/helpers/interval/CustomInterval';
import { getTabNewIndicatorShownUntil } from '@/helpers/dashboardNewIndicator';
import MainAppToolbar from '@/components/organisms/MainAppToolbar/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import EvoconVTooltipWrap from '@/components/atoms/EvoconVTooltipWrap/index.vue';
import MultiLineSwitch from '@/components/atoms/MultiLineSwitch/index.vue';
import NewIndicator from '@/components/atoms/NewIndicator/index.vue';
import DraggableTabs from '@/components/molecules/DraggableTabs/index.vue';
import MenuWithButtonActivator from '@/components/molecules/MenuWithButtonActivator/index.vue';
import {
  useDashboardConfigStore, useDeviceStore, useGenericDialogStore,
  useGenericNotificationStore, useProfileStore,
} from '@/stores/index';

const vectorIcons = {
  mdiPlus, mdiPencil, mdiCog, mdiShare, mdiDotsVertical, mdiContentDuplicate, mdiDelete,
};
export default {
  name: 'DasboardComponent',
  components: {
    MainAppToolbar,
    EvoconVButton,
    EvoconVTooltipWrap,
    MultiLineSwitch,
    NewIndicator,
    DraggableTabs,
    MenuWithButtonActivator,
  },
  data() {
    return {
      isMounted: false,
      ...vectorIcons,
      selectedTabIndex: 0,
      tabRotationState: false,
      interval: null,
      intervalSeconds: 0,
      timeoutSeconds: 30,
    };
  },
  computed: {
    ...mapState(useDashboardConfigStore, ['pages', 'isEditPages', 'isLoading']),
    ...mapState(useDeviceStore, ['isBrowserTabActive']),
    ...mapState(useGenericDialogStore, ['isDialogOpened']),
    ...mapState(useProfileStore, ['highestRoleAllows']),
    isRotationEnabled() {
      if (this.isDialogOpened) return false;
      if (this.isHandheldDevice) return false;
      if (this.tabs.length < 2) return false;
      if (!this.tabRotationState) return false;
      return !this.isEditPages;
    },
    tabRotationPct() {
      return (this.intervalSeconds / this.timeoutSeconds) * 100;
    },
    isHandheldDevice() {
      return this.$vuetify.display.smAndDown;
    },
    tabs: {
      get() {
        return this.pages;
      },
      set(val) {
        this.setPages(val);
      },
    },
    showShareDashboardBtn() {
      return !this.isEditPages && this.highestRoleAllows('shareDashboard');
    },
    tabsWithDisplayInfo() {
      return this.tabs.map((tab) => ({ ...tab, newIndicatorShownUntil: getTabNewIndicatorShownUntil(tab) }));
    },
    toolbarMenuItems() {
      return [
        {
          icon: mdiCog,
          name: this.$t('Settings'),
          action: () => this.openTabSettings(),
        },
        {
          icon: mdiShare,
          name: this.$t('Share'),
          action: () => this.openDashboardSharingDialog(),
        },
      ];
    },
    tabEditMenuItems() {
      return [
        {
          icon: mdiPencil,
          name: this.$t('Rename'),
          action: (tab) => this.initEditPageFlow(tab),
        },
        {
          icon: mdiContentDuplicate,
          name: this.$t('Duplicate'),
          action: (tab) => this.onDuplicateTab(tab),
        },
        {
          icon: mdiDelete,
          name: this.$t('Delete'),
          action: (tab) => this.initDeletePageFlow(tab),
        },
      ];
    },
  },
  watch: {
    isLoading(val, prevVal) {
      if (!val && prevVal) {
        this.setOpenTab();
      }
    },
    selectedTabIndex(val) {
      if (this.tabs[val].sharedAtISO) {
        const tabsCopy = [...this.tabs];
        tabsCopy[val].sharedAtISO = null;
        this.saveDashboardConfig({ pages: tabsCopy, showToast: false });
      }
      this.onPageChange(this.tabs[val].id);
    },
    pages(newVal, oldVal) {
      if (oldVal.length && newVal.length !== oldVal.length) this.selectedTabIndex = newVal.length - 1;
    },
    async tabRotationState(val) {
      if (this.isMounted) {
        try {
          localStorage.setItem('dashboardTabRotationEnabled', val);

          this.openNotification({
            text: val
              ? this.$t('Tab rotation enabled')
              : this.$t('Tab rotation disabled'),
            type: 'success',
          });
        } catch {
          this.openNotification({
            text: this.$t('Action failed'),
            type: 'error',
          });
          this.loadRotationState();
        }
      }
      if (val) {
        this.addMouseMoveTracker();
      } else {
        this.removeMouseMoveTracker();
      }
    },
    isBrowserTabActive(val, prevVal) {
      if (val && val !== prevVal) {
        this.addMouseMoveTracker();
      } else this.removeMouseMoveTracker();
    },
  },
  async mounted() {
    this.setOpenTab();
    await this.loadRotationState();
    this.isMounted = true;
    this.addMouseMoveTracker();
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.resizeHandler);
    this.removeMouseMoveTracker();
  },
  methods: {
    ...mapActions(useDashboardConfigStore, [
      'onPageChange',
      'saveDashboardConfig',
      'startEditPagesFlow',
      'cancelEditPagesFlow',
      'setPages',
      'savePage',
      'initDeletePageFlow',
      'duplicatePageWithWidgets',
    ]),
    ...mapActions(useGenericNotificationStore, ['openNotification']),
    ...mapActions(useGenericDialogStore, ['openDialog', 'closeDialog']),
    async loadRotationState() {
      this.tabRotationState = JSON.parse(localStorage.getItem('dashboardTabRotationEnabled'));
    },
    addMouseMoveTracker() {
      if (this.tabRotationState) {
        this.onMouseMove();
        window.addEventListener('mousemove', this.onMouseMove);
      }
    },
    removeMouseMoveTracker() {
      window.removeEventListener('mousemove', this.onMouseMove);
      this.clearInterval();
    },
    checkInterval() {
      this.intervalSeconds += 0.05;
      if (this.intervalSeconds >= this.timeoutSeconds) {
        this.rotateTabs();
        this.intervalSeconds = 0;
      }
    },
    onMouseMove() {
      this.clearInterval();
      // eslint-disable-next-line no-magic-numbers
      this.interval = CustomInterval.createInterval(this.checkInterval, 50);
    },
    clearInterval() {
      if (this.interval) {
        this.interval.clear();
        this.interval = null;
        this.intervalSeconds = 0;
      }
    },
    rotateTabs() {
      if (this.isRotationEnabled) {
        if (this.selectedTabIndex >= this.tabs.length - 1) {
          this.selectedTabIndex = 0;
        } else {
          this.selectedTabIndex += 1;
        }
      }
    },
    onDuplicateTab(page) {
      const dialogConfig = {
        title: '',
        component: defineAsyncComponent(() => import('../DashboardPageForm/index.vue')),
        width: 425,
        data: {
          page: { ...page, name: `${this.$t('Copy of')} ${page.name}` },
        },
        allowFullscreen: false,
        onPrimaryAction: async (tab) => {
          await this.duplicatePageWithWidgets(tab);
          this.closeDialog();
        },
      };
      this.openDialog(dialogConfig);
    },
    initEditPageFlow(page) {
      const dialogConfig = {
        component: defineAsyncComponent(() => import('../DashboardPageForm/index.vue')),
        width: 425,
        data: {
          page,
        },
        allowFullscreen: false,
        onPrimaryAction: (tab) => {
          this.onTabSave(tab);
        },
      };
      this.openDialog(dialogConfig);
    },
    openTabSettings() {
      const dialogConfig = {
        component: defineAsyncComponent(() => import('../DashboardTabSettings/index.vue')),
        data: {
          onTabOrderChange: (tabs) => {
            this.setPages(tabs);
          },
        },
        onPrimaryAction: async (tab, isTabDuplication) => {
          if (isTabDuplication) {
            await this.duplicatePageWithWidgets(tab);
            this.closeDialog();
          } else {
            this.onTabSave(tab);
          }
        },
      };
      this.openDialog(dialogConfig);
    },
    openDashboardSharingDialog() {
      const dialogConfig = {
        component: defineAsyncComponent(() => import('../ShareDashboardDialog/index.vue')),
      };
      this.openDialog(dialogConfig);
    },
    onTabSave(tab) {
      this.savePage(tab);
      if (tab.id) this.onTabChange([tab.id]);
      this.closeDialog();
    },
    onTabChange(ev) {
      this.selectedTabIndex = this.tabs.findIndex((tab) => tab.id === ev[0]);
    },
    setOpenTab() {
      if (this.isLoading) return;
      const { tabId } = this.$route.params;
      if (tabId) {
        const tabIndex = this.tabs.findIndex((tab) => tab.id === tabId);
        if (tabIndex !== -1) this.selectedTabIndex = tabIndex;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.above-tabs-z {
  z-index: 1;
}
.tabs-max-width {
  max-width: calc(100vw - 450px) !important;
}

#page-edit-overflow {
  position: relative;
  top: -100%;
  left: 0;
  right: 0;
  bottom: 0;
}
.dashboard-tabs-container {
  max-width: 100%;
}

.dashboard-tabs-content {
  height: calc(var(--app-height) * 1px - 64px);
  max-height: calc(var(--app-height) * 1px - 64px);
  overflow: auto;
}
</style>
