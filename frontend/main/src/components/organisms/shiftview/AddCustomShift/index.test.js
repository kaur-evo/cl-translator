import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import { useProfileStore } from '@/stores/index';
import AddCustomShift from '@/components/organisms/shiftview/AddCustomShift/index.vue';

const createWrapper = (options = {}, piniaStateOverrides = {}) => shallowMount(AddCustomShift, {
  global: {
    plugins: [
      createTestingPinia({
        createSpy: vi.fn,
        initialState: { piniaStateOverrides },
      }),
    ],
  },
  ...options,
});

describe('AddCustomShift', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly for user with write rights', () => {
    const wrapper = createWrapper();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly for read-only user', () => {
    const pinia = createTestingPinia({ createSpy: vi.fn });
    const profileStore = useProfileStore(pinia);
    vi.spyOn(profileStore, 'isReadOnly', 'get').mockReturnValue(true);

    const wrapper = shallowMount(AddCustomShift, {
      global: { plugins: [pinia] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
