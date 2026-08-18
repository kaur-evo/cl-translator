import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { mdiRefresh, mdiDelete } from '@mdi/js';

import SettingsOperatorsEdit from './index.vue';

import useOperatorStore from '@/stores/operator';
import useDeviceStore from '@/stores/device';

const router = {
  $router: {
    push: vi.fn(),
  },
};
const route = {
  $route: {
    params: vi.fn(),
  },
};

const defaultOperatorState = {
  operatorsList: [
    {
      id: 1, firstname: 'First1', lastname: 'Last1', name: 'First1 Last1', passcodeCreatedAt: null, stationIds: [],
    },
    {
      id: 2, firstname: 'First2', lastname: 'Last2', name: 'First2 Last2', passcodeCreatedAt: '2021-01-01T01:00:00Z', stationIds: [],
    },
  ],
  loading: [],
};

const defaultStationState = {
  stations: [{ id: 1, groupId: 1 }, { id: 2, groupId: 1 }, { id: 3, groupId: 1 }, { id: 4, groupId: 2 }],
  stationGroups: [{ id: 1 }, { id: 2 }],
};

const defaultFeatureState = {
  checklists: true,
};

const createPinia = (overrides = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
    initialState: {
      operator: { ...defaultOperatorState, ...overrides.operator },
      station: { ...defaultStationState, ...overrides.station },
      feature: { ...defaultFeatureState, ...overrides.feature },
      profile: { currentUser: { roles: { 0: 'COMPANY_ADMIN' } }, ...overrides.profile },
    },
  });
  useDeviceStore(pinia).isMobileView = overrides.isMobileView ?? false;
  return pinia;
};

describe('SettingsOperatorsEdit', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2024-01-01T12:34:33'));
    vi.clearAllMocks();
  });

  const createWrapper = (options = {}) => {
    const pinia = createPinia(options.stateOverrides);
    const operatorStore = useOperatorStore(pinia);
    operatorStore.isLoading = null;
    return shallowMount(SettingsOperatorsEdit, {
      global: {
        plugins: [pinia],
        stubs: options.stubs ?? { 'form-page-template': false },
        mocks: { ...router, ...(options.route || route) },
      },
    });
  };

  it('renders', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly if selected operator is not in operatorsMap', async () => {
    const wrapper = createWrapper({
      stateOverrides: {
        operator: {
          operatorsList: [
            {
              id: 1, firstname: 'First1', lastname: 'Last1', name: 'First1 Last1', passcodeCreatedAt: null, stationIds: [],
            },
          ],
        },
      },
      route: { $route: { params: { id: 11 } } },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if checklists are disabled', () => {
    const wrapper = createWrapper({
      stateOverrides: { feature: { checklists: false } },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in new operator view', () => {
    const wrapper = createWrapper();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in operator edit view', async () => {
    const wrapper = createWrapper({
      route: { $route: { params: { id: 1 } } },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if operator has passcode generated', async () => {
    const wrapper = createWrapper({
      route: { $route: { params: { id: 2 } } },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('cardPrimaryActionText', () => {
    it('returns empty string in mobile view if operator has passcode generated', async () => {
      const wrapper = createWrapper({
        stateOverrides: {
          isMobileView: true,
          operator: {
            operatorsList: [{
              id: 11, firstname: 'First11', lastname: 'Last11', name: 'First11 Last11', passcodeCreatedAt: '2021-01-01T01:00:00Z', stationIds: [],
            }],
          },
        },
        route: { $route: { params: { id: 11 } } },
      });

      await flushPromises();
      expect(wrapper.vm.cardPrimaryActionText).toBe('');
    });

    it('returns Generate in mobile view if operator does not have passcode generated', async () => {
      const wrapper = createWrapper({
        stateOverrides: {
          isMobileView: true,
          operator: {
            operatorsList: [{
              id: 12, firstname: 'First12', lastname: 'Last12', name: 'First12 Last12', passcodeCreatedAt: null, stationIds: [],
            }],
          },
        },
        route: { $route: { params: { id: 12 } } },
      });

      await flushPromises();
      expect(wrapper.vm.cardPrimaryActionText).toBe('Generate');
    });

    it('returns Regenerate if operator has passcode generated', async () => {
      const wrapper = createWrapper({
        stateOverrides: {
          operator: {
            operatorsList: [{
              id: 11, firstname: 'First11', lastname: 'Last11', name: 'First11 Last11', passcodeCreatedAt: '2021-01-01T01:00:00Z', stationIds: [],
            }],
          },
        },
        route: { $route: { params: { id: 11 } } },
      });

      await flushPromises();
      expect(wrapper.vm.cardPrimaryActionText).toBe('Regenerate');
    });

    it('returns Generate if operator does not have passcode generated', async () => {
      const wrapper = createWrapper({
        stateOverrides: {
          operator: {
            operatorsList: [{
              id: 12, firstname: 'First12', lastname: 'Last12', name: 'First12 Last12', passcodeCreatedAt: null, stationIds: [],
            }],
          },
        },
        route: { $route: { params: { id: 12 } } },
      });

      await flushPromises();
      expect(wrapper.vm.cardPrimaryActionText).toBe('Generate');
    });
  });

  describe('passcodeCardButtons array', () => {
    it('has delete action', () => {
      const wrapper = createWrapper();

      expect(wrapper.vm.passcodeCardButtons.length).toBe(1);
      expect(wrapper.vm.passcodeCardButtons[0]).toEqual({
        icon: mdiDelete,
        text: 'Delete',
        tooltip: 'Delete',
        action: expect.any(Function),
      });
    });

    it('has delete and regenerate actions in mobile view', () => {
      const wrapper = createWrapper({
        stateOverrides: { isMobileView: true },
      });

      expect(wrapper.vm.passcodeCardButtons.length).toBe(2);
      expect(wrapper.vm.passcodeCardButtons[0]).toEqual({
        icon: mdiRefresh,
        text: 'Regenerate',
        action: expect.any(Function),
      });
      expect(wrapper.vm.passcodeCardButtons[1]).toEqual({
        icon: mdiDelete,
        text: 'Delete',
        tooltip: 'Delete',
        action: expect.any(Function),
      });
    });
  });

  test('that onGeneratePasscode calls generatePassword if operator does not have passcode generated', async () => {
    const wrapper = createWrapper({
      route: { $route: { params: { id: 1 } } },
    });

    const generatePassword = vi.spyOn(wrapper.vm, 'generatePassword');
    await wrapper.vm.onGeneratePasscode();
    expect(generatePassword).toHaveBeenCalledTimes(1);
    expect(generatePassword).toHaveBeenCalledWith(false);
  });

  test('that onGeneratePasscode calls openConfirmDialog if operator has passcode generated', async () => {
    const wrapper = createWrapper({
      route: { $route: { params: { id: 2 } } },
    });

    const openConfirmDialog = vi.spyOn(wrapper.vm, 'openConfirmDialog');
    await wrapper.vm.onGeneratePasscode();
    expect(openConfirmDialog).toHaveBeenCalledTimes(1);
    expect(openConfirmDialog).toHaveBeenCalledWith({
      title: 'Confirmation',
      text: 'Are you sure you want to proceed? Regenerating the passcode will replace the existing one.',
      action: expect.any(Function),
      confirmText: 'Regenerate',
      cancelText: 'Cancel',
      color: 'primary',
    });
  });

  test('that onDeletePasscode calls openConfirmDialog', async () => {
    const wrapper = createWrapper({
      route: { $route: { params: { id: 2 } } },
    });

    const openConfirmDialog = vi.spyOn(wrapper.vm, 'openConfirmDialog');
    await wrapper.vm.onDeletePasscode();
    expect(openConfirmDialog).toHaveBeenCalledTimes(1);
  });

  test('that generatePassword calls generatePasscode with correct arguments when regenerate is true', async () => {
    const wrapper = createWrapper({
      route: { $route: { params: { id: 2 } } },
    });

    const generatePasscode = vi.spyOn(wrapper.vm, 'generatePasscode');

    await wrapper.vm.generatePassword(true);

    expect(generatePasscode).toHaveBeenCalledTimes(1);
    expect(generatePasscode).toHaveBeenCalledWith({
      operatorId: 2,
      isRegenerate: true,
      callback: wrapper.vm.openPasscodeGenerationDialog,
    });
  });

  test('that generatePassword calls generatePasscode with correct arguments when regenerate is false', async () => {
    const wrapper = createWrapper({
      route: { $route: { params: { id: 2 } } },
    });

    const generatePasscode = vi.spyOn(wrapper.vm, 'generatePasscode');

    await wrapper.vm.generatePassword(false);

    expect(generatePasscode).toHaveBeenCalledTimes(1);
    expect(generatePasscode).toHaveBeenCalledWith({
      operatorId: 2,
      isRegenerate: false,
      callback: wrapper.vm.openPasscodeGenerationDialog,
    });
  });

  test('that generatePassword sets passcodeCreatedAt to formData', async () => {
    const wrapper = createWrapper();

    expect(wrapper.vm.formData.passcodeCreatedAt).toBe(null);
    const generatePasscode = vi.spyOn(wrapper.vm, 'generatePasscode');
    generatePasscode.mockImplementationOnce(() => ({ passcodeCreatedAt: '2024-10-30T08:41:37Z' }));

    await wrapper.vm.generatePassword(false);

    expect(wrapper.vm.formData.passcodeCreatedAt).toBe('2024-10-30T08:41:37Z');
  });

  describe('isRemovedOperator', () => {
    it('returns false if isLoading is true', () => {
      const wrapper = createWrapper({
        stateOverrides: { operator: { loading: ['loading'] } },
      });

      expect(wrapper.vm.isRemovedOperator).toBe(false);
    });

    it('returns false if operatorId does not exist', () => {
      const wrapper = createWrapper({
        route: { $route: { params: {} } },
      });

      expect(wrapper.vm.isRemovedOperator).toBe(false);
    });

    it('returns false if operator exists in operatorsMap and is not marked as deleted', () => {
      const wrapper = createWrapper({
        stateOverrides: {
          operator: {
            operatorsList: [{
              id: 1, firstname: 'First1', lastname: 'Last1', name: 'First1 Last1', passcodeCreatedAt: null, deleted: false, stationIds: [],
            }],
          },
        },
        route: { $route: { params: { id: 1 } } },
      });

      expect(wrapper.vm.isRemovedOperator).toBe(false);
    });

    it('returns true if operator exists in operatorsMap and is marked as deleted', () => {
      const wrapper = createWrapper({
        stateOverrides: {
          operator: {
            operatorsList: [{
              id: 1, firstname: 'First1', lastname: 'Last1', name: 'First1 Last1', passcodeCreatedAt: null, deleted: true, stationIds: [],
            }],
          },
        },
        route: { $route: { params: { id: 1 } } },
      });

      expect(wrapper.vm.isRemovedOperator).toBe(true);
    });

    it('returns true if isLoading is false, operatorId exists, and operator does not exist in operatorsMap', () => {
      const wrapper = createWrapper({
        stateOverrides: {
          operator: {
            operatorsList: [{
              id: 1, firstname: 'First1', lastname: 'Last1', name: 'First1 Last1', passcodeCreatedAt: null, stationIds: [],
            }],
            loading: [],
          },
        },
        route: { $route: { params: { id: 11 } } },
      });

      expect(wrapper.vm.isRemovedOperator).toBe(true);
    });
  });
});
