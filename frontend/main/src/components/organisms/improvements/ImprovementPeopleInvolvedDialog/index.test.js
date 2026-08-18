import { shallowMount } from '@vue/test-utils';

import index from './index.vue';

import createGlobal from '@/helpers/createGlobal';

const global = createGlobal({
  piniaOptions: {
    initialState: {
      genericDialog: {
        dialogData: {
          selectedUsers: [
            { username: 'user1', fullName: 'User 1' },
            { username: 'user2', fullName: 'User 2' },
          ],
        },
        onPrimaryAction: {},
      },
      user: {
        users: [
          { username: 'user1', fullName: 'User 1' },
          { username: 'user2', fullName: 'User 2' },
        ],
      },
      profile: {
        currentUser: { username: 'user1', fullName: 'Test User' },
      },
    },
  },
});

const createWrapper = (options) => shallowMount(index, {
  global: { ...global },
  ...options,
});

const propsDefault = {};

describe('ImprovementPeopleInvolvedDialog', () => {
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
