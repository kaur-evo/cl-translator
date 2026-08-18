import { shallowMount } from '@vue/test-utils';

import index from './index.vue';

import createGlobal from '@/helpers/createGlobal';

const router = {
  $router: {
    push: vi.fn(),
  },
};

const mocks = {
  ...router,
};

const global = createGlobal({
  piniaOptions: {
    initialState: {
      genericDialog: {},
      genericNotification: {},
      confirmDialog: {},
      improvementsProject: {},
    },
  },
});

const createWrapper = (options) => shallowMount(index, {
  global: { ...global },
  mocks,

  ...options,
});

const propsDefault = {
  project: {
    name: 'test project',
    startDate: '2020-01-01',
    endDate: '2021-01-01',
    finished: false,
    id: 123,

  },
  canEdit: true,
};

describe('ImprovementProjectHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly if project is not finished', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if project is finished', () => {
    const wrapper = createWrapper({
      props: { project: { ...propsDefault.project, finished: true }, canEdit: true },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
