import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import DashboardSharingNotification from './index.vue';

const createWrapper = (pages = []) => shallowMount(DashboardSharingNotification, {
  global: {
    plugins: [
      createTestingPinia({
        createSpy: vi.fn,
        initialState: {
          dashboardConfig: {
            pages,
          },
        },
      }),
    ],
  },
});

describe('DashboardSharingNotification', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2020-01-01T12:34:56.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('renders', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly if pages array is empty', () => {
    const wrapper = createWrapper([]);

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if pages array is not empty and none of the pages have sharedAtISO', () => {
    const wrapper = createWrapper([
      {
        id: 1, name: 'Page 1', sharedAtISO: null, sharedBy: null,
      },
      {
        id: 2, name: 'Page 2', sharedAtISO: null, sharedBy: null,
      },
      {
        id: 3, name: 'Page 3', sharedAtISO: null, sharedBy: null,
      },
    ]);

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if pages array is not empty and some of the pages have sharedAtISO', () => {
    const wrapper = createWrapper([
      {
        id: 1, name: 'Page 1', sharedAtISO: '2019-12-12T00:00:00.000Z', sharedBy: 'John Doe',
      },
      {
        id: 2, name: 'Page 2', sharedAtISO: null, sharedBy: null,
      },
      {
        id: 3, name: 'Page 3', sharedAtISO: '2019-12-15T00:00:00.000Z', sharedBy: 'Jane Doe',
      },
    ]);

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('tabsMappedBySharedAtISO', () => {
    it('returns empty object if pages array is empty', () => {
      const wrapper = createWrapper([]);

      expect(wrapper.vm.tabsMappedBySharedAtISO).toEqual({});
    });

    it('returns empty object if some pages have sharedAtISO but all of those are more than 30 days ago', () => {
      const wrapper = createWrapper([
        {
          id: 1, name: 'Page 1', sharedAtISO: '2019-11-30T00:00:00.000Z', sharedBy: 'John Doe',
        },
        {
          id: 2, name: 'Page 2', sharedAtISO: null, sharedBy: null,
        },
        {
          id: 3, name: 'Page 3', sharedAtISO: '2019-11-15T00:00:00.000Z', sharedBy: 'Jane Doe',
        },
      ]);

      expect(wrapper.vm.tabsMappedBySharedAtISO).toEqual({});
    });

    it('returns object of pages mapped by sharedAtISO without pages that have sharedAtISO in closedDashboardTabNotifications local storage', () => {
      localStorage.setItem('closedDashboardTabNotifications', JSON.stringify(['2019-12-12T00:00:00.000Z']));
      const wrapper = createWrapper([
        {
          id: 1, name: 'Page 1', sharedAtISO: '2019-12-12T00:00:00.000Z', sharedBy: 'John Doe',
        },
        {
          id: 2, name: 'Page 2', sharedAtISO: null, sharedBy: null,
        },
        {
          id: 3, name: 'Page 3', sharedAtISO: '2019-12-15T00:00:00.000Z', sharedBy: 'Jane Doe',
        },
        {
          id: 4, name: 'Page 4', sharedAtISO: '2019-12-12T00:00:00.000Z', sharedBy: 'John Doe',
        },
      ]);

      expect(wrapper.vm.tabsMappedBySharedAtISO).toEqual({
        '2019-12-15T00:00:00.000Z': { sharedBy: 'Jane Doe', count: 1 },
      });
    });

    it('returns object of pages mapped by sharedAtISO', () => {
      const wrapper = createWrapper([
        {
          id: 1, name: 'Page 1', sharedAtISO: '2019-12-12T00:00:00.000Z', sharedBy: 'John Doe',
        },
        {
          id: 2, name: 'Page 2', sharedAtISO: null, sharedBy: null,
        },
        {
          id: 3, name: 'Page 3', sharedAtISO: '2019-12-15T00:00:00.000Z', sharedBy: 'Jane Doe',
        },
        {
          id: 4, name: 'Page 4', sharedAtISO: '2019-12-12T00:00:00.000Z', sharedBy: 'John Doe',
        },
      ]);

      expect(wrapper.vm.tabsMappedBySharedAtISO).toEqual({
        '2019-12-12T00:00:00.000Z': { sharedBy: 'John Doe', count: 2 },
        '2019-12-15T00:00:00.000Z': { sharedBy: 'Jane Doe', count: 1 },
      });
    });
  });

  describe('getNotificationBottomMargin', () => {
    it('returns 0 if there is no prop given to the method', () => {
      const wrapper = createWrapper();

      expect(wrapper.vm.getNotificationBottomMargin()).toEqual(0);
    });

    it('returns index of given key from keyOfVisibleNotifications array multiplied by 84 and added by 16', () => {
      const wrapper = createWrapper();

      wrapper.vm.keysOfVisibleNotifications = ['key1', 'key2', 'key3'];
      expect(wrapper.vm.getNotificationBottomMargin('key1')).toEqual('16px');
      expect(wrapper.vm.getNotificationBottomMargin('key2')).toEqual('100px');
      expect(wrapper.vm.getNotificationBottomMargin('key3')).toEqual('184px');
    });
  });

  describe('closeNotification', () => {
    it('does not add any key to local storage if keysOfVisibleNotifications array is empty', () => {
      const wrapper = createWrapper();

      expect(wrapper.vm.keysOfVisibleNotifications).toEqual([]);
      wrapper.vm.closeNotification('key1');
      expect(localStorage.getItem('closedDashboardTabNotifications')).toBeNull();
    });

    it('adds a key to local storage and removes it from keysOfVisibleNotifications array if it exists', () => {
      const wrapper = createWrapper();

      wrapper.vm.keysOfVisibleNotifications = ['key1', 'key2', 'key3'];
      expect(localStorage.getItem('closedDashboardTabNotifications')).toBeNull();
      wrapper.vm.closeNotification('key2');
      expect(localStorage.getItem('closedDashboardTabNotifications')).toEqual('["key2"]');
      expect(wrapper.vm.keysOfVisibleNotifications).toEqual(['key1', 'key3']);
    });
  });

  describe('setKeysOfVisibleNotifications', () => {
    it('ignores all the keys in local storage and keysOfVisibleNotifications array is set as empty array, because tabsMappedBySharedAtISO is empty', () => {
      localStorage.setItem('closedDashboardTabNotifications', JSON.stringify(['2019-12-12T00:00:00.000Z', '2019-12-15T00:00:00.000Z']));
      const wrapper = createWrapper([
        {
          id: 1, name: 'Page 1', sharedAtISO: '2019-12-12T00:00:00.000Z', sharedBy: 'John Doe',
        },
        {
          id: 2, name: 'Page 2', sharedAtISO: null, sharedBy: null,
        },
        {
          id: 3, name: 'Page 3', sharedAtISO: '2019-12-15T00:00:00.000Z', sharedBy: 'Jane Doe',
        },
        {
          id: 4, name: 'Page 4', sharedAtISO: '2019-12-12T00:00:00.000Z', sharedBy: 'John Doe',
        },
      ]);

      expect(Object.keys(wrapper.vm.tabsMappedBySharedAtISO)).toEqual([]);
      wrapper.vm.setKeysOfVisibleNotifications();
      expect(wrapper.vm.keysOfVisibleNotifications).toEqual([]);
    });

    it('ignores the key in local storage and adds a key to keysOfVisibleNotifications array that is available in tabsMappedBySharedAtISO map', () => {
      localStorage.setItem('closedDashboardTabNotifications', JSON.stringify(['2019-12-12T00:00:00.000Z']));
      const wrapper = createWrapper([
        {
          id: 1, name: 'Page 1', sharedAtISO: '2019-12-12T00:00:00.000Z', sharedBy: 'John Doe',
        },
        {
          id: 2, name: 'Page 2', sharedAtISO: null, sharedBy: null,
        },
        {
          id: 3, name: 'Page 3', sharedAtISO: '2019-12-15T00:00:00.000Z', sharedBy: 'Jane Doe',
        },
        {
          id: 4, name: 'Page 4', sharedAtISO: '2019-12-12T00:00:00.000Z', sharedBy: 'John Doe',
        },
      ]);

      expect(Object.keys(wrapper.vm.tabsMappedBySharedAtISO)).toEqual(['2019-12-15T00:00:00.000Z']);
      wrapper.vm.setKeysOfVisibleNotifications();
      expect(wrapper.vm.keysOfVisibleNotifications).toEqual(['2019-12-15T00:00:00.000Z']);
    });
  });
});
