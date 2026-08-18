import { shallowMount } from '@vue/test-utils';
import { mdiAbTesting } from '@mdi/js';

import index from './index.vue';

describe('MenuWithButtonActivator', () => {
  it('renders correctly', () => {
    const wrapper = shallowMount(index, {
      props: {
        items: [
          {
            id: 1, name: 'test 1', description: 'test 1 description', additionalText: 'lorem ipsum 1',
          },
          {
            id: 2, name: 'test 2', description: 'test 2 description', additionalText: 'lorem ipsum 2',
          },
        ],
        buttonIcon: mdiAbTesting,
        primaryTextField: 'name',
        secondaryTextField: 'description',
        tertiaryTextField: 'additionalText',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when disabled', () => {
    const wrapper = shallowMount(index, {
      props: {
        items: [
          {
            id: 1, name: 'test 1', description: 'test 1 description', additionalText: 'lorem ipsum 1',
          },
          {
            id: 2, name: 'test 2', description: 'test 2 description', additionalText: 'lorem ipsum 2',
          },
        ],
        disabled: true,
        buttonIcon: mdiAbTesting,
        primaryTextField: 'name',
        secondaryTextField: 'description',
        tertiaryTextField: 'additionalText',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with no items', () => {
    const wrapper = shallowMount(index, {
      props: {
        items: [],
        buttonIcon: mdiAbTesting,
        primaryTextField: 'name',
        secondaryTextField: 'description',
        tertiaryTextField: 'additionalText',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with a different button icon', () => {
    const wrapper = shallowMount(index, {
      props: {
        items: [
          {
            id: 1, name: 'test 1', description: 'test 1 description', additionalText: 'lorem ipsum 1',
          },
          {
            id: 2, name: 'test 2', description: 'test 2 description', additionalText: 'lorem ipsum 2',
          },
        ],
        buttonIcon: mdiAbTesting,
        primaryTextField: 'name',
        secondaryTextField: 'description',
        tertiaryTextField: 'additionalText',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly without tertiary text fields', () => {
    const wrapper = shallowMount(index, {
      props: {
        items: [
          {
            id: 1, name: 'test 1', description: 'test 1 description',
          },
          {
            id: 2, name: 'test 2', description: 'test 2 description',
          },
        ],
        buttonIcon: mdiAbTesting,
        primaryTextField: 'description',
        secondaryTextField: 'name',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly without secondary text fields', () => {
    const wrapper = shallowMount(index, {
      props: {
        items: [
          {
            id: 1, name: 'test 1', description: 'test 1 description',
          },
          {
            id: 2, name: 'test 2', description: 'test 2 description',
          },
        ],
        buttonIcon: mdiAbTesting,
        primaryTextField: 'description',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });
});
