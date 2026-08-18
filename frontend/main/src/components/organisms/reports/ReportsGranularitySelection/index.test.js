import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

window.Intl.DisplayNames = class {
  constructor(locale, options) {
    this.locale = locale;
    this.options = options;
  }


  of(type) {
    return type;
  }
};

const createPinia = () => createTestingPinia({
  createSpy: vi.fn,
  initialState: {
    filterbar: { requestFilterState: { groupBy: [] } },
    genericDialog: { dialogData: {} },
    reportsConfig: {
      groupBy: [],
    },
  },
});

const createWrapper = (options) => shallowMount(index, {
  global: { plugins: [createPinia()] },
  ...options,
});

const propsDefault = {};

describe('ReportsGranularitySelection', () => {
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
