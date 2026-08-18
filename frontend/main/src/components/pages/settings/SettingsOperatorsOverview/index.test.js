import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import SettingsOperatorsOverview from './index.vue';

import useOperatorStore from '@/stores/operator';

const defaultPiniaState = {
  operator: {
    operatorsList: [{
      id: 1, firstname: 'First1', lastname: 'Last1', name: 'First1 Last1', stationIds: [31],
    }, {
      id: 2, firstname: 'First2', lastname: 'Last2', name: 'First2 Last2', stationIds: [31],
    }],
    loading: [],
  },
  factory: {
    factories: [{ id: 21, name: 'Factory1', stations: [{ id: 31 }] }],
  },
  station: {
    stations: [{ id: 31, name: 'Station1', factoryId: 21 }],
    stationGroups: [],
  },
  feature: {
    checklists: true,
  },
  profile: {
    currentUser: { roles: { 0: 'COMPANY_ADMIN' } },
  },
};

const createWrapper = (options = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
    initialState: { ...defaultPiniaState, ...options.piniaState },
  });
  const operatorStore = useOperatorStore(pinia);
  operatorStore.isLoading = null;
  return shallowMount(SettingsOperatorsOverview, {
    global: {
      plugins: [pinia],
    },
    ...options,
  });
};

describe('SettingsOperatorsOverview', () => {
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

  test('that passcode table header is visible if checklists are enabled', () => {
    const wrapper = createWrapper();
    expect(wrapper.vm.tableHeaders.find((header) => header.value === 'passcodeCreatedAt').isHidden).toBeFalsy();
  });

  test('that passcode table header is hidden when checklists are disabled', () => {
    const wrapper = createWrapper({
      piniaState: { feature: { checklists: false } },
    });
    expect(wrapper.vm.tableHeaders.find((header) => header.value === 'passcodeCreatedAt').isHidden).toBeTruthy();
  });
});
