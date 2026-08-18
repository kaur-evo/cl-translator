import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ChecklistImgPreview from './index.vue';

import checklistApi from '@/api/checklistApi';

vi.mock('@/api/checklistApi');
checklistApi.getChecklistFile = vi.fn();

const defaultPiniaState = {
  device: {
    showFullscreenDialogs: false,
  },
};

describe('ChecklistImgPreview', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  it('renders correctly', () => {
    const wrapper = shallowMount(ChecklistImgPreview, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, initialState: defaultPiniaState })],
      },
      props: {
        file: {
          fileName: 'test.jpg',
          checklistTaskId: '123',
          checklistTaskElementId: '2',
          deletable: true,
        },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when deletable is false', () => {
    const wrapper = shallowMount(ChecklistImgPreview, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, initialState: defaultPiniaState })],
      },
      props: {
        file: {
          fileName: 'test.jpg',
          checklistTaskId: '123',
          checklistTaskElementId: '2',
          deletable: false,
        },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that loadImg is called on mount if file does not have url', async () => {
    const mockImg = 'data:image/jpeg;base64,abc123';
    checklistApi.getChecklistFile.mockResolvedValue(mockImg);

    shallowMount(ChecklistImgPreview, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, initialState: defaultPiniaState })],
      },
      props: {
        file: {
          fileName: 'test.jpg',
          checklistTaskId: '123',
          checklistTaskElementId: '2',
        },
      },
    });

    await flushPromises();
    expect(checklistApi.getChecklistFile).toHaveBeenCalledTimes(1);
    expect(checklistApi.getChecklistFile).toHaveBeenCalledWith({
      fileName: 'test.jpg',
      checklistTaskId: '123',
      checklistTaskElementId: '2',
    });
  });

  test('that loadImg is not called on mount if file has url', async () => {
    const mockImg = 'data:image/jpeg;base64,abc123';
    checklistApi.getChecklistFile.mockResolvedValue(mockImg);

    shallowMount(ChecklistImgPreview, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, initialState: defaultPiniaState })],
      },
      props: {
        file: {
          fileName: 'test.jpg',
          checklistTaskId: '123',
          checklistTaskElementId: '2',
          url: 'testurl',
        },
      },
    });

    await flushPromises();
    expect(checklistApi.getChecklistFile).toHaveBeenCalledTimes(0);
  });

  describe('onModelValueUpdate', () => {
    it('emits close event when value is false', () => {
      const wrapper = shallowMount(ChecklistImgPreview, {
        global: {
          plugins: [createTestingPinia({ createSpy: vi.fn, initialState: defaultPiniaState })],
        },
        props: {
          file: {
            fileName: 'test.jpg',
            checklistTaskId: '123',
            checklistTaskElementId: '2',
          },
        },
      });

      wrapper.vm.onModelValueUpdate(false);
      expect(wrapper.emitted()).toHaveProperty('close');
    });

    it('does not emit close event when value is true', () => {
      const wrapper = shallowMount(ChecklistImgPreview, {
        global: {
          plugins: [createTestingPinia({ createSpy: vi.fn, initialState: defaultPiniaState })],
        },
        props: {
          file: {
            fileName: 'test.jpg',
            checklistTaskId: '123',
            checklistTaskElementId: '2',
          },
        },
      });

      wrapper.vm.onModelValueUpdate(true);
      expect(wrapper.emitted()).not.toHaveProperty('close');
    });
  });
});
