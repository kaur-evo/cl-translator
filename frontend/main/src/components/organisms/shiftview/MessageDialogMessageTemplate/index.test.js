import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

import messageApi from '@/api/messageApi';
import { useDeviceStore, useGenericNotificationStore } from '@/stores/index';

vi.mock('@/api/messageApi');
const sendMessage = vi.fn();
messageApi.sendMessage.mockImplementation(sendMessage);

const createPinia = ({ isMobileView = false, showFullscreenDialogs = false, lineviewStation = {} } = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: {
      station: { lineviewStation },
    },
  });
  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = isMobileView;
  deviceStore.showFullscreenDialogs = showFullscreenDialogs;
  return pinia;
};

const propsDefault = {
  message: {},
  threadMessages: [],
};

describe('MessageDialogMessageTemplate', () => {
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

  describe('submit', () => {
    const pinia = createPinia({ isMobileView: true, showFullscreenDialogs: true, lineviewStation: { id: 1 } });
    const notificationStore = useGenericNotificationStore(pinia);
    const wrapper = shallowMount(index, {
      global: { plugins: [pinia] },
      props: {
        ...propsDefault,
        message: {
          subject: 'test subject',
          participants: ['test@evocon.com'],
        },
      },
    });

    beforeEach(() => {
      vi.clearAllMocks();
      wrapper.vm.newMessageBody = 'test message';
    });

    it('calls sendMessage with correct parameters', async () => {
      await wrapper.vm.submit();

      expect(sendMessage).toHaveBeenCalledTimes(1);
      expect(sendMessage).toHaveBeenCalledWith(1, {
        message: 'test message',
        subject: 'test subject',
        recipients: ['test@evocon.com'],
        stationId: 1,
      });
    });

    test('calls notifySuccess with correct phrase', async () => {
      await wrapper.vm.submit();

      expect(notificationStore.notifySuccess).toHaveBeenCalledTimes(1);
      expect(notificationStore.notifySuccess).toHaveBeenCalledWith('Message sent');
    });

    test('emits message-sent with correct parameters', async () => {
      await wrapper.vm.submit();

      expect(wrapper.emitted('message-sent')[0]).toEqual([
        {
          participants: ['test@evocon.com'],
          subject: 'test subject',
        },
        'test message',
      ]);
    });

    test('clears newMessageBody', async () => {
      expect(wrapper.vm.newMessageBody).toBe('test message');
      await wrapper.vm.submit();

      expect(wrapper.vm.newMessageBody).toBe('');
    });
  });
});
