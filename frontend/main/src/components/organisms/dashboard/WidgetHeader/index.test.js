import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { nextTick } from 'vue';

import index from './index.vue';

import { useDeviceStore } from '@/stores/index';

const createWrapper = (options) => shallowMount(index, {
  global: {
    plugins: [
      createTestingPinia({
        createSpy: vi.fn,
        initialState: {
          device: {
            isMobileView: false,
          },
        },
      }),
    ],
  },
  ...options,
});

const propsDefault = {
  items: [],
  widgetTitle: 'string',
  widgetPeriod: 'string',
  widgetSubtitle: 'string',
  hideMenu: true,
};

describe('WidgetHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', async () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    await nextTick();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', async () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    await nextTick();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile view', async () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });
    const deviceStore = useDeviceStore();
    deviceStore.isMobileView = true;

    await nextTick();

    expect(wrapper.element).toMatchSnapshot();
  });
});
