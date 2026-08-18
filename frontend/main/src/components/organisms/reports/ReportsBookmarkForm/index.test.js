import { shallowMount, mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { nextTick } from 'vue';

import index from './index.vue';

import { useBookmarkStore, useReportsConfigStore, useGenericDialogStore, useDeviceStore } from '@/stores';
import configType from '@/stores/reportsConfig/constants/configType';

const applyBookmarkGetters = (pinia) => {
  const bookmarkStore = useBookmarkStore(pinia);
  bookmarkStore.bookmarkList = [];
  bookmarkStore.bookmarkPresetsMap = {
    [configType.DOWNTIME]: { name: 'Downtime' },
  };
};

const applyReportsConfigGetters = (pinia, overrides = {}) => {
  const reportsConfigStore = useReportsConfigStore(pinia);
  reportsConfigStore.reportName = '';
  reportsConfigStore.reportDescription = '';
  reportsConfigStore.configType = configType.DOWNTIME;
  Object.assign(reportsConfigStore, overrides);
};

const applyDeviceGetters = (pinia) => {
  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = false;
  deviceStore.showFullscreenDialogs = false;
};

const createPinia = ({ dialogData = {}, reportsConfigOverrides = {} } = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
    initialState: {
      genericDialog: { dialogData },
    },
  });
  applyBookmarkGetters(pinia);
  applyReportsConfigGetters(pinia, reportsConfigOverrides);
  applyDeviceGetters(pinia);
  return pinia;
};

describe('ReportsBookmarkForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = mount(index, {
      shallow: true,
      global: {
        plugins: [createPinia()],
        stubs: { 'form-dialog-template': false },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(index, {
      shallow: true,
      global: {
        plugins: [createPinia()],
        stubs: { 'form-dialog-template': false },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when editing bookmark', () => {
    const wrapper = mount(index, {
      shallow: true,
      global: {
        plugins: [createPinia({
          dialogData: {
            bookmark: {
              id: 1,
              name: 'Test bookmark',
              description: 'test description',
            },
          },
        })],
        stubs: { 'form-dialog-template': false },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('onSaveClick', () => {
    it('doesnt call any methods when form is invalid', async () => {
      const pinia = createPinia();
      const bookmarkStore = useBookmarkStore(pinia);
      const genericDialogStore = useGenericDialogStore(pinia);
      const wrapper = mount(index, {
        global: { plugins: [pinia] },
      });

      await wrapper.vm.onSaveClick();
      expect(bookmarkStore.saveNewBookmark).not.toHaveBeenCalled();
      expect(bookmarkStore.editBookmark).not.toHaveBeenCalled();
      expect(genericDialogStore.closeDialog).not.toHaveBeenCalled();
    });

    it('calls editBookmark and closeDialog when editing bookmark', async () => {
      const pinia = createPinia({
        dialogData: { bookmark: { id: 1 } },
        reportsConfigOverrides: {
          reportName: 'Test bookmark',
          reportDescription: 'Test description',
        },
      });
      const bookmarkStore = useBookmarkStore(pinia);
      const genericDialogStore = useGenericDialogStore(pinia);
      const wrapper = mount(index, {
        global: { plugins: [pinia] },
      });

      wrapper.vm.formData.name = 'New name';

      await nextTick();

      await wrapper.vm.onSaveClick();
      expect(bookmarkStore.saveNewBookmark).not.toHaveBeenCalled();
      expect(bookmarkStore.editBookmark).toHaveBeenCalledTimes(1);
      expect(bookmarkStore.editBookmark).toHaveBeenCalledWith({
        id: 1,
        name: 'New name',
        description: 'Test description',
      });
      expect(genericDialogStore.closeDialog).toHaveBeenCalledTimes(1);
    });

    it('calls saveNewBookmark and closeDialog when saving new bookmark', async () => {
      const pinia = createPinia({
        reportsConfigOverrides: { reportName: 'Downtime' },
      });
      const bookmarkStore = useBookmarkStore(pinia);
      const genericDialogStore = useGenericDialogStore(pinia);
      const wrapper = mount(index, {
        global: { plugins: [pinia] },
      });

      wrapper.vm.formData.name = 'New name';

      await nextTick();

      await wrapper.vm.onSaveClick();
      expect(bookmarkStore.saveNewBookmark).toHaveBeenCalledTimes(1);
      expect(bookmarkStore.saveNewBookmark).toHaveBeenCalledWith({
        name: 'New name',
        description: '',
      });
      expect(bookmarkStore.editBookmark).not.toHaveBeenCalled();
      expect(genericDialogStore.closeDialog).toHaveBeenCalledTimes(1);
    });
  });

  test('that onDeleteClick calls initDeleteBookmarkFlow', async () => {
    const pinia = createPinia({
      dialogData: {
        bookmark: {
          id: 1,
          name: 'Test bookmark',
          description: 'test description',
        },
      },
    });
    const bookmarkStore = useBookmarkStore(pinia);
    const wrapper = mount(index, {
      global: { plugins: [pinia] },
    });

    await nextTick();

    await wrapper.vm.onDeleteClick();
    expect(bookmarkStore.initDeleteBookmarkFlow).toHaveBeenCalledTimes(1);
  });

  test('that name field in formData is prefilled after mount if it is not default name', () => {
    const wrapper = mount(index, {
      global: {
        plugins: [createPinia({
          reportsConfigOverrides: { reportName: 'Test bookmark' },
        })],
      },
    });

    expect(wrapper.vm.formData.name).toBe('Test bookmark');
  });

  test('that name field in formData is not prefilled after mount if it is default name', () => {
    const wrapper = mount(index, {
      global: {
        plugins: [createPinia({
          reportsConfigOverrides: { reportName: 'Downtime' },
        })],
      },
    });

    expect(wrapper.vm.formData.name).toBe('');
  });

  test('that description field in formData is prefilled after mount', () => {
    const wrapper = mount(index, {
      global: {
        plugins: [createPinia({
          reportsConfigOverrides: { reportDescription: 'a description' },
        })],
      },
    });

    expect(wrapper.vm.formData.description).toBe('a description');
  });
});
