import { mount } from '@vue/test-utils';
import { mdiStar } from '@mdi/js';

import index from './index.vue';

import createGlobal from '@/helpers/createGlobal';

const global = createGlobal();

const createWrapper = (options) => mount(index, {
  global: {
    ...global,
  },
  ...options,
});

const propsDefault = {
  icon: mdiStar,
  label: 'Chip label',
  inputValue: true,
};

describe('EvoconVChip', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', async () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
