import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ManualChecklistDialog from './index.vue';

import { useDeviceStore } from '@/stores/index';
import productApi from '@/api/productApi';

vi.mock('@/api/productApi');
productApi.getProducts = vi.fn();

const defaultTemplates = [{
  id: '3b9ba4e9-f2de-4d5e-9e12-19cd013bbe08',
  name: 'iga 3h, manual lubatud',
  stationIds: [54],
  description: '',
  active: false,
  frequency: {
    type: 'INTERVAL', productIds: [], intervalTime: 10800, pauseDuringDowntime: false, resetOnShiftStart: false,
  },
  elements: [{
    id: 1, name: 'Tehtud?', unit: '', minVal: null, maxVal: null, type: 'CHECK', notApplicableEnabled: false,
  }],
  manualAllowed: true,
}, {
  id: '8c4cfb0e-580e-4155-b5ee-266f65b5f16a',
  name: 'madli manual check - õunamahl',
  stationIds: [54],
  description: '',
  active: false,
  frequency: {
    type: 'CHANGEOVER', productIds: [490], intervalTime: 1800, pauseDuringDowntime: false, delayTime: 0,
  },
  elements: [{
    id: 1, name: 'Kuidas sul täna läheb?', unit: '', minVal: null, maxVal: null, type: 'TEXT', notApplicableEnabled: false,
  }],
  manualAllowed: true,
}, {
  id: 'cc2886ce-af5b-4de8-8c3d-c2c196109f48',
  name: 'Madli manual checklist',
  stationIds: [54],
  description: 'This is a checklist that can be activated manually',
  active: false,
  frequency: {
    type: 'MANUAL', productIds: [], intervalTime: 0, pauseDuringDowntime: false,
  },
  elements: [{
    id: 1, name: 'Kas kõik on hästi?', unit: '', minVal: null, maxVal: null, type: 'YES_NO', notApplicableEnabled: false,
  }],
  manualAllowed: false,
}];

const defaultPiniaState = {
  genericDialog: {
    dialogData: { templates: defaultTemplates, time: '2022-06-29T10:42:00' },
    allowFullscreen: true,
  },
  station: { lineviewStation: { id: 54 } },
};

const createPinia = (overrides = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: { ...defaultPiniaState, ...overrides },
  });

  const deviceStore = useDeviceStore(pinia);
  deviceStore.showFullscreenDialogs = overrides.device?.showFullscreenDialogs ?? false;
  deviceStore.isMobileView = overrides.device?.isMobileView ?? false;

  return pinia;
};

const createWrapper = (overrides = {}) => shallowMount(ManualChecklistDialog, {
  global: { plugins: [createPinia(overrides)] },
});

describe('ManualChecklistDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('renders correctly', () => {
    const wrapper = createWrapper();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in tablet view', () => {
    const wrapper = createWrapper({ device: { showFullscreenDialogs: true } });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile view', () => {
    const wrapper = createWrapper({ device: { isMobileView: true, showFullscreenDialogs: true } });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('has templates ordered alphabetically by name', () => {
    const wrapper = createWrapper({
      genericDialog: {
        dialogData: {
          templates: [{
            id: '3b9ba4e9-f2de-4d5e-9e12-19cd013bbe08',
            name: 'test name',
            stationIds: [54],
            description: '',
            active: false,
            frequency: {
              type: 'INTERVAL', productIds: [], intervalTime: 10800, pauseDuringDowntime: false, resetOnShiftStart: false,
            },
            elements: [{
              id: 1, name: 'Tehtud?', unit: '', minVal: null, maxVal: null, type: 'CHECK', notApplicableEnabled: false,
            }],
            manualAllowed: true,
          }, {
            id: '8c4cfb0e-580e-4155-b5ee-266f65b5f16a',
            name: 'other test name',
            stationIds: [54],
            description: '',
            active: false,
            frequency: {
              type: 'CHANGEOVER', productIds: [490], intervalTime: 1800, pauseDuringDowntime: false, delayTime: 0,
            },
            elements: [{
              id: 1, name: 'Kuidas sul täna läheb?', unit: '', minVal: null, maxVal: null, type: 'TEXT', notApplicableEnabled: false,
            }],
            manualAllowed: true,
          }, {
            id: 'cc2886ce-af5b-4de8-8c3d-c2c196109f48',
            name: 'Test name 3',
            stationIds: [54],
            description: 'This is a checklist that can be activated manually',
            active: false,
            frequency: {
              type: 'MANUAL', productIds: [], intervalTime: 0, pauseDuringDowntime: false,
            },
            elements: [{
              id: 1, name: 'Kas kõik on hästi?', unit: '', minVal: null, maxVal: null, type: 'YES_NO', notApplicableEnabled: false,
            }],
            manualAllowed: false,
          }],
          time: '2022-06-29T10:42:00',
        },
        allowFullscreen: true,
      },
    });

    const templateNames = wrapper.vm.templates.map((template) => template.name);
    expect(templateNames).toEqual(['other test name', 'test name', 'Test name 3']);
  });
});
