import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

import { useReportsConfigStore } from '@/stores';

const createPinia = (overrides = {}) => createTestingPinia({
  createSpy: vi.fn,
  stubActions: true,
  initialState: {
    reportsConfig: {
      ...(overrides.reportsConfig || {}),
    },
    ...overrides,
  },
});

const createWrapper = (options = {}) => shallowMount(index, {
  global: { plugins: [createPinia()] },
  ...options,
});

const propsDefault = {
  label: 'label',
  imgSrc: 'imgSrc',
  menuItems: new Map([
    ['value', { label: 'label' }],
  ]),
};

describe('ReportsChartOptionsMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly with one menu item', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with multiple items', () => {
    const wrapper = createWrapper({
      props: {
        ...propsDefault,
        menuItems: new Map([
          ['value', { label: 'label' }],
          ['value2', { label: 'label2' }],
        ]),
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('onClick', () => {
    it('dispatches action with value and index when arrayValueKeyIndex is not null', async () => {
      const pinia = createPinia();
      const reportsConfigStore = useReportsConfigStore(pinia);
      const wrapper = shallowMount(index, {
        props: { ...propsDefault },
        global: { plugins: [pinia] },
        data() {
          return {
            arrayValueKeyIndex: 1,
            changeActionKey: 'onGroupByChange',
          };
        },
      });
      const value = 'testValue';
      wrapper.vm.onClick(value);

      expect(reportsConfigStore.onGroupByChange).toHaveBeenCalledWith({ value, index: 1 });
    });

    it('dispatches action with value when arrayValueKeyIndex is null', async () => {
      const pinia = createPinia();
      const reportsConfigStore = useReportsConfigStore(pinia);
      const wrapper = shallowMount(index, {
        props: { ...propsDefault },
        global: { plugins: [pinia] },
        data() {
          return {
            arrayValueKeyIndex: null,
            changeActionKey: 'onGroupByChange',
          };
        },
      });
      const value = 'testValue';
      wrapper.vm.onClick(value);

      expect(reportsConfigStore.onGroupByChange).toHaveBeenCalledWith(value);
    });
  });
});
