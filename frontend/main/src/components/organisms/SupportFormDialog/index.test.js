import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { nextTick } from 'vue';

import SupportFormDialog from './index.vue';

import { useGenericNotificationStore } from '@/stores/index';
import hubspotApi from '@/api/hubspotApi';

vi.mock('@/api/hubspotApi');

const forwardToSupport = vi.fn();
hubspotApi.forwardToSupport = forwardToSupport;

const defaultPiniaState = {
  profile: {
    currentUser: {
      email: 'test@evocon.com',
      fullName: 'Mr. Evocon',
    },
  },
};

const createWrapper = () => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
    initialState: { ...defaultPiniaState },
  });
  const wrapper = shallowMount(SupportFormDialog, {
    global: { plugins: [pinia] },
  });

  return { wrapper, genericNotificationStore: useGenericNotificationStore(pinia) };
};

describe('SupportFormDialog', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly in initial state', async () => {
    const { wrapper } = createWrapper();
    await nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in success state', async () => {
    const { wrapper } = createWrapper();
    wrapper.vm.state = 'success';
    await nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in failure state', async () => {
    const { wrapper } = createWrapper();
    wrapper.vm.state = 'failure';
    wrapper.vm.message = 'Hello, support /n I have a problem /n /n Mr. Evocon';
    await nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  test('that onSendSupportRequest calls hubspotApi.forwardToSupport with correct data if form is valid', async () => {
    const { wrapper } = createWrapper();

    wrapper.vm.subject = 'Hello, support';
    wrapper.vm.message = 'I have a problem';

    wrapper.vm.form.validate = () => {
      wrapper.vm.valid = true;
    };

    await wrapper.vm.onSendSupportRequest();

    expect(forwardToSupport).toHaveBeenCalledTimes(1);
    expect(forwardToSupport).toHaveBeenCalledWith({
      formId: 'aae4777c-ab2a-4d68-82f8-1c2bcba55b93',
      email: 'test@evocon.com',
      firstname: 'Mr. Evocon',
      'TICKET.subject': 'Hello, support',
      'TICKET.content': 'I have a problem',
    });
  });

  test('that onSendSupportRequest does not call hubspotApi.forwardToSupport if form is invalid', async () => {
    const { wrapper } = createWrapper();

    wrapper.vm.subject = 'Hello, support';
    wrapper.vm.message = 'I have a problem';

    wrapper.vm.form.validate = () => {
      wrapper.vm.valid = false;
    };

    await wrapper.vm.onSendSupportRequest();

    expect(forwardToSupport).toHaveBeenCalledTimes(0);
  });

  test('that onSendSupportRequest sets state to success and notifies success if hubspotApi.forwardToSupport is successful', async () => {
    const { wrapper, genericNotificationStore } = createWrapper();

    wrapper.vm.subject = 'Hello, support';
    wrapper.vm.message = 'I have a problem';

    wrapper.vm.form.validate = () => {
      wrapper.vm.valid = true;
    };

    await wrapper.vm.onSendSupportRequest();

    expect(genericNotificationStore.notifySuccess).toHaveBeenCalledTimes(1);
    expect(genericNotificationStore.notifySuccess).toHaveBeenCalledWith('Message sent');
    expect(wrapper.vm.state).toBe('success');
  });

  test('that onSendSupportRequest sets state to failure and shows error notification if hubspotApi.forwardToSupport is unsuccessful', async () => {
    const { wrapper, genericNotificationStore } = createWrapper();

    wrapper.vm.subject = 'Hello, support';
    wrapper.vm.message = 'I have a problem';

    wrapper.vm.form.validate = () => {
      wrapper.vm.valid = true;
    };

    const supporterror = () => {
      throw new Error('Error');
    };
    hubspotApi.forwardToSupport.mockImplementationOnce(supporterror);

    await wrapper.vm.onSendSupportRequest();

    expect(genericNotificationStore.notifySuccess).toHaveBeenCalledTimes(0);
    expect(genericNotificationStore.openNotification).toHaveBeenCalledTimes(1);
    expect(genericNotificationStore.openNotification).toHaveBeenCalledWith({
      type: 'error',
      text: 'An error has occurred',
      secondaryText: 'Please email Evocon support directly at support@evocon.com',
    });
    expect(wrapper.vm.state).toBe('failure');
  });
});
