import { mount } from '@vue/test-utils';

import index from './index.vue';

import createGlobal from '@/helpers/createGlobal';

const global = createGlobal();

const createWrapper = (options) => mount(index, {
  global: { ...global },
  ...options,
});

const propsDefault = {
  items: [{ id: 1, name: 'test-name', sku: 'test-sku' }],
  itemTitleKey: 'name',
  itemSubtitleKey: 'sku',
  itemValueKey: 'id',
  itemSubtitleFunction: () => 'subtitle-function-result',
};

describe('ShiftviewSearch', () => {
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
