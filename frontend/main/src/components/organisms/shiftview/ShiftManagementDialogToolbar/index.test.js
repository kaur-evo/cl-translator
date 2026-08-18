import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ShiftManagementDialogToolbar from './index.vue';

import useDeviceStore from '@/stores/device';

const createPinia = () => {
  const pinia = createTestingPinia({ createSpy: vi.fn });
  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = false;
  deviceStore.screenWidth = 1600;
  return pinia;
};

const defaultProps = {
  isStartShiftDialog: false,
  isShiftStartSelectionVisible: false,
};

describe('ShiftManagementDialogToolbar', () => {
  it('renders', () => {
    const wrapper = shallowMount(ShiftManagementDialogToolbar, {
      global: {
        plugins: [createPinia()],
        stubs: { 'dialog-toolbar': false },
      },
      props: { ...defaultProps },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly when its shift edit dialog', () => {
    const wrapper = shallowMount(ShiftManagementDialogToolbar, {
      global: {
        plugins: [createPinia()],
        stubs: { 'dialog-toolbar': false },
      },
      props: { ...defaultProps },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when its shift start dialog and isShiftStartSelectionVisible is true', () => {
    const wrapper = shallowMount(ShiftManagementDialogToolbar, {
      global: {
        plugins: [createPinia()],
        stubs: { 'dialog-toolbar': false },
      },
      props: { ...defaultProps, isStartShiftDialog: true, isShiftStartSelectionVisible: true },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when its shift start dialog and isShiftStartSelectionVisible is false', () => {
    const wrapper = shallowMount(ShiftManagementDialogToolbar, {
      global: {
        plugins: [createPinia()],
        stubs: { 'dialog-toolbar': false },
      },
      props: { ...defaultProps, isStartShiftDialog: true },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
