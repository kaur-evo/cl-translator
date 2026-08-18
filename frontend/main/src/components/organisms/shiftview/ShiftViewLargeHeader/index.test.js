import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ShiftViewLargeHeader from './index.vue';

import { useGenericDialogStore, useBottomSheetStore } from '@/stores/index';

const createWrapper = (options = {}, pinia = createTestingPinia({ createSpy: vi.fn })) => shallowMount(ShiftViewLargeHeader, {
  global: { plugins: [pinia] },
  ...options,
});

describe('ShiftViewLargeHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: { shift: { shift: { id: 1 } } },
    });
    const wrapper = createWrapper({}, pinia);

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly in medium screen width', () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        shift: { shift: { id: 1 } },
        device: { screen: { width: 1000 } },
      },
    });
    const wrapper = createWrapper({}, pinia);
    wrapper.vm.$vuetify.display.md = true;
    wrapper.vm.$vuetify.display.lgAndUp = false;

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in large screen width less than 1450', () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        shift: { shift: { id: 1 } },
        device: { screen: { width: 1400 } },
      },
    });
    const wrapper = createWrapper({}, pinia);
    wrapper.vm.$vuetify.display.md = false;
    wrapper.vm.$vuetify.display.lgAndUp = true;

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in large screen width more than 1450', () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        shift: { shift: { id: 1 } },
        device: { screen: { width: 1500 } },
      },
    });
    const wrapper = createWrapper({}, pinia);
    wrapper.vm.$vuetify.display.md = false;
    wrapper.vm.$vuetify.display.lgAndUp = true;

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly without shifts', () => {
    const wrapper = createWrapper();

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('onExpandBatchOverview', () => {
    it('calls openDialog with correct config when not medium view', () => {
      const pinia = createTestingPinia({ createSpy: vi.fn });
      const wrapper = createWrapper({ props: { status: 'active' } }, pinia);
      wrapper.vm.$vuetify.display.md = false;

      const genericDialogStore = useGenericDialogStore(pinia);
      wrapper.vm.onExpandBatchOverview('completed');

      expect(genericDialogStore.openDialog).toHaveBeenCalledOnce();
      expect(genericDialogStore.openDialog).toHaveBeenCalledWith(expect.objectContaining({
        width: 900,
        data: { tab: 'completed' },
      }));
    });

    it('calls openBottomSheet with batches component config and does not call openDialog in medium view', () => {
      const pinia = createTestingPinia({ createSpy: vi.fn });
      const wrapper = createWrapper({ props: { status: 'active' } }, pinia);
      wrapper.vm.$vuetify.display.md = true;

      const genericDialogStore = useGenericDialogStore(pinia);
      const bottomSheetStore = useBottomSheetStore(pinia);
      wrapper.vm.onExpandBatchOverview('completed');

      expect(bottomSheetStore.openBottomSheet).toHaveBeenCalledWith(expect.objectContaining({
        componentProps: { tab: 'completed' },
        theme: 'light',
      }));
      expect(genericDialogStore.openDialog).not.toHaveBeenCalled();
    });
  });
});
