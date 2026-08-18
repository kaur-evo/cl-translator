import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

const router = {
  $router: {
    go: vi.fn(),
  },
};

const createWrapper = (options) => shallowMount(index, {
  global: {
    plugins: [createTestingPinia({ createSpy: vi.fn })],
    mocks: { ...router, $route: { query: {} } },
    stubs: ['router-link', 'router-view'],
  },
  ...options,
});

const propsDefault = {};

describe('ReportsBackBtn', () => {
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
  it('renders back btn when theres routing history', async () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });
    wrapper.vm.history = ['0', '1'];
    await nextTick();
    expect(wrapper.find('#reports-back-btn').isVisible()).toBe(true);
  });
  it('does not rennder back btn when theres no history', async () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });
    wrapper.vm.history = [];
    nextTick();
    expect(wrapper.find('#reports-back-btn').isVisible()).toBe(false);
  });
  it('calls router go -1 on button click', async () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });
    wrapper.vm.history = ['0', '1'];
    const onGoBackSpy = vi.spyOn(wrapper.vm, 'onGoBack');

    await wrapper.find('#reports-back-btn').trigger('click');
    nextTick();

    expect(onGoBackSpy).toHaveBeenCalled();
    expect(router.$router.go).toHaveBeenCalled();
    expect(router.$router.go).toHaveBeenCalledWith(-1);
  });
  it('adds previous fullPath to history when moving to new location or removes old path when moving back', async () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });
    wrapper.vm.onRouteChange({ fullPath: 'newPath' }, { fullPath: 'oldPath' });
    expect(wrapper.vm.history).toStrictEqual(['oldPath']);
    wrapper.vm.onRouteChange({ fullPath: 'newPath2' }, { fullPath: 'oldPath2' });
    expect(wrapper.vm.history).toStrictEqual(['oldPath', 'oldPath2']);
    wrapper.vm.onRouteChange({ fullPath: 'oldPath2' }, { fullPath: 'newPath2' });
    expect(wrapper.vm.history).toStrictEqual(['oldPath']);
    wrapper.vm.onRouteChange({ fullPath: 'oldPath' }, { fullPath: 'newPath' });
    expect(wrapper.vm.history).toStrictEqual([]);
  });
});
