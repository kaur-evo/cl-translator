import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

import { useDeviceStore } from '@/stores/index';

const createPinia = ({ isMobileView = false } = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: {
      station: { lineviewStation: { id: 1, notificationEmails: 'test@email,test2@email' } },
    },
  });
  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = isMobileView;
  return pinia;
};

const propsDefault = {
  message: { subject: 'subject', participants: ['paricipant'] },
  subjectError: 'string',
};

describe('MessageDialogMessageHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it('renders correctly if it is new message', () => {
    const wrapper = shallowMount(index, {
      global: { plugins: [createPinia()] },
      props: { ...propsDefault, message: { new: true, subject: '', participants: ['paricipant'] } },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile', () => {
    const wrapper = shallowMount(index, {
      global: { plugins: [createPinia({ isMobileView: true })] },
      props: { ...propsDefault },
    });
    expect(wrapper.element).toMatchSnapshot();
  });
});
