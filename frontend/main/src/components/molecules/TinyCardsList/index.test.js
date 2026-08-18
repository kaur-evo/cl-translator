import { shallowMount } from '@vue/test-utils';
import { mdiAccount, mdiAccountAlertOutline } from '@mdi/js';

import index from './index.vue';

import createGlobal from '@/helpers/createGlobal';

const global = createGlobal();

const createWrapper = (options) => shallowMount(index, {
  global: { ...global },
  ...options,
});

const propsDefault = {
  items: [{ name: 'test 1' }, { name: 'test 2' }],
  titleTextKey: 'name',
  subtitleKeyValuePairs: [{ key: 'key 1', value: 'value 1' }, { key: 'key 2', value: 'value 2' }],
};

describe('TinyCardsList', () => {
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

  it('renders correctly with listItemIcon as String', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, listItemIcon: mdiAccount },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with listItemIcon as Function', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, listItemIcon: (item) => (item.key === 'key 1' ? mdiAccount : mdiAccountAlertOutline) },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
