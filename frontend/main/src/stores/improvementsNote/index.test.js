import { setActivePinia, createPinia } from 'pinia';

import useImprovementsNoteStore from './index';

import improvementsNoteApi from '@/api/improvementsNoteApi';
import groupNotes from '@/helpers/groupNotes';

vi.mock('@/api/improvementsNoteApi', () => ({
  default: {
    getNotes: vi.fn(),
    editNote: vi.fn(),
    addNote: vi.fn(),
    deleteNote: vi.fn(),
  },
  __esModule: true,
}));

vi.mock('@/helpers/groupNotes', () => ({
  default: vi.fn(),
}));

const mockOpenDialog = vi.fn();
vi.mock('@/stores/genericDialog', () => ({
  default: () => ({ openDialog: mockOpenDialog }),
}));

const mockOpenNotification = vi.fn();
vi.mock('@/stores/genericNotification', () => ({
  default: () => ({ openNotification: mockOpenNotification }),
}));

const mockOpenConfirmDialog = vi.fn();
vi.mock('@/stores/confirmDialog', () => ({
  default: () => ({ openConfirmDialog: mockOpenConfirmDialog }),
}));

describe('useImprovementsNoteStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useImprovementsNoteStore();
    vi.clearAllMocks();
  });

  test('initial state', () => {
    expect(store.notes).toEqual([]);
    expect(store.loading).toEqual([]);
  });

  describe('actions', () => {
    test('fetchNotes', async () => {
      const notes = [{ id: 1, text: 'Note 1' }, { id: 2, text: 'Note 2' }];
      improvementsNoteApi.getNotes.mockResolvedValue(notes);
      await store.fetchNotes(1);
      expect(improvementsNoteApi.getNotes).toHaveBeenCalledWith(1);
      expect(store.notes).toEqual(notes);
      expect(store.isLoading).toBe(false);
    });

    test('createNote', async () => {
      const note = { text: 'New note' };
      const noteResponse = { id: 1, text: 'New note' };
      improvementsNoteApi.addNote.mockResolvedValue(noteResponse);
      await store.createNote(note);
      expect(improvementsNoteApi.addNote).toHaveBeenCalledWith(note);
      expect(store.notes).toEqual([noteResponse]);
      expect(store.isLoading).toBe(false);
    });

    test('deleteNote', async () => {
      store.notes = [{ id: 1, text: 'Note 1' }, { id: 2, text: 'Note 2' }];
      improvementsNoteApi.deleteNote.mockResolvedValue();
      await store.deleteNote(1);
      expect(improvementsNoteApi.deleteNote).toHaveBeenCalledWith(1);
      expect(store.notes).toEqual([{ id: 2, text: 'Note 2' }]);
      expect(store.isLoading).toBe(false);
    });

    test('editNote', async () => {
      const note = { id: 1, text: 'Updated', projectId: 1 };
      improvementsNoteApi.editNote.mockResolvedValue();
      improvementsNoteApi.getNotes.mockResolvedValue([note]);
      await store.editNote(note);
      expect(improvementsNoteApi.editNote).toHaveBeenCalledWith(note);
      expect(store.isLoading).toBe(false);
    });

    test('initEditNoteFlow opens dialog', async () => {
      await store.initEditNoteFlow({ projectId: 1, note: { id: 1 }, steps: [] });
      expect(mockOpenDialog).toHaveBeenCalledTimes(1);
      expect(mockOpenDialog).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ note: { projectId: 1, id: 1 } }),
        width: 606,
      }));
    });

    test('initDeleteNoteFlow opens confirm dialog', async () => {
      await store.initDeleteNoteFlow({ noteId: 1 });
      expect(mockOpenConfirmDialog).toHaveBeenCalledTimes(1);
    });
  });

  describe('getters', () => {
    test('notesMap', () => {
      store.notes = [{ id: 1, text: 'Note 1' }, { id: 2, text: 'Note 2' }];
      expect(store.notesMap).toEqual({
        1: { id: 1, text: 'Note 1' },
        2: { id: 2, text: 'Note 2' },
      });
    });

    test('notesByMonth', () => {
      store.notes = [{ id: 1, text: 'Note 1' }];
      const result = { '2021-01': [{ id: 1 }] };
      groupNotes.mockReturnValue(result);
      expect(store.notesByMonth).toEqual(result);
    });

    test('isLoading', () => {
      expect(store.isLoading).toBe(false);
      store.loading.push('loading');
      expect(store.isLoading).toBe(true);
    });
  });
});
