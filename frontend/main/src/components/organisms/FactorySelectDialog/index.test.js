import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import FactorySelectDialog from './index.vue';

import useGenericDialogStore from '@/stores/genericDialog';

const dialogAction = vi.fn();

const createPinia = (overrides = {}) => createTestingPinia({
  createSpy: vi.fn,
  stubActions: false,
  initialState: {
    factory: {
      factories: [
        { id: 1, name: 'Factory 1' },
        { id: 2, name: 'Factory 2' },
        { id: 3, name: 'Factory 3' },
      ],
    },
    genericDialog: {
      dialogData: { action: dialogAction },
    },
    device: {
      screen: { width: 1920, height: 1080 },
    },
    ...overrides,
  },
});

describe('FactorySelectDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly', () => {
    const wrapper = shallowMount(FactorySelectDialog, {
      global: {
        plugins: [createPinia()],
        stubs: {
          'dialog-template': false,
        },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that closeDialog calls closeDialog action', async () => {
    const pinia = createPinia();
    const genericDialogStore = useGenericDialogStore(pinia);
    const wrapper = shallowMount(FactorySelectDialog, {
      global: {
        plugins: [pinia],
      },
    });

    await wrapper.vm.closeDialog();

    expect(genericDialogStore.closeDialog).toHaveBeenCalled();
  });

  describe('onToggleAllFactories', () => {
    const wrapper = shallowMount(FactorySelectDialog, {
      global: {
        plugins: [createPinia()],
      },
    });
    it('should toggle all factories if none is selected', () => {
      wrapper.vm.selectedFactories = [];
      wrapper.vm.onToggleAllFactories();
      expect(wrapper.vm.selectedFactories).toEqual([1, 2, 3]);
    });

    it('should clear all factories if all are selected', () => {
      wrapper.vm.selectedFactories = [1, 2, 3];
      wrapper.vm.onToggleAllFactories();
      expect(wrapper.vm.selectedFactories).toEqual([]);
    });

    it('should toggle all factories if some are selected', () => {
      wrapper.vm.selectedFactories = [1, 2];
      wrapper.vm.onToggleAllFactories();
      expect(wrapper.vm.selectedFactories).toEqual([1, 2, 3]);
    });
  });

  test('that onDownload calls dialogData action', async () => {
    const wrapper = shallowMount(FactorySelectDialog, {
      global: {
        plugins: [createPinia()],
      },
    });

    await wrapper.vm.onDownload();

    expect(dialogAction).toHaveBeenCalled();
  });
});
