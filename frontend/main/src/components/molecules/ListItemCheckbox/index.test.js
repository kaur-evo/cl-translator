import { shallowMount } from '@vue/test-utils';

import index from './index.vue';

import createGlobal from '@/helpers/createGlobal';

const global = createGlobal();

const createWrapper = (options) => shallowMount(index, {
  global: { ...global },
  ...options,
});

const propsDefault = {
  value: true,
  indeterminate: true,
  disabled: true,
  error: false,
};

describe('ListItemCheckbox', () => {
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

  it('renders correctly when single select and not selected value', () => {
    const wrapper = createWrapper({
      props: { value: false, disabled: false, isSingleSelect: true },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when single select and is selected value', () => {
    const wrapper = createWrapper({
      props: { value: true, disabled: false, isSingleSelect: true },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when disabled single select and is not selected value', () => {
    const wrapper = createWrapper({
      props: { value: false, disabled: true, isSingleSelect: true },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when disabled single select and is selected value', () => {
    const wrapper = createWrapper({
      props: { value: true, disabled: true, isSingleSelect: true },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correcly when multiselect and not selected value', () => {
    const wrapper = createWrapper({
      props: { value: false, disabled: false, isSingleSelect: false },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correcly when multiselect and selected value', () => {
    const wrapper = createWrapper({
      props: { value: true, disabled: false, isSingleSelect: false },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correcly when disabled multiselect and not selected value', () => {
    const wrapper = createWrapper({
      props: { value: false, disabled: true, isSingleSelect: false },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correcly when disabled multiselect and selected value', () => {
    const wrapper = createWrapper({
      props: { value: true, disabled: true, isSingleSelect: false },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
