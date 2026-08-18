<template>
  <span>
    <evocon-v-table
      v-model:options="internalOptions"
      :headers="headers"
      :items="items"
      :width="width"
      height="auto"
      :loading="loading"
      :empty-view-header="entityName === 'station' ? $t('This group is empty') : $t('Nothing to display')"
      :empty-view-description="emptyViewDescription"
      empty-view-img="settings-view"
      :are-cols-loading="areColsLoading"
      :are-rows-clickable="areRowsClickable"
      :disable-pagination="false"
      :empty-view-btn-icon="mdiPlus"
      :empty-view-btn="emptyViewBtnText"
      empty-view-btn-color="primary"
      :footer-options="footerOpts"
      :group="String(groupId)"
      hide-default-footer
      :page="internalOptions.page"
      :row-click-mode="rowClickMode"
      @update:options="internalOptions = $event"
      @row-click="onRowClick"
      @on-items-order-change="onItemsOrderChange"
      @secondary-empty-view-btn-clicked="$emit('empty-view-btn-clicked')"
      @on-delete-row-click="$emit('on-delete-row-click', $event)"
      @link-click="onLinkClick"
    >
      <template #oldcolumn="{ item }">
        <div v-if="item.oldValues.length > 0">
          <object-data-visualizer v-for="(oldVal, i) in item.oldValues" :key="i" :value="oldVal" />
        </div>
        <span v-else>-</span>
      </template>
      <template #newcolumn="{ item }">
        <div v-if="item.newValues.length > 0">
          <object-data-visualizer v-for="(newVal, i) in item.newValues" :key="i" :value="newVal" />
        </div>
        <span v-else>-</span>
      </template>
      <template #dropdown-selection="{ item }">
        <settings-status-dropdown
          :status="item ? item[statusKey] : false"
          @on-dropdown-select="onDropdownSelect(item, $event)"
        />
      </template>
      <template
        v-if="$slots['footer-page-text']"
        #footer-page-text="{ data }"
      >
        <slot
          name="footer-page-text"
          :data="data"
        />
      </template>
    </evocon-v-table>
    <slot v-if="$slots['table-footer']" name="table-footer" />
    <div v-else-if="items.length" class="d-flex justify-end">
      <evocon-v-data-footer
        v-bind="footerOpts"
        v-model:options="internalOptions"
        :items="items"
        :show-all-items="lessThan50Items"
        :items-per-page-list="itemsPerPageList"
        :all-items-not-loaded="footerOptions.allItemsNotLoaded"
        scroll-into-view
        show-rows-per-page
        class="mr-1"
      />
    </div>
  </span>
</template>
<script>
import { mdiPlus } from '@mdi/js';
import { isEqual } from 'lodash';
import { mapState } from 'pinia';

import useProfileStore from '@/stores/profile';
import EvoconVTable from '@/components/molecules/EvoconVTable/index.vue';
import SettingsStatusDropdown from '@/components/organisms/settings/SettingsStatusDropdown/index.vue';
import EvoconVDataFooter from '@/components/atoms/EvoconVDataFooter/index.vue';
import ObjectDataVisualizer from '@/components/molecules/ObjectDataVisualizer/index.vue';
import { tablePageOptionsInclAll } from '@/constants/tableOptions';


const icons = { mdiPlus };

export default {
  name: 'SettingsEntitiesTable',
  components: {
    EvoconVTable,
    SettingsStatusDropdown,
    EvoconVDataFooter,
    ObjectDataVisualizer,
  },
  props: {
    items: { type: Array, default: () => [] },
    headers: { type: Array, default: () => [] },
    entityName: { type: String, default: '' },
    loading: { type: Boolean },
    areColsLoading: { type: Boolean },
    addEntityBtnText: { type: String, default: '' },
    footerOptions: { type: Object, default: () => ({ itemsPerPageOptions: tablePageOptionsInclAll }) },
    width: { type: Number, required: true },
    rowClickAction: { type: Function, default: null },
    rowClickMode: { type: String, default: null },
    tableOptions: { type: Object, default: () => ({}) },
    groupId: { type: Number, default: null },
    statusKey: { type: String, default: 'enabled' },
    areRowsClickable: { type: Boolean, default: true },
    navigateToEditRoute: { type: Boolean, default: true },
    isGlobal: { type: Boolean, default: false },
  },
  emits: ['link-click', 'table-options-changed', 'on-items-order-change', 'on-dropdown-select', 'empty-view-btn-clicked', 'on-delete-row-click'],
  data() {
    return {
      ...icons,
      internalOptions: {},
      footerOpts: {},
    };
  },
  computed: {
    ...mapState(useProfileStore, ['highestRoleAllows']),
    itemsCount() {
      return this.items.length;
    },
    lessThan50Items() {
      // eslint-disable-next-line no-magic-numbers
      return this.itemsCount > 0 && this.itemsCount <= 50;
    },
    itemsPerPageList() {
      return this.footerOpts.itemsPerPageOptions?.map((value) => ({
        value,
        text: value === -1 ? this.$t('All') : value,
      }));
    },
    emptyViewBtnText() {
      if (this.isGlobal && !this.highestRoleAllows('editGlobalGroup')) return '';
      return this.addEntityBtnText;
    },
    emptyViewDescription() {
      if (this.entityName === 'station') return this.$t('You can move stations between groups by opening the station edit view and changing the station group value');
      if (this.isGlobal && !this.highestRoleAllows('editGlobalGroup')) return this.$t('Contact your company administrator to add items.');
      return this.$t('Start adding new values');
    },
  },
  watch: {
    loading(isLoading) {
      if (!isLoading) this.setOptions();
    },
    internalOptions(newVal, oldVal) {
      if (!isEqual(newVal, oldVal)) this.$emit('table-options-changed', newVal);
    },
    itemsCount() {
      this.setOptions();
    },
  },
  mounted() {
    this.setOptions();
  },
  methods: {
    setOptions() {
      this.internalOptions = { ...this.tableOptions };
      this.footerOpts = {
        ...this.footerOptions,
        disableItemsPerPage: this.lessThan50Items,
        itemsPerPageOptions: this.lessThan50Items ? tablePageOptionsInclAll : this.footerOptions.itemsPerPageOptions,
      };
    },
    onRowClick({ item }) {
      if (this.rowClickAction) {
        this.rowClickAction(item);
      } else if (this.navigateToEditRoute) {
        this.$router.push({ name: `${this.entityName}Edit`, params: { id: item.id }, query: this.$route.query });
      }
    },
    onItemsOrderChange(event) {
      const { moved } = event;
      // eslint-disable-next-line no-magic-numbers
      const beforeOrAfter = moved.newIndex > moved.oldIndex ? 0.5 : -0.5;
      let { ordering } = this.items[((this.internalOptions.page - 1) * this.internalOptions.itemsPerPage) + moved.newIndex];
      if (typeof ordering === 'object') ordering = ordering[this.groupId];
      const { id } = moved.element;
      const newOrder = ordering + beforeOrAfter;
      this.$emit('on-items-order-change', { ordering: newOrder, id });
    },
    onDropdownSelect(item, status) {
      this.$emit('on-dropdown-select', { ...item, [this.statusKey]: status });
    },
    onLinkClick(item, col) {
      this.$emit('link-click', item, col);
    },
  },
};
</script>
