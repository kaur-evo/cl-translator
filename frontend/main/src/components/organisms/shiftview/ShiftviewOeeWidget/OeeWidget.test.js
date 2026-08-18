import { shallowMount } from '@vue/test-utils';

import OeeWidget from './OeeWidget.vue';

import createGlobal from '@/helpers/createGlobal';

const global = createGlobal();

const MOCK_INSTANCE_ID = 'oee-widget-test';

const createWrapper = (options) => shallowMount(OeeWidget, {
  global: { ...global },
  data() {
    return { instanceId: MOCK_INSTANCE_ID };
  },
  ...options,
});

const propsDefault = {
  data: [],
  screenWidth: 0,
  xDomain: [],
};

describe('OeeWidget', () => {
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
