<template>
  <secondary-nav-drawer-wrapper
    :collapsed="mini"
    :selected-item="selectedReport"
    @update:collapsed="$emit('update:mini', $event)"
  >
    <template #nav-drawer-content>
      <secondary-nav-drawer
        :groups="groupedItems"
        label-key="displayName"
        icon-key="icon"
        active-key="id"
        active-color-key="activeColor"
        :collapsed="mini"
        :active-value="currentBookmark ? currentBookmark.id : ''"
        @update:collapsed="$emit('update:mini', $event)"
        @item-click="onItemClick"
      >
        <template #placeholder-0>
          <v-row>
            <v-img
              max-width="45px"
              src="../../../../assets/images/reports/bookmark-placeholder.svg"
              class="mx-auto my-2"
            />
          </v-row>
          <v-row>
            <span
              class="mx-auto mt-3 mb-5 text-secondary-text bookmark-list-placeholder text-center text-body-medium"
            >
              {{ $t('Saved reports will appear here') }}
            </span>
          </v-row>
        </template>
      </secondary-nav-drawer>
    </template>
  </secondary-nav-drawer-wrapper>
</template>
<script>
import { mapState, mapActions } from 'pinia';
import { mdiStar, mdiDatabaseExportOutline } from '@mdi/js';

import { useCustomReportStore, useBookmarkStore, useFilterbarStore, useReportsConfigStore, useDeviceStore, useGenericDialogStore } from '@/stores';
import SecondaryNavDrawerWrapper from '@/components/templates/SecondaryNavDrawerWrapper/index.vue';
import SecondaryNavDrawer from '@/components/molecules/SecondaryNavDrawer/index.vue';
import configType from '@/stores/reportsConfig/constants/configType';
import dialogConfig from '@/stores/reportsConfig/configurations/dialogConfig';
import getNewOrder from '@/helpers/getNewOrder';

export default {
  name: 'ReportsBookmarkDrawer',
  components: {
    SecondaryNavDrawerWrapper,
    SecondaryNavDrawer,
  },
  props: {
    mini: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['update:mini'],
  computed: {
    ...mapState(useCustomReportStore, ['customReports', 'defaultReports', 'customReportsLoading']),
    ...mapState(useBookmarkStore, ['orderedBookmarks', 'bookmarkPresetsMap', 'currentBookmark']),
    ...mapState(useFilterbarStore, ['getUrlWithPassableFilterValues']),
    ...mapState(useReportsConfigStore, ['filterConfiguration']),
    ...mapState(useDeviceStore, ['isMobileView']),
    predefinedBookmarks() {
      return Object.values(this.bookmarkPresetsMap).map((b) => ({
        ...b,
        url: this.getUrlWithPassableFilterValues(b.url, this.filterConfiguration(b.type)),
        activeColor: 'primary',
        displayName: b.name,
      }));
    },
    savedBookmarks() {
      return this.orderedBookmarks.map((b) => ({
        ...b,
        icon: mdiStar,
        activeColor: 'primary',
        displayName: b.name,
      }));
    },
    customReportsList() {
      return this.customReports.map(this.customReportMapper);
    },
    defaultReportsList() {
      return this.defaultReports.map(this.customReportMapper);
    },
    groupedItems() {
      const systemReports = [
        { items: this.savedBookmarks, reOrderFn: this.onBookmarkReorder },
        { items: this.predefinedBookmarks },
      ];
      if (this.isMobileView) return systemReports;
      return [
        ...systemReports,
        { items: this.defaultReportsList },
        { items: this.customReportsList },
      ];
    },
    selectedReport() {
      return this.groupedItems.flatMap((group) => group.items).find((item) => item.id === this.currentBookmark?.id)?.displayName;
    },
  },
  mounted() {
    this.fetchBookmarkDefaults();
    this.fetchBookmarks();
    this.fetchCustomReports();
    this.fetchDefaultReports();
  },
  methods: {
    ...mapActions(useCustomReportStore, [
      'fetchCustomReports',
      'fetchDefaultReports',
    ]),
    ...mapActions(useBookmarkStore, ['fetchBookmarks', 'setNewBookmarkOrdering', 'fetchBookmarkDefaults']),
    ...mapActions(useGenericDialogStore, ['openDialog']),
    customReportMapper(report) {
      return {
        ...report,
        icon: mdiDatabaseExportOutline,
        activeColor: 'primary',
        type: configType.CUSTOM_REPORT,
        isLoading: !!this.customReportsLoading[report.name],
        name: this.$t(report.name),
        originalItem: { ...report },
      };
    },
    initDownloadReportFlow(reportItem) {
      const config = {
        ...dialogConfig.REPORTS_DOWNLOAD_DIALOG,
        data: reportItem,
      };
      this.openDialog(config);
    },
    onItemClick(item) {
      if (item.type === configType.CUSTOM_REPORT) {
        this.initDownloadReportFlow(item.originalItem);
      }
    },
    onBookmarkReorder({ moved }) {
      const newOrder = getNewOrder(moved, this.savedBookmarks);
      this.setNewBookmarkOrdering({ bookmarkId: moved.element.id, order: newOrder });
    },
  },
};
</script>
<style lang="scss" scoped>
.bookmark-list-placeholder {
  max-width: 150px;
}
</style>
