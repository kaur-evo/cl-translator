import request from '@/api/request';

const bookmarkApi = {
  async listBookmarks() {
    const { data } = await request.get('/reports/bookmarks');
    return data;
  },
  async postBookmark(bookmark) {
    const { data } = await request.post('/reports/bookmarks', bookmark);
    return data;
  },
  async putBookmark(bookmark) {
    if (!bookmark.id) throw new Error('bookmark put requires id');
    const { data } = await request.put(`/reports/bookmarks/${bookmark.id}`, bookmark);
    return data;
  },
  async deleteBookmark(bookmarkId) {
    if (!bookmarkId) throw new Error('bookmark delete requires id');
    const { data } = await request.delete(`/reports/bookmarks/${bookmarkId}`);
    return data;
  },

  async setBookmarkOrder(bookmarkId, ordering) {
    if (!bookmarkId) throw new Error('bookmark id required');
    const { data } = await request.patch(`/reports/bookmarks/${bookmarkId}/order`, ordering);
    return data;
  },
};

export default bookmarkApi;
