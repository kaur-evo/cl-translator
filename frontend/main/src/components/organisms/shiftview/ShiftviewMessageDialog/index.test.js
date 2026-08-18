import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ShiftviewMessageDialog from './index.vue';

import messageApi from '@/api/messageApi';

vi.mock('@/api/messageApi');
messageApi.getMessages = () => [];
messageApi.getArchivedMessages = () => [];
messageApi.getMessageByThreadId = vi.fn();
messageApi.toggleMessage = vi.fn();

const defaultPiniaState = {
  station: {
    lineviewStation: {
      id: 1, name: 'Station1', notificationEmails: ['test@email'], zoneId: 'UTC',
    },
  },
  profile: {
    // highestUserRole drives highestRoleAllows getter; FACTORY_ADMIN allows settings access
    highestUserRole: 'FACTORY_ADMIN',
    currentUser: { roles: {} },
  },
};

describe('ShiftviewMessageDialog', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2022-01-01T12:34:33.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders disabled empty state', async () => {
    const wrapper = shallowMount(ShiftviewMessageDialog, {
      global: {
        plugins: [
          createTestingPinia({ createSpy: vi.fn, initialState: { ...defaultPiniaState, station: { lineviewStation: { id: 1, notificationEmails: null } } } }),
        ],
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders no messages view', () => {
    const wrapper = shallowMount(ShiftviewMessageDialog, {
      global: {
        plugins: [
          createTestingPinia({ createSpy: vi.fn, initialState: defaultPiniaState }),
        ],
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that setNewMessage adds new message to currentThreadMessages', async () => {
    const wrapper = shallowMount(ShiftviewMessageDialog, {
      global: {
        plugins: [
          createTestingPinia({ createSpy: vi.fn, initialState: defaultPiniaState }),
        ],
      },
    });

    expect(wrapper.vm.currentThreadMessages).toEqual([]);
    await wrapper.vm.setNewMessage({ id: 123, subject: 'subject', participants: ['test@test.com'] }, 'new message body');
    expect(wrapper.vm.currentThreadMessages).toEqual([{
      sender: 'Station1',
      body: 'new message body',
      received: '2022-01-01T12:34:33.000Z',
    }]);
  });
});
