import { shallowMount } from '@vue/test-utils';

import index from './index.vue';

import createGlobal from '@/helpers/createGlobal';

const global = createGlobal({
  piniaOptions: {
    initialState: {
      genericDialog: {
        dialogData: {
          project: {
            finalSummary: 'final summary',
            description: 'description',
            startDate: '2021-01-01',
            finished: false,
          },
        },
      },
    },
  },
});

const createWrapper = (options) => shallowMount(index, {
  global: { ...global },
  ...options,
});

const propsDefault = {};

describe('ImprovementProjectFinishForm', () => {
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
    await wrapper.setData({ completionDate: '2024-01-08' });
    expect(wrapper.element).toMatchSnapshot();
  });
});
