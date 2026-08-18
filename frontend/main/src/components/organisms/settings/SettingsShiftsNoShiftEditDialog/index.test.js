import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { format } from 'date-fns';

import useGenericDialogStore from '@/stores/genericDialog';
import SettingsShiftNoShiftEditDialog from '@/components/organisms/settings/SettingsShiftsNoShiftEditDialog/index.vue';
import useStationStore from '@/stores/station';

const t = (key) => key;

const mockStations = [
  { id: 1, name: 'Station 1', zoneId: 'UTC' },
  { id: 2, name: 'Station 2', zoneId: 'UTC' },
  { id: 3, name: 'Station 3', zoneId: 'UTC' },
];

describe('SettingsShiftNoShiftEditDialog', () => {
  let wrapper;

  const mountComponent = (dialogData = {}, stations = mockStations, allowedStationIds = []) => {
    const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });
    const gdStore = useGenericDialogStore(pinia);
    Object.assign(gdStore, { dialogData: { ...dialogData, allowedStationIds } });

    const stationStore = useStationStore(pinia);
    stationStore.stations = stations;

    wrapper = shallowMount(SettingsShiftNoShiftEditDialog, {
      global: {
        plugins: [pinia],
        mocks: {
          t,
        },
        stubs: {
          'form-dialog-template': true,
          'v-form': {
            template: '<form @submit.prevent><slot></slot></form>',
            methods: {
              validate: vi.fn().mockResolvedValue(true),
            },
          },
          'v-row': true,
          'v-col': true,
          'evocon-v-input': true,
          'generic-station-input': true,
          'double-date-range-menu': true,
          'delete-button': true,
          'v-spacer': true,
          'evocon-v-button': true,
        },
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization (Create mode)', () => {
    beforeEach(() => {
      mountComponent();
    });

    it('mounts the component', () => {
      expect(wrapper.exists()).toBe(true);
    });

    it('initializes with default form data', () => {
      const today = new Date();
      const todayStr = format(today, 'yyyy-MM-dd');
      expect(wrapper.vm.formData.id).toBe(null);
      expect(wrapper.vm.formData.description).toBe('');
      expect(wrapper.vm.formData.stationIds).toEqual([]);
      expect(wrapper.vm.dateRange).toEqual([todayStr, todayStr]);
    });

    it('does not show the delete button', () => {
      expect(wrapper.findComponent({ name: 'DeleteButton' }).exists()).toBe(false);
    });
  });

  describe('Initialization (Edit mode)', () => {
    const dialogData = {
      id: 10,
      description: 'Maintenance Day',
      stationIds: [1, 2],
      startTime: '2023-10-20T00:00:00.000Z',
      endTime: '2023-10-21T23:59:59.999Z',
      shiftTemplateId: 5,
    };

    beforeEach(() => {
      mountComponent(dialogData);
    });

    it('initializes form data from dialogData', () => {
      expect(wrapper.vm.formData.id).toBe(10);
      expect(wrapper.vm.formData.description).toBe('Maintenance Day');
      expect(wrapper.vm.formData.stationIds).toEqual([1, 2]);
      expect(wrapper.vm.formData.shiftTemplateId).toBe(5);
      expect(wrapper.vm.dateRange).toEqual(['2023-10-20', '2023-10-21']);
    });
  });

  describe('Station Input Logic', () => {
    it('hides station input and auto-selects station when only one is available', async () => {
      mountComponent({}, [mockStations[0]], [1]);
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.singleStationOption).toBe(true);
      expect(wrapper.findComponent({ name: 'GenericStationInput' }).exists()).toBe(false);
      expect(wrapper.vm.formData.stationIds).toEqual([1]);
    });

    it('filters stationIds in edit mode to only include allowed stations', async () => {
      const dialogData = {
        id: 1,
        stationIds: [1, 3], // station 3 is not in allowedStationIds
      };
      mountComponent(dialogData, mockStations, [1, 2]); // only stations 1 and 2 are allowed
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.formData.stationIds).toEqual([1]);
    });
  });


  describe('Date Range Logic', () => {
    it('updates dateRange when startTime and endTime are provided', () => {
      const dialogData = {
        startTime: '2023-10-20T00:00:00.000Z',
        endTime: '2023-10-21T23:59:59.999Z',
      };
      mountComponent(dialogData, mockStations, [1, 2, 3]);
      expect(wrapper.vm.dateRange).toEqual(['2023-10-20', '2023-10-21']);
    });

    it('defaults dateRange to today if no startTime and endTime are provided', () => {
      mountComponent();
      const today = new Date();
      const todayStr = format(today, 'yyyy-MM-dd');
      expect(wrapper.vm.dateRange).toEqual([todayStr, todayStr]);
    });
  });

  describe('Computed Properties', () => {
    it('singleStationOption is false when multiple stations', () => {
      mountComponent();
      expect(wrapper.vm.singleStationOption).toBe(false);
    });

    it('singleStationOption is true when only one station', () => {
      mountComponent({}, [mockStations[0]], [1]);
      expect(wrapper.vm.singleStationOption).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty stations array gracefully', () => {
      mountComponent({}, [], []);
      expect(wrapper.vm.formData.stationIds).toEqual([]);
      expect(wrapper.vm.singleStationOption).toBe(false);
    });

    it('handles undefined dialogData', () => {
      mountComponent(undefined, mockStations, []);
      expect(wrapper.vm.formData.id).toBe(null);
    });
  });
});
