import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

import useDeviceStore from '@/stores/device';

const createPinia = (initialState = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: { genericDialog: { dialogData: {} }, ...initialState } });
  useDeviceStore(pinia).isMobileView = false;
  useDeviceStore(pinia).showFullscreenDialogs = false;
  return pinia;
};

describe('SettingsTagEditForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = shallowMount(index, {
      global: {
        plugins: [createPinia()],
        stubs: { 'form-dialog-template': false },
      },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', async () => {
    const wrapper = shallowMount(index, {
      global: {
        plugins: [createPinia()],
        stubs: { 'form-dialog-template': false },
      },
    });
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in edit', async () => {
    const wrapper = shallowMount(index, {
      global: {
        plugins: [createPinia({ genericDialog: { dialogData: { tag: { id: 23, name: 'tag name', alias: 'tag alias' } } } })],
        stubs: { 'form-dialog-template': false },
      },
    });
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });
});
