import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

const createPinia = (overrides = {}) => createTestingPinia({
  createSpy: vi.fn,
  stubActions: false,
  initialState: {
    genericDialog: {
      dialogData: {
        reportName: 'Custom report name',
      },
    },
    ...overrides,
  },
});

const createWrapper = (options = {}) => shallowMount(index, {
  global: { plugins: [createPinia()] },
  ...options,
});

describe('ReportsExportInfoDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();

    expect(wrapper.element).toMatchSnapshot();
  });
});
