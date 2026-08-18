import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import CommentLayer from '@/components/organisms/shiftview/CommentLayer/index.vue';
import { useShiftviewSelectionStore, useCommentStore, useProfileStore } from '@/stores/index';

const createWrapper = (piniaOverrides = {}, options = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });
  const shiftviewSelectionStore = useShiftviewSelectionStore(pinia);
  const profileStore = useProfileStore(pinia);

  vi.spyOn(shiftviewSelectionStore, 'isSelectionActive', 'get').mockReturnValue(piniaOverrides.isSelectionActive ?? false);
  vi.spyOn(profileStore, 'isReadOnly', 'get').mockReturnValue(piniaOverrides.isReadOnly ?? false);

  if (piniaOverrides.commentsRealMap) {
    const commentStore = useCommentStore(pinia);
    vi.spyOn(commentStore, 'commentsRealMap', 'get').mockReturnValue(piniaOverrides.commentsRealMap);
  }

  return shallowMount(CommentLayer, {
    global: { plugins: [pinia] },
    ...options,
  });
};

describe('CommentLayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleClickEvent', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    test('single click when requireOperator is false', async () => {
      const wrapper = createWrapper({}, {
        props: { requireOperator: false },
      });

      const spy = vi.spyOn(wrapper.vm, 'requestOperator');
      const selectSlice = vi.fn();
      const dialogSpy = vi.spyOn(wrapper.vm, 'openDialog');
      wrapper.vm.selectSlice = selectSlice;
      wrapper.vm.clicks = 0;

      wrapper.vm.handleClickEvent();
      vi.runOnlyPendingTimers();

      expect(spy).toHaveBeenCalledTimes(0);
      expect(selectSlice).toHaveBeenCalledTimes(1);
      expect(dialogSpy).toHaveBeenCalledTimes(0);
    });

    test('single click when requireOperator is true', async () => {
      const wrapper = createWrapper({}, {
        props: { requireOperator: true },
      });

      const spy = vi.spyOn(wrapper.vm, 'requestOperator');
      const selectSlice = vi.fn();
      wrapper.vm.selectSlice = selectSlice;
      wrapper.vm.clicks = 0;

      wrapper.vm.handleClickEvent();
      vi.runOnlyPendingTimers();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(selectSlice).toHaveBeenCalledTimes(0);
    });

    test('double click when requireOperator is true', () => {
      const wrapper = createWrapper({}, {
        props: { requireOperator: true },
      });

      const spy = vi.spyOn(wrapper.vm, 'requestOperator');
      const selectSlice = vi.fn();
      wrapper.vm.selectSlice = selectSlice;
      wrapper.vm.clicks = 1;

      wrapper.vm.handleClickEvent();
      vi.runOnlyPendingTimers();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(selectSlice).toHaveBeenCalledTimes(0);
    });

    test('double click when requreOperator is false and selection is not active', () => {
      const wrapper = createWrapper({}, {
        props: { requireOperator: false },
      });

      const spy = vi.spyOn(wrapper.vm, 'requestOperator');
      const selectSlice = vi.fn();
      const dialogSpy = vi.spyOn(wrapper.vm, 'openDialog');
      wrapper.vm.selectSlice = selectSlice;
      wrapper.vm.clicks = 1;

      wrapper.vm.handleClickEvent();
      vi.runOnlyPendingTimers();

      expect(spy).toHaveBeenCalledTimes(0);
      expect(selectSlice).toHaveBeenCalledTimes(1);
      expect(dialogSpy).toHaveBeenCalledTimes(1);
    });

    test('double click when requreOperator is false and selection is active', () => {
      const wrapper = createWrapper({ isSelectionActive: true }, {
        props: { requireOperator: false },
      });

      const spy = vi.spyOn(wrapper.vm, 'requestOperator');
      const selectSlice = vi.fn();
      const dialogSpy = vi.spyOn(wrapper.vm, 'openDialog');
      wrapper.vm.selectSlice = selectSlice;
      wrapper.vm.clicks = 1;

      wrapper.vm.handleClickEvent();
      vi.runOnlyPendingTimers();

      expect(spy).toHaveBeenCalledTimes(0);
      expect(selectSlice).toHaveBeenCalledTimes(0);
      expect(dialogSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCommentPartNames', () => {
    it('returns correct object when comment part length is zero', () => {
      const wrapper = createWrapper();

      const actualResult = wrapper.vm.getCommentPartNames([]);
      expect(actualResult).toStrictEqual({ 0: '' });
    });

    it('returns correct object when comment part length is one and element duration is at least 60', () => {
      const wrapper = createWrapper({ commentsRealMap: new Map([[3, { id: 3, name: 'Stop reason name' }]]) });

      const commentParts = [{ parent: { commentId: 3 }, elementDuration: 60 }];
      const actualResult = wrapper.vm.getCommentPartNames(commentParts);
      expect(actualResult).toStrictEqual({ 0: 'Stop reason name' });
    });

    it('returns correct object when comment part length is one and element duration is less than 60', () => {
      const wrapper = createWrapper({ commentsRealMap: new Map([[3, { id: 3, name: 'Stop reason name' }]]) });

      const commentParts = [{ parent: { commentId: 3 }, elementDuration: 59 }];
      const actualResult = wrapper.vm.getCommentPartNames(commentParts);
      expect(actualResult).toStrictEqual({ 0: '' });
    });

    it('returns correct object when comment part length is two and first part duration is bigger than second part', () => {
      const wrapper = createWrapper({ commentsRealMap: new Map([[3, { id: 3, name: 'Stop reason name' }]]) });

      const commentParts = [{ parent: { commentId: 3 }, elementDuration: 120 }, { parent: { commentId: 3 }, elementDuration: 60 }];
      const actualResult = wrapper.vm.getCommentPartNames(commentParts);
      expect(actualResult).toStrictEqual({ 0: 'Stop reason name' });
    });

    it('returns correct object when comment part length is two and first part duration is smaller than second part but bigger than 180', () => {
      const wrapper = createWrapper({ commentsRealMap: new Map([[3, { id: 3, name: 'Stop reason name' }]]) });

      const commentParts = [{ parent: { commentId: 3 }, elementDuration: 190 }, { parent: { commentId: 3 }, elementDuration: 210 }];
      const actualResult = wrapper.vm.getCommentPartNames(commentParts);
      expect(actualResult).toStrictEqual({ 0: 'Stop reason name' });
    });

    it('returns correct object when comment part length is two and first part duration is less than second part and less than 180, and second part duration is less than 60', () => {
      const wrapper = createWrapper({ commentsRealMap: new Map([[3, { id: 3, name: 'Stop reason name' }]]) });

      const commentParts = [{ parent: { commentId: 3 }, elementDuration: 40 }, { parent: { commentId: 3 }, elementDuration: 50 }];
      const actualResult = wrapper.vm.getCommentPartNames(commentParts);
      expect(actualResult).toStrictEqual({ 0: '' });
    });

    it('returns correct object when comment part length is two and first part duration is less than second part and less than 180, and second part duration is at least 60', () => {
      const wrapper = createWrapper({ commentsRealMap: new Map([[3, { id: 3, name: 'Stop reason name' }]]) });

      const commentParts = [{ parent: { commentId: 3 }, elementDuration: 120 }, { parent: { commentId: 3 }, elementDuration: 180 }];
      const actualResult = wrapper.vm.getCommentPartNames(commentParts);
      expect(actualResult).toStrictEqual({ 1: 'Stop reason name' });
    });
  });
});
