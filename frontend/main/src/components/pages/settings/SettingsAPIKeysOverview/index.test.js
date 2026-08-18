import { shallowMount } from '@vue/test-utils';

import SettingsAPIKeysOverview from './index.vue';

import createGlobal from '@/helpers/createGlobal';

const global = createGlobal({
  piniaOptions: {
    stubActions: true,
    initialState: {
      APIKeys: {
        APIKeys: [
          {
            keyId: 'asd123', name: 'desc1', createdBy: 'user@test', lastUsedAt: '2021-01-01T01:00:00Z', createdAt: '2021-01-01T00:00:00Z',
          },
        ],
        loading: [],
      },
      user: {
        users: [{ username: 'user@test', fullName: 'User Test' }],
      },
      genericDialog: {},
      confirmDialog: {},
    },
  },
});

const createWrapper = (options) => shallowMount(SettingsAPIKeysOverview, {
  global: { ...global },
  ...options,
});

describe('SettingsAPIKeysOverview', () => {
  it('renders', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();

    expect(wrapper.element).toMatchSnapshot();
  });
});
