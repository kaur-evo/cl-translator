import { shallowMount } from '@vue/test-utils';

import index from './index.vue';

import createGlobal from '@/helpers/createGlobal';

const global = createGlobal({
  piniaOptions: {
    initialState: {
      improvementsNote: { notes: {} },
      improvementsFile: { files: {} },
    },
  },
});

const createWrapper = (options) => shallowMount(index, {
  global: { ...global },
  ...options,
});

const propsDefault = {
  project: {},
  canEdit: true,
};

describe('ImprovementNotesAndFilesSection', () => {
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
