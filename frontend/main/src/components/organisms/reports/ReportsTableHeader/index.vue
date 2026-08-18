<template>
  <div class="d-flex justify-space-between align-center pa-2">
    <div class="d-flex align-center text-truncate">
      <span class="text-headline-small text-truncate"> {{ headerTitle }} </span>
      <icon-with-tooltip
        additional-classes="ml-2"
        :icon="mdiInformationOutline"
        :tooltip-text="$t('Terms and definitions')"
        :icon-clicked-fn="openHelp"
      />
    </div>
    <div>
      <selection-input
        v-if="!isMobileView"
        :items="activeTableHeaders"
        :model-value="visibleHeaders"
        use-chips
        hide-search
        item-text="text"
        :prepend-inner-icon="mdiViewColumn"
        :prepend-text="`${$t('Columns')}:`"
        :item-disabled="(item) => item.id === activeTableHeaders[0].id"
        menu-input-class="ml-2"
        @update:model-value="setVisibleColumns"
      />
      <selection-input
        v-if="showDurationFormatSelection"
        :items="getDurationFormatsArray"
        :model-value="[reportsDurationFormat]"
        use-chips
        hide-search
        is-single-select
        item-text="text"
        :prepend-inner-icon="mdiDecimal"
        :prepend-text="`${$t('Time format')}:`"
        menu-input-class="ml-2"
        @update:model-value="setDurationFormat"
      />
      <selection-input
        v-if="!isMobileView && exportOptions.length > 1"
        :items="exportOptions"
        :model-value="[]"
        use-chips
        hide-search
        is-single-select
        item-text="text"
        :placeholder="`${$t('Export')}`"
        :prepend-inner-icon="mdiDownload"
        menu-input-class="ml-2"
        :checkbox="false"
        @update:model-value="onExportOptionClick"
      />
      <evocon-v-button
        v-else-if="exportOptions.length === 1 && !isMobileView"
        :text="$t('Export')"
        :icon="mdiDownload"
        size="small"
        class="ml-2"
        color="quaternary-dark"
        @click="exportOptions[0].action"
      />
      <evocon-v-button
        v-if="isMobileView"
        :icon="mdiCog"
        class="ml-2"
        @click="openViewSettings"
      />
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import {
  mdiInformationOutline, mdiViewColumn, mdiDecimal, mdiDownload, mdiCog,
} from '@mdi/js';

import { useFilterbarStore, useReportsConfigStore, useBookmarkStore, useProfileStore, useDeviceStore, useGenericDialogStore } from '@/stores';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import IconWithTooltip from '@/components/atoms/IconWithTooltip/index.vue';
import getTableHeadersConfig from '@/stores/reportsConfig/configurations/tableHeadersConfig';
import { getDurationFormatsArray } from '@/constants/durationFormat';
import notesTableHeaders from '@/stores/reportsConfig/configurations/notesTableHeadersConfig';
import ConfigType from '@/stores/reportsConfig/constants/configType';
import dialogConfig from '@/stores/reportsConfig/configurations/dialogConfig';

const icons = {
  mdiInformationOutline, mdiViewColumn, mdiDecimal, mdiDownload, mdiCog,
};

export default {
  name: 'ReportsTableHeader',
  components: {
    SelectionInput, EvoconVButton, IconWithTooltip,
  },
  props: {
    tableTotals: { type: Object, required: true },
  },
  data() {
    return {
      ...icons,
    };
  },
  computed: {
    ...mapState(useFilterbarStore, ['requestFilterState', 'currentFilterItemsMap']),
    ...mapState(useReportsConfigStore, ['configType', 'activeHeaders', 'notesTableActiveHeaders', 'granularity', 'groupBy']),
    ...mapState(useBookmarkStore, ['bookmarkPresetsMap']),
    ...mapState(useProfileStore, ['reportsDurationFormat', 'language']),
    ...mapState(useDeviceStore, ['isMobileView']),
    getDurationFormatsArray,
    headerTitle() {
      return this.bookmarkPresetsMap[this.configType]?.name || '';
    },
    activeTableHeaders() {
      const headers = this.activeHeaders(getTableHeadersConfig({
        granularity: this.granularity,
        groupBy: this.groupBy,
        configType: this.configType,
        language: this.language,
        durFormatType: this.reportsDurationFormat,
        tableTotals: this.tableTotals,
        requestFilterState: this.requestFilterState,
        currentFilterItemsMap: this.currentFilterItemsMap,
      }));
      return headers.filter((header) => !header.isHidden);
    },
    visibleHeaders() {
      const requestValues = this.requestFilterState.visibleColumns;
      return this.activeTableHeaders.reduce((acc, header) => {
        const headerMatchesGranularity = () => header.id === this.granularity;
        const primaryGroupByEqualsSecondary = () => this.groupBy[0] === header.secondaryId;
        const requestValuesIncludesHeader = () => requestValues.includes(header.id);
        if (headerMatchesGranularity() || primaryGroupByEqualsSecondary() || requestValuesIncludesHeader()) {
          acc.push(header.id);
        }

        return acc;
      }, []);
    },
    exportOptions() {
      return [
        {
          text: `${this.$t('All')} (${this.$t('Excel')})`,
          id: 'all',
          action: this.onExportSpeadsheet,
          isVisible: [ConfigType.DOWNTIME, ConfigType.SPEEDLOSS, ConfigType.SCRAPREASON, ConfigType.QUANTITY, ConfigType.OEE, ConfigType.CHECKLIST, ConfigType.TIME_USAGE].includes(this.configType),
        },
        {
          text: `${this.$t('Notes')} (${this.$t('Excel')})`,
          id: 'notes',
          action: () => {
            this.onNotesSpreadsheetExport({ headers: this.notesTableActiveHeaders(notesTableHeaders(this.configType)) });
          },
          isVisible: [ConfigType.DOWNTIME, ConfigType.SPEEDLOSS].includes(this.configType),
        },
      ].filter((option) => option.isVisible);
    },
    showDurationFormatSelection() {
      return !this.isMobileView && ![ConfigType.QUANTITY].includes(this.configType);
    },
  },
  methods: {
    ...mapActions(useFilterbarStore, ['updateFilterValue', 'triggerDataRequest']),
    ...mapActions(useProfileStore, ['updateCurrentUser']),
    ...mapActions(useReportsConfigStore, ['onTableSpreadsheetExport', 'onNotesSpreadsheetExport']),
    ...mapActions(useGenericDialogStore, ['openDialog']),
    openHelp() {
      const url = this.configType === ConfigType.PRODUCTION_SPEED
        ? 'https://support.evocon.com/Reports-Production-speed-157dae0ba802803e8982dc49f1da7e54'
        : 'https://support.evocon.com/Terms-and-definitions-d40cf5833c50464f889a6de535dda891';
      window.open(url, '_blank');
    },
    setVisibleColumns(columns) {
      this.updateFilterValue({ visibleColumns: columns });
      this.triggerDataRequest();
    },
    setDurationFormat(reportsDurationFormat) {
      this.updateCurrentUser({ reportingTimeFormat: reportsDurationFormat[0] });
    },
    onExportOptionClick([option]) {
      const selectedOption = this.exportOptions.find((exportOption) => exportOption.id === option);
      selectedOption.action();
    },
    onExportSpeadsheet() {
      const headers = this.activeTableHeaders.filter((header) => this.visibleHeaders.includes(header.id));
      this.onTableSpreadsheetExport({ headers });
    },
    openViewSettings() {
      this.openDialog(dialogConfig.REPORTS_VIEW_SETTINGS);
    },
  },
};
</script>
