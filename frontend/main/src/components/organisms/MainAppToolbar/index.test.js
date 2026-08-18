import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';

import MainAppToolbar from './index.vue';

const route = {
  $route: {
    name: 'route name',
    meta: { title: () => 'Route title', main: false },
    matched: [{ name: 'main', meta: { useRoutePathAsReturnPath: false } }, { name: 'not-main', meta: { useRoutePathAsReturnPath: false } }],
    params: { id: 1, groupId: 2, returnParams: { factoryIds: [1, 2, 3], stationIds: [11, 12] } },
    query: { test: 'test' },
  },
};

const router = {
  $router: {
    go: vi.fn(),
    push: vi.fn(),
  },
};

const defaultProps = {
  hasBackButton: true,
  modelValue: [],
  items: [],
};

const defaultPiniaState = {
  mainNavDrawerConfig: { drawerOpen: false },
};

const createWrapper = ({ props, mocks, piniaOverrides = {} } = {}) => shallowMount(MainAppToolbar, {
  props: { ...defaultProps, ...props },
  global: {
    plugins: [createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: { ...defaultPiniaState, ...piniaOverrides },
    })],
    mocks: { ...route, ...router, ...mocks },
  },
});

describe('MainAppToolbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    expect(createWrapper().exists()).toBe(true);
  });

  it('renders correctly', () => {
    expect(createWrapper().element).toMatchSnapshot();
  });

  it('renders correctly in small view if items prop is empty', async () => {
    const wrapper = createWrapper();

    wrapper.vm.$vuetify.display.smAndDown = true;
    await nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in small view if items prop is not empty', async () => {
    const wrapper = createWrapper({
      props: { modelValue: [1], items: [{ id: 1, name: 'item1' }, { id: 2, name: 'item2' }] },
    });

    wrapper.vm.$vuetify.display.smAndDown = true;
    await nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('setMainNavDrawer', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('changes mainNavDrawerOpen value from false to true when logo is clicked', async () => {
      const wrapper = createWrapper();

      wrapper.vm.$vuetify.display.smAndDown = true;
      await nextTick();

      const spy = vi.spyOn(wrapper.vm, 'setMainNavDrawer');
      const button = wrapper.find('#app-toolbar-logo');
      expect(wrapper.vm.mainNavDrawerOpen).toBe(false);
      await button.trigger('click', spy);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(true);
    });

    it('changes mainNavDrawerOpen value from true to false when logo is clicked', async () => {
      const wrapper = createWrapper({
        piniaOverrides: { mainNavDrawerConfig: { drawerOpen: true } },
      });

      wrapper.vm.$vuetify.display.smAndDown = true;
      await nextTick();

      const spy = vi.spyOn(wrapper.vm, 'setMainNavDrawer');
      const button = wrapper.find('#app-toolbar-logo');
      expect(wrapper.vm.mainNavDrawerOpen).toBe(true);
      await button.trigger('click', spy);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(false);
    });
  });

  describe('onGoBackClick', () => {
    test('that if route meta has useRoutePathAsReturnPath prop, then router push is called with path and query', () => {
      const wrapper = createWrapper({
        mocks: {
          $route: { ...route.$route, matched: [{ name: 'main', path: 'main/path', meta: { useRoutePathAsReturnPath: true } }, { name: 'not-main', meta: { useRoutePathAsReturnPath: false } }] },
        },
      });

      wrapper.find('#app-toolbar-back').trigger('click');
      expect(wrapper.vm.$router.push).toHaveBeenCalledTimes(1);
      expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ path: 'main/path', query: { test: 'test' } });
    });

    test('that if route params contains returnParams prop, then router push is called with name, params and query', () => {
      const wrapper = createWrapper();

      wrapper.find('#app-toolbar-back').trigger('click');
      expect(wrapper.vm.$router.push).toHaveBeenCalledTimes(1);
      expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: 'main', params: wrapper.vm.$route.params, query: { factoryIds: [1, 2, 3], stationIds: [11, 12] } });
    });

    test('that if useRoutePathAsReturnPath and returnParams properties does not exist, then router push is called with name, group id and params id', () => {
      const wrapper = createWrapper({
        mocks: {
          $route: { ...route.$route, params: { id: 1, groupId: 2 } },
        },
      });

      wrapper.find('#app-toolbar-back').trigger('click');
      expect(wrapper.vm.$router.push).toHaveBeenCalledTimes(1);
      expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: 'main', query: { groupId: 2, test: 'test' }, params: { id: 1 } });
    });
  });
});
