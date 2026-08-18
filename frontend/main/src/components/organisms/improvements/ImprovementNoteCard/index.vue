<template>
  <v-row
    class="mt-4 align-baseline notes-row"
    :class="{ editable: note.createdBy !== currentUser.username }"
  >
    <v-col
      v-if="note.id !== -1"
      cols="12"
      sm="4"
      lg="3"
      xl="2"
    >
      <div class="text-label-small text-high-emphasis">
        {{ note.createdByName }}
      </div>
      <div class="mt-2 text-label-small text-medium-emphasis">
        {{ noteDateTimeLabel }}
      </div>
      <div class="mt-1 action-buttons d-flex align-center">
        <improvement-step-number
          v-if="note.stepId && stepsMap[note.stepId]"
          :step="stepsMap[note.stepId]"
          :has-tooltip="true"
          :step-number="stepsMap[note.stepId].ordering"
        />
        <template v-if="note.createdBy === currentUser.username">
          <evocon-v-button
            class="hidden-btn"
            :icon="mdiDelete"
            @click="deleteNote"
          />
          <evocon-v-button
            class="hidden-btn"
            :icon="mdiPencil"
            @click="editNote"
          />
        </template>
      </div>
    </v-col>
    <v-col
      class="px-5"
      cols="12"
      sm="8"
      lg="9"
      xl="10"
    >
      <p
        v-for="(paragraph, i) in getNoteParagraphs(note.note)"
        :key="i"
      >
        {{ paragraph }}
      </p>
    </v-col>
  </v-row>
</template>
<script>
import { mapState, mapActions } from 'pinia';
import { mdiDelete, mdiPencil } from '@mdi/js';

import { useProfileStore, useImprovementsNoteStore } from '@/stores/index';
import { formatDate } from '@/helpers/date/formatDate';
import ImprovementStepNumber from '@/components/organisms/improvements/ImprovementStepNumber/index.vue';
import { formatTime } from '@/helpers/time/formatTime';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';

const vectorIcons = { mdiDelete, mdiPencil };

export default {
  name: 'ImprovementNoteCard',
  components: {
    ImprovementStepNumber,
    EvoconVButton,
  },
  props: {
    note: {
      type: Object,
      required: true,
    },
    projectId: {
      type: [Number, String],
      required: true,
    },
    steps: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      ...vectorIcons,
    };
  },
  computed: {
    ...mapState(useProfileStore, ['currentUser']),
    noteDateTimeLabel() {
      return `${formatTime(this.note.createdDate)} · ${formatDate(this.note.createdDate, 'long')}`;
    },
    stepsMap() {
      return this.steps.reduce((acc, step) => {
        acc[step.id] = step;
        return acc;
      }, {});
    },
  },
  methods: {
    ...mapActions(useImprovementsNoteStore, ['initEditNoteFlow', 'initDeleteNoteFlow']),
    editNote() {
      this.initEditNoteFlow({
        note: this.note,
        projectId: this.projectId,
        steps: this.steps,
      });
    },
    deleteNote() {
      this.initDeleteNoteFlow({
        noteId: this.note.id,
      });
    },
    getNoteParagraphs(note) {
      return note.split('\n');
    },
  },
};
</script>
<style lang="less" scoped>
.notes-row {
  .action-buttons {
    .hidden-btn {
      visibility: hidden;
    }
  }

  &:not(.editable) {
    &:hover {
      .action-buttons {
        .hidden-btn {
          visibility: visible;
        }
      }
    }
  }
}
</style>
