import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';

import ShiftviewChecklistAuthDialog from './index.vue';

import operatorApi from '@/api/operatorApi';
import createGlobal from '@/helpers/createGlobal';

vi.mock('@/api/operatorApi', () => ({
  default: {
    validatePasscode: vi.fn().mockResolvedValue(),
  },
  __esModule: true,
}));

const defaultPiniaState = {
  operator: {
    operatorsList: [{ id: 1, name: 'Test Operator1', passcodeCreatedAt: null, stationIds: [1] }, { id: 2, name: 'Test Operator2', passcodeCreatedAt: '2024-07-23T06:49:20Z', stationIds: [1] }],
  },
  station: {
    lineviewStation: { id: 1 },
  },
  configuration: {
    configuration: { showUsualCheckPasscodeInput: false },
  },
};

const global = createGlobal({ piniaOptions: { initialState: defaultPiniaState, createSpy: vi.fn, stubActions: false } });

const createWrapper = (options) => shallowMount(ShiftviewChecklistAuthDialog, {
  global: { ...global },
  ...options,
});

describe('ShiftviewChecklistAuthDialog', () => {
  it('renders', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if operator selection is not visible', async () => {
    const wrapper = createWrapper();

    wrapper.vm.selectedOperatorId = 1;
    wrapper.vm.isOperatorSelectionVisible = false;
    await nextTick();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if operator selection is not visible and showUsualCheckPasscodeInput is true', async () => {
    const customGlobal = createGlobal({
      piniaOptions: {
        initialState: { ...defaultPiniaState, configuration: { configuration: { showUsualCheckPasscodeInput: true } } },
        createSpy: vi.fn,
        stubActions: false,
      },
    });
    const wrapper = shallowMount(ShiftviewChecklistAuthDialog, {
      global: { ...customGlobal },
    });

    wrapper.vm.selectedOperatorId = 1;
    wrapper.vm.isOperatorSelectionVisible = false;
    await nextTick();

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that onSubmit calls validatePasscode', async () => {
    const wrapper = createWrapper();

    wrapper.vm.selectedOperatorId = 1;
    wrapper.vm.passcode = '1234';
    await wrapper.vm.onSubmit();
    expect(operatorApi.validatePasscode).toHaveBeenCalledWith({ operatorId: 1, passcode: '1234' });
    expect(wrapper.vm.valid).toBe(true);
  });

  test('that onSubmit calls validatePasscode with error', async () => {
    const wrapper = createWrapper();

    wrapper.vm.selectedOperatorId = 1;
    wrapper.vm.passcode = '1234';
    operatorApi.validatePasscode = vi.fn().mockRejectedValue();
    await wrapper.vm.onSubmit();
    expect(operatorApi.validatePasscode).toHaveBeenCalledWith({ operatorId: 1, passcode: '1234' });
    expect(wrapper.vm.valid).toBe(false);
  });

  test('that operatorsWithCode has only operators with passcode generated', () => {
    const wrapper = createWrapper();

    expect(wrapper.vm.operatorsWithCode).toEqual([{ id: 2, name: 'Test Operator2', passcodeCreatedAt: '2024-07-23T06:49:20Z', stationIds: [1] }]);
  });
});
