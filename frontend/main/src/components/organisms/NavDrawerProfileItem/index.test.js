import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

import { useDeviceStore } from '@/stores/index';

const propsDefault = {
  avatar: 'string',
  email: 'string',
  fullName: 'Hello user!',
  canEditProfile: true,
};

const createWrapper = ({ isMobileView = false } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });
  useDeviceStore(pinia).isMobileView = isMobileView;

  return shallowMount(index, {
    props: { ...propsDefault },
    global: { plugins: [pinia] },
  });
};

describe('NavDrawerProfileItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    expect(createWrapper().exists()).toBe(true);
  });

  it('renders correctly', () => {
    expect(createWrapper().element).toMatchSnapshot();
  });

  it('renders correctly in mobile view', () => {
    expect(createWrapper({ isMobileView: true }).element).toMatchSnapshot();
  });
});
