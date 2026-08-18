import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

import { useDeviceStore } from '@/stores/index';

const createPinia = ({ isMobileView = false, showFullscreenDialogs = false } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });
  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = isMobileView;
  deviceStore.showFullscreenDialogs = showFullscreenDialogs;
  return pinia;
};

const propsDefault = {
  active: 0,
  messages: { 0: [{ subject: 'subject', participants: ['paricipant'], lastMessageTime: '2020-01-01T00:00:00' }] },
  selectedMessage: {},
  loading: true,
};

describe('MessageDialogSideMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2021-04-01 00:00:00'));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('renders', () => {
    const wrapper = shallowMount(index, {
      global: { plugins: [createPinia()] },
      props: { ...propsDefault },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(index, {
      global: { plugins: [createPinia()] },
      props: { ...propsDefault },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in tablet', () => {
    const wrapper = shallowMount(index, {
      global: { plugins: [createPinia({ showFullscreenDialogs: true })] },
      props: { ...propsDefault },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile', () => {
    const wrapper = shallowMount(index, {
      global: { plugins: [createPinia({ isMobileView: true, showFullscreenDialogs: true })] },
      props: { ...propsDefault },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
