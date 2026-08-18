import { shallowMount } from '@vue/test-utils';

import MobileBatchWidget from './index.vue';

const defaultProps = {
  items: [
    {
      rows: [
        { label: 'Product', value: 'Widget A' },
        { label: 'Quantity', value: '100', slot: { batch: { id: 1 }, showGoodQty: true } },
      ],
    },
    {
      rows: [
        { label: 'Product', value: 'Widget B' },
      ],
    },
  ],
};

describe('MobileBatchWidget', () => {
  it('renders correctly with items', () => {
    const wrapper = shallowMount(MobileBatchWidget, {
      props: { ...defaultProps },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with empty items', () => {
    const wrapper = shallowMount(MobileBatchWidget, {
      props: { items: [] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
