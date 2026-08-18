import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import defaultStationIcon from './defaultStationIcon.vue';

import { useProfileStore } from '@/stores/index';
import userRoles from '@/constants/userRoles';

const createWrapper = ({ storeOverrides = {}, options = {} } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });
  const profileStore = useProfileStore(pinia);
  profileStore.currentUser = storeOverrides.currentUser ?? { username: 'mr@evocon', defaultStationId: 1 };
  profileStore.highestUserRole = storeOverrides.highestUserRole ?? userRoles.COMPANY_ADMIN;

  const wrapper = shallowMount(defaultStationIcon, {
    global: { plugins: [pinia] },
    ...options,
  });
  return { wrapper, profileStore, pinia };
};

describe('defaultStationIcon', () => {
  it('renders correctly for shiftview user', () => {
    const { wrapper } = createWrapper({
      storeOverrides: { highestUserRole: userRoles.LINEVIEW_USER },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly for admin if station with same id is selected as default', () => {
    const { wrapper } = createWrapper({ options: { props: { id: 1 } } });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly for admin if station with different id is selected as default', () => {
    const { wrapper } = createWrapper({ options: { props: { id: 2 } } });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('that selectDefaultStation calls saveCurrentUser', async () => {
    const { wrapper, profileStore } = createWrapper({ options: { props: { id: 2 } } });

    await wrapper.vm.selectDefaultStation();
    expect(profileStore.saveCurrentUser).toHaveBeenCalledWith({ username: 'mr@evocon', defaultStationId: 2 });
  });
});
