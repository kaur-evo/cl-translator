import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ShareDashboardDialogFilter from './index.vue';

import {
  COMPANY_ADMIN, FACTORY_ADMIN, OFFICE_USER, LINEVIEW_USER,
} from '@/constants/userRoles';

const defaultProps = {
  filter: {
    search: '',
    factoryIds: [],
    stationIds: [],
    roles: [],
  },
};

const createWrapper = (options = {}) => {
  const {
    factories = [{ id: 1, name: 'Factory 1' }, { id: 2, name: 'Factory 2' }],
    stations = [],
    stationGroups = [{ id: 21, name: 'Station Group 21', factoryId: 1 }, { id: 22, name: 'Station Group 22', factoryId: 2 }],
    visibleUserRoles = [],
    props = {},
  } = options;

  return shallowMount(ShareDashboardDialogFilter, {
    props: { ...defaultProps, ...props },
    global: {
      plugins: [
        createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            factory: { factories },
            station: { stations, stationGroups },
            profile: { visibleUserRoles },
          },
        }),
      ],
    },
  });
};

describe('ShareDashboardDialogFilter', () => {
  it('renders', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly when search filter is not empty', () => {
    const wrapper = createWrapper({
      props: { filter: { ...defaultProps.filter, search: 'search' } },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when hasMultipleFactories is true', () => {
    const wrapper = createWrapper({
      factories: [{ id: 1, name: 'Factory 1' }, { id: 2, name: 'Factory 2' }],
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when hasMultipleFactories is false', () => {
    const wrapper = createWrapper({
      factories: [{ id: 1, name: 'Factory 1' }],
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that visibleUserRoles has Lineview User filtered out', () => {
    const wrapper = createWrapper({
      visibleUserRoles: [COMPANY_ADMIN, FACTORY_ADMIN, OFFICE_USER, LINEVIEW_USER],
    });

    expect(wrapper.vm.visibleUserRoles.length).toBe(3);
    expect(wrapper.vm.visibleUserRoles.map((r) => r.id)).toEqual([
      COMPANY_ADMIN,
      FACTORY_ADMIN,
      OFFICE_USER,
    ]);
  });

  describe('filteredStations', () => {
    it('returns all stations if factoryIds filter is empty', () => {
      const wrapper = createWrapper({
        stations: [{ id: 11, name: 'Station 11', factoryId: 1 }, { id: 12, name: 'Station 12', factoryId: 2 }],
        props: { filter: { ...defaultProps.filter, factoryIds: [] } },
      });

      expect(wrapper.vm.filteredStations).toEqual([{ id: 11, name: 'Station 11', factoryId: 1 }, { id: 12, name: 'Station 12', factoryId: 2 }]);
    });

    it('returns all stations if factoryIds filter includes the factoryId of each station', () => {
      const wrapper = createWrapper({
        stations: [{ id: 11, name: 'Station 11', factoryId: 1 }, { id: 12, name: 'Station 12', factoryId: 2 }],
        props: { filter: { ...defaultProps.filter, factoryIds: [1, 2] } },
      });

      expect(wrapper.vm.filteredStations).toEqual([{ id: 11, name: 'Station 11', factoryId: 1 }, { id: 12, name: 'Station 12', factoryId: 2 }]);
    });

    it('returns stations that have a factoryId that is included in the factoryIds filter', () => {
      const wrapper = createWrapper({
        stations: [{ id: 11, name: 'Station 11', factoryId: 1 }, { id: 12, name: 'Station 12', factoryId: 2 }],
        props: { filter: { ...defaultProps.filter, factoryIds: [1] } },
      });

      expect(wrapper.vm.filteredStations).toEqual([{ id: 11, name: 'Station 11', factoryId: 1 }]);
    });
  });
});
