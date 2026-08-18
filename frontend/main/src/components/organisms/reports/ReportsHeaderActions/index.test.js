import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

import { useReportsConfigStore, useBookmarkStore, useDeviceStore, useFilterbarStore } from '@/stores';
import copyToClipboard from '@/helpers/copyToClipboard';

vi.mock('@/helpers/copyToClipboard', () => ({
  default: vi.fn((val) => val),
  __esModule: true,
}));

const $route = { href: '' };

const applyDefaultGetters = (pinia, {
  isMobileView = false,
  isUserBookmark = false,
  currentBookmark = {},
  isCurrentBookmarkModified,
  visibleFilters = () => [],
} = {}) => {
  const reportsConfigStore = useReportsConfigStore(pinia);
  reportsConfigStore.isGeneratingPdf = undefined;

  const bookmarkStore = useBookmarkStore(pinia);
  bookmarkStore.currentBookmark = currentBookmark;
  bookmarkStore.bookmarkPresetsMap = undefined;
  bookmarkStore.isCurrentBookmarkModified = isCurrentBookmarkModified === undefined
    ? vi.fn()
    : isCurrentBookmarkModified;
  bookmarkStore.isUserBookmark = isUserBookmark;

  const filterbarStore = useFilterbarStore(pinia);
  filterbarStore.visibleFilters = visibleFilters;

  useDeviceStore(pinia).isMobileView = isMobileView;
};

const createPinia = ({
  overrides = {},
  filterbarState = {},
} = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
    initialState: {
      device: { screen: { width: 1920, height: 1080 } },
      filterbar: {
        currentFilterState: {},
        requestFilterState: {},
        calculatedFilterConfig: new Map(),
        ...filterbarState,
      },
    },
  });
  applyDefaultGetters(pinia, overrides);
  return pinia;
};

describe('ReportsHeaderActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = shallowMount(index, {
      global: {
        plugins: [createPinia()],
        mocks: { $route },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(index, {
      global: {
        plugins: [createPinia()],
        mocks: { $route },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile view', () => {
    const wrapper = shallowMount(index, {
      global: {
        plugins: [createPinia({ overrides: { isMobileView: true } })],
        mocks: { $route },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('has correct extraMenuItems when isUserBookmark is false', async () => {
    const wrapper = shallowMount(index, {
      global: {
        plugins: [createPinia({ overrides: { isUserBookmark: false } })],
        mocks: { $route },
      },
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.extraMenuItems).toMatchSnapshot();
  });

  it('has correct extraMenuItems when isUserBookmark is true', async () => {
    const wrapper = shallowMount(index, {
      global: {
        plugins: [createPinia({ overrides: { isUserBookmark: true } })],
        mocks: { $route },
      },
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.extraMenuItems).toMatchSnapshot();
  });

  it('has correct extraMenuItems in mobile', async () => {
    const wrapper = shallowMount(index, {
      global: {
        plugins: [createPinia({ overrides: { isMobileView: true } })],
        mocks: { $route },
      },
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.extraMenuItems).toMatchSnapshot();
  });

  test('that onCopyLink calls copyToClipboard and notifies success', () => {
    navigator.clipboard = { writeText: vi.fn() };
    const wrapper = shallowMount(index, {
      global: {
        plugins: [createPinia()],
        mocks: { $route },
      },
    });

    const notifySuccess = vi.spyOn(wrapper.vm, 'notifySuccess');
    wrapper.vm.onCopyLink();

    expect(copyToClipboard).toHaveBeenCalledTimes(1);
    expect(notifySuccess).toHaveBeenCalledTimes(1);
  });

  describe('isSaveDisabled', () => {
    it('returns true if isMobileView is false and isCurrentBookmarkModified is false', () => {
      const wrapper = shallowMount(index, {
        global: {
          plugins: [createPinia({
            overrides: { isMobileView: false, isCurrentBookmarkModified: () => false },
          })],
          mocks: { $route },
        },
      });

      expect(wrapper.vm.isSaveDisabled).toBe(true);
    });

    it('returns false if isMobileView is false and isCurrentBookmarkModified is true', () => {
      const wrapper = shallowMount(index, {
        global: {
          plugins: [createPinia({
            overrides: { isMobileView: false, isCurrentBookmarkModified: () => true },
          })],
          mocks: { $route },
        },
      });

      expect(wrapper.vm.isSaveDisabled).toBe(false);
    });

    it('returns true if isMobileView is true and no requestFilterState param is in visibleFilters', () => {
      const wrapper = shallowMount(index, {
        global: {
          plugins: [createPinia({
            overrides: { isMobileView: true, visibleFilters: () => ['commentId'] },
            filterbarState: { requestFilterState: { stationId: [1, 2], factoryId: [5] } },
          })],
          mocks: { $route },
        },
      });

      expect(wrapper.vm.isSaveDisabled).toBe(true);
    });

    it('returns true if requestFilterState param is in visibleFilters and equal to bookmark param', () => {
      const wrapper = shallowMount(index, {
        global: {
          plugins: [createPinia({
            overrides: {
              isMobileView: true,
              visibleFilters: () => ['stationId'],
              currentBookmark: { url: 'http://test.com?stationId%5B%5D=%5B53%5D' },
            },
            filterbarState: { requestFilterState: { stationId: [53] } },
          })],
          mocks: { $route },
        },
      });

      expect(wrapper.vm.isSaveDisabled).toBe(true);
    });

    it('returns false if requestFilterState param is in visibleFilters and not equal to bookmark param', () => {
      const wrapper = shallowMount(index, {
        global: {
          plugins: [createPinia({
            overrides: {
              isMobileView: true,
              visibleFilters: () => ['stationId'],
              currentBookmark: { url: 'http://test.com?stationId%5B%5D=%5B53%5D' },
            },
            filterbarState: { requestFilterState: { stationId: [1] } },
          })],
          mocks: { $route },
        },
      });

      expect(wrapper.vm.isSaveDisabled).toBe(false);
    });

    it('returns true if requestFilterState param is in visibleFilters, missing from bookmark, but equal with default value', () => {
      const wrapper = shallowMount(index, {
        global: {
          plugins: [createPinia({
            overrides: {
              isMobileView: true,
              visibleFilters: () => ['factoryId'],
              currentBookmark: { url: 'http://test.com?stationId%5B%5D=%5B53%5D' },
            },
            filterbarState: {
              requestFilterState: { factoryId: [] },
              calculatedFilterConfig: new Map([['factoryId', { defaultValue: [] }]]),
            },
          })],
          mocks: { $route },
        },
      });

      expect(wrapper.vm.isSaveDisabled).toBe(true);
    });

    it('returns false if requestFilterState param is in visibleFilters, missing from bookmark and not equal with default value', () => {
      const wrapper = shallowMount(index, {
        global: {
          plugins: [createPinia({
            overrides: {
              isMobileView: true,
              visibleFilters: () => ['factoryId'],
              currentBookmark: { url: 'http://test.com?stationId%5B%5D=%5B53%5D' },
            },
            filterbarState: {
              requestFilterState: { factoryId: [1] },
              calculatedFilterConfig: new Map([['factoryId', { defaultValue: [] }]]),
            },
          })],
          mocks: { $route },
        },
      });

      expect(wrapper.vm.isSaveDisabled).toBe(false);
    });
  });
});
