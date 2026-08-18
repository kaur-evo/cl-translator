import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { mdiPencil, mdiDelete } from '@mdi/js';

import SettingsUserRightsSection from './index.vue';

import {
  COMPANY_ADMIN, FACTORY_ADMIN, OFFICE_USER, LINEVIEW_USER,
} from '@/constants/userRoles';
import useFactoryStore from '@/stores/factory';

const propsDefault = {
  roles: {},
  allowedStations: {},
  lineviewTimeRestrictionValue: 0,
};

const createWrapper = (propsOverrides = {}, factoryOverrides = null) => {
  const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });
  const factoryStore = useFactoryStore(pinia);
  factoryStore.factories = factoryOverrides || [{ id: 1, name: 'factory1' }, { id: 2, name: 'factory2' }];

  return shallowMount(SettingsUserRightsSection, {
    global: { plugins: [pinia] },
    props: { ...propsDefault, ...propsOverrides },
  });
};

describe('SettingsUserRightsSection', () => {
  it('renders', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that rolesCardButtons array has delete and edit actions', () => {
    const wrapper = createWrapper();

    expect(wrapper.vm.rolesCardButtons.length).toBe(2);
    expect(wrapper.vm.rolesCardButtons[0]).toEqual({
      icon: mdiPencil,
      text: 'Edit',
      tooltip: 'Edit',
      action: expect.any(Function),
    });
    expect(wrapper.vm.rolesCardButtons[1]).toEqual({
      icon: mdiDelete,
      text: 'Delete',
      tooltip: 'Delete',
      action: expect.any(Function),
    });
  });

  describe('isAddRoleBtnHidden', () => {
    it('returns true if the user is a company admin', () => {
      const wrapper = createWrapper({
        roles: { role1: COMPANY_ADMIN },
      });

      expect(wrapper.vm.isAddRoleBtnHidden).toBe(true);
    });

    it('returns false if the user is a factory admin', () => {
      const wrapper = createWrapper({
        roles: { role1: FACTORY_ADMIN },
      });

      expect(wrapper.vm.isAddRoleBtnHidden).toBe(false);
    });

    it('returns false if the user is an office user', () => {
      const wrapper = createWrapper({
        roles: { role1: OFFICE_USER },
      });

      expect(wrapper.vm.isAddRoleBtnHidden).toBe(false);
    });

    it('returns true if the user is a lineview user', () => {
      const wrapper = createWrapper({
        roles: { role1: LINEVIEW_USER },
      });

      expect(wrapper.vm.isAddRoleBtnHidden).toBe(true);
    });

    it('returns true if factories count is equal to roles count', () => {
      const wrapper = createWrapper(
        { roles: { role1: 'some role' } },
        [{ id: 1, name: 'factory1' }],
      );

      expect(wrapper.vm.isAddRoleBtnHidden).toBe(true);
    });

    it('returns false if factories count is more than roles count', () => {
      const wrapper = createWrapper({
        roles: { role1: 'some role' },
      });

      expect(wrapper.vm.isAddRoleBtnHidden).toBe(false);
    });

    it('returns true if unique roles count is more than 1', () => {
      const wrapper = createWrapper({
        roles: { role1: 'unique role1', role2: 'unique role2' },
      });

      expect(wrapper.vm.isAddRoleBtnHidden).toBe(true);
    });

    it('returns false if unique roles count is equal to 1', () => {
      const wrapper = createWrapper({
        roles: { role1: 'unique role' },
      });

      expect(wrapper.vm.isAddRoleBtnHidden).toBe(false);
    });
  });
});
