import request from './request';

const improvementsNoteApi = {
  async getNotes(projectId) {
    const { data } = await request.get(`/improvements/notes/${projectId}`);
    return data;
  },

  async addNote(note) {
    const { data } = await request.post('/improvements/notes', note);
    return data;
  },

  async editNote(note) {
    const { data } = await request.put(`/improvements/notes/${note.id}`, note);
    return data;
  },

  async deleteNote(noteId) {
    const { data } = await request.delete(`/improvements/notes/${noteId}`);
    return data;
  },
};

export default improvementsNoteApi;
