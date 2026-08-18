<template>
  <v-col cols="6">
    <v-card class="ma-3">
      <GenericTabsRow
        v-model="activeTab"
        :items="tabs"
        :count-func="(val) => getTabCount(val.value)"
        height="56"
        color="black"
      />
      <v-divider />
      <div class="pa-4">
        <improvement-notes
          v-if="activeTab === 0"
          :project="project"
          :can-edit="canEdit"
        />
        <improvement-files-overview
          v-if="activeTab === 1"
          :project="project"
          :can-edit="canEdit"
        />
      </div>
    </v-card>
  </v-col>
</template>
<script>
import { mapState } from 'pinia';

import { useImprovementsNoteStore, useImprovementsFileStore } from '@/stores/index';
import GenericTabsRow from '@/components/molecules/GenericTabsRow/index.vue';
import ImprovementNotes from '@/components/organisms/improvements/ImprovementNotes/index.vue';
import ImprovementFilesOverview from '@/components/organisms/improvements/ImprovementFilesOverview/index.vue';

export default {
  name: 'ImprovementNotesAndFilesSection',
  components: {
    GenericTabsRow,
    ImprovementNotes,
    ImprovementFilesOverview,
  },
  props: {
    project: {
      type: Object,
      default: () => {},
    },
    canEdit: {
      type: Boolean,
    },
  },
  data() {
    return {
      activeTab: 0,
      tabs: [
        { label: this.$t('Notes'), value: 'notes' },
        { label: this.$t('Files'), value: 'files' },
      ],
    };
  },
  computed: {
    ...mapState(useImprovementsNoteStore, ['notes']),
    ...mapState(useImprovementsFileStore, ['files']),
  },
  methods: {
    getTabCount(tabValue) {
      if (tabValue === 'notes') return this.notes.length;
      if (tabValue === 'files') return this.files.length;
      return 0;
    },
  },
};
</script>
