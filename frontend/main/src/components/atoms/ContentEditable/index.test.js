import { shallowMount } from '@vue/test-utils';

import index from './index.vue';

import createGlobal from '@/helpers/createGlobal';

const global = createGlobal();

const createWrapper = (options) => shallowMount(index, {
  global: { ...global },
  ...options,
});

const propsDefault = {
  tag: 'span',
  editable: true,
  modelValue: 'string',
  allowHtml: false,
  allowNewLine: false,
  maxLength: 50,
};

describe('ContentEditable', () => {
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

  it('renders correctly as dark', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, dark: true },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
