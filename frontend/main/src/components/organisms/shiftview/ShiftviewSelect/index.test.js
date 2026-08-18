import { shallowMount } from '@vue/test-utils';

import index from './index.vue';

import createGlobal from '@/helpers/createGlobal';

const global = createGlobal();

const createWrapper = (options) => shallowMount(index, {
  global: { ...global },
  ...options,
});

const propsDefault = {
  items: [],
  title: 'string',
  subtitle: 'string',
  itemAppendIcon: 'string',
  itemText: 'name',
  itemValue: 'id',
  height: 'string',
  itemSubtitleKey: 'string',
  mandatory: true,
};

describe('ShiftviewSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly - empty state', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with additional text', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, additionalText: 'Test additional text' },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with items', () => {
    const wrapper = createWrapper({
      props: {
        ...propsDefault,
        items: [
          { id: 1, name: 'Test 1' },
          { id: 2, name: 'Test 2' },
        ],
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when disabled', () => {
    const wrapper = createWrapper({
      props: {
        ...propsDefault,
        disabled: true,
        items: [
          { id: 1, name: 'Test 1' },
          { id: 2, name: 'Test 2' },
        ],
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });
});
