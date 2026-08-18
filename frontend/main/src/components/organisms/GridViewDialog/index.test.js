import { flushPromises, shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import GridViewDialog from './index.vue';

import dashboardApi from '@/api/dashboardApi';
import urlShortenerApi from '@/api/urlShortenerApi';
import useBookmarkStore from '@/stores/bookmark';
import useDeviceStore from '@/stores/device';

vi.mock('@/api/dashboardApi');
dashboardApi.loadDashboardState = () => ({ pages: [{ id: 1, name: 'Page 1' }, { id: 2, name: 'Page 2' }] });

vi.mock('@/api/urlShortenerApi');
const saveUrl = vi.fn().mockResolvedValue('testurl');
urlShortenerApi.saveUrl = saveUrl;

const createPinia = ({
  showFullscreenDialogs = false,
  bookmarks = [],
  bookmarkPresetsMap = {},
} = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
    initialState: {
      station: {
        stations: [{ id: 1, name: 'Station 1' }, { id: 2, name: 'Station 2' }, { id: 3, name: 'Station 3' }],
        stationGroups: [{ id: 1, name: 'Group 1' }, { id: 2, name: 'Group 2' }],
      },
    },
  });
  const deviceStore = useDeviceStore(pinia);
  deviceStore.showFullscreenDialogs = showFullscreenDialogs;
  const bookmarkStore = useBookmarkStore(pinia);
  bookmarkStore.bookmarks = bookmarks;
  bookmarkStore.bookmarkPresetsMap = bookmarkPresetsMap;
  return pinia;
};

const mountWithPinia = (pinia) => shallowMount(GridViewDialog, {
  global: {
    plugins: [pinia],
  },
});

describe('GridViewDialog', () => {
  let originalLocationDescriptor;
  beforeEach(() => {
    originalLocationDescriptor = Object.getOwnPropertyDescriptor(window, 'location');

    const mockLocation = {
      origin: 'testlocation',
      href: 'https://testlocation/somepath',
      assign: vi.fn(),
      replace: vi.fn(),
      reload: vi.fn(),
    };

    Object.defineProperty(window, 'location', {
      configurable: true,
      enumerable: true,
      value: mockLocation,
      writable: true,
    });

    vi.spyOn(window, 'open').mockImplementation(() => null);
  });

  afterEach(() => {
    if (originalLocationDescriptor) {
      Object.defineProperty(window, 'location', originalLocationDescriptor);
    } else {
      delete window.location;
    }
    vi.clearAllMocks();
  });

  it('renders correctly', async () => {
    const wrapper = mountWithPinia(createPinia());
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in tablet', async () => {
    const wrapper = mountWithPinia(createPinia({ showFullscreenDialogs: true }));
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile', async () => {
    const wrapper = mountWithPinia(createPinia({ showFullscreenDialogs: true }));
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if url is generated', async () => {
    const wrapper = mountWithPinia(createPinia());
    wrapper.vm.shortUrl = 'testurl';
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('cardHeight', () => {
    it('returns 350px if there is just one row', () => {
      const wrapper = mountWithPinia(createPinia());
      wrapper.vm.selectedViews = [['dashboard', 'shiftview']];
      expect(wrapper.vm.cardHeight).toEqual('350px');
    });

    it('returns 200px if there are two rows', () => {
      const wrapper = mountWithPinia(createPinia());
      wrapper.vm.selectedViews = [['dashboard', 'shiftview'], ['shiftview', 'shiftview']];
      expect(wrapper.vm.cardHeight).toEqual('200px');
    });

    it('returns 150px if there are three rows', () => {
      const wrapper = mountWithPinia(createPinia());
      wrapper.vm.selectedViews = [['dashboard', 'shiftview'], ['shiftview', 'shiftview'], ['dashboard', 'dashboard']];
      expect(wrapper.vm.cardHeight).toEqual('150px');
    });
  });

  describe('addRow', () => {
    it('adds a new row with shiftview slot to given index', () => {
      const wrapper = mountWithPinia(createPinia());
      wrapper.vm.selectedViews = [[{ module: 'dashboard', id: 1 }, { module: 'shiftview', id: 2 }]];
      wrapper.vm.addRow(0);
      expect(wrapper.vm.selectedViews).toEqual([[{ module: 'shiftview', id: null }], [{ module: 'dashboard', id: 1 }, { module: 'shiftview', id: 2 }]]);
      wrapper.vm.addRow(2);
      expect(wrapper.vm.selectedViews).toEqual([[{ module: 'shiftview', id: null }], [{ module: 'dashboard', id: 1 }, { module: 'shiftview', id: 2 }], [{ module: 'shiftview', id: null }]]);
    });

    it('doesnt add a new row if there are already 3 rows', () => {
      const wrapper = mountWithPinia(createPinia());
      wrapper.vm.selectedViews = [
        [{ module: 'dashboard', id: 1 }, { module: 'shiftview', id: 2 }],
        [{ module: 'dashboard', id: 1 }, { module: 'shiftview', id: 2 }],
        [{ module: 'dashboard', id: 1 }, { module: 'shiftview', id: 2 }],
      ];
      wrapper.vm.addRow(1);
      expect(wrapper.vm.selectedViews).toEqual([
        [{ module: 'dashboard', id: 1 }, { module: 'shiftview', id: 2 }],
        [{ module: 'dashboard', id: 1 }, { module: 'shiftview', id: 2 }],
        [{ module: 'dashboard', id: 1 }, { module: 'shiftview', id: 2 }],
      ]);
    });
  });

  describe('addSlot', () => {
    it('adds a new slot with shiftview to given row and index', () => {
      const wrapper = mountWithPinia(createPinia());
      wrapper.vm.selectedViews = [[{ module: 'dashboard', id: 1 }, { module: 'shiftview', id: 2 }]];
      wrapper.vm.addSlot(wrapper.vm.selectedViews[0], 0);
      expect(wrapper.vm.selectedViews).toEqual([[{ module: 'shiftview', id: null }, { module: 'dashboard', id: 1 }, { module: 'shiftview', id: 2 }]]);
      wrapper.vm.addSlot(wrapper.vm.selectedViews[0], 3);
      expect(wrapper.vm.selectedViews).toEqual([[{ module: 'shiftview', id: null }, { module: 'dashboard', id: 1 }, { module: 'shiftview', id: 2 }, { module: 'shiftview', id: null }]]);
    });

    it('doesnt add a new slot if there are already 4 slots in the row', () => {
      const wrapper = mountWithPinia(createPinia());
      wrapper.vm.selectedViews = [[
        { module: 'dashboard', id: 1 },
        { module: 'shiftview', id: 2 },
        { module: 'dashboard', id: 1 },
        { module: 'shiftview', id: 2 },
      ]];
      wrapper.vm.addSlot(wrapper.vm.selectedViews[0], 2);
      expect(wrapper.vm.selectedViews).toEqual([[
        { module: 'dashboard', id: 1 },
        { module: 'shiftview', id: 2 },
        { module: 'dashboard', id: 1 },
        { module: 'shiftview', id: 2 },
      ]]);
    });
  });

  describe('removeSlot', () => {
    it('removes slot from given row and index', async () => {
      const wrapper = mountWithPinia(createPinia());
      wrapper.vm.selectedViews = [[
        { module: 'dashboard', id: 1 },
        { module: 'shiftview', id: 2 },
        { module: 'dashboard', id: 1 },
      ]];
      wrapper.vm.removeSlot(0, 0);
      expect(wrapper.vm.selectedViews).toEqual([[{ module: 'shiftview', id: 2 }, { module: 'dashboard', id: 1 }]]);
    });

    it('removes entire row if there is only one slot left in the row', async () => {
      const wrapper = mountWithPinia(createPinia());
      wrapper.vm.selectedViews = [
        [{ module: 'dashboard', id: 1 }, { module: 'shiftview', id: 2 }],
        [{ module: 'dashboard', id: 1 }],
      ];
      wrapper.vm.removeSlot(1, 0);
      expect(wrapper.vm.selectedViews).toEqual([[{ module: 'dashboard', id: 1 }, { module: 'shiftview', id: 2 }]]);
    });
  });

  test('that onSelectModule updates selectedViews correctly', async () => {
    const wrapper = mountWithPinia(createPinia());
    wrapper.vm.selectedViews = [
      [{ module: 'dashboard', id: 1 }, { module: 'shiftview', id: 2 }],
      [{ module: 'dashboard', id: 1 }, { module: 'shiftview', id: 2 }],
    ];
    wrapper.vm.onSelectModule(1, 0, 'report');
    expect(wrapper.vm.selectedViews).toEqual([
      [{ module: 'dashboard', id: 1 }, { module: 'shiftview', id: 2 }],
      [{ module: 'report', id: null }, { module: 'shiftview', id: 2 }],
    ]);
  });

  describe('onSelectModuleItem', () => {
    it('updates selectedViews correctly', async () => {
      const wrapper = mountWithPinia(createPinia());
      wrapper.vm.selectedViews = [
        [{ module: 'dashboard', id: 1 }, { module: 'shiftview', id: 2 }],
        [{ module: 'dashboard', id: 1 }, { module: 'shiftview', id: 2 }],
      ];
      wrapper.vm.onSelectModuleItem(0, 1, 3);
      expect(wrapper.vm.selectedViews).toEqual([
        [{ module: 'dashboard', id: 1 }, { module: 'shiftview', id: 3 }],
        [{ module: 'dashboard', id: 1 }, { module: 'shiftview', id: 2 }],
      ]);
    });

    it('clears validation errors when item is selected', async () => {
      const wrapper = mountWithPinia(createPinia());
      wrapper.vm.validationResult = [
        ['error', 'error'],
        ['error', 'error'],
      ];
      wrapper.vm.onSelectModuleItem(0, 1, 3);
      expect(wrapper.vm.validationResult).toEqual([
        ['error', 'valid'],
        ['error', 'error'],
      ]);
    });
  });

  describe('getModuleItems', () => {
    it('returns stations if view is shiftview', async () => {
      const wrapper = mountWithPinia(createPinia());
      await flushPromises();
      expect(wrapper.vm.getModuleItems('shiftview')).toEqual([{ id: 1, name: 'Station 1' }, { id: 2, name: 'Station 2' }, { id: 3, name: 'Station 3' }]);
    });

    it('returns factory view items if view is factory-view', async () => {
      const wrapper = mountWithPinia(createPinia());
      await flushPromises();
      expect(wrapper.vm.getModuleItems('factory-view')).toEqual([{ name: 'Live', id: 'realtime' }, { name: 'Timeline', id: 'timeline' }]);
    });

    it('returns dashboard tabs if view is dashboard', async () => {
      const wrapper = mountWithPinia(createPinia());
      await flushPromises();
      expect(wrapper.vm.getModuleItems('dashboard')).toEqual([{ id: 1, name: 'Page 1' }, { id: 2, name: 'Page 2' }]);
    });

    it('returns bookmarks and presets if view is report', async () => {
      const wrapper = mountWithPinia(createPinia({
        bookmarks: [
          { id: 'bookmark1', name: 'Bookmark 1', url: '/report/bookmark1' },
          { id: 'bookmark2', name: 'Bookmark 2', url: '/report/bookmark2' },
          { id: 'bookmark3', name: 'Bookmark 3', url: '/report/bookmark3' },
        ],
        bookmarkPresetsMap: {
          preset1: { id: 'preset1', name: 'Preset 1', url: '/report/preset1' },
          preset2: { id: 'preset2', name: 'Preset 2', url: '/report/preset2' },
        },
      }));
      await flushPromises();
      expect(wrapper.vm.getModuleItems('report')).toEqual([
        { name: 'Bookmark 1', id: '/report/bookmark1', url: '/report/bookmark1' },
        { name: 'Bookmark 2', id: '/report/bookmark2', url: '/report/bookmark2' },
        { name: 'Bookmark 3', id: '/report/bookmark3', url: '/report/bookmark3' },
        { name: 'Preset 1', id: '/report/preset1', url: '/report/preset1' },
        { name: 'Preset 2', id: '/report/preset2', url: '/report/preset2' },
      ]);
    });

    it('returns empty array if view is not shiftview, dashboard or report', async () => {
      const wrapper = mountWithPinia(createPinia());
      await flushPromises();
      expect(wrapper.vm.getModuleItems('other')).toEqual([]);
    });

    it('returns empty array if view is not defined', async () => {
      const wrapper = mountWithPinia(createPinia());
      await flushPromises();
      expect(wrapper.vm.getModuleItems(null)).toEqual([]);
    });
  });

  test('that getModulePrepend returns correct prepend for each module', () => {
    const wrapper = mountWithPinia(createPinia());
    expect(wrapper.vm.getModulePrepend('shiftview')).toEqual('Station');
    expect(wrapper.vm.getModulePrepend('factory-view')).toEqual('Tab');
    expect(wrapper.vm.getModulePrepend('dashboard')).toEqual('Tab');
    expect(wrapper.vm.getModulePrepend('report')).toEqual('Report');
    expect(wrapper.vm.getModulePrepend('other')).toEqual('');
  });

  test('that generateShortUrl calls urlShortenerApi.saveUrl and sets shortUrl', async () => {
    const wrapper = mountWithPinia(createPinia());
    expect(wrapper.vm.shortUrl).toEqual('');
    urlShortenerApi.saveUrl.mockResolvedValueOnce('testurl');
    await wrapper.vm.generateShortUrl();
    expect(saveUrl).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.shortUrl).toEqual('testlocation/#/?s=testurl');
  });

  test('that validate generates correct validationResult', () => {
    const wrapper = mountWithPinia(createPinia());
    wrapper.vm.selectedViews = [
      [{ module: 'dashboard', id: 1 }, { module: 'shiftview', id: null }],
      [{ module: 'report', id: 'report1' }, { module: 'shiftview', id: 2 }],
    ];
    wrapper.vm.validate();
    expect(wrapper.vm.validationResult).toEqual([
      ['valid', 'error'],
      ['valid', 'valid'],
    ]);
  });

  test('that getSelectedViewsString returns correct string representation of selected views', async () => {
    const wrapper = mountWithPinia(createPinia());
    wrapper.vm.selectedViews = [
      [{ module: 'dashboard', id: 1 }, { module: 'shiftview', id: 2 }],
      [{ module: 'shiftview', id: 3 }, { module: 'report', id: 'randomurl' }],
    ];

    const result = await wrapper.vm.getSelectedViewsString();
    expect(result).toEqual('[["dashboard/1","shiftview/2"],["shiftview/3","?s=testurl"]]');
  });

  test('that onOpenGridView opens grid view with correct url and calls generateShortUrl', async () => {
    const wrapper = mountWithPinia(createPinia());
    wrapper.vm.selectedViews = [[{ module: 'dashboard', id: 2 }, { module: 'shiftview', id: 2 }], [{ module: 'shiftview', id: 3 }, { module: 'shiftview', id: 4 }]];
    await wrapper.vm.onOpenGridView();
    expect(window.open).toHaveBeenCalledTimes(1);
    const url = await wrapper.vm.getSelectedViewsString();
    expect(window.open).toHaveBeenCalledWith(`testlocation/#/split?titles=true&views=${encodeURIComponent(url)}`, '_blank');
  });

  test('that onOpenGridView doesnt open grid view if form is not valid', async () => {
    const wrapper = mountWithPinia(createPinia());
    wrapper.vm.selectedViews = [[{ module: 'dashboard', id: null }, { module: 'shiftview', id: 2 }], [{ module: 'shiftview', id: 3 }, { module: 'shiftview', id: 4 }]];
    await wrapper.vm.onOpenGridView();
    expect(window.open).toHaveBeenCalledTimes(0);
  });
});
