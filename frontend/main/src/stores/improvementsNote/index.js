import { defineStore } from 'pinia';
import { defineAsyncComponent } from 'vue';

import improvementsNoteApi from '@/api/improvementsNoteApi';
import i18n from '@/services/i18n';
import groupNotes from '@/helpers/groupNotes';

const useImprovementsNoteStore = defineStore('improvementsNote', {
  state: () => ({
    notes: [],
    loading: [],
  }),
  getters: {
    notesMap: (state) => state.notes.reduce((map, note) => ({ ...map, [note.id]: note }), {}),
    notesByMonth: (state) => groupNotes(state.notes),
    isLoading: (state) => !!state.loading.length,
  },
  actions: {
    async fetchNotes(projectId) {
      this.loading.push('loading');
      try {
        const notes = await improvementsNoteApi.getNotes(projectId) || [];
        this.notes = notes;
      } finally {
        this.loading.pop();
      }
    },
    async editNote(note) {
      this.loading.push('loading');
      try {
        await improvementsNoteApi.editNote(note);
        await this.fetchNotes(note.projectId);
      } finally {
        this.loading.pop();
      }
    },
    async createNote(note) {
      this.loading.push('loading');
      try {
        const noteResponse = await improvementsNoteApi.addNote(note);
        this.notes.unshift(noteResponse);
      } finally {
        this.loading.pop();
      }
    },
    async deleteNote(noteId) {
      this.loading.push('loading');
      try {
        await improvementsNoteApi.deleteNote(noteId);
        const index = this.notes.findIndex((n) => Number(n.id) === Number(noteId));
        if (index > -1) {
          this.notes.splice(index, 1);
        }
      } finally {
        this.loading.pop();
      }
    },
    async initEditNoteFlow({ projectId, note, steps }) {
      const { default: useGenericDialogStore } = await import('@/stores/genericDialog');
      const genericDialogStore = useGenericDialogStore();
      const { default: useGenericNotificationStore } = await import('@/stores/genericNotification');
      const genericNotificationStore = useGenericNotificationStore();
      let currentNote = { projectId };
      if (note) {
        currentNote = { ...currentNote, ...note };
      }
      const dialogConfig = {
        title: i18n.global.t('Note'),
        component: defineAsyncComponent(() => import('../../components/organisms/improvements/ImprovementNoteForm/index.vue')),
        allowFullscreen: false,
        data: { steps, note: currentNote },
        width: 606,
        onPrimaryAction: () => {
          genericNotificationStore.openNotification({
            text: i18n.global.t('Note saved'),
            type: 'success',
          });
        },
      };
      genericDialogStore.openDialog(dialogConfig);
    },
    async initDeleteNoteFlow({ noteId }) {
      const { default: useConfirmDialogStore } = await import('@/stores/confirmDialog');
      const confirmDialogStore = useConfirmDialogStore();
      const { default: useGenericNotificationStore } = await import('@/stores/genericNotification');
      const genericNotificationStore = useGenericNotificationStore();
      const dialogConfig = {
        title: i18n.global.t('Confirmation'),
        text: i18n.global.t('Are you sure you want to delete this?'),
        action: async () => {
          await this.deleteNote(noteId);
          genericNotificationStore.openNotification({
            text: i18n.global.t('Note deleted'),
            type: 'success',
          });
        },
        confirmText: i18n.global.t('Delete'),
        cancelText: i18n.global.t('Cancel'),
      };
      confirmDialogStore.openConfirmDialog(dialogConfig);
    },
  },
});

export default useImprovementsNoteStore;
