import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import GlobalAnnouncementDialog from './index.vue';

import { useConfigurationStore } from '@/stores/index';

const defaultGlobalAnnouncement = {
  title: 'title',
  text: 'text',
  isAlert: true,
  timestamp: '2021-09-01T00:00:00Z',
  visible: true,
  allowedRoles: ['admin'],
};

const createWrapper = ({ globalAnnouncement = defaultGlobalAnnouncement, stubs } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });
  useConfigurationStore(pinia).globalAnnouncement = globalAnnouncement;

  return shallowMount(GlobalAnnouncementDialog, {
    global: {
      plugins: [pinia],
      stubs: { 'router-link': true, 'router-view': true, ...stubs },
    },
  });
};

describe('GlobalAnnouncementDialog', () => {
  it('renders', () => {
    expect(createWrapper().exists()).toBe(true);
  });

  it('renders correctly', () => {
    expect(createWrapper({ stubs: { 'dialog-template': false } }).element).toMatchSnapshot();
  });
});
