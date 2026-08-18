import { shallowMount } from '@vue/test-utils';

import index from './index.vue';

import createGlobal from '@/helpers/createGlobal';
import {
  OFFICE_USER, LINEVIEW_USER, FACTORY_ADMIN, COMPANY_ADMIN,
} from '@/constants/userRoles';

const global = createGlobal({
  piniaOptions: {
    stubActions: true,
    initialState: {
      user: {
        users: [],
        loading: [],
      },
      factory: {
        factories: [],
      },
      station: {
        stations: [],
      },
      profile: {
        currentUser: { roles: { 0: 'COMPANY_ADMIN' } },
        visibleUserRoles: [
          { id: COMPANY_ADMIN, name: 'Company Admin' },
          { id: FACTORY_ADMIN, name: 'Factory Admin' },
          { id: LINEVIEW_USER, name: 'Lineview User' },
          { id: OFFICE_USER, name: 'Office User' },
        ],
        highestUserRole: 'COMPANY_ADMIN',
      },
      securityProfile: {
        securityProfiles: [],
      },
      feature: {
        securitySettings: true,
      },
    },
  },
});

const createWrapper = (options) => shallowMount(index, {
  global: { ...global },
  ...options,
});

const propsDefault = {};

describe('SettingsUsersOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
