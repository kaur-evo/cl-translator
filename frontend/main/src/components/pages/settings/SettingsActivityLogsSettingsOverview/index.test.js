import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import SettingsActivityLogsSettingsOverview from './index.vue';

import { entities, entityUrlParams } from '@/constants/activityLogsConstants';
import { TODAY } from '@/constants/predefinedTimePeriodNames';
import useDeviceStore from '@/stores/device';
import useFilterbarStore from '@/stores/filterbar';
import useUserStore from '@/stores/user';
import useChecklistTemplateStore from '@/stores/checklistTemplate';
import useShiftTemplateStore from '@/stores/shiftTemplate';

const createPinia = () => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: {
      filterbar: {
        requestFilterState: { entity: [entities.USER], [entities.USER]: [], period: TODAY },
      },
      feature: {
        checklists: true,
      },
      profile: {},
      user: {},
    },
  });
  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = false;
  deviceStore.screen = {};
  return pinia;
};

const createWrapper = (options = {}) => shallowMount(SettingsActivityLogsSettingsOverview, {
  global: {
    plugins: [createPinia()],
  },
  ...options,
});

describe('SettingsActivityLogsSettingsOverview', () => {
  it('renders', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', async () => {
    const wrapper = createWrapper();

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('modifyEntityParam', () => {
    let wrapper;
    let filterbarStore;
    beforeEach(() => {
      wrapper = createWrapper();
      filterbarStore = useFilterbarStore();
    });

    it('calls removeFilter with prevEntity', async () => {
      const removeFilterSpy = vi.spyOn(filterbarStore, 'removeFilter');
      await wrapper.vm.modifyEntityParam(entities.USER, null);
      expect(removeFilterSpy).toHaveBeenCalledWith(entities.USER);
    });

    it('calls updateFilterValue with newEntity if provided', async () => {
      const updateFilterValueSpy = vi.spyOn(filterbarStore, 'updateFilterValue');
      await wrapper.vm.modifyEntityParam(entities.USER, entities.STATION);
      expect(updateFilterValueSpy).toHaveBeenCalledWith({ [entities.STATION]: [] });
    });

    it('does not call updateFilterValue if newEntity is null', async () => {
      const updateFilterValueSpy = vi.spyOn(filterbarStore, 'updateFilterValue');
      await wrapper.vm.modifyEntityParam(entities.USER, null);
      expect(updateFilterValueSpy).not.toHaveBeenCalled();
    });

    it('always calls triggerDataRequest', async () => {
      const triggerDataRequestSpy = vi.spyOn(filterbarStore, 'triggerDataRequest');
      await wrapper.vm.modifyEntityParam(entities.USER, entities.STATION);
      expect(triggerDataRequestSpy).toHaveBeenCalled();
    });
  });

  describe('onLinkClick', () => {
    beforeEach(() => {
      window.open = vi.fn();
    });
    afterEach(() => {
      window.open.mockRestore();
    });

    it('calls window.open with correct URL if entityType is SECURITY and reference is Allowed IPs', () => {
      const wrapper = createWrapper();

      const item = { entity: { reference: 'Allowed IPs', entityType: entities.SECURITY } };
      wrapper.vm.onLinkClick(item);
      expect(window.open).toHaveBeenCalledWith('#/settings/security/allowedips', '_blank');
    });

    it('calls window.open with correct URL if entityType is SECURITY and reference is Security profiles', () => {
      const wrapper = createWrapper();

      const item = { entity: { reference: 'Security Profiles', entityType: entities.SECURITY } };
      wrapper.vm.onLinkClick(item);
      expect(window.open).toHaveBeenCalledWith('#/settings/security/securityprofiles', '_blank');
    });

    it('calls window.open with correct URL if entityType includes GROUPS', () => {
      const wrapper = createWrapper();

      const item = { entity: { id: '123', entityType: entities.STOP_REASON_GROUP } };
      wrapper.vm.onLinkClick(item);
      expect(window.open).toHaveBeenCalledWith(`#/settings/${entityUrlParams[item.entity.entityType]}?isGroupEdit=true&id=${item.entity.id}`, '_blank');
    });

    it('calls window.open with correct URL if entityType is USER', () => {
      const wrapper = createWrapper();

      const item = { entity: { reference: 'test@user', entityType: entities.USER } };
      wrapper.vm.onLinkClick(item);
      expect(window.open).toHaveBeenCalledWith(`#/settings/${entityUrlParams[item.entity.entityType]}/${item.entity.reference}/edit`, '_blank');
    });

    it('calls window.open with correct URL if entityType is OPERATOR', () => {
      const wrapper = createWrapper();

      const item = { entity: { id: '123', entityType: entities.OPERATOR } };
      wrapper.vm.onLinkClick(item);
      expect(window.open).toHaveBeenCalledWith(`#/settings/${entityUrlParams[item.entity.entityType]}/${item.entity.id}/edit`, '_blank');
    });
  });

  describe('onSelectedEntityChange', () => {
    it('calls fetchChecklistGroups when selectedEntity is set to CHECKLIST_GROUP', () => {
      const wrapper = createWrapper();
      const checklistTemplateStore = useChecklistTemplateStore();
      const spy = vi.spyOn(checklistTemplateStore, 'fetchChecklistGroups');

      wrapper.vm.onSelectedEntityChange(entities.CHECKLIST_GROUP);
      expect(spy).toHaveBeenCalled();
    });

    it('calls fetchChecklists and fetchChecklistGroups when selectedEntity is set to CHECKLIST', () => {
      const wrapper = createWrapper();
      const checklistTemplateStore = useChecklistTemplateStore();
      const groupsSpy = vi.spyOn(checklistTemplateStore, 'fetchChecklistGroups');
      const checklistsSpy = vi.spyOn(checklistTemplateStore, 'fetchChecklists');

      wrapper.vm.onSelectedEntityChange(entities.CHECKLIST);
      expect(groupsSpy).toHaveBeenCalled();
      expect(checklistsSpy).toHaveBeenCalled();
    });

    it('calls fetchUsers when selectedEntity is set to USER', () => {
      const wrapper = createWrapper();
      const userStore = useUserStore();
      const fetchUsersSpy = vi.spyOn(userStore, 'fetchUsers');

      wrapper.vm.onSelectedEntityChange(entities.USER);
      expect(fetchUsersSpy).toHaveBeenCalled();
    });

    it('calls fetchShiftTemplates when selectedEntity is set to SHIFT', () => {
      const wrapper = createWrapper();
      const shiftTemplateStore = useShiftTemplateStore();
      const spy = vi.spyOn(shiftTemplateStore, 'fetchShiftTemplates');

      wrapper.vm.onSelectedEntityChange(entities.SHIFT);
      expect(spy).toHaveBeenCalled();
    });
  });
});
