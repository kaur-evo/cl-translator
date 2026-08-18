<template>
  <form-dialog-template
    :primary-segment-title="title"
  >
    <template #primary-segment>
      <evocon-v-table
        v-model:options="tableOptions"
        :headers="activeTableHeaders"
        :items="calculatedNotesData"
        :empty-view-header="$t('No results')"
        :empty-view-description="$t('Please try again with other settings.')"
        :loading="isNotesLoading"
        hide-default-footer
        height="500px"
        width="100%"
      />
    </template>
    <template #actions>
      <v-spacer />
      <evocon-v-button
        :text="$t('Close')"
        @click="closeDialog()"
      />
    </template>
  </form-dialog-template>
</template>
<script>
import { mapActions, mapState } from 'pinia';

import { useGenericDialogStore, useReportsConfigStore } from '@/stores';
import EvoconVTable from '@/components/molecules/EvoconVTable/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import FormDialogTemplate from '@/components/templates/FormDialogTemplate/index.vue';
import notesTableHeaders from '@/stores/reportsConfig/configurations/notesTableHeadersConfig';

export default {
  name: 'ReportsNotesDialog',
  components: {
    FormDialogTemplate,
    EvoconVTable,
    EvoconVButton,
  },
  data() {
    return {
      tableOptions: {
        itemsPerPage: -1,
      },
    };
  },
  computed: {
    ...mapState(useGenericDialogStore, ['dialogData']),
    ...mapState(useReportsConfigStore, [
      'calculatedNotesData',
      'isNotesLoading',
      'notesTableActiveHeaders',
      'configType',
    ]),
    currentRow() {
      return this.dialogData?.item;
    },
    title() {
      return `${this.$t('Notes')}: ${this.currentRow?.tableTimeLabel}`;
    },
    activeTableHeaders() {
      return this.notesTableActiveHeaders(notesTableHeaders(this.configType));
    },
  },
  mounted() {
    this.loadReportsNotesTableData({ row: this.currentRow });
  },
  methods: {
    ...mapActions(useReportsConfigStore, ['loadReportsNotesTableData']),
    ...mapActions(useGenericDialogStore, ['closeDialog']),

  },
};
</script>
