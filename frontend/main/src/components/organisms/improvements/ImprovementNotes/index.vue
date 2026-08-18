<template>
  <div
    v-if="notes.length"
    class="pa-2"
  >
    <v-row class="mb-6 notes-section">
      <v-col
        v-for="(array, month) in notesByMonth"
        :key="month"
        cols="12"
      >
        <span class="text-headline-small text-medium-emphasis">
          {{ getMonthName(month) }}
        </span>
        <improvement-note-card
          v-for="note in array"
          :key="note.id"
          :note="note"
          :steps="actions"
          :project-id="project.id"
        />
      </v-col>
    </v-row>
    <v-card-actions class="pa-0 align-end justify-end">
      <evocon-v-button
        v-if="canEdit && !editableNoteId && notes.length"
        type="primary-light"
        :icon="mdiPlus"
        :text="$t('Note')"
        @click="editNote"
      />
    </v-card-actions>
  </div>
  <empty-view
    v-else
    id="improvement-notes-empty-view"
    :header="$t('No notes added')"
    :description="canEdit ? $t('Add notes to document the improvement journey.') : ''"
    :primary-btn="canEdit ? $t('Note') : ''"
    :primary-btn-icon="mdiPlus"
    :img-url="'notes'"
    @button-clicked="editNote"
  />
</template>
<script>
import { mapState, mapActions } from 'pinia';
import { mdiPlus } from '@mdi/js';
import { format } from 'date-fns';

import { useImprovementsNoteStore, useImprovementsActionsStore } from '@/stores/index';
import ImprovementNoteCard from '@/components/organisms/improvements/ImprovementNoteCard/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import EmptyView from '@/components/atoms/EmptyView/index.vue';
import parseDateStr from '@/helpers/date/parseDateStr';

const vectorIcons = { mdiPlus };

export default {
  name: 'ImprovementNotes',
  components: {
    ImprovementNoteCard,
    EvoconVButton,
    EmptyView,
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
      ...vectorIcons,
      editableNoteId: undefined,
    };
  },
  computed: {
    ...mapState(useImprovementsNoteStore, ['notes', 'notesByMonth']),
    ...mapState(useImprovementsActionsStore, ['actions']),
  },
  methods: {
    ...mapActions(useImprovementsNoteStore, ['initEditNoteFlow']),
    editNote() {
      this.initEditNoteFlow({
        projectId: this.project.id,
        steps: this.actions,
      });
    },
    getMonthName(date) {
      const parsedDate = parseDateStr(`${date}-01`);
      return format(parsedDate, 'MMMM yyyy');
    },
  },
};
</script>
<style lang="less" scoped>
.notes-section {
  max-height: 600px;
  overflow-y: auto;
}
</style>
