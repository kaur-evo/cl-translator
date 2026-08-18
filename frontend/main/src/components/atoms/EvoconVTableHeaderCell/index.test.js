import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { mdiAccessPointCheck } from '@mdi/js';

import index from './index.vue';

import createGlobal from '@/helpers/createGlobal';

const global = createGlobal();

const createWrapper = (options) => mount(index, {
  global: { ...global },
  ...options,
});

const propsDefault = {
  header: {},
  options: {},
  hidden: true,
  fixed: true,
  modelValue: 'string',
  tooltipContent: 'string',
};

describe('EvoconVTableHeaderCell', () => {
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

  it('renders correctly with append text', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, header: { text: 'mainText', appendText: 'appendText' } },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with append icon', () => {
    const wrapper = createWrapper({
      props: {
        ...propsDefault,
        header: {
          text: 'this is header text',
          headerAppendIcon: mdiAccessPointCheck,
          headerAppendIconSize: 8,
          headerAppendIconColor: 'primary',
          headerAppendIconClass: 'ml-1 mt-n1',
        },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
  test('if cellClass returns expected classes based on props', async () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });
    wrapper.setProps({ fixed: false, hidden: false });
    await nextTick();
    expect(wrapper.vm.cellClass).toBe('sortable cursor-pointer');
    wrapper.setProps({ fixed: true });
    await nextTick();
    expect(wrapper.vm.cellClass).toBe('fixed sortable cursor-pointer');
    wrapper.setProps({ hidden: true });
    await nextTick();
    expect(wrapper.vm.cellClass).toBe('fixed d-none sortable cursor-pointer');
  });

  test('if cellLabelContainerClass returns expected classes based on props', async () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });
    expect(wrapper.vm.cellLabelContainerClass).toBe('text-secondary-text');
    wrapper.setProps({ options: { sortBy: { key: 'test' } }, modelValue: 'test' });
    await nextTick();
    expect(wrapper.vm.cellLabelContainerClass).toBe('text-primary-text');
    wrapper.setProps({ header: { type: 'number' } });
    await nextTick();
    expect(wrapper.vm.cellLabelContainerClass).toBe('justify-end text-right text-no-wrap text-primary-text');
  });
});
