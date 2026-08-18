import { shallowMount } from '@vue/test-utils';
import { setActivePinia } from 'pinia';
import { createTestingPinia } from '@pinia/testing';

import SettingsShiftsNoShiftDialog from './index.vue';

import useGenericDialogStore from '@/stores/genericDialog';
import useStationStore from '@/stores/station';
import useShiftTemplateStore from '@/stores/shiftTemplate';

vi.mock('@/api/shiftApi');

let pinia;
let genericDialogStore;
let stationStore;
let shiftTemplateStore;

const createWrapper = (options) => shallowMount(SettingsShiftsNoShiftDialog, {
  global: {
    plugins: [pinia],
    stubs: { 'dialog-template': false },
  },
  ...options,
});

describe('SettingsShiftsNoShiftDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });
    setActivePinia(pinia);

    genericDialogStore = useGenericDialogStore();
    genericDialogStore.dialogData = { id: 1, factoryIds: [1], stationIds: [1] };
    genericDialogStore.closeDialog = vi.fn();

    stationStore = useStationStore();
    stationStore.getSelectedFactoryAllowedStations = vi.fn(() => []);

    shiftTemplateStore = useShiftTemplateStore();
    shiftTemplateStore.fetchShiftTemplateNoShiftDeviations = vi.fn().mockResolvedValue([]);
    shiftTemplateStore.currentNoShiftDeviations = vi.fn(() => []);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('matches snapshot', () => {
    const wrapper = createWrapper();
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('calls closeDialog when cancel button is clicked', async () => {
    const wrapper = createWrapper();
    await wrapper.find('#cancel-button').trigger('click');
    expect(genericDialogStore.closeDialog).toHaveBeenCalled();
  });

  it('loads no-shift deviations on mount', () => {
    createWrapper();
    expect(shiftTemplateStore.fetchShiftTemplateNoShiftDeviations).toHaveBeenCalledWith(1);
  });
});
