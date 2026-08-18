<template>
  <settings-group-edit
    v-if="isGroupEdit"
    :fields="groupFields"
    :language-text-entity="languageTextEntity"
    :namespace="entityName"
    :name-field="nameField"
    :save-action-name="saveActionName"
    :selected-group-items-count="selectedGroupItemsCount"
    :delete-loading="isDeletingGroupInProgress"
    :group-delete-fn="groupDeleteFn"
    @group-added="onGroupSaved"
  />
  <settings-overview-wrapper
    v-else-if="isOverviewOpen"
    :header="overviewHeader"
    :secondary-btn-text="secondaryBtnText"
    :btn-text="primaryBtnText"
    :primary-btn-disabled="hasGroupView && groups.length === 0"
    :filter-configuration="filterConfiguration"
    :toggle-btn-items="toggleButtonItems"
    :toggle-btn-value="toggleBtnValue"
    :menu-items="menuItems"
    :hide-reset-btn="hideResetBtn"
    @secondary-btn-clicked="onAddGroup"
    @btn-clicked="onPrimaryBtnClicked"
    @update:toggle-btn-value="$emit('update:toggle-btn-value', $event)"
  >
    <template #notification>
      <slot name="notification" />
    </template>
    <template #header>
      <slot name="header" />
    </template>
    <template #header-append>
      <slot name="header-append" />
    </template>
    <template #header-btn>
      <slot name="header-btn" />
    </template>
    <template #data>
      <slot v-if="currentCustomView" :name="currentCustomView" />
      <settings-group-panels
        v-else-if="showGroupPanels"
        ref="groupPanels"
        :groups="filteredGroups"
        :are-filters-empty="areFiltersEmpty"
        :show-global-groups-icon="showGlobalGroupsIcon"
        :show-drag-icon="showDragIcon"
        :can-edit-groups="canEditGroups"
        :show-group-items-count="showGroupItemsCount"
        :open-panels-on-filter="openPanelsOnFilter"
        :loading="loading"
        @on-group-edit-click="onAddGroup"
        @on-group-order-change="$emit('on-group-order-change', $event)"
        @on-panel-opened="$emit('on-panel-opened', $event)"
      >
        <template #panel-content="{ groupId, isGlobal }">
          <settings-entities-table
            :headers="tableHeaders"
            :items="getTableItems(groupId)"
            :entity-name="entityName"
            :loading="loading"
            :are-cols-loading="areColsLoading"
            :footer-options="footerOptions"
            :width="tableWidth"
            :status-key="statusKey"
            :table-options="tableOptions"
            :group-id="groupId"
            :is-global="isGlobal"
            :are-rows-clickable="areRowsClickable"
            :row-click-mode="rowClickMode"
            :navigate-to-edit-route="navigateToEditRoute"
            :add-entity-btn-text="primaryBtnText"
            @empty-view-btn-clicked="onPrimaryBtnClicked(groupId)"
            @on-items-order-change="$emit('on-items-order-change', { ...$event, groupId })"
            @on-dropdown-select="$emit('on-dropdown-select', $event)"
            @link-click="onLinkClick"
          />
        </template>
      </settings-group-panels>
      <v-card
        v-else-if="!loading && !filteredEntities.length"
        class="pa-2"
      >
        <empty-view
          :header="emptyViewHeader"
          :description="emptyViewDescription"
          :img-url="emptyViewImgUrl"
          :secondary-btn-color="areFiltersEmpty ? emptyViewSecondaryBtnColor : ''"
          :secondary-btn-icon="areFiltersEmpty ? emptyViewSecondaryBtnIcon : ''"
          :secondary-btn="areFiltersEmpty ? emptyViewSecondaryBtn : ''"
          :tertiary-btn="areFiltersEmpty ? emptyViewTertiaryBtn : ''"
          @secondary-btn-clicked="$emit('secondary-empty-view-btn-clicked')"
          @tertiary-btn-clicked="$emit('tertiary-empty-view-btn-clicked')"
        />
      </v-card>
      <v-card
        v-else-if="toggleBtnValue === builtInViewTypes.LIST"
        class="pa-2"
      >
        <slot name="inner-header" />
        <settings-entities-table
          :headers="tableHeaders"
          :items="filteredEntities"
          :entity-name="entityName"
          :loading="loading"
          :are-cols-loading="areColsLoading"
          :footer-options="footerOptions"
          :width="tableWidth"
          :row-click-action="rowClickAction"
          :status-key="statusKey"
          :table-options="tableOptions"
          :are-rows-clickable="areRowsClickable"
          :row-click-mode="rowClickMode"
          :navigate-to-edit-route="navigateToEditRoute"
          @on-dropdown-select="$emit('on-dropdown-select', $event)"
          @table-options-changed="onTableOptionsChange"
          @on-delete-row-click="$emit('on-delete-row-click', $event)"
          @link-click="onLinkClick"
        >
          <template
            v-if="$slots['footer-page-text']"
            #footer-page-text="{ data }"
          >
            <slot
              name="footer-page-text"
              :data="data"
            />
          </template>
          <template
            v-if="$slots['table-footer']"
            #table-footer
          >
            <slot name="table-footer" />
          </template>
        </settings-entities-table>
      </v-card>
    </template>
  </settings-overview-wrapper>
  <router-view v-else />
</template>
<script>
import { mapState } from 'pinia';
import { nextTick } from 'vue';
import { mdiFormatListBulleted, mdiFormatListGroup, mdiMonitor } from '@mdi/js';

import { filterEntities } from '@/helpers/settingsEntitiesFiltering';
import EmptyView from '@/components/atoms/EmptyView/index.vue';
import SettingsGroupPanels from '@/components/organisms/settings/SettingsGroupPanels/index.vue';
import SettingsEntitiesTable from '@/components/organisms/settings/SettingsEntitiesTable/index.vue';
import SettingsOverviewWrapper from '@/components/templates/SettingsOverviewWrapper/index.vue';
import SettingsGroupEdit from '@/components/pages/settings/SettingsGroupEdit/index.vue';
import builtInViewTypes from '@/components/pages/settings/SettingsEntitiesOverview/settingsBuiltInViewTypes.js';
import useFilterbarStore from '@/stores/filterbar';
import useFactoryStore from '@/stores/factory';
import useDeviceStore from '@/stores/device';
import useSettingsSideMenuStore from '@/stores/settingsSideMenu';

export default {
  name: 'SettingsEntitiesOverview',
  components: {
    EmptyView,
    SettingsGroupPanels,
    SettingsEntitiesTable,
    SettingsOverviewWrapper,
    SettingsGroupEdit,
  },
  props: {
    groupFields: { type: Array, default: () => [] },
    languageTextEntity: { type: String, default: '' },
    entityName: { type: String, default: '' },
    nameField: { type: String, default: 'name' },
    saveActionName: { type: String, default: '' },
    overviewHeader: { type: String, default: '' },
    secondaryBtnText: { type: String, default: '' },
    primaryBtnText: { type: String, default: '' },
    filterConfiguration: { type: Map, default: () => new Map() },
    groups: { type: Array, default: () => [] },
    items: { type: Array, default: () => [] },
    tableHeaders: { type: Array, default: () => [] },
    loading: { type: Boolean },
    isDeletingGroupInProgress: { type: Boolean },
    showGlobalGroupsIcon: { type: Boolean },
    showDragIcon: { type: Boolean },
    areColsLoading: { type: Boolean },
    hasGroupView: { type: Boolean },
    toggleBtnItems: { type: Array, default: () => null },
    toggleBtnValue: { type: [Number, String], default: builtInViewTypes.LIST },
    footerOptions: { type: Object, default: () => {} },
    canEditGroups: { type: Boolean, default: true },
    showGroupItemsCount: { type: Boolean, default: true },
    openPanelsOnFilter: { type: Boolean, default: true },
    primaryBtnAction: { type: Function, default: null },
    rowClickAction: { type: Function, default: null },
    rowClickMode: { type: String, default: null },
    menuItems: { type: Array, default: () => [] },
    showEmptyGroups: { type: Boolean, default: true },
    statusKey: { type: String, default: 'enabled' },
    groupDeleteFn: { type: Function, default: null },
    areRowsClickable: { type: Boolean, default: true },
    navigateToEditRoute: { type: Boolean, default: true },
    useBackendFiltering: { type: Boolean, default: false },
    hideResetBtn: { type: Boolean },
    customViews: { type: Array, default: () => [] },
    emptyViewImgOverride: { type: String, default: null },
    emptyViewHeaderOverride: { type: String, default: null },
    emptyViewDescriptionOverride: { type: String, default: null },
    emptyViewSecondaryBtnColor: { type: String, default: null },
    emptyViewSecondaryBtnIcon: { type: String, default: null },
    emptyViewSecondaryBtn: { type: String, default: null },
    emptyViewTertiaryBtn: { type: String, default: null },
  },
  emits: ['link-click', 'on-group-order-change', 'on-panel-opened', 'update:toggle-btn-value', 'on-items-order-change', 'on-dropdown-select', 'on-table-options-change', 'on-delete-row-click', 'secondary-empty-view-btn-clicked', 'tertiary-empty-view-btn-clicked'],
  data() {
    return {
      tableOptions: {
        page: 1,
        itemsPerPage: 50,
      },
      tableWidth: 200,
      builtInViewTypes,
    };
  },
  computed: {
    ...mapState(useFilterbarStore, ['requestFilterState', 'calculatedFilterConfig']),
    ...mapState(useFactoryStore, ['factoriesMap']),
    ...mapState(useDeviceStore, ['screenPxTotal', 'isMobileView']),
    ...mapState(useSettingsSideMenuStore, ['isCollapsed']),
    currentCustomView() {
      return this.customViews.find((view) => view === this.toggleBtnValue);
    },
    isGroupEdit() {
      return this.$route.query.isGroupEdit;
    },
    isOverviewOpen() {
      return this.$route.name === `${this.entityName}Overview`;
    },
    search() {
      return this.requestFilterState.search;
    },
    factoryFilter() {
      return this.requestFilterState.factoryId;
    },
    groupFilter() {
      return this.requestFilterState.groupId;
    },
    areFiltersEmpty() {
      return !this.search && Object.entries(this.requestFilterState).every(([key, filterValue]) => !this.calculatedFilterConfig.has(key) || !filterValue?.length);
    },
    filteredGroups() {
      return this.groups.reduce((acc, group) => {
        const itemsCount = this.getTableItems(group.id).length || 0;
        const hasItems = itemsCount > 0;
        const passesGroupFilter = this.groupFilter?.includes(group.id);
        const allFactoriesSelected = this.factoryFilter?.length === 0 || this.factoryFilter?.length === Object.keys(this.factoriesMap).length;
        const allGroupsSelected = this.groupFilter?.length === 0 || this.groupFilter?.length === Object.keys(this.groups).length;
        const passesFactoryFilter = allGroupsSelected && !allFactoriesSelected && (group.factoryIds?.length === 0 || group.factoryIds?.some((id) => this.factoryFilter?.includes(id)));
        if (hasItems || passesGroupFilter || passesFactoryFilter || (this.areFiltersEmpty && this.showEmptyGroups)) {
          acc.push({ ...group, itemsCount });
        }
        return acc;
      }, []);
    },
    filteredEntities() {
      if (this.useBackendFiltering) return this.items;
      return filterEntities(this.items, this.requestFilterState, this.statusKey);
    },
    showGroupPanels() {
      const isEmptyViewWithGroups = this.areFiltersEmpty && this.groups.length > 0 && this.items.length === 0;
      const hasFilteredGroups = this.filteredGroups.length > 0;
      const hasFilteredEntities = this.filteredEntities.length > 0;
      return this.toggleBtnValue === builtInViewTypes.GROUPS && this.hasGroupView && (isEmptyViewWithGroups || hasFilteredEntities || hasFilteredGroups);
    },
    emptyViewImgUrl() {
      if (this.emptyViewImgOverride && this.areFiltersEmpty) return this.emptyViewImgOverride;
      if (this.areFiltersEmpty) return 'settings-view';
      return 'no-filter-results';
    },
    emptyViewHeader() {
      if (this.entityName.includes('ActivityLogs')) return this.$t('No user actions');
      if (this.emptyViewHeaderOverride && this.areFiltersEmpty) return this.emptyViewHeaderOverride;
      if (this.areFiltersEmpty) return this.$t('Nothing to display');
      return this.$t('No results');
    },
    emptyViewDescription() {
      if (this.emptyViewDescriptionOverride !== null && this.areFiltersEmpty) return this.emptyViewDescriptionOverride;
      if (this.areFiltersEmpty) return this.$t('Start adding new values');
      return this.$t('Please try again with other settings.');
    },
    selectedGroupItemsCount() {
      if (!this.$route.query.id) return 0;
      return this.items.filter((item) => item.groupId === Number(this.$route.query.id)).length;
    },
    toggleButtonItems() {
      if (this.toggleBtnItems?.length > 0) return this.toggleBtnItems;
      if (this.hasGroupView) {
        return [
          {
            icon: this.entityName === 'position' ? mdiMonitor : mdiFormatListGroup,
            text: this.entityName === 'position' ? this.$t('Stations') : this.$t('Groups'),
            id: builtInViewTypes.GROUPS,
          },
          {
            icon: mdiFormatListBulleted,
            text: this.$t('List'),
            id: builtInViewTypes.LIST,
          },
        ];
      }
      return [];
    },
  },
  watch: {
    screenPxTotal() {
      this.setTableWidth();
    },
    isCollapsed() {
      this.setTableWidth();
    },
    async $route(to, from) {
      if (!this.isOverviewOpen) return;
      await nextTick();
      if (this.toggleBtnValue === builtInViewTypes.GROUPS && to.name !== from.name) {
        const fromId = from.params.id;
        const fromItem = this.items.find((item) => item.id === Number(fromId));
        const groupId = fromItem?.groupId || Number(from.query.itemGroupId);
        if (groupId) await this.$refs.groupPanels?.onPanelOpened(groupId);
      }
    },
  },
  mounted() {
    this.setTableWidth();
  },
  methods: {
    onAddGroup(group) {
      if (group) this.$router.push({ query: { ...this.$route.query, id: group.id, isGroupEdit: true } });
      else this.$router.push({ query: { ...this.$route.query, isGroupEdit: true } });
    },
    onPrimaryBtnClicked(itemGroupId) {
      if (this.primaryBtnAction) {
        this.primaryBtnAction();
      } else {
        this.$router.push({ name: `${this.entityName}Edit`, query: { ...this.$route.query, itemGroupId } });
      }
    },
    getTableItems(groupId) {
      const entityHasGroups = this.items[0]?.groupId !== undefined;
      if (entityHasGroups) {
        return this.filteredEntities.filter((item) => item.groupId === groupId);
      }
      const entities = this.filteredEntities.filter((item) => item.stationIds.includes(groupId));
      if (typeof this.items[0]?.ordering === 'object') {
        entities.sort((a, b) => a.ordering[groupId] - b.ordering[groupId]);
      }
      return entities;
    },
    onTableOptionsChange(val) {
      this.tableOptions = val;
      this.$emit('on-table-options-change', val);
    },
    async setTableWidth() {
      /* eslint-disable no-magic-numbers */
      await nextTick();
      const hasSideMenu = !this.isMobileView && this.$vuetify.display.lgAndUp;
      const scrollbarVisible = document.body.scrollHeight > window.innerHeight;
      const windowWidth = scrollbarVisible ? window.innerWidth - 10 : window.innerWidth;
      const appSideMenu = this.$vuetify.display.mdAndUp ? 64 : 0;
      const overviewPadding = 2 * 16;
      let sideMenuWidth = 0;
      if (hasSideMenu) sideMenuWidth = this.isCollapsed ? 80 : 272; // 64 or 256 + 16px margin
      const tablePadding = 2 * 8;

      this.tableWidth = windowWidth - appSideMenu - overviewPadding - sideMenuWidth - tablePadding;
      /* eslint-enable no-magic-numbers */
    },
    onLinkClick(item, col) {
      this.$emit('link-click', item, col);
    },
    async onGroupSaved(groupId) {
      this.$emit('update:toggle-btn-value', builtInViewTypes.GROUPS);
      setTimeout(() => {
        this.$refs.groupPanels?.onPanelOpened(groupId);
      }, 100);
      await nextTick();
    },
  },
};
</script>
