import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { nextTick } from 'vue';

import index from './index.vue';

import { useCustomReportStore, useBookmarkStore, useFilterbarStore, useReportsConfigStore, useDeviceStore } from '@/stores';

const applyDefaultGetters = (pinia, { isMobileView = false, orderedBookmarks = [] } = {}) => {
  const customReportStore = useCustomReportStore(pinia);
  customReportStore.customReports = [];
  customReportStore.defaultReports = [];
  customReportStore.customReportsLoading = {};

  const bookmarkStore = useBookmarkStore(pinia);
  bookmarkStore.orderedBookmarks = orderedBookmarks;
  bookmarkStore.bookmarkPresetsMap = {};
  bookmarkStore.currentBookmark = undefined;

  const filterbarStore = useFilterbarStore(pinia);
  filterbarStore.getUrlWithPassableFilterValues = vi.fn();

  const reportsConfigStore = useReportsConfigStore(pinia);
  reportsConfigStore.filterConfiguration = vi.fn();

  useDeviceStore(pinia).isMobileView = isMobileView;
};

const createPinia = (overrides = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
    initialState: {
      device: { screen: { width: 1920, height: 1080 } },
    },
  });
  applyDefaultGetters(pinia, overrides);
  return pinia;
};

const propsDefault = {
  mini: true,
};

describe('ReportsBookmarkDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = shallowMount(index, {
      props: { ...propsDefault },
      global: {
        plugins: [createPinia()],
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(index, {
      props: { ...propsDefault },
      global: {
        plugins: [createPinia()],
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that onBookmarkReorder is called when bookmark is reordered', async () => {
    const pinia = createPinia({
      orderedBookmarks: [
        { id: '1', name: 'Bookmark 1', ordering: 0 },
        { id: '2', name: 'Bookmark 2', ordering: 1 },
        { id: '3', name: 'Bookmark 3', ordering: 2 },
      ],
    });
    const bookmarkStore = useBookmarkStore(pinia);
    const wrapper = shallowMount(index, {
      props: { ...propsDefault },
      global: {
        plugins: [pinia],
      },
    });

    await nextTick();

    await wrapper.vm.onBookmarkReorder({ moved: { element: { id: '1' }, newIndex: 1, oldIndex: 0 } });
    expect(bookmarkStore.setNewBookmarkOrdering).toHaveBeenCalledTimes(1);
    expect(bookmarkStore.setNewBookmarkOrdering).toHaveBeenCalledWith({ bookmarkId: '1', order: 1.5 });
  });

  test('that groupedItems has bookmarks, system reports, default reports and custom reports if not in mobile', () => {
    const wrapper = shallowMount(index, {
      props: { ...propsDefault },
      global: {
        plugins: [createPinia({ isMobileView: false })],
      },
    });

    const { groupedItems } = wrapper.vm;
    expect(groupedItems).toHaveLength(4);
    expect(groupedItems).toEqual([
      { items: wrapper.vm.savedBookmarks, reOrderFn: expect.any(Function) },
      { items: wrapper.vm.predefinedBookmarks },
      { items: wrapper.vm.defaultReportsList },
      { items: wrapper.vm.customReportsList },
    ]);
  });

  test('that groupedItems has only bookmarks and system reports in mobile', () => {
    const wrapper = shallowMount(index, {
      props: { ...propsDefault },
      global: {
        plugins: [createPinia({ isMobileView: true })],
      },
    });

    const { groupedItems } = wrapper.vm;
    expect(groupedItems).toHaveLength(2);
    expect(groupedItems).toEqual([
      { items: wrapper.vm.savedBookmarks, reOrderFn: expect.any(Function) },
      { items: wrapper.vm.predefinedBookmarks },
    ]);
  });
});
