import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ShiftViewExtraLargeHeader from './index.vue';

import { useGenericDialogStore } from '@/stores/index';

const createWrapper = (options = {}, pinia = createTestingPinia({ createSpy: vi.fn, initialState: { shift: { shift: { id: 1 } } } })) => shallowMount(ShiftViewExtraLargeHeader, {
  global: { plugins: [pinia] },
  ...options,
});

const propsDefault = {
  status: 'online',
};

describe('ShiftViewExtraLargeHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper({ props: { ...propsDefault } });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper({ props: { ...propsDefault } });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly without shifts', () => {
    const pinia = createTestingPinia({ createSpy: vi.fn });
    const wrapper = createWrapper({ props: { ...propsDefault } }, pinia);

    expect(wrapper.element).toMatchSnapshot();
  });

  it('calls openDialog with correct config when openBatchOverview is called', () => {
    const pinia = createTestingPinia({ createSpy: vi.fn });
    const wrapper = createWrapper({ props: { ...propsDefault } }, pinia);
    const genericDialogStore = useGenericDialogStore(pinia);

    wrapper.vm.openBatchOverview('info');

    expect(genericDialogStore.openDialog).toHaveBeenCalledOnce();
    expect(genericDialogStore.openDialog).toHaveBeenCalledWith(expect.objectContaining({
      width: 900,
      data: { tab: 'info' },
    }));
  });
});
