import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { nextTick } from 'vue';

import ReportsFilterBar from './index.vue';

import { useBookmarkStore, useReportsConfigStore, useFilterbarStore } from '@/stores';
import configType from '@/stores/reportsConfig/constants/configType';

const $route = {
  href: '',
};

const applyBookmarkGetters = (pinia, { currentBookmark = undefined, bookmarkPresetsMap = { DOWNTIME: {} }, isCurrentBookmarkModified } = {}) => {
  const bookmarkStore = useBookmarkStore(pinia);
  bookmarkStore.currentBookmark = currentBookmark;
  bookmarkStore.bookmarkPresetsMap = bookmarkPresetsMap;
  if (isCurrentBookmarkModified !== undefined) {
    bookmarkStore.isCurrentBookmarkModified = isCurrentBookmarkModified;
  }
};

const applyReportsConfigGetters = (pinia) => {
  const reportsConfigStore = useReportsConfigStore(pinia);
  reportsConfigStore.filterConfiguration = () => new Map();
  reportsConfigStore.disabledParams = [];
  reportsConfigStore.configType = configType.DOWNTIME;
};

const applyFilterbarGetters = (pinia, { notAppliedFilters = [{ label: 'Status' }, { label: 'Type' }] } = {}) => {
  const filterbarStore = useFilterbarStore(pinia);
  filterbarStore.visibleFilters = () => ['search', 'factoryId', 'stationId'];
  filterbarStore.notAppliedFilters = notAppliedFilters;
};

const createPinia = ({ bookmarkOverrides = {}, filterbarOverrides = {} } = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
    initialState: {
      filterbar: {
        currentFilterState: {},
        requestFilterState: {},
        calculatedFilterConfig: new Map([
          ['search', {}],
          ['factoryId', {}],
          ['stationId', {}],
        ]),
      },
    },
  });
  applyBookmarkGetters(pinia, bookmarkOverrides);
  applyReportsConfigGetters(pinia);
  applyFilterbarGetters(pinia, filterbarOverrides);
  return pinia;
};

describe('ReportsFilterBar', () => {
  it('renders', () => {
    const wrapper = shallowMount(ReportsFilterBar, {
      global: {
        plugins: [createPinia()],
        mocks: { $route },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(ReportsFilterBar, {
      global: {
        plugins: [createPinia()],
        mocks: { $route },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with bookmark not modified', async () => {
    const wrapper = shallowMount(ReportsFilterBar, {
      global: {
        plugins: [createPinia({ filterbarOverrides: { notAppliedFilters: [] } })],
        mocks: { $route },
      },
    });

    await nextTick();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with modified bookmark', async () => {
    const wrapper = shallowMount(ReportsFilterBar, {
      global: {
        plugins: [createPinia({ bookmarkOverrides: { isCurrentBookmarkModified: () => true } })],
        mocks: { $route },
      },
    });

    await nextTick();

    expect(wrapper.element).toMatchSnapshot();
  });
});
