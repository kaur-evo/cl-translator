import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ShiftViewUserSettings from './index.vue';

import {
  useDeviceStore, useUserPreferencesStore, useFeatureStore,
  useChecklistTemplateStore, useStationStore, useGenericNotificationStore,
} from '@/stores/index';

const createWrapper = (piniaOverrides = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });
  const deviceStore = useDeviceStore(pinia);
  const userPreferencesStore = useUserPreferencesStore(pinia);
  const featureStore = useFeatureStore(pinia);
  const checklistTemplateStore = useChecklistTemplateStore(pinia);
  const stationStore = useStationStore(pinia);

  deviceStore.showFullscreenDialogs = false;
  vi.spyOn(deviceStore, 'isMobileView', 'get').mockReturnValue(piniaOverrides.isMobileView ?? false);
  userPreferencesStore.viewSettings = piniaOverrides.viewSettings ?? {
    hideChecklists: false,
    visibleChecklistIdsByStation: {},
  };
  vi.spyOn(featureStore, 'checklistsEnabled', 'get').mockReturnValue(piniaOverrides.checklistsEnabled ?? true);
  checklistTemplateStore.checklistTemplates = piniaOverrides.checklistTemplates ?? [
    { id: 'c1', name: 'Checklist 1', active: true, stationIds: [1, 2], groupId: 'g1' },
    { id: 'c2', name: 'Checklist 2', active: true, stationIds: [1], groupId: 'g1' },
    { id: 'c3', name: 'Checklist 3', active: false, stationIds: [1], groupId: 'g2' },
    { id: 'c4', name: 'Checklist 4', active: true, stationIds: [3], groupId: 'g2' },
    { id: 'c5', name: 'Checklist 5', active: true, stationIds: [1], groupId: null },
  ];
  checklistTemplateStore.checklistGroups = piniaOverrides.checklistGroups ?? [
    { id: 'g1', name: 'Group 1' },
    { id: 'g2', name: 'Group 2' },
    { id: 'g3', name: 'Group 3' },
  ];
  stationStore.lineviewStation = piniaOverrides.lineviewStation ?? { id: 1, zoneId: 'Europe/Tallinn' };

  return shallowMount(ShiftViewUserSettings, {
    global: { plugins: [pinia] },
  });
};

describe('ShiftViewUserSettings', () => {
  it('renders', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile', () => {
    const wrapper = createWrapper({ isMobileView: true });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('stationChecklists', () => {
    it('filters checklists by current station and active status', () => {
      const wrapper = createWrapper();

      const result = wrapper.vm.stationChecklists;

      expect(result).toHaveLength(3);
      expect(result.map((c) => c.id)).toEqual(['c1', 'c2', 'c5']);
    });

    it('returns empty array when no station is set', () => {
      const wrapper = createWrapper({ lineviewStation: {} });

      expect(wrapper.vm.stationChecklists).toEqual([]);
    });
  });

  describe('relevantChecklistGroups', () => {
    it('returns only groups that have active checklists for current station', () => {
      const wrapper = createWrapper();

      const result = wrapper.vm.relevantChecklistGroups;

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('g1');
    });
  });

  describe('checklist selection logic', () => {
    it('expands empty array to all station checklist IDs on mount', () => {
      const wrapper = createWrapper();

      // No entry for station means all selected - should be expanded for UI
      expect(wrapper.vm.localVisibleChecklistIds).toEqual(['c1', 'c2', 'c5']);
    });

    it('onChecklistSelectionChange updates localVisibleChecklistIds', async () => {
      const wrapper = createWrapper();

      wrapper.vm.onChecklistSelectionChange(['c1']);

      expect(wrapper.vm.localVisibleChecklistIds).toEqual(['c1']);
    });

    it('getVisibleIdsForStorage converts all selected to empty array', () => {
      const wrapper = createWrapper();

      wrapper.vm.localVisibleChecklistIds = ['c1', 'c2', 'c5']; // All station checklists

      const result = wrapper.vm.getVisibleIdsForStorage();

      // All selected = empty array (storage optimization)
      expect(result).toEqual([]);
    });

    it('getVisibleIdsForStorage keeps partial selection as-is', () => {
      const wrapper = createWrapper();

      wrapper.vm.localVisibleChecklistIds = ['c1', 'c5'];

      const result = wrapper.vm.getVisibleIdsForStorage();

      expect(result).toEqual(['c1', 'c5']);
    });

    it('expandEmptyToAllIds expands empty to all IDs', () => {
      const wrapper = createWrapper();

      const result = wrapper.vm.expandEmptyToAllIds([]);

      expect(result).toEqual(['c1', 'c2', 'c5']);
    });

    it('expandEmptyToAllIds keeps non-empty arrays unchanged', () => {
      const wrapper = createWrapper();

      const result = wrapper.vm.expandEmptyToAllIds(['c1', 'c2']);

      expect(result).toEqual(['c1', 'c2']);
    });
  });

  describe('hideChecklists watch', () => {
    it('resets localVisibleChecklistIds when hideChecklists is enabled', async () => {
      const wrapper = createWrapper();

      // Set initial state with some checklists selected
      wrapper.vm.localVisibleChecklistIds = ['c1', 'c2'];
      wrapper.vm.formData.hideChecklists = false;
      await wrapper.vm.$nextTick();

      // Enable hideChecklists - watch should reset selection
      wrapper.vm.formData.hideChecklists = true;
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.localVisibleChecklistIds).toEqual([]);
    });

    it('restores all selected when hideChecklists changes to false', async () => {
      const wrapper = createWrapper();

      // Start with hideChecklists true
      wrapper.vm.formData.hideChecklists = true;
      await wrapper.vm.$nextTick();

      // Selection should be empty when hidden
      expect(wrapper.vm.localVisibleChecklistIds).toEqual([]);

      // Now set hideChecklists to false - should restore to all selected
      wrapper.vm.formData.hideChecklists = false;
      await wrapper.vm.$nextTick();

      // Watch restores all checklists when showing
      expect(wrapper.vm.localVisibleChecklistIds).toEqual(['c1', 'c2', 'c5']);
    });
  });

  describe('filter persistence', () => {
    it('saves visibleChecklistIdsByStation via saveViewSettings action', async () => {
      const pinia = createTestingPinia({ createSpy: vi.fn });
      const stationStore = useStationStore(pinia);
      const featureStore = useFeatureStore(pinia);
      const checklistTemplateStore = useChecklistTemplateStore(pinia);
      const userPreferencesStore = useUserPreferencesStore(pinia);

      stationStore.lineviewStation = { id: 1, zoneId: 'Europe/Tallinn' };
      vi.spyOn(featureStore, 'checklistsEnabled', 'get').mockReturnValue(true);
      checklistTemplateStore.checklistTemplates = [
        { id: 'c1', name: 'Checklist 1', active: true, stationIds: [1, 2], groupId: 'g1' },
        { id: 'c2', name: 'Checklist 2', active: true, stationIds: [1], groupId: 'g1' },
        { id: 'c3', name: 'Checklist 3', active: false, stationIds: [1], groupId: 'g2' },
        { id: 'c4', name: 'Checklist 4', active: true, stationIds: [3], groupId: 'g2' },
        { id: 'c5', name: 'Checklist 5', active: true, stationIds: [1], groupId: null },
      ];
      checklistTemplateStore.checklistGroups = [
        { id: 'g1', name: 'Group 1' },
        { id: 'g2', name: 'Group 2' },
        { id: 'g3', name: 'Group 3' },
      ];
      userPreferencesStore.viewSettings = {
        hideChecklists: false,
        visibleChecklistIdsByStation: {},
      };
      userPreferencesStore.saveViewSettings.mockResolvedValue();

      const wrapper = shallowMount(ShiftViewUserSettings, {
        global: { plugins: [pinia] },
      });

      // Select only c1 (station checklists are c1, c2, c5)
      wrapper.vm.localVisibleChecklistIds = ['c1'];
      await wrapper.vm.onSave();

      expect(userPreferencesStore.saveViewSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          visibleChecklistIdsByStation: {
            1: ['c1'],
          },
        }),
      );
    });

    it('shows error notification when saveViewSettings fails', async () => {
      const pinia = createTestingPinia({ createSpy: vi.fn });
      const stationStore = useStationStore(pinia);
      const featureStore = useFeatureStore(pinia);
      const checklistTemplateStore = useChecklistTemplateStore(pinia);
      const userPreferencesStore = useUserPreferencesStore(pinia);
      const genericNotificationStore = useGenericNotificationStore(pinia);

      stationStore.lineviewStation = { id: 1, zoneId: 'Europe/Tallinn' };
      vi.spyOn(featureStore, 'checklistsEnabled', 'get').mockReturnValue(true);
      checklistTemplateStore.checklistTemplates = [
        { id: 'c1', name: 'Checklist 1', active: true, stationIds: [1, 2], groupId: 'g1' },
        { id: 'c2', name: 'Checklist 2', active: true, stationIds: [1], groupId: 'g1' },
        { id: 'c5', name: 'Checklist 5', active: true, stationIds: [1], groupId: null },
      ];
      checklistTemplateStore.checklistGroups = [];
      userPreferencesStore.viewSettings = {
        hideChecklists: false,
        visibleChecklistIdsByStation: {},
      };
      userPreferencesStore.saveViewSettings.mockRejectedValue(new Error('API Error'));

      const wrapper = shallowMount(ShiftViewUserSettings, {
        global: { plugins: [pinia] },
      });

      await wrapper.vm.onSave();

      expect(genericNotificationStore.notifyError).toHaveBeenCalled();
    });
  });
});
