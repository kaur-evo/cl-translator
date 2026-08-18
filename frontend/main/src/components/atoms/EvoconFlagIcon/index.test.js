import { mount } from '@vue/test-utils';

import index from './index.vue';

import createGlobal from '@/helpers/createGlobal';

const global = createGlobal();

const createWrapper = (options) => mount(index, {
  global: { ...global },
  ...options,
});

describe('EvoconFlagIcon', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it('renders', async () => {
    const wrapper = createWrapper({
      props: {
        flagCountryCode: 'lv',
        rounded: false,
        squared: false,
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders flag correctly', () => {
    const wrapper = createWrapper({
      props: {
        flagCountryCode: 'lt',
        rounded: false,
        squared: false,
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders rounded flag correctly', () => {
    const wrapper = createWrapper({
      props: {
        flagCountryCode: 'ee',
        rounded: true,
        squared: false,
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders squared flag correctly', () => {
    const wrapper = createWrapper({
      props: {
        flagCountryCode: 'fi',
        rounded: false,
        squared: true,
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
