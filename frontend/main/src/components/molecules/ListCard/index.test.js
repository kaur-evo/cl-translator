import { shallowMount } from '@vue/test-utils';
import { mdiPlus, mdiPencil, mdiDelete } from '@mdi/js';
import { createTestingPinia } from '@pinia/testing';

import ListCard from './index.vue';

import { useDeviceStore } from '@/stores/index';

const propsDefault = {
  icon: mdiPlus,
  flagIconCode: '',
  title: 'This is a card title',
  subtitleKeyValuePairs: [{ key: 'key 1', value: 'value 1' }, { key: 'key 2', value: 'value 2' }, { key: 'key 3', value: 'value 3' }],

};

describe('ListCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(ListCard, { props: propsDefault });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with flag icon', () => {
    const wrapper = shallowMount(
      ListCard,
      { props: { ...propsDefault, icon: '', flagIconCode: 'it' } },
    );

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with cardButtons array', () => {
    const wrapper = shallowMount(ListCard, {
      props: {
        ...propsDefault,
        cardButtons: [
          {
            key: 'delete', icon: mdiDelete, tooltip: 'Delete', text: 'Delete',
          },
          {
            key: 'edit', icon: mdiPencil, tooltip: 'Edit', text: 'Edit',
          },
        ],
      },
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs: { 'v-list-item': false },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with cardButtons array in mobile view', () => {
    const pinia = createTestingPinia({ createSpy: vi.fn });
    const deviceStore = useDeviceStore(pinia);
    deviceStore.isMobileView = true;

    const wrapper = shallowMount(ListCard, {
      props: {
        ...propsDefault,
        cardButtons: [
          {
            key: 'delete', icon: mdiDelete, tooltip: 'Delete', text: 'Delete',
          },
          {
            key: 'edit', icon: mdiPencil, tooltip: 'Edit', text: 'Edit',
          },
        ],
      },
      global: {
        plugins: [pinia],
        stubs: { 'v-list-item': false },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
