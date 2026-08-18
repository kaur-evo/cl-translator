import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

import { ALL_FACTORIES, REALTIME, TIMELINE } from '@/constants/routeNames';

const router = {
  $router: {
    resolve: (obj) => {
      if (obj.name === TIMELINE) return { href: TIMELINE };
      if (obj.name === REALTIME) return { href: REALTIME };
      return { href: 'unknown' };
    },
    push: vi.fn(),
  },
};
const route = {
  $route: {
    name: REALTIME,
  },
};

const createPinia = () => createTestingPinia({
  createSpy: vi.fn,
  stubActions: true,
});

describe('FactoriesOverviewMain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders', () => {
    const wrapper = shallowMount(index, {
      global: {
        plugins: [createPinia()],
        mocks: { ...router, ...route },
        stubs: { 'router-view': true },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(index, {
      global: {
        plugins: [createPinia()],
        mocks: { ...router, ...route },
        stubs: { 'router-view': true },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in small view', async () => {
    const wrapper = shallowMount(index, {
      global: {
        plugins: [createPinia()],
        mocks: { ...router, ...route },
        stubs: { 'router-view': true },
      },
    });
    wrapper.vm.$vuetify.display.smAndDown = true;
    await nextTick();

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('mounted hook', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      localStorage.clear();
    });

    it('uses localStorage and calls router.push when route is ALL_FACTORIES', () => {
      localStorage.setItem('factoryOverviewOpenTabIndex', '1');
      const wrapper = shallowMount(index, {
        global: {
          plugins: [createPinia()],
          mocks: { ...router, $route: { name: ALL_FACTORIES } },
          stubs: { 'router-view': true },
        },
      });

      expect(wrapper.vm.openTabIndex).toBe(1);
      expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: TIMELINE });
    });

    it('sets openTabIndex based on current route and adds it to localStorage when route is REALTIME', () => {
      const wrapper = shallowMount(index, {
        global: {
          plugins: [createPinia()],
          mocks: { ...router, $route: { name: REALTIME } },
          stubs: { 'router-view': true },
        },
      });

      expect(wrapper.vm.openTabIndex).toBe(0);
      expect(localStorage.getItem('factoryOverviewOpenTabIndex')).toBe('0');
    });

    it('sets openTabIndex based on current route and adds it to localStorage when route is TIMELINE', () => {
      const wrapper = shallowMount(index, {
        global: {
          plugins: [createPinia()],
          mocks: { ...router, $route: { name: TIMELINE } },
          stubs: { 'router-view': true },
        },
      });

      expect(wrapper.vm.openTabIndex).toBe(1);
      expect(localStorage.getItem('factoryOverviewOpenTabIndex')).toBe('1');
    });

    it('defaults to openTabIndex 0 when no localStorage and route is ALL_FACTORIES', () => {
      const wrapper = shallowMount(index, {
        global: {
          plugins: [createPinia()],
          mocks: { ...router, $route: { name: ALL_FACTORIES } },
          stubs: { 'router-view': true },
        },
      });

      expect(wrapper.vm.openTabIndex).toBe(0);
      expect(localStorage.getItem('factoryOverviewOpenTabIndex')).toBe('0');
    });
  });

  test('that updateRoute calls router.push with correct route', () => {
    const wrapper = shallowMount(index, {
      global: {
        plugins: [createPinia()],
        mocks: { ...router, $route: { name: ALL_FACTORIES } },
        stubs: { 'router-view': true },
      },
    });

    expect(wrapper.vm.$router.push).toHaveBeenCalledTimes(1);
    wrapper.vm.updateRoute(1);
    expect(wrapper.vm.$router.push).toHaveBeenCalledTimes(2);
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: TIMELINE });
    wrapper.vm.updateRoute(0);
    expect(wrapper.vm.$router.push).toHaveBeenCalledTimes(3);
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: REALTIME });
  });

  test('that updateRoute sets openTabIndex', () => {
    const wrapper = shallowMount(index, {
      global: {
        plugins: [createPinia()],
        mocks: { ...router, ...route },
        stubs: { 'router-view': true },
      },
    });

    expect(wrapper.vm.openTabIndex).toBe(0);
    wrapper.vm.updateRoute(1);
    expect(wrapper.vm.openTabIndex).toBe(1);
    wrapper.vm.updateRoute(0);
    expect(wrapper.vm.openTabIndex).toBe(0);
  });

  test('that updateRoute sets tab index to localStorage', () => {
    const wrapper = shallowMount(index, {
      global: {
        plugins: [createPinia()],
        mocks: { ...router, ...route },
        stubs: { 'router-view': true },
      },
    });

    wrapper.vm.updateRoute(1);
    expect(localStorage.getItem('factoryOverviewOpenTabIndex')).toBe('1');
    wrapper.vm.updateRoute(0);
    expect(localStorage.getItem('factoryOverviewOpenTabIndex')).toBe('0');
  });

  describe('onPageChange', () => {
    it('does not change openTabIndex for invalid tab', () => {
      const wrapper = shallowMount(index, {
        global: {
          plugins: [createPinia()],
          mocks: { ...router, ...route },
          stubs: { 'router-view': true },
        },
      });

      expect(wrapper.vm.openTabIndex).toBe(0);
      wrapper.vm.onPageChange(['/not-a-tab']);
      expect(wrapper.vm.openTabIndex).toBe(0);
    });

    it('changes openTabIndex to 1 and calls router.push', () => {
      const wrapper = shallowMount(index, {
        global: {
          plugins: [createPinia()],
          mocks: { ...router, ...route },
          stubs: { 'router-view': true },
        },
      });

      expect(wrapper.vm.openTabIndex).toBe(0);
      const resolvedTimeline = wrapper.vm.tabs[1].resolved;
      wrapper.vm.onPageChange([resolvedTimeline]);
      expect(wrapper.vm.$router.push).toHaveBeenCalledWith(resolvedTimeline);
      expect(wrapper.vm.openTabIndex).toBe(1);
    });

    it('changes openTabIndex to 0 and calls router.push', () => {
      const wrapper = shallowMount(index, {
        global: {
          plugins: [createPinia()],
          mocks: { ...router, ...route },
          stubs: { 'router-view': true },
        },
      });

      wrapper.vm.openTabIndex = 1;
      const resolvedRealtime = wrapper.vm.tabs[0].resolved;
      wrapper.vm.onPageChange([resolvedRealtime]);
      expect(wrapper.vm.$router.push).toHaveBeenCalledWith(resolvedRealtime);
      expect(wrapper.vm.openTabIndex).toBe(0);
    });
  });
});
