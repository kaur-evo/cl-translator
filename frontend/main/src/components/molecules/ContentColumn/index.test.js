import { shallowMount } from '@vue/test-utils';

import ContentColumn from './index.vue';

const createWrapper = (options) => shallowMount(ContentColumn, {
  ...options,
});

const propsDefault = {
  contentHeader: 'header',
  contentValue: 'value',
  hasContentBtn: false,
  contentBtnIcon: 'testIcon',
  btnTooltipText: '',
};

describe('ContentColumn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly without content button', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with content button', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, hasContentBtn: true, btnTooltipText: 'tooltip text' },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with content button and prepend icon', () => {
    const wrapper = createWrapper({
      props: {
        ...propsDefault, hasContentBtn: true, btnTooltipText: 'tooltip text', prependIcon: 'mdiKey',
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
