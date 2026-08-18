<template>
  <div class="text-no-wrap d-flex">
    <v-menu location="bottom">
      <template #activator="{ props }">
        <div v-bind="props">
          <evocon-v-button
            :icon="mdiDotsVertical"
            :color="isMobileView ? 'white' : ''"
          />
        </div>
      </template>
      <v-list theme="light" density="compact">
        <v-list-item
          v-for="(menuItem, index) in extraMenuItems"
          :key="index"
          :disabled="menuItem.disabled"
          @click="menuItem.onClick"
        >
          <list-item-contents
            :disabled="menuItem.disabled"
            :primary-text="menuItem.text"
            dense
            color="primary"
            :icon="menuItem.icon"
            :loading="menuItem.loading"
          />
        </v-list-item>
      </v-list>
    </v-menu>
    <copy-to-clipboard-button v-if="!isMobileView" shorten />
    <evocon-v-button
      v-if="!isMobileView"
      class="ml-1"
      :text="isUserBookmark ? $t('Update') : $t('Save')"
      :icon="mdiStarOutline"
      type="primary-light"
      :disabled="isSaveDisabled"
      @click="onSaveClick"
    />
  </div>
</template>
<script>
import {
  mdiDotsVertical,
  mdiStarOutline,
  mdiContentDuplicate,
  mdiDelete,
  mdiFileDownloadOutline,
  mdiPencil,
  mdiShareVariant,
} from '@mdi/js';
import { mapActions, mapState } from 'pinia';
import { isEqual } from 'lodash';

import { useReportsConfigStore, useBookmarkStore, useDeviceStore, useFilterbarStore, useGenericDialogStore, useGenericNotificationStore } from '@/stores';
import CopyToClipboardButton from '@/components/atoms/CopyToClipboardButton/index.vue';
import ListItemContents from '@/components/molecules/ListItemContents/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import dialogConfig from '@/stores/reportsConfig/configurations/dialogConfig';
import copyToClipboard from '@/helpers/copyToClipboard';
import UrlParams from '@/helpers/UrlParams';

const vectorIcons = {
  mdiDotsVertical, mdiStarOutline, mdiFileDownloadOutline, mdiPencil,
};

export default {
  name: 'ReportsHeaderActions',
  components: {
    CopyToClipboardButton,
    ListItemContents,
    EvoconVButton,
  },
  data() {
    return {
      ...vectorIcons,
    };
  },
  computed: {
    ...mapState(useReportsConfigStore, ['isGeneratingPdf']),
    ...mapState(useBookmarkStore, ['isUserBookmark', 'isCurrentBookmarkModified', 'currentBookmark']),
    ...mapState(useDeviceStore, ['isMobileView']),
    ...mapState(useFilterbarStore, ['requestFilterState', 'calculatedFilterConfig', 'visibleFilters']),
    extraMenuItems() {
      return [
        {
          text: this.isUserBookmark ? this.$t('Update') : this.$t('Save'),
          icon: mdiStarOutline,
          disabled: this.isSaveDisabled,
          visible: this.isMobileView,
          onClick: this.onSaveClick,
        },
        {
          text: this.$t('Duplicate'),
          icon: mdiContentDuplicate,
          disabled: false,
          visible: true,
          onClick: () => this.duplicateBookmark(),
        },
        {
          text: this.$t('Edit'),
          icon: mdiPencil,
          disabled: !this.isUserBookmark,
          visible: true,
          onClick: () => this.initEditBookmarkFlow(this.currentBookmark),
        },
        {
          text: this.$t('Delete'),
          icon: mdiDelete,
          disabled: !this.isUserBookmark,
          visible: true,
          onClick: () => this.initDeleteBookmarkFlow(),
        },
        {
          text: this.$t('Print'),
          icon: mdiFileDownloadOutline,
          visible: !this.isMobileView,
          loading: this.isGeneratingPdf,
          onClick: () => this.onPrintChart(),
        },
        {
          text: this.$t('Copy link'),
          icon: mdiShareVariant,
          visible: this.isMobileView,
          onClick: this.onCopyLink,
        },
      ].filter((item) => item.visible);
    },
    isSaveDisabled() {
      if (this.isMobileView) {
        // in mobile dialog all filters are visible, so the empty values are stored in the bookmark
        const bookmarkParams = new UrlParams(this.currentBookmark.url).getParams();
        return Object.entries(this.requestFilterState).every(([key, value]) => {
          if (!this.visibleFilters(true).includes(key)) return true; // skip hidden filters
          if (key in bookmarkParams) {
            return isEqual(bookmarkParams[key], value);
          }
          return isEqual(value, this.calculatedFilterConfig.get(key).defaultValue);
        });
      }
      return !this.isCurrentBookmarkModified(this.$route.href);
    },
  },
  methods: {
    ...mapActions(useBookmarkStore, [
      'updateBookmarkIgnoringLabels',
      'initDeleteBookmarkFlow',
      'duplicateBookmark',
    ]),
    ...mapActions(useGenericDialogStore, ['openDialog']),
    ...mapActions(useGenericNotificationStore, ['notifySuccess']),
    initEditBookmarkFlow(bookmark = null) {
      this.openDialog({
        ...dialogConfig.REPORTS_SAVE_BOOKMARK,
        data: {
          bookmark,
        },
      });
    },
    onSaveClick() {
      if (this.isUserBookmark) {
        this.updateBookmarkIgnoringLabels();
      } else {
        this.initEditBookmarkFlow();
      }
    },
    onPrintChart() {
      window.evoconReports.onPdfExport();
    },
    onCopyLink() {
      copyToClipboard(this.$route.href);
      this.notifySuccess(this.$t('Link copied'));
    },
  },
};
</script>
